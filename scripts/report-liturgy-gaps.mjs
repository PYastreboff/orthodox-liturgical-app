#!/usr/bin/env node
/** Report missing or misaligned EL/RU lines after building from the English spine. */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function audit(file) {
  const data = JSON.parse(readFileSync(join(root, 'data/liturgy', file), 'utf8'));

  const gaps = [];

  for (const section of data.sections) {
    section.units.forEach((unit, index) => {
      const missingEl = !unit.el?.trim();
      const missingRu = !unit.ru?.trim();
      if (missingEl || missingRu) {
        gaps.push({
          file,
          section: section.id,
          index,
          en: unit.en,
          missingEl,
          missingRu,
        });
      }
    });
  }

  return gaps;
}

const gaps = [
  ...audit('chrysostom-liturgy.json'),
  ...audit('basil-liturgy.json'),
  ...audit('vespers-liturgy.json'),
];

const out = join(root, 'scripts/liturgy-sources/translation-gaps.json');
writeFileSync(out, `${JSON.stringify(gaps, null, 2)}\n`, 'utf8');
console.log(`Wrote ${gaps.length} gaps to ${out}`);
