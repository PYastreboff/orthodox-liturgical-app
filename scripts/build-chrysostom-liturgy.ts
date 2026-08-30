/**
 * Build data/liturgy/chrysostom-liturgy.json from GOARCH Hieratikon sources.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildGoarchDivineLiturgy,
  CHRYSOSTOM_GOARCH_CONFIG,
} from './lib/buildGoarchDivineLiturgy.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const sourcesDir = join(root, 'scripts/liturgy-sources');
const outFile = join(root, 'data/liturgy/chrysostom-liturgy.json');

const sections = buildGoarchDivineLiturgy({
  ...CHRYSOSTOM_GOARCH_CONFIG,
  sourcesDir,
});

const payload = {
  version: 10,
  updated: new Date().toISOString().slice(0, 10),
  source:
    'Divine Liturgy of St John Chrysostom — GOARCH Hieratikon skeleton (goarch.org/chapel/texts); Russian congregational text; GOARCH Greek/English skeleton.',
  sections,
};

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

for (const lang of ['en', 'ru', 'el'] as const) {
  const total = sections.reduce((n, s) => n + s.paragraphs[lang].length, 0);
  console.log(`${lang}: ${total} paragraphs`);
}
console.log(`units: ${sections.reduce((n, s) => n + s.units.length, 0)} aligned rows`);
console.log(`Wrote ${outFile}`);
