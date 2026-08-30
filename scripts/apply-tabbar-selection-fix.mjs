#!/usr/bin/env node
/**
 * Copy fixed MainTabBar (selection pill won't clip on bar edges).
 * Run: node scripts/apply-tabbar-selection-fix.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'scripts/patches/MainTabBar.tsx');
const dest = path.join(root, 'src/components/MainTabBar.tsx');

if (!fs.existsSync(src)) {
  console.error('Missing', src);
  process.exit(1);
}

fs.copyFileSync(src, dest);
console.log('Installed', path.relative(root, dest));
console.log('Reload the app.');
