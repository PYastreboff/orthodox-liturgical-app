#!/usr/bin/env node
/**
 * Build liturgy-translations-pending.json with proper GOARCH Greek and Russian liturgical text.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourcesDir = join(root, 'scripts/liturgy-sources');

const gaps = JSON.parse(readFileSync(join(sourcesDir, 'translation-gaps.json'), 'utf8'));
const existing = JSON.parse(readFileSync(join(sourcesDir, 'liturgy-translations.json'), 'utf8'));

const GREEK_RE = /[\u0370-\u03FF\u1F00-\u1FFF]/;

function norm(s) {
  return s.replace(/\s+/g, ' ').trim();
}

function isGreekLine(s) {
  const t = s.trim();
  if (!t || !GREEK_RE.test(t)) return false;
  const latin = (t.match(/[A-Za-z]/g) || []).length;
  const greek = (t.match(/[\u0370-\u03FF\u1F00-\u1FFF]/g) || []).length;
  return greek > latin;
}

function isEnglishLine(s) {
  const t = s.trim();
  if (!t || isGreekLine(t)) return false;
  if (
    /^(ΔΙΑΚΟΝΟΣ|ΙΕΡΕΥΣ|ΧΟΡΟΣ|ΛΑΟΣ|ΑΝΑΓΝΩΣΤΗΣ|DEACON|PRIEST|CHOIR|PEOPLE|READER|LITURGY|ENARXIS|__________|Books|This is|Hieratikon|Βιβλ|ΛΕΙΤΟΥΡΓΙΑ|See Liturgy|Small Litany|PRAYER|THE ENTRANCE|Only-begotten|Μικρὰ|Ἀντίφωνον|c\d+ -|\(See )/i.test(
      t,
    )
  )
    return false;
  if (/^[\d\s.]+$/.test(t)) return false;
  return /[A-Za-z]/.test(t);
}

function parseGoarch(filePath) {
  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);
  const pairs = new Map();
  let pg = [];
  let pe = [];
  const flush = () => {
    if (pg.length && pe.length) {
      pairs.set(norm(pe.join(' ')), norm(pg.join(' ')));
    }
    pg = [];
    pe = [];
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line === '__________') continue;
    if (isGreekLine(line)) {
      if (pe.length) flush();
      pg.push(line);
    } else if (isEnglishLine(line)) {
      pe.push(line);
    } else {
      flush();
    }
  }
  flush();
  return pairs;
}

const goarchEl = new Map([
  ...parseGoarch(join(sourcesDir, 'chrysostom-gr-en-goarch.txt')),
  ...parseGoarch(join(sourcesDir, 'basil-gr-en-goarch.txt')),
]);

const ROLE_EL = {
  DEACON: 'ΔΙΑΚΟΝΟΣ',
  PRIEST: 'ΙΕΡΕΥΣ',
  CHOIR: 'ΧΟΡΟΣ',
  PEOPLE: 'ΛΑΟΣ',
  READER: 'ΑΝΑΓΝΩΣΤΗΣ',
};

function parseRole(en) {
  const m = en.match(/^(DEACON|PRIEST|CHOIR|PEOPLE|READER)(\s*\((in a low voice|aloud)\))?:\s*(.*)$/s);
  if (!m) return null;
  return {
    role: m[1],
    qual:
      m[2]?.includes('low') ? 'low' : m[2]?.includes('aloud') ? 'aloud' : null,
    body: m[3].trim(),
  };
}

function elQual(q) {
  if (q === 'low') return ' (χαμηλοφώνως)';
  if (q === 'aloud') return ' (ἐκφώνως)';
  return '';
}

function withRoleEl(en, body) {
  const r = parseRole(en);
  if (!r) return body;
  return `${ROLE_EL[r.role]}${elQual(r.qual)}: ${body}`;
}

function lookupEl(en) {
  const r = parseRole(en);
  const body = r ? r.body : en;
  const n = norm(body);
  if (goarchEl.has(n)) return withRoleEl(en, goarchEl.get(n));
  if (goarchEl.has(norm(en))) return goarchEl.get(norm(en));
  return null;
}

// Authoritative manual translations for exact gap keys (fragments + full lines + Russian)
const manual = JSON.parse(readFileSync(join(sourcesDir, 'pending-translations-manual.json'), 'utf8'));

const unique = new Map();
for (const g of gaps) {
  if (!unique.has(g.en)) unique.set(g.en, { missingEl: false, missingRu: false });
  const u = unique.get(g.en);
  if (g.missingEl) u.missingEl = true;
  if (g.missingRu) u.missingRu = true;
}

const pending = { el: {}, ru: {} };

for (const [en, flags] of unique) {
  if (flags.missingEl && !existing.el[en]) {
    const el = manual.el?.[en] ?? lookupEl(en);
    if (el) pending.el[en] = el;
  }
  if (flags.missingRu && !existing.ru[en]) {
    const ru = manual.ru?.[en];
    if (ru) pending.ru[en] = ru;
  }
}

const outFile = join(sourcesDir, 'liturgy-translations-pending.json');
writeFileSync(outFile, `${JSON.stringify(pending, null, 2)}\n`, 'utf8');

const missEl = [...unique].filter(([en, f]) => f.missingEl && !existing.el[en] && !pending.el[en]);
const missRu = [...unique].filter(([en, f]) => f.missingRu && !existing.ru[en] && !pending.ru[en]);
console.log(`Wrote el=${Object.keys(pending.el).length} ru=${Object.keys(pending.ru).length}`);
console.log(`Missing el=${missEl.length} ru=${missRu.length}`);
if (missEl.length) missEl.slice(0, 5).forEach(([e]) => console.log(' EL:', e.slice(0, 80)));
if (missRu.length) missRu.slice(0, 5).forEach(([e]) => console.log(' RU:', e.slice(0, 80)));
