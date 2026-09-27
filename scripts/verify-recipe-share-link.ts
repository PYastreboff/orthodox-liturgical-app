import assert from 'node:assert/strict';

import { buildAppWebBaseUrl } from '../src/lib/share/appWebBase';

const BASE = '/orthodox-liturgical-app';
const PROD = 'https://pyastreboff.github.io/orthodox-liturgical-app';

// Native: fixed origin + baseUrl exactly once.
assert.equal(buildAppWebBaseUrl({ basePath: BASE }), PROD);
assert.equal(buildAppWebBaseUrl({ basePath: `${BASE}/` }), PROD);

// Web (GitHub Pages): current page path must not leak into the base.
assert.equal(
  buildAppWebBaseUrl({
    basePath: BASE,
    webOrigin: 'https://pyastreboff.github.io',
    webPathname: `${BASE}/recipes/lentil-soup`,
  }),
  PROD,
);
assert.equal(
  buildAppWebBaseUrl({
    basePath: BASE,
    webOrigin: 'https://pyastreboff.github.io',
    webPathname: BASE,
  }),
  PROD,
);

// Web dev server serves from `/`, so no baseUrl prefix.
assert.equal(
  buildAppWebBaseUrl({
    basePath: BASE,
    webOrigin: 'http://localhost:8081',
    webPathname: '/recipes/lentil-soup',
  }),
  'http://localhost:8081',
);

function recipeUrl(base: string, recipeId: string, shareBasePath = '/recipes'): string {
  const segment = shareBasePath.replace(/^\/|\/$/g, '');
  return `${base.replace(/\/$/, '')}/${segment}/${encodeURIComponent(recipeId)}`;
}

assert.equal(recipeUrl(PROD, 'lentil-soup'), `${PROD}/recipes/lentil-soup`);
assert.equal(recipeUrl(PROD, 'pascha', '/easter-cooking'), `${PROD}/easter-cooking/pascha`);

console.log('verify-recipe-share-link: ok');
