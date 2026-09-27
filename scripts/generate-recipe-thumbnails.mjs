/**
 * Generates downscaled {name}-thumb.jpg files next to the full-res recipe and
 * Easter food photos, plus WebP copies of both ({name}.webp, {name}-thumb.webp).
 * The app loads the WebP files (list rows use thumbs, the detail hero the full
 * image); the JPGs stay as source originals and a legacy fallback.
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
const WEBP_QUALITY = 78;

async function main() {
  let photos = 0;
  for (const dir of TARGET_DIRS) {
    const entries = await readdir(dir);
    for (const entry of entries) {
      if (!/\.jpg$/i.test(entry) || entry.endsWith('-thumb.jpg')) continue;
      const file = join(dir, entry);
      const info = await stat(file);
      if (!info.isFile()) continue;
      const name = basename(entry, extname(entry));
      const thumb = () =>
        sharp(file)
          .rotate()
          .resize({ width: THUMB_MAX, height: THUMB_MAX, fit: 'inside', withoutEnlargement: true });

      await thumb().jpeg({ quality: 80, progressive: true }).toFile(join(dir, `${name}-thumb.jpg`));
      await thumb().webp({ quality: WEBP_QUALITY }).toFile(join(dir, `${name}-thumb.webp`));
      await sharp(file).rotate().webp({ quality: WEBP_QUALITY }).toFile(join(dir, `${name}.webp`));
      photos += 1;
    }
  }
  console.log(`Generated thumbnails and WebP copies for ${photos} photos (thumbs max ${THUMB_MAX}px).`);
}

void main();
