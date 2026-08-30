#!/usr/bin/env node
/**
 * Stops the tab-bar selection pill clipping on the left/right edges.
 * Run: node scripts/fix-tabbar-selection-clip.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(root, 'src/components/MainTabBar.tsx');

if (!fs.existsSync(file)) {
  console.error('MainTabBar.tsx not found');
  process.exit(1);
}

let text = fs.readFileSync(file, 'utf8');
const before = text;

const selectionHelpers = `const SELECTION_OVERLAP_X = 10;
const SELECTION_INSET_Y = 4;

function selectionWidthForIndex(index: number, tabCount: number, slotWidth: number): number {
  if (slotWidth <= 0 || tabCount <= 0) return 0;
  if (tabCount === 1) return slotWidth;
  if (index === 0 || index === tabCount - 1) return slotWidth + SELECTION_OVERLAP_X;
  return slotWidth + SELECTION_OVERLAP_X * 2;
}

function selectionXForIndex(index: number, tabCount: number, slotWidth: number): number {
  if (slotWidth <= 0) return 0;
  if (index === 0) return 0;
  if (index === tabCount - 1) return index * slotWidth - SELECTION_OVERLAP_X;
  return index * slotWidth - SELECTION_OVERLAP_X;
}
`;

// Replace constant block if present in any form.
text = text.replace(
  /const SELECTION_OVERLAP_X = [\s\S]*?const SELECTION_INSET_Y = \d+;\n\n/,
  `${selectionHelpers}\n`,
);
if (!text.includes('function selectionWidthForIndex')) {
  text = text.replace(
    /(export function tabBarBackground[\s\S]*?\n}\n\n)/,
    `$1${selectionHelpers}\n`,
  );
}

// Animated width + translate (edge-aware).
const animatedBlock = `  const widthOutputRange =
    slotWidth > 0
      ? state.routes.map((_, index) =>
          selectionWidthForIndex(index, tabCount, slotWidth),
        )
      : state.routes.map(() => 0);
  const selectionWidth =
    slotWidth > 0
      ? position.interpolate({
          inputRange,
          outputRange: widthOutputRange,
          extrapolate: 'clamp',
        })
      : null;
  const outputRange =
    slotWidth > 0
      ? state.routes.map((_, index) => selectionXForIndex(index, tabCount, slotWidth))
      : state.routes.map(() => 0);
  const selectionTranslateX =
    slotWidth > 0
      ? position.interpolate({
          inputRange,
          outputRange,
          extrapolate: 'clamp',
        })
      : null;`;

if (!text.includes('selectionWidthForIndex')) {
  console.error('Could not insert selection helpers — edit MainTabBar.tsx manually.');
  process.exit(1);
}

text = text.replace(
  /const outputRange =[\s\S]*?const selectionTranslateX =[\s\S]*?: null;\n/,
  `${animatedBlock}\n`,
);

text = text.replace(
  /width:\s*slotWidth[^,]*,/,
  'width: selectionWidth!,',
);

text = text.replace(
  /<Animated\.View\n(\s*)style=\{\[\n\s*styles\.selectionFill,/,
  '<Animated.View\n$1style={[\n$1  styles.selectionFill,',
);

if (text === before) {
  console.log('No changes applied — MainTabBar may already be patched or layout changed.');
  process.exit(0);
}

fs.writeFileSync(file, text);
console.log('Updated MainTabBar.tsx — selection pill no longer clips on bar edges.');
console.log('Reload the app.');
