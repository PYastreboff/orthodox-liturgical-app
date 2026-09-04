import type {
  FastingRecipe,
  RecipeAbilityFilter,
  RecipeCategory,
  RecipeDifficulty,
  RecipeFastLevel,
  RecipeMealSlot,
} from './fastingRecipes';
import { getRecipeFromCache } from './recipeLibraryRemote';

export function getRecipeById(id: string): FastingRecipe | undefined {
  return getRecipeFromCache(id);
}

export function recipeLevelLabelKey(level: RecipeFastLevel): string {
  switch (level) {
    case 'strict':
      return 'recipes.levelStrict';
    case 'wine_oil':
      return 'recipes.levelWineOil';
    case 'fish':
      return 'recipes.levelFish';
    case 'dairy':
      return 'recipes.levelDairy';
    case 'feast':
      return 'recipes.levelFeast';
  }
}

export function recipeAbilityLabelKey(ability: RecipeAbilityFilter): string {
  switch (ability) {
    case 'strict':
      return 'recipes.ability.strict';
    case 'wine_oil':
      return 'recipes.ability.wineOil';
    case 'fish':
      return 'recipes.ability.fish';
    case 'dairy':
      return 'recipes.ability.dairy';
    case 'no_fast':
      return 'recipes.ability.noFast';
    case 'total_abstinence':
      return 'recipes.ability.totalAbstinence';
  }
}

export function recipeDifficultyLabelKey(difficulty: RecipeDifficulty): string {
  return `recipes.difficulty.${difficulty}`;
}

export function recipeCategoryLabelKey(category: RecipeCategory): string {
  return `recipes.category.${category}`;
}

export function recipeMealSlotLabelKey(slot: RecipeMealSlot): string {
  return `recipes.meal.${slot}`;
}
