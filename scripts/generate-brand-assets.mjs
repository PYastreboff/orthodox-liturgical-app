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
/** Keep in sync with src/brand/splash.ts */
const SPLASH_BG = '#1a1410';

/** Keep in sync with src/brand/orthodoxCrossGeometry.ts */
const ORTHODOX_CROSS_VIEW = 100;
const BARS = {
  vertical: { cx: 50, top: 4, bottom: 96, width: 10 },
  main: { cy: 33, left: 11, right: 89, height: 10.5 },
  top: { cy: 13, left: 39, right: 61, height: 7.5 },
  footrest: { cx: 50, cy: 78, width: 32, height: 7, angleDeg: 18 },
};

function roundedRectSvg(size, radius, fill) {
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" fill="${fill}"/>
    </svg>`,
  );
}

function crossSvg(size, fill) {
  const s = size / ORTHODOX_CROSS_VIEW;
  const rx = Math.max(0.8, 1.4 * s);
  const { vertical, main, top, footrest } = BARS;

  const rect = (x, y, w, h) =>
    `<rect x="${x * s}" y="${y * s}" width="${w * s}" height="${h * s}" rx="${rx}" fill="${fill}"/>`;

  const vLeft = vertical.cx - vertical.width / 2;
  const vHeight = vertical.bottom - vertical.top;
  const mainTop = main.cy - main.height / 2;
  const topTop = top.cy - top.height / 2;
  const footLeft = footrest.cx - footrest.width / 2;
  const footTop = footrest.cy - footrest.height / 2;

  return Buffer.from(
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      ${rect(vLeft, vertical.top, vertical.width, vHeight)}
      ${rect(main.left, mainTop, main.right - main.left, main.height)}
      ${rect(top.left, topTop, top.right - top.left, top.height)}
      <rect x="${footLeft * s}" y="${footTop * s}" width="${footrest.width * s}" height="${footrest.height * s}" rx="${rx}" fill="${fill}" transform="rotate(${footrest.angleDeg} ${footrest.cx * s} ${footrest.cy * s})"/>
    </svg>`,
  );
}

async function composeAppIcon(size) {
  const radius = Math.round(size * 0.22);
  const bg = roundedRectSvg(size, radius, WINE);
  const crossSize = Math.round(size * 0.72);
  const inset = Math.round((size - crossSize) / 2);
  const cross = crossSvg(crossSize, GOLD);
  return sharp(bg)
    .composite([{ input: cross, blend: 'over', left: inset, top: inset }])
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
