/**
 * Build data/liturgy/basil-liturgy.json from GOARCH Hieratikon sources.
 * Greek is aligned to the Basil English spine (Chrysostom reuse + gr-en pairs + overrides).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  BASIL_GOARCH_CONFIG,
  buildBasilGoarchDivineLiturgy,
  CHRYSOSTOM_GOARCH_CONFIG,
} from './lib/buildGoarchDivineLiturgy.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const sourcesDir = join(root, 'scripts/liturgy-sources');
const outFile = join(root, 'data/liturgy/basil-liturgy.json');

const sections = buildBasilGoarchDivineLiturgy(
  { ...BASIL_GOARCH_CONFIG, sourcesDir },
  {
    chrysostomConfig: { ...CHRYSOSTOM_GOARCH_CONFIG, sourcesDir },
    grEnFile: 'basil-gr-en-goarch.txt',
    grEnMarkers: BASIL_GOARCH_CONFIG.elMarkers,
    overridesFile: 'basil-el-overrides.json',
    sharedEnFromChrysostom: ['great_litany'],
  },
);

const payload = {
  version: 3,
  updated: new Date().toISOString().slice(0, 10),
  source:
    'Divine Liturgy of St Basil the Great — GOARCH Hieratikon skeleton (goarch.org/chapel/texts); Greek aligned to the Basil English text; Russian from Chrysostom congregational text where parallel.',
  sections,
};

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

let missingEl = 0;
for (const lang of ['en', 'ru', 'el'] as const) {
  const total = sections.reduce((n, s) => n + s.paragraphs[lang].length, 0);
  console.log(`${lang}: ${total} paragraphs`);
}
for (const section of sections) {
  section.paragraphs.en.forEach((en, index) => {
    if (!section.paragraphs.el[index]?.trim()) {
      missingEl++;
      if (missingEl <= 5) {
        console.warn(`[missing el] ${section.id}#${index}: ${en.slice(0, 72)}…`);
      }
    }
  });
}
if (missingEl > 5) console.warn(`…and ${missingEl - 5} more missing Greek lines`);
console.log(`units: ${sections.reduce((n, s) => n + s.units.length, 0)} aligned rows`);
console.log(`Wrote ${outFile}`);
