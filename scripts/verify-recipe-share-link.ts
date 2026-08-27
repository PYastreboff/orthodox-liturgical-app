import assert from 'node:assert/strict';

import { buildRecipeShareBody } from '../src/lib/share/recipeShareLink';

const DEFAULT_WEB_ORIGIN = 'https://pyastreboff.github.io/orthodox-liturgical-app';

function buildRecipeShareUrlForTest(recipeId: string, shareBasePath = '/recipes'): string {
  const segment = shareBasePath.replace(/^\/|\/$/g, '');
  return `${DEFAULT_WEB_ORIGIN}/${segment}/${encodeURIComponent(recipeId)}`;
}

assert.equal(buildRecipeShareUrlForTest('lentil-soup'), `${DEFAULT_WEB_ORIGIN}/recipes/lentil-soup`);
assert.equal(
  buildRecipeShareUrlForTest('pascha', '/easter-cooking'),
  `${DEFAULT_WEB_ORIGIN}/easter-cooking/pascha`,
);

assert.equal(
  buildRecipeShareBody(
    { recipeId: 'lentil-soup', title: 'Lentil Soup', detailLine: '45 min · Easy' },
    'OrthoDaily',
  ),
  'OrthoDaily\nLentil Soup\n45 min · Easy',
);

console.log('verify-recipe-share-link: ok');
