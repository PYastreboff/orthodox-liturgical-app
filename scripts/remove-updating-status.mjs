#!/usr/bin/env node
/** Remove "Updating…" under the home hero. Run: node scripts/remove-updating-status.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, 'app/(tabs)/index.tsx');
const patchFile = path.join(root, 'scripts/patches/index.tsx');

function removeRefreshingBlock(text) {
  const oldBlock = `          {model.waitingForDay ? (
            <TodaySkeleton isDark={model.isDark} />
          ) : model.refreshing ? (
            <Text style={[styles.statusLine, model.type.status, { color: colors.muted }]}>
              {model.t('today.refreshing')}
            </Text>
          ) : null}`;

  const newBlock = `          {model.waitingForDay ? <TodaySkeleton isDark={model.isDark} /> : null}`;

  if (text.includes(oldBlock)) {
    return text.replace(oldBlock, newBlock);
  }

  const regex =
    /(\s*)\{model\.waitingForDay \? \(\s*<TodaySkeleton isDark=\{model\.isDark\} \/>\s*\) : model\.refreshing \? \([\s\S]*?today\.refreshing[\s\S]*?\) : null\}/;
  if (regex.test(text)) {
    return text.replace(regex, '$1{model.waitingForDay ? <TodaySkeleton isDark={model.isDark} /> : null}');
  }

  return null;
}

let text = fs.readFileSync(target, 'utf8');
const patched = removeRefreshingBlock(text);

if (patched && patched !== text) {
  fs.writeFileSync(target, patched);
  console.log('Removed updating status line from home page.');
  process.exit(0);
}

if (fs.existsSync(patchFile)) {
  fs.copyFileSync(patchFile, target);
  console.log('Copied scripts/patches/index.tsx (no updating line).');
  process.exit(0);
}

console.warn('Could not patch — edit app/(tabs)/index.tsx manually.');
process.exit(1);
