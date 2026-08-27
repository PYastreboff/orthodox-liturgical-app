/**
 * Remote Lenten recipe library (JSON on GitHub).
 * Not bundled into the app — requires network on first load of a session.
 */
import type { FastingRecipe } from './fastingRecipes';

const DEFAULT_URLS = [
  'https://raw.githubusercontent.com/PYastreboff/orthodox-liturgical-app/main/data/recipes/fasting-recipes.json',
  'https://cdn.jsdelivr.net/gh/PYastreboff/orthodox-liturgical-app@main/data/recipes/fasting-recipes.json',
] as const;

function libraryUrls(): string[] {
  const override =
    typeof process !== 'undefined' && process.env.EXPO_PUBLIC_RECIPE_LIBRARY_URL?.trim();
  return override ? [override, ...DEFAULT_URLS] : [...DEFAULT_URLS];
}

type RecipeLibraryPayload = {
  version?: number;
  updated?: string;
  recipes: FastingRecipe[];
};

export type RecipeLibraryState =
  | { status: 'loading'; recipes: readonly FastingRecipe[] }
  | { status: 'ready'; recipes: readonly FastingRecipe[] }
  | { status: 'offline'; recipes: readonly FastingRecipe[]; error: string };

let memoryCache: readonly FastingRecipe[] | null = null;
let inflight: Promise<readonly FastingRecipe[]> | null = null;

function isRecipe(value: unknown): value is FastingRecipe {
  if (!value || typeof value !== 'object') return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.id === 'string' &&
    typeof r.level === 'string' &&
    typeof r.category === 'string' &&
    typeof r.title === 'object' &&
    r.title !== null
  );
}

function parsePayload(data: unknown): FastingRecipe[] {
  if (!data || typeof data !== 'object') throw new Error('Invalid recipe library');
  const recipes = (data as RecipeLibraryPayload).recipes;
  if (!Array.isArray(recipes) || recipes.length === 0) {
    throw new Error('Recipe library is empty');
  }
  const valid = recipes.filter(isRecipe);
  if (valid.length === 0) throw new Error('No valid recipes in library');
  return valid;
}

async function fetchFromUrl(url: string): Promise<FastingRecipe[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data: unknown = await response.json();
    return parsePayload(data);
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchFastingRecipes(options?: {
  force?: boolean;
}): Promise<readonly FastingRecipe[]> {
  if (!options?.force && memoryCache) return memoryCache;
  if (!options?.force && inflight) return inflight;

  inflight = (async () => {
    try {
      let lastError: unknown;
      for (const url of libraryUrls()) {
        try {
          const recipes = await fetchFromUrl(url);
          memoryCache = recipes;
          return recipes;
        } catch (error) {
          lastError = error;
        }
      }
      const message = lastError instanceof Error ? lastError.message : 'Network error';
      throw new Error(message);
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

export function getCachedFastingRecipes(): readonly FastingRecipe[] | null {
  return memoryCache;
}

export function getRecipeFromCache(id: string): FastingRecipe | undefined {
  return memoryCache?.find((recipe) => recipe.id === id);
}
