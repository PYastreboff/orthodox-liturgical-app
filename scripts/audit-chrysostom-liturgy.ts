/**
 * Audit chrysostom-liturgy.json for language purity and alignment issues.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseLiturgyLine } from '../src/lib/liturgy/parseLiturgyLine.ts';
import { lineRole } from '../src/lib/liturgy/liturgyUnit.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(
  readFileSync(join(__dirname, '../data/liturgy/chrysostom-liturgy.json'), 'utf8'),
) as {
  sections: {
    id: string;
    units: { en: string; el?: string; ru?: string }[];
    paragraphs: { en: string[]; el: string[]; ru: string[] };
  }[];
};

const GREEK = /[\u0370-\u03FF\u1F00-\u1FFF]/;
const CYRILLIC = /[\u0400-\u04FF]/;
const LATIN = /[A-Za-z]/;

function dominantScript(text: string): 'en' | 'el' | 'ru' | 'mixed' | 'empty' {
  const t = text.replace(/^(DEACON|PRIEST|CHOIR|PEOPLE|READER|CLERGY|ΔΙΑΚΟΝΟΣ|ΙΕΡΕΥΣ|ΧΟΡΟΣ|ΛΑΟΣ|Священник|Диакон|Хор|Народ|Чтец)\s*(\([^)]*\))?\s*:?\s*/i, '');
  if (!t.trim()) return 'empty';
  const g = (t.match(GREEK) ?? []).length;
  const c = (t.match(CYRILLIC) ?? []).length;
  const l = (t.match(LATIN) ?? []).length;
  if (g > c && g > l && g > 2) return 'el';
  if (c > g && c > l && c > 2) return 'ru';
  if (l > g && l > c && l > 2) return 'en';
  if (g + c + l < 3) return 'empty';
  return 'mixed';
}

function stripRoles(text: string): string {
  return text
    .replace(/^(DEACON|PRIEST|CHOIR|PEOPLE|READER|CLERGY)(\s*\([^)]*\))?\s*:\s*/i, '')
    .replace(/^(ΔΙΑΚΟΝΟΣ|ΙΕΡΕΥΣ|ΧΟΡΟΣ|ΛΑΟΣ|ΑΝΑΓΝΩΣΤΗΣ)\s*:\s*/i, '')
    .replace(/^(Священник|Диакон|Чтец|Народ|Хор)\s*:\s*/i, '')
    .trim();
}

let issues = 0;

for (const section of data.sections) {
  const { id, units, paragraphs } = section;
  console.log(`\n=== ${id} === paragraphs en=${paragraphs.en.length} ru=${paragraphs.ru.length} el=${paragraphs.el.length} units=${units.length}`);

  for (let i = 0; i < units.length; i++) {
    const u = units[i]!;
    for (const lang of ['en', 'ru', 'el'] as const) {
      const line = u[lang];
      if (!line?.trim()) continue;
      const script = dominantScript(line);
      if (script !== 'empty' && script !== lang && script !== 'mixed') {
        console.log(`  [${id}#${i}] ${lang} column has ${script}: ${line.slice(0, 80)}…`);
        issues++;
      }
      if (script === 'mixed') {
        console.log(`  [${id}#${i}] ${lang} MIXED script: ${line.slice(0, 100)}…`);
        issues++;
      }
    }

    const enRole = lineRole(u.en, 'en');
    const ruRole = u.ru ? lineRole(u.ru, 'ru') : null;
    const elRole = u.el ? lineRole(u.el, 'el') : null;
    if (enRole && ruRole && enRole !== ruRole) {
      console.log(`  [${id}#${i}] role mismatch en=${enRole} ru=${ruRole}: ${u.en.slice(0, 40)} | ${u.ru?.slice(0, 40)}`);
      issues++;
    }
    if (enRole && elRole && enRole !== elRole) {
      console.log(`  [${id}#${i}] role mismatch en=${enRole} el=${elRole}: ${u.en.slice(0, 40)} | ${u.el?.slice(0, 40)}`);
      issues++;
    }
  }

  // Junk patterns in RU
  for (const line of paragraphs.ru) {
    if (/\d+-й антифон|ектения|малый вход|великий вход/i.test(line) && /^(Хор|Священник|Диакон)/i.test(line) === false) {
      // section marker as standalone - ok
    }
    if (/^(Хор|Священник|Диакон).*(ектения|антифон|вход)/i.test(line)) {
      console.log(`  [${id}] RU junk in role line: ${line.slice(0, 100)}…`);
      issues++;
    }
  }

  for (const line of paragraphs.en) {
    if (/^(CHOIR|DEACON|PRIEST).*(Antiphon|Litany|Entrance)/i.test(line)) {
      console.log(`  [${id}] EN junk in role line: ${line.slice(0, 100)}…`);
      issues++;
    }
  }
}

console.log(`\nTotal issues: ${issues}`);
