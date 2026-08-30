#!/usr/bin/env node
/** Find EN/EL/RU role mismatches in liturgy JSON. */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const EN_ROLE = /^(DEACON|PRIEST|CHOIR|PEOPLE|READER)(\s*\([^)]*\))?\s*:/i;
const EL_ROLE = /^(ΔΙΑΚΟΝΟΣ|ΙΕΡΕΥΣ|ΧΟΡΟΣ|ΛΑΟΣ|ΑΝΑΓΝΩΣΤΗΣ)(\s*\([^)]*\))?\s*[:·]/i;
const RU_ROLE = /^(Священник|Диакон|Чтец|Народ|Хор)(\s*\([^)]*\))?\s*:/i;

function role(line, lang) {
  if (!line) return null;
  const m =
    lang === 'en'
      ? line.match(EN_ROLE)
      : lang === 'el'
        ? line.match(EL_ROLE)
        : line.match(RU_ROLE);
  return m ? m[1].toLowerCase() : 'speech';
}

const issues = [];
for (const file of ['chrysostom-liturgy.json', 'basil-liturgy.json']) {
  const data = JSON.parse(readFileSync(join(root, 'data/liturgy', file), 'utf8'));
  for (const section of data.sections) {
    section.units.forEach((unit, index) => {
      const enRole = role(unit.en, 'en');
      for (const lang of ['el', 'ru']) {
        const line = unit[lang];
        if (!line) continue;
        const otherRole = role(line, lang);
        const expected =
          lang === 'el'
            ? { deacon: 'διακονος', priest: 'ιερευς', choir: 'χορος', people: 'λαος', reader: 'αναγνωστης' }
            : { deacon: 'диакон', priest: 'священник', choir: 'хор', people: 'народ', reader: 'чтец' };
        if (enRole === 'speech' || otherRole === 'speech') continue;
        const enKey = enRole === 'deacon' ? 'deacon' : enRole;
        if (expected[enKey] && otherRole !== expected[enKey] && otherRole !== 'speech') {
          issues.push({ file, section: section.id, index, lang, en: unit.en.slice(0, 80), got: line.slice(0, 80) });
        }
      }
    });
  }
}

console.log('role mismatches', issues.length);
issues.slice(0, 25).forEach((i) => console.log(JSON.stringify(i)));
writeFileSync(
  join(root, 'scripts/liturgy-sources/translation-role-mismatches.json'),
  `${JSON.stringify(issues, null, 2)}\n`,
);
