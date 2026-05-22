#!/usr/bin/env bash
# Publishes dist/ to the gh-pages branch (creates the branch if missing).
set -euo pipefail
cd "$(dirname "$0")/.."

echo "Building web app…"
npm run build:web
touch dist/.nojekyll

echo "Publishing to gh-pages branch…"
npx --yes gh-pages@6.3.0 -d dist --nojekyll

echo "Done. In GitHub: Settings → Pages → Branch gh-pages / (root)"
echo "Site: https://pyastreboff.github.io/orthodox-liturgical-app/"
