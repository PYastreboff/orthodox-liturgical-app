import { useCallback, useEffect, useState } from 'react';

import type { FastingRecipe } from '../lib/recipes/fastingRecipes';
import {
  fetchFastingRecipes,
  getCachedFastingRecipes,
  type RecipeLibraryState,
} from '../lib/recipes/recipeLibraryRemote';

/** Loads the remote recipe JSON; shows offline when the network fetch fails. */
export function useFastingRecipes(): RecipeLibraryState & { reload: () => void } {
  const cached = getCachedFastingRecipes();
  const [state, setState] = useState<RecipeLibraryState>(() =>
    cached
      ? { status: 'ready', recipes: cached }
      : { status: 'loading', recipes: [] },
  );

  const load = useCallback((force = false) => {
    if (!force && getCachedFastingRecipes()) {
      setState({ status: 'ready', recipes: getCachedFastingRecipes()! });
      return;
    }
    setState((prev) => ({ status: 'loading', recipes: prev.recipes }));
    void fetchFastingRecipes({ force })
      .then((recipes) => {
        setState({ status: 'ready', recipes });
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Network error';
        setState({ status: 'offline', recipes: [], error: message });
      });
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  return {
    ...state,
    reload: () => load(true),
  };
}

export function useRecipeById(id: string): {
  recipe: FastingRecipe | undefined;
  status: RecipeLibraryState['status'];
  reload: () => void;
} {
  const library = useFastingRecipes();
  const recipe = id ? library.recipes.find((item) => item.id === id) : undefined;
  return { recipe, status: library.status, reload: library.reload };
}
