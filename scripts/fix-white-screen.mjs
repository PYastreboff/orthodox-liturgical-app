#!/usr/bin/env node
/**
 * Fixes duplicate imports in DaySectionPage and MainTabBar patch issues.
 * Run: node scripts/fix-white-screen.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function dedupeImportLines(file) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) return false;
  const text = fs.readFileSync(full, 'utf8');
  const seen = new Set();
  const out = [];
  for (const line of text.split('\n')) {
    if (line.startsWith('import ')) {
      if (seen.has(line)) continue;
      seen.add(line);
    }
    out.push(line);
  }
  const next = out.join('\n') + (text.endsWith('\n') ? '\n' : '');
  if (next === text) return false;
  fs.writeFileSync(full, next);
  console.log('Deduped imports in', file);
  return true;
}

let changed = dedupeImportLines('src/components/day/DaySectionPage.tsx');

const mainTabBar = path.join(root, 'src/components/MainTabBar.tsx');
if (fs.existsSync(mainTabBar)) {
  let text = fs.readFileSync(mainTabBar, 'utf8');
  const before = text;

  if (text.includes('SELECTION_OVERLAP_X') && !text.includes('const SELECTION_OVERLAP_X')) {
    if (text.includes('const SELECTION_INSET_X = 3;')) {
      text = text.replace(
        'const SELECTION_INSET_X = 3;',
        'const SELECTION_OVERLAP_X = 10;\nconst SELECTION_INSET_X = -SELECTION_OVERLAP_X;',
      );
    } else if (text.includes('const SELECTION_INSET_Y')) {
      text = text.replace(
        /const SELECTION_INSET_Y = \d+;/,
        'const SELECTION_OVERLAP_X = 10;\nconst SELECTION_INSET_X = -SELECTION_OVERLAP_X;\nconst SELECTION_INSET_Y = 4;',
      );
    }
  }

  text = text.replace(
    /width:\s*slotWidth\s*-\s*SELECTION_INSET_X\s*\*\s*2,/g,
    'width: slotWidth + SELECTION_OVERLAP_X * 2,',
  );
  text = text.replace(
    /index \* slotWidth \+ SELECTION_INSET_X/g,
    'index * slotWidth - SELECTION_OVERLAP_X',
  );

  if (text !== before) {
    fs.writeFileSync(mainTabBar, text);
    console.log('Fixed src/components/MainTabBar.tsx');
    changed = true;
  }
}

if (!changed) {
  console.log('Nothing to fix — if errors remain, check Metro output.');
} else {
  console.log('Done. Restart Metro and reload the app.');
}
