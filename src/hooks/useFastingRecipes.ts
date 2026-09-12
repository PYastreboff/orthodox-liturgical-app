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

  useEffect(() => {
    if (getCachedFastingRecipes()) return;
    let cancelled = false;
    void fetchFastingRecipes({ force: false })
      .then((recipes) => {
        if (!cancelled) setState({ status: 'ready', recipes });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : 'Network error';
        setState({ status: 'offline', recipes: [], error: message });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const reload = useCallback(() => {
    setState((prev) => ({ status: 'loading', recipes: prev.recipes }));
    void fetchFastingRecipes({ force: true })
      .then((recipes) => {
        setState({ status: 'ready', recipes });
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Network error';
        setState({ status: 'offline', recipes: [], error: message });
      });
  }, []);

  return {
    ...state,
    reload,
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