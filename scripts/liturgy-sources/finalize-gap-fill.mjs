#!/usr/bin/env node
/**
 * Build complete gap-fill-manual.json: GOARCH Greek + Russian from pending/chrysostom-ru + manual overrides.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const gaps = JSON.parse(fs.readFileSync(path.join(__dirname, 'translation-gaps.json'), 'utf8'));
const pending = JSON.parse(fs.readFileSync(path.join(__dirname, 'pending-translations-manual.json'), 'utf8'));
const existing = JSON.parse(fs.readFileSync(path.join(__dirname, 'liturgy-translations.json'), 'utf8'));

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

const SKIP_EN =
  /^(ΔΙΑΚΟΝΟΣ|ΙΕΡΕΥΣ|ΧΟΡΟΣ|ΛΑΟΣ|ΑΝΑΓΝΩΣΤΗΣ|DEACON|PRIEST|CHOIR|PEOPLE|READER|LITURGY|ENARXIS|__________|Books|This is|Hieratikon|Βιβλ|ΛΕΙΤΟΥΡΓΙΑ|See Liturgy|Small Litany|PRAYER|THE ENTRANCE|Only-begotten|Μικρὰ|Ἀντίφωνον|c\d+ -|\(See |The Gospel|The Epistle|Epistle Reading|Prokeimenon|Alleluia|Trisagion|Dismissal|COMMUNION|ANAPHORA|CREED|Cherubic|Antiphon|Litany|Lord's Prayer|LORD'S PRAYER|THE LORD|And with your spirit|Small Litany)/i;

function isEnglishLine(s) {
  const t = s.trim();
  if (!t || isGreekLine(t)) return false;
  if (SKIP_EN.test(t)) return false;
  if (/^[\d\s.]+$/.test(t)) return false;
  if (/^[A-Z][A-Z\s'’()-]+$/.test(t) && t.length < 40) return false;
  return /[a-z]/.test(t);
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

// Chrysostom second so it wins on duplicate English keys (Basil file has polluted pairings).
const goarchEl = new Map([
  ...parseGoarch(path.join(__dirname, 'basil-gr-en-goarch.txt')),
  ...parseGoarch(path.join(__dirname, 'chrysostom-gr-en-goarch.txt')),
]);

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
  return null;
}

// Manual overrides: fragments + Russian (traditional Orthodox from chrysostom-ru / pending)
const overrides = JSON.parse(fs.readFileSync(path.join(__dirname, 'gap-fill-overrides.json'), 'utf8'));

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

const PLACEHOLDER = /^__.*__$/;

for (const [en, flags] of unique) {
  if (flags.missingEl) {
    const el =
      overrides.el?.[en] ??
      lookupEl(en) ??
      (pending.el?.[en] && !PLACEHOLDER.test(pending.el[en]) ? pending.el[en] : null) ??
      existing.el?.[en];
    if (el) out.el[en] = el;
    else missEl.push(en);
  }
  if (flags.missingRu) {
    const ru =
      overrides.ru?.[en] ??
      pending.ru?.[en] ??
      existing.ru?.[en];
    if (ru) out.ru[en] = ru;
    else missRu.push(en);
  }
}

if (missEl.length || missRu.length) {
  console.error(`Missing el=${missEl.length} ru=${missRu.length}`);
  missEl.forEach((e) => console.error(' EL:', e.slice(0, 100)));
  missRu.forEach((e) => console.error(' RU:', e.slice(0, 100)));
  process.exit(1);
}

fs.writeFileSync(path.join(__dirname, 'gap-fill-manual.json'), JSON.stringify(out, null, 2) + '\n');
console.log(`Wrote gap-fill-manual.json: el=${Object.keys(out.el).length} ru=${Object.keys(out.ru).length}`);
