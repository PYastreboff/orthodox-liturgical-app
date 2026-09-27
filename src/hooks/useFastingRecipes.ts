import { useCallback, useEffect, useState } from 'react';

import type { FastingRecipe } from '../lib/recipes/fastingRecipes';
import {
  fetchFastingRecipes,
  getCachedFastingRecipes,
  type RecipeLibraryState,
} from '../lib/recipes/recipeLibraryRemote';

/**
 * Shows the bundled (or previously downloaded) recipes immediately, then swaps in a
 * newer remote copy if one validates. Offline only when there is nothing to show.
 */
export function useFastingRecipes(): RecipeLibraryState & { reload: () => void } {
  const [state, setState] = useState<RecipeLibraryState>(() => {
    const cached = getCachedFastingRecipes();
    return cached ? { status: 'ready', recipes: cached } : { status: 'loading', recipes: [] };
  });

  const load = useCallback((force: boolean) => {
    let cancelled = false;
    void fetchFastingRecipes({ force })
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

  useEffect(() => load(false), [load]);

  const reload = useCallback(() => {
    setState((prev) =>
      prev.recipes.length > 0 ? prev : { status: 'loading', recipes: prev.recipes },
    );
    load(true);
  }, [load]);

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
