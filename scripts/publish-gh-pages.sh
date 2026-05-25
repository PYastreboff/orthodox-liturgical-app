#!/usr/bin/env bash
# Publishes dist/ to the gh-pages branch (site root only — never node_modules).
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ ! -f package.json ]]; then
  echo "Error: run this from the main branch (package.json missing)." >&2
  echo "  git checkout main" >&2
  exit 1
fi

echo "Building web app…"
rm -rf dist
npm run build:web

if [[ ! -f dist/index.html ]]; then
  echo "Error: dist/index.html missing after build." >&2
  exit 1
fi

touch dist/.nojekyll

# gh-pages caches under node_modules; clear so paths are not published wrongly.
rm -rf node_modules/.cache/gh-pages 2>/dev/null || true

echo "Publishing dist/ to gh-pages branch…"
npx --yes gh-pages@6.3.0 -d dist --nojekyll --remove "node_modules" --remove ".expo" --remove "app" --remove "src"

echo "Done. In GitHub: Settings → Pages → Branch gh-pages / (root)"
echo "Site: https://pyastreboff.github.io/orthodox-liturgical-app/"
