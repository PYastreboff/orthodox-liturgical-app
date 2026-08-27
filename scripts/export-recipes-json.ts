#!/usr/bin/env npx tsx
/**
 * Rebuild data/recipes/fasting-recipes.json from scripts/recipe-library/*.ts
 * Then commit + push so jsDelivr can serve the updated library.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { FASTING_RECIPES } from './recipe-library/recipeDatabase.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'data/recipes');
const outFile = join(outDir, 'fasting-recipes.json');

mkdirSync(outDir, { recursive: true });
const payload = {
  version: 1,
  updated: new Date().toISOString().slice(0, 10),
  recipes: FASTING_RECIPES,
};
writeFileSync(outFile, `${JSON.stringify(payload)}\n`);
console.log(`Wrote ${FASTING_RECIPES.length} recipes → ${outFile}`);
