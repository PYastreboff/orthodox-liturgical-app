#!/usr/bin/env node
/**
 * Updates worship imports to use WorshipLiturgyBody (slim pinned search + scrollable controls).
 * Run from repo root: node scripts/apply-worship-ui-patch.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const targets = [
  path.join(root, 'app/(tabs)/liturgy.tsx'),
  path.join(root, 'src/components/TodaySectionContent.tsx'),
];

const replacements = [
  ["from '../components/ChrysostomLiturgyBody'", "from '../components/WorshipLiturgyBody'"],
  ["from './ChrysostomLiturgyBody'", "from './WorshipLiturgyBody'"],
  ['ChrysostomLiturgyBody', 'WorshipLiturgyBody'],
];

let changed = 0;
for (const file of targets) {
  if (!fs.existsSync(file)) {
    console.warn('Skip missing', file);
    continue;
  }
  let text = fs.readFileSync(file, 'utf8');
  const before = text;
  for (const [from, to] of replacements) {
    text = text.split(from).join(to);
  }
  if (text !== before) {
    fs.writeFileSync(file, text);
    console.log('Updated', path.relative(root, file));
    changed += 1;
  }
}

if (!changed) {
  console.log('No import files changed (already using WorshipLiturgyBody).');
}
console.log('Component: src/components/WorshipLiturgyBody.tsx');
