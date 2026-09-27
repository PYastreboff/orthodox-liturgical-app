import { isSupportedSchema } from '../net/remoteSchema';
import {
  RECIPE_CATEGORIES,
  RECIPE_FAST_LEVELS,
  type FastingRecipe,
  type LocalizedLines,
  type LocalizedText,
  type RecipeDifficulty,
} from './fastingRecipes';

/** Highest `schemaVersion` this binary understands (see `remoteSchema.ts`). */
export const RECIPE_LIBRARY_SCHEMA_VERSION = 1;

const DIFFICULTIES: readonly RecipeDifficulty[] = ['easy', 'medium', 'hard'];
const LANGS = ['en', 'ru', 'el'] as const;

export type RecipeLibrary = {
  /** ISO date of the export; used to pick the newest valid copy. */
  updated: string;
  recipes: readonly FastingRecipe[];
};

type Json = Record<string, unknown>;
const isObject = (value: unknown): value is Json =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

function localizedText(value: unknown): LocalizedText | null {
  if (!isObject(value) || typeof value.en !== 'string' || !value.en.trim()) return null;
  const out: Partial<LocalizedText> = {};
  for (const lang of LANGS) {
    if (typeof value[lang] === 'string') out[lang] = value[lang] as string;
  }
  return out as LocalizedText;
}

function localizedLines(value: unknown): LocalizedLines | null {
  if (!isObject(value)) return null;
  const out: Partial<LocalizedLines> = {};
  for (const lang of LANGS) {
    const lines = value[lang];
    if (Array.isArray(lines) && lines.every((line) => typeof line === 'string')) {
      out[lang] = lines as string[];
    }
  }
  return out.en ? (out as LocalizedLines) : null;
}

export function parseRecipe(value: unknown): FastingRecipe | null {
  if (!isObject(value)) return null;
  const { id, level, category, difficulty, prepMinutes, cookMinutes, servings } = value;
  if (typeof id !== 'string' || !id) return null;
  if (!RECIPE_FAST_LEVELS.includes(level as FastingRecipe['level'])) return null;
  if (!RECIPE_CATEGORIES.includes(category as FastingRecipe['category'])) return null;
  if (!DIFFICULTIES.includes(difficulty as RecipeDifficulty)) return null;
  if (!isCount(prepMinutes) || !isCount(cookMinutes) || !isCount(servings)) return null;

  const title = localizedText(value.title);
  const summary = localizedText(value.summary);
  const servingSize = localizedText(value.servingSize);
  const ingredients = localizedLines(value.ingredients);
  const steps = localizedLines(value.steps);
  const tips = localizedLines(value.tips) ?? { en: [] };
  if (!title || !summary || !servingSize || !ingredients || !steps) return null;
  const notes = value.notes === undefined ? undefined : localizedText(value.notes);

  return {
    id,
    level: level as FastingRecipe['level'],
    category: category as FastingRecipe['category'],
    difficulty: difficulty as RecipeDifficulty,
    prepMinutes,
    cookMinutes,
    servings,
    servingSize,
    title,
    summary,
    ingredients,
    steps,
    tips: tips as LocalizedLines,
    ...(notes ? { notes } : null),
  };
}

/** Returns null for payloads this binary must not use (bad shape or newer schema). */
export function parseRecipeLibrary(data: unknown): RecipeLibrary | null {
  if (!isObject(data) || !Array.isArray(data.recipes)) return null;
  if (!isSupportedSchema(data, RECIPE_LIBRARY_SCHEMA_VERSION)) return null;
  const recipes = data.recipes.map(parseRecipe).filter((r): r is FastingRecipe => r !== null);
  // A mostly-broken payload is a bad push, not a smaller library.
  if (recipes.length === 0 || recipes.length < data.recipes.length * 0.9) return null;
  return {
    updated: typeof data.updated === 'string' ? data.updated : '',
    recipes,
  };
}
