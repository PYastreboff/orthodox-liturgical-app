#!/usr/bin/env node
/**
 * Build global EL/RU maps keyed by exact English liturgy lines.
 * Run: node scripts/generate-liturgy-translation-map.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outFile = join(root, 'scripts/liturgy-sources/liturgy-translations.json');

const el = {};
const ru = {};

for (const file of ['chrysostom-liturgy.json', 'basil-liturgy.json', 'vespers-liturgy.json']) {
  const data = JSON.parse(readFileSync(join(root, 'data/liturgy', file), 'utf8'));
  for (const section of data.sections) {
    for (const unit of section.units) {
      const en = unit.en?.trim();
      if (!en) continue;
      if (unit.el?.trim()) el[en] = unit.el.trim();
      if (unit.ru?.trim()) ru[en] = unit.ru.trim();
    }
  }
}

writeFileSync(outFile, `${JSON.stringify({ el, ru }, null, 2)}\n`, 'utf8');
console.log(`Wrote ${Object.keys(el).length} el and ${Object.keys(ru).length} ru entries to ${outFile}`);
