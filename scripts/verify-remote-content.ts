/**
 * Every JSON file served to installed apps from `main` must pass the same validators
 * the app uses. Run before pushing content changes (CI runs it on every PR).
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { normalizeOrthocalDay } from '../src/lib/api/orthocalValidate';
import { parseStreams } from '../src/lib/livestreams/orthodoxLivestreams';
import { parseLiturgyPayload } from '../src/lib/liturgy/liturgyRemoteLoader';
import { parseRecipe, parseRecipeLibrary } from '../src/lib/recipes/recipeLibrarySchema';

const root = join(__dirname, '..');
const readJson = (path: string): unknown => JSON.parse(readFileSync(join(root, path), 'utf8'));

// Recipes: every entry valid (the app tolerates 10% bad entries; the repo must not).
const recipesRaw = readJson('data/recipes/fasting-recipes.json') as { recipes: unknown[] };
const recipes = parseRecipeLibrary(recipesRaw);
assert.ok(recipes, 'fasting-recipes.json failed validation');
const invalidRecipes = recipesRaw.recipes
  .filter((r) => parseRecipe(r) === null)
  .map((r) => (r as { id?: string })?.id ?? '?');
assert.deepEqual(invalidRecipes, [], `Invalid recipes: ${invalidRecipes.join(', ')}`);
const ids = recipes.recipes.map((r) => r.id);
assert.equal(new Set(ids).size, ids.length, 'Duplicate recipe ids');

for (const file of ['chrysostom-liturgy.json', 'basil-liturgy.json']) {
  assert.ok(parseLiturgyPayload(readJson(`data/liturgy/${file}`)), `${file} failed validation`);
}

const liveNow = readJson('data/livestreams/live-now.json') as { streams: unknown[] };
assert.ok(parseStreams(liveNow), 'live-now.json failed validation');

// Schema gating: a payload from a future schema is refused, not half-rendered.
assert.equal(parseRecipeLibrary({ ...recipesRaw, schemaVersion: 2 }), null);
assert.equal(
  parseLiturgyPayload({ ...(readJson('data/liturgy/chrysostom-liturgy.json') as object), schemaVersion: 2 }),
  null,
);
assert.equal(parseStreams({ ...liveNow, schemaVersion: 2 }), null);

// Streams: unknown channels and malformed video ids are dropped; stale data is never "live".
const [stream] = parseStreams({
  updated: '2000-01-01T00:00:00Z',
  streams: [
    { channelId: 'stMarysOca', videoId: 'idFd51_5Ylk', status: 'live' },
    { channelId: 'stMarysOca', videoId: 'javascript:alert(1)', status: 'live' },
    { channelId: 'unknownChannel', videoId: 'idFd51_5Ylk', status: 'live' },
  ],
})!;
assert.equal(stream.status, 'upcoming');
assert.equal(parseStreams({ updated: new Date().toISOString(), streams: [] })?.length, 0);

// Orthocal: missing arrays are coerced instead of crashing `.map` in the UI.
const day = normalizeOrthocalDay({ year: 2026, month: 9, day: 27, readings: [{ display: 'Jn 1:1' }, 5] });
assert.ok(day);
assert.deepEqual(day.saints, []);
assert.equal(day.readings.length, 1);
assert.equal(day.readings[0].passage, null);
assert.equal(normalizeOrthocalDay({ month: 9, day: 27 }), null);
assert.equal(normalizeOrthocalDay('<html>'), null);

console.log(`verify-remote-content: ok (${ids.length} recipes)`);
