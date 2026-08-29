/**
 * Build data/liturgy/chrysostom-liturgy.json from St Justin Martyr aligned canonical source.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { sanitizeLiturgyLines } from '../src/lib/liturgy/liturgySanitize.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const canonicalFile = join(root, 'scripts/liturgy-sources/chrysostom-st-justin-canonical.json');
const outFile = join(root, 'data/liturgy/chrysostom-liturgy.json');

const SECTION_IDS = [
  'opening',
  'great_litany',
  'antiphons',
  'readings',
  'cherubic',
  'creed',
  'anaphora',
  'communion',
  'dismissal',
] as const;

type SectionId = (typeof SECTION_IDS)[number];
type Lang = 'en' | 'ru' | 'el';

type CanonicalRow = { en: string; el: string; ru: string };

type CanonicalFile = Record<SectionId, CanonicalRow[]>;

const canonical = JSON.parse(readFileSync(canonicalFile, 'utf8')) as CanonicalFile;

const sections = SECTION_IDS.map((id) => {
  const rows = canonical[id] ?? [];
  const en = sanitizeLiturgyLines(
    rows.map((r) => r.en).filter(Boolean),
    'en',
    id,
  );
  const el = sanitizeLiturgyLines(
    rows.map((r) => r.el).filter(Boolean),
    'el',
    id,
  );
  const ru = sanitizeLiturgyLines(
    rows.map((r) => r.ru).filter(Boolean),
    'ru',
    id,
  );

  const count = Math.max(en.length, el.length, ru.length);
  const units = Array.from({ length: count }, (_, index) => ({
    en: en[index] ?? '',
    el: el[index] ?? '',
    ru: ru[index] ?? '',
  })).filter((unit) => unit.en.trim() || unit.el.trim() || unit.ru.trim());

  return {
    id,
    units,
    paragraphs: { en, el, ru },
  };
});

const payload = {
  version: 7,
  updated: new Date().toISOString().slice(0, 10),
  source:
    'Divine Liturgy of St John Chrysostom — St Justin Martyr Orthodox Church congregational text (LITURGY-for-website.pdf); Greek and Church Slavonic aligned translations.',
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
