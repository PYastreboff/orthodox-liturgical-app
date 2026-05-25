/**
 * Regenerate icon.png, splash.png, and favicon.png from OrthoDaily brand colours.
 * Run: node scripts/generate-brand-assets.mjs
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, '..', 'assets');

const WINE = '#6b2d3c';
const GOLD = '#b08d57';
const SPLASH_BG = '#1a1410';

function roundedRectSvg(size, radius, fill) {
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" fill="${fill}"/>
    </svg>`,
  );
}

function crossSvg(size, stroke, strokeWidth) {
  const c = size / 2;
  const barY = size * 0.39;
  const topY = size * 0.22;
  const botY = size * 0.78;
  const armL = size * 0.33;
  const armR = size * 0.67;
  const topBarL = size * 0.41;
  const topBarR = size * 0.59;
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <line x1="${c}" y1="${topY}" x2="${c}" y2="${botY}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round"/>
      <line x1="${armL}" y1="${barY}" x2="${armR}" y2="${barY}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round"/>
      <line x1="${topBarL}" y1="${topY + size * 0.04}" x2="${topBarR}" y2="${topY + size * 0.04}" stroke="${stroke}" stroke-width="${strokeWidth * 0.8}" stroke-linecap="round"/>
    </svg>`,
  );
}

async function composeAppIcon(size) {
  const radius = Math.round(size * 0.22);
  const bg = roundedRectSvg(size, radius, WINE);
  const cross = crossSvg(size, GOLD, Math.max(2, size * 0.0625));
  return sharp(bg)
    .composite([{ input: cross, blend: 'over' }])
    .png()
    .toBuffer();
}

async function composeSplash(width, height) {
  const logoSize = Math.round(Math.min(width, height) * 0.28);
  const logo = await composeAppIcon(logoSize);
  const bg = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: SPLASH_BG,
    },
  })
    .png()
    .toBuffer();

  return sharp(bg)
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toBuffer();
}

const icon1024 = await composeAppIcon(1024);
writeFileSync(join(assetsDir, 'icon.png'), icon1024);

const splash = await composeSplash(1284, 2778);
writeFileSync(join(assetsDir, 'splash.png'), splash);

const favicon = await sharp(icon1024).resize(48, 48).png().toBuffer();
writeFileSync(join(assetsDir, 'favicon.png'), favicon);

console.log('Wrote assets/icon.png, assets/splash.png, assets/favicon.png');
