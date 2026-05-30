/**
 * GitHub Pages serves static files only — refreshing /calendar or /settings 404s
 * unless each route has its own index.html. Copy the main shell for known tab routes
 * and add 404.html as a fallback for other client-side paths.
 *
 * Run after `expo export --platform web` (see publish-gh-pages.sh / CI).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dist = join(root, 'dist');
const indexPath = join(dist, 'index.html');

/** Expo Router tab paths (group segments like (tabs) are omitted from URLs). */
const TAB_ROUTES = ['calendar', 'settings'];

function main() {
  const indexHtml = readFileSync(indexPath, 'utf8');

  for (const route of TAB_ROUTES) {
    const dir = join(dist, route);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), indexHtml);
  }

  // GitHub Pages: custom 404 page loads the app for unmapped deep links.
  writeFileSync(join(dist, '404.html'), indexHtml);

  console.log(`Prepared SPA fallbacks: ${TAB_ROUTES.map((r) => `${r}/index.html`).join(', ')}, 404.html`);
}

try {
  readFileSync(indexPath);
} catch {
  console.error('Error: dist/index.html missing — run npm run build:web first.');
  process.exit(1);
}

main();
