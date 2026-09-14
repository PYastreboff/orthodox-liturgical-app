/**
 * Generates downscaled {name}-thumb.jpg files next to the full-res recipe and
 * Easter food photos. List rows load these; the detail hero keeps the full image.
 *
 * Run: npm run generate:thumbs
 */
import { readdir, stat } from 'node:fs/promises';
import { join, basename, extname } from 'node:path';
import sharp from 'sharp';

const TARGET_DIRS = [
  new URL('../assets/recipes/', import.meta.url).pathname,
  new URL('../assets/easter/', import.meta.url).pathname,
];

const THUMB_MAX = 320;

async function main() {
  let thumbnails = 0;
  for (const dir of TARGET_DIRS) {
    const entries = await readdir(dir);
    for (const entry of entries) {
      if (!/\.jpg$/i.test(entry) || entry.endsWith('-thumb.jpg')) continue;
      const file = join(dir, entry);
      const info = await stat(file);
      if (!info.isFile()) continue;
      const out = join(dir, `${basename(entry, extname(entry))}-thumb.jpg`);
      await sharp(file)
        .rotate()
        .resize({ width: THUMB_MAX, height: THUMB_MAX, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80, progressive: true })
        .toFile(out);
      thumbnails += 1;
    }
  }
  console.log(`Generated ${thumbnails} thumbnails (max ${THUMB_MAX}px).`);
}

void main();