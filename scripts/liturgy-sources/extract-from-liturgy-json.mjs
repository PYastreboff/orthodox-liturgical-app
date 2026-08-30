#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '../..');

function walk(obj, out) {
  if (!obj || typeof obj !== 'object') return;
  if (typeof obj.en === 'string' && typeof obj.el === 'string') out.el.set(obj.en, obj.el);
  if (typeof obj.en === 'string' && typeof obj.ru === 'string') out.ru.set(obj.en, obj.ru);
  if (Array.isArray(obj)) {
    for (const item of obj) walk(item, out);
    return;
  }
  for (const v of Object.values(obj)) walk(v, out);
}

const out = { el: new Map(), ru: new Map() };
for (const f of ['chrysostom-liturgy.json', 'basil-liturgy.json']) {
  walk(JSON.parse(fs.readFileSync(path.join(root, 'data/liturgy', f), 'utf8')), out);
}
console.log('from liturgy json el', out.el.size, 'ru', out.ru.size);
