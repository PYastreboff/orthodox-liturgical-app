/**
 * Lenten recipe library. A copy of `data/recipes/fasting-recipes.json` ships in the
 * binary so the page always works offline; newer copies from GitHub `main` replace it
 * (and are persisted) only when they pass schema-version and shape validation.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { fetchJson } from '../net/fetchJson';
import type { FastingRecipe } from './fastingRecipes';
import { parseRecipeLibrary, type RecipeLibrary } from './recipeLibrarySchema';

const DEFAULT_URLS = [
  'https://raw.githubusercontent.com/PYastreboff/orthodox-liturgical-app/main/data/recipes/fasting-recipes.json',
  'https://cdn.jsdelivr.net/gh/PYastreboff/orthodox-liturgical-app@main/data/recipes/fasting-recipes.json',
] as const;

const STORAGE_KEY = '@orthodaily/recipe-library/v1';

function libraryUrls(): string[] {
  const override =
    typeof process !== 'undefined' && process.env.EXPO_PUBLIC_RECIPE_LIBRARY_URL?.trim();
  return override ? [override, ...DEFAULT_URLS] : [...DEFAULT_URLS];
}

export type RecipeLibraryState =
  | { status: 'loading'; recipes: readonly FastingRecipe[] }
  | { status: 'ready'; recipes: readonly FastingRecipe[] }
  | { status: 'offline'; recipes: readonly FastingRecipe[]; error: string };

let bundledLibrary: RecipeLibrary | null = null;
function getBundledLibrary(): RecipeLibrary {
  if (!bundledLibrary) {
    const raw: unknown = require('../../../data/recipes/fasting-recipes.json');
    bundledLibrary = parseRecipeLibrary(raw) ?? { updated: '', recipes: [] };
  }
  return bundledLibrary;
}

let current: RecipeLibrary | null = null;
let persistedLoaded = false;
let remoteChecked = false;
let inflight: Promise<readonly FastingRecipe[]> | null = null;

function getCurrent(): RecipeLibrary {
  if (!current) current = getBundledLibrary();
  return current;
}

function adoptIfNewer(candidate: RecipeLibrary | null): boolean {
  if (!candidate) return false;
  if (candidate.updated < getCurrent().updated) return false;
  current = candidate;
  return true;
}

async function loadPersisted(): Promise<void> {
  if (persistedLoaded) return;
  persistedLoaded = true;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) adoptIfNewer(parseRecipeLibrary(JSON.parse(raw)));
  } catch {
    // Corrupt or unavailable storage — the bundled copy is still valid.
  }
}

async function fetchRemote(): Promise<void> {
  let lastError: unknown = new Error('Network error');
  for (const url of libraryUrls()) {
    try {
      const library = parseRecipeLibrary(await fetchJson(url, { timeoutMs: 20000 }));
      if (!library) throw new Error('Recipe library failed validation');
      if (adoptIfNewer(library)) {
        void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(library)).catch(() => {});
      }
      return;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

/**
 * Best available recipes. Checks GitHub once per session (or on `force`); when that
 * fails the persisted or bundled library is returned instead of throwing, unless
 * there is nothing at all to show.
 */
export async function fetchFastingRecipes(options?: {
  force?: boolean;
}): Promise<readonly FastingRecipe[]> {
  if (!options?.force && remoteChecked) return getCurrent().recipes;
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      await loadPersisted();
      try {
        await fetchRemote();
      } catch (error) {
        if (getCurrent().recipes.length === 0) throw error;
      }
      remoteChecked = true;
      return getCurrent().recipes;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

/** Recipes available synchronously (bundled or already-fetched); empty only if the bundle is broken. */
export function getCachedFastingRecipes(): readonly FastingRecipe[] | null {
  const recipes = getCurrent().recipes;
  return recipes.length > 0 ? recipes : null;
}

export function getRecipeFromCache(id: string): FastingRecipe | undefined {
  return getCurrent().recipes.find((recipe) => recipe.id === id);
}
