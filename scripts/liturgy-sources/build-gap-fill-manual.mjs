#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const gaps = JSON.parse(fs.readFileSync(path.join(__dirname, 'translation-gaps.json'), 'utf8'));
const pending = JSON.parse(fs.readFileSync(path.join(__dirname, 'pending-translations-manual.json'), 'utf8'));
const existing = JSON.parse(fs.readFileSync(path.join(__dirname, 'liturgy-translations.json'), 'utf8'));

const GREEK_RE = /[\u0370-\u03FF\u1F00-\u1FFF]/;
const CYRILLIC_RE = /[\u0400-\u04FF]/;

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

function isRussianLine(s) {
  const t = s.trim();
  if (!t || !CYRILLIC_RE.test(t)) return false;
  const latin = (t.match(/[A-Za-z]/g) || []).length;
  const cyr = (t.match(/[\u0400-\u04FF]/g) || []).length;
  return cyr > latin;
}

function parseGoarch(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
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

function parseRu(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  const pairs = new Map();
  let pr = [];
  let pe = [];
  const flush = () => {
    if (pr.length && pe.length) {
      pairs.set(norm(pe.join(' ')), norm(pr.join(' ')));
    }
    pr = [];
    pe = [];
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line === '__________') continue;
    if (isRussianLine(line)) {
      if (pe.length) flush();
      pr.push(line);
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
  ...parseGoarch(path.join(__dirname, 'chrysostom-gr-en-goarch.txt')),
  ...parseGoarch(path.join(__dirname, 'basil-gr-en-goarch.txt')),
]);
const goarchRu = parseRu(path.join(__dirname, 'chrysostom-ru.txt'));

const ROLE_EL = {
  DEACON: 'ΔΙΑΚΟΝΟΣ',
  PRIEST: 'ΙΕΡΕΥΣ',
  CHOIR: 'ΧΟΡΟΣ',
  PEOPLE: 'ΛΑΟΣ',
  READER: 'ΑΝΑΓΝΩΣΤΗΣ',
};
const ROLE_RU = {
  DEACON: 'Диакон',
  PRIEST: 'Священник',
  CHOIR: 'Хор',
  PEOPLE: 'Народ',
  READER: 'Чтец',
};

function parseRole(en) {
  const m = en.match(/^(DEACON|PRIEST|CHOIR|PEOPLE|READER)(\s*\((in a low voice|aloud)\))?:\s*(.*)$/s);
  if (!m) return null;
  return {
    role: m[1],
    qual: m[3] === 'in a low voice' ? 'low' : m[3] === 'aloud' ? 'aloud' : null,
    body: (m[4] ?? '').trim(),
  };
}

function elQual(q) {
  if (q === 'low') return ' (χαμηλοφώνως)';
  if (q === 'aloud') return ' (ἐκφώνως)';
  return '';
}
function ruQual(q) {
  if (q === 'low') return ' (тихо)';
  if (q === 'aloud') return ' (громко)';
  return '';
}

function withRoleEl(en, body) {
  const r = parseRole(en);
  if (!r) return body;
  return `${ROLE_EL[r.role]}${elQual(r.qual)}: ${body}`;
}
function withRoleRu(en, body) {
  const r = parseRole(en);
  if (!r) return body;
  return `${ROLE_RU[r.role]}${ruQual(r.qual)}: ${body}`;
}

function lookupEl(en) {
  const r = parseRole(en);
  const body = r ? r.body : en;
  const n = norm(body);
  if (goarchEl.has(n)) return withRoleEl(en, goarchEl.get(n));
  if (goarchEl.has(norm(en))) return goarchEl.get(norm(en));
  return null;
}

function lookupRu(en) {
  const r = parseRole(en);
  const body = r ? r.body : en;
  const n = norm(body);
  if (goarchRu.has(n)) return withRoleRu(en, goarchRu.get(n));
  if (goarchRu.has(norm(en))) return goarchRu.get(norm(en));
  return null;
}

const unique = new Map();
for (const g of gaps) {
  if (!unique.has(g.en)) unique.set(g.en, { missingEl: false, missingRu: false });
  const u = unique.get(g.en);
  if (g.missingEl) u.missingEl = true;
  if (g.missingRu) u.missingRu = true;
}

const out = { el: {}, ru: {} };
const missEl = [];
const missRu = [];

for (const [en, flags] of unique) {
  if (flags.missingEl) {
    const el =
      pending.el?.[en] ??
      lookupEl(en) ??
      existing.el?.[en];
    if (el) out.el[en] = el;
    else missEl.push(en);
  }
  if (flags.missingRu) {
    const ru =
      pending.ru?.[en] ??
      lookupRu(en) ??
      existing.ru?.[en];
    if (ru) out.ru[en] = ru;
    else missRu.push(en);
  }
}

fs.writeFileSync(path.join(__dirname, 'gap-fill-manual.json'), JSON.stringify(out, null, 2) + '\n');
console.log(`Wrote el=${Object.keys(out.el).length} ru=${Object.keys(out.ru).length}`);
console.log(`Missing el=${missEl.length} ru=${missRu.length}`);
if (missEl.length) missEl.forEach((e) => console.log(' EL:', e.slice(0, 100)));
if (missRu.length) missRu.forEach((e) => console.log(' RU:', e.slice(0, 100)));
