import type { FastingFoodKind, FastingFoodsDetail, FastSummaryKind } from '../../i18n/fastingLabels';
import type { UiLanguage } from '../../i18n/types';

/** Recipe list is loaded remotely — see `recipeLibraryRemote.ts`. */

/** How “rich” a recipe is — mapped onto today’s allowed foods. */
export type RecipeFastLevel = 'strict' | 'wine_oil' | 'fish' | 'dairy' | 'feast';

export type RecipeCategory =
  | 'soup'
  | 'salad'
  | 'main'
  | 'side'
  | 'breakfast'
  | 'bread'
  | 'sweet'
  | 'drink';

export type RecipeDifficulty = 'easy' | 'medium' | 'hard';

/** Broad taste bucket for library filters. */
export type RecipeTaste = 'savory' | 'sweet' | 'drink';

export const RECIPE_CATEGORIES: readonly RecipeCategory[] = [
  'soup',
  'salad',
  'main',
  'side',
  'breakfast',
  'bread',
  'sweet',
  'drink',
] as const;

/** List-page meal filters (maps from recipe categories). */
export type RecipeMealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export const RECIPE_MEAL_SLOTS: readonly RecipeMealSlot[] = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
] as const;

/** Breakfast / lunch / dinner / snack — sweets & drinks count as snack. */
export function recipeMealSlot(category: RecipeCategory): RecipeMealSlot {
  switch (category) {
    case 'breakfast':
      return 'breakfast';
    case 'soup':
    case 'salad':
    case 'side':
      return 'lunch';
    case 'main':
      return 'dinner';
    case 'sweet':
    case 'drink':
    case 'bread':
      return 'snack';
  }
}

export const RECIPE_FAST_LEVELS: readonly RecipeFastLevel[] = [
  'strict',
  'wine_oil',
  'fish',
  'dairy',
  'feast',
] as const;

/** Day-rule filter on the recipes page (what the typikon allows that day). */
export type RecipeAbilityFilter =
  | 'strict'
  | 'wine_oil'
  | 'fish'
  | 'dairy'
  | 'no_fast'
  | 'total_abstinence';

export const RECIPE_ABILITY_FILTERS: readonly RecipeAbilityFilter[] = [
  'strict',
  'wine_oil',
  'fish',
  'dairy',
  'no_fast',
] as const;

/** Map today’s pill kind onto the recipes ability filter. */
export function abilityFilterFromSummaryKind(kind: FastSummaryKind): RecipeAbilityFilter {
  switch (kind) {
    case 'total_abstinence':
      return 'total_abstinence';
    case 'no_fast':
      return 'no_fast';
    case 'strict':
    case 'wine_oil':
    case 'fish':
    case 'dairy':
      return kind;
  }
}

/** Recipes allowed under a chosen day-rule (not the recipe’s own richness alone). */
export function recipeFitsAbility(
  recipe: FastingRecipe,
  ability: RecipeAbilityFilter,
): boolean {
  if (ability === 'total_abstinence') return false;
  if (ability === 'no_fast') return true;
  if (ability === 'dairy') return recipe.level !== 'feast';
  if (ability === 'fish') {
    return (
      recipe.level === 'strict' ||
      recipe.level === 'wine_oil' ||
      recipe.level === 'fish'
    );
  }
  if (ability === 'wine_oil') {
    return recipe.level === 'strict' || recipe.level === 'wine_oil';
  }
  return recipe.level === 'strict';
}

export function recipeTaste(category: RecipeCategory): RecipeTaste {
  if (category === 'sweet') return 'sweet';
  if (category === 'drink') return 'drink';
  return 'savory';
}

export type LocalizedLines = Record<UiLanguage, string[]>;
export type LocalizedText = Record<UiLanguage, string>;

/**
 * Hand-curated OrthoDaily recipe (not from an external recipe API).
 * Quantities are home-kitchen estimates.
 */
export type FastingRecipe = {
  id: string;
  level: RecipeFastLevel;
  category: RecipeCategory;
  difficulty: RecipeDifficulty;
  prepMinutes: number;
  cookMinutes: number;
  servings: number;
  /** What one serving looks like (volume/weight). */
  servingSize: LocalizedText;
  title: LocalizedText;
  summary: LocalizedText;
  ingredients: LocalizedLines;
  steps: LocalizedLines;
  tips: LocalizedLines;
  /** Optional fasting / substitution note. */
  notes?: LocalizedText;
};

/** Total active time for display. */
export function recipeTotalMinutes(recipe: FastingRecipe): number {
  return recipe.prepMinutes + recipe.cookMinutes;
}

/** Foods a recipe of this level needs to be “legal” today. */
export function foodsRequiredForLevel(level: RecipeFastLevel): FastingFoodKind[] {
  switch (level) {
    case 'strict':
      return ['plant'];
    case 'wine_oil':
      return ['plant', 'oil'];
    case 'fish':
      return ['plant', 'oil', 'fish'];
    case 'dairy':
      return ['plant', 'oil', 'dairy'];
    case 'feast':
      return ['meat'];
  }
}

export function recipeFitsDay(
  recipe: FastingRecipe,
  foods: FastingFoodsDetail,
  summaryKind: FastSummaryKind,
): boolean {
  if (foods.totalAbstinence) return false;
  if (summaryKind === 'no_fast') return true;

  const allowed = new Set(foods.allowed.map((item) => item.kind));
  if (allowed.has('all') || allowed.has('meat')) return true;

  // Meat-fast / cheesefare: everything except meat.
  if (foods.meatFast || summaryKind === 'dairy') {
    return recipe.level !== 'feast';
  }

  const required = foodsRequiredForLevel(recipe.level);
  return required.every((kind) => {
    if (kind === 'plant') return allowed.has('plant') || allowed.has('oil') || allowed.has('fish');
    return allowed.has(kind);
  });
}

export function recipesForDay(
  all: readonly FastingRecipe[],
  foods: FastingFoodsDetail,
  summaryKind: FastSummaryKind,
): FastingRecipe[] {
  return all.filter((recipe) => recipeFitsDay(recipe, foods, summaryKind));
}

export function recipeTitle(recipe: FastingRecipe, lang: UiLanguage): string {
  return recipe.title[lang] ?? recipe.title.en;
}

export function recipeSummary(recipe: FastingRecipe, lang: UiLanguage): string {
  return recipe.summary[lang] ?? recipe.summary.en;
}

export function recipeServingSize(recipe: FastingRecipe, lang: UiLanguage): string {
  return recipe.servingSize[lang] ?? recipe.servingSize.en;
}

export function recipeIngredients(recipe: FastingRecipe, lang: UiLanguage): string[] {
  return recipe.ingredients[lang] ?? recipe.ingredients.en;
}

export function recipeSteps(recipe: FastingRecipe, lang: UiLanguage): string[] {
  return recipe.steps[lang] ?? recipe.steps.en;
}

export function recipeTips(recipe: FastingRecipe, lang: UiLanguage): string[] {
  return recipe.tips[lang] ?? recipe.tips.en;
}

export function recipeNotes(recipe: FastingRecipe, lang: UiLanguage): string | null {
  if (!recipe.notes) return null;
  return recipe.notes[lang] ?? recipe.notes.en;
}
