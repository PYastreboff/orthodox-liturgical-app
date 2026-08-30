#!/usr/bin/env node
/**
 * Phone UI fixes:
 * - Wider overlapping tab-bar selection pill (MainTabBar)
 * - Stack header gutters aligned with page content (stackContentColumn + StackScreenHeader)
 *
 * Liturgy search zoom is fixed in LiturgySearchBar.tsx (16px min on native).
 *
 * Run from repo root: node scripts/apply-phone-ui-patch.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function patch(file, edits, label = file) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) {
    console.warn('Skip missing', label);
    return false;
  }
  let text = fs.readFileSync(full, 'utf8');
  const before = text;
  for (const [from, to] of edits) {
    if (!text.includes(from)) {
      console.warn(`Pattern not found in ${label}:`, JSON.stringify(from.slice(0, 72)));
      continue;
    }
    text = text.split(from).join(to);
  }
  if (text !== before) {
    fs.writeFileSync(full, text);
    console.log('Updated', label);
    return true;
  }
  console.log('No changes', label);
  return false;
}

let changed = 0;

if (
  patch('src/components/MainTabBar.tsx', [
    [
      'const SELECTION_INSET_X = 3;\nconst SELECTION_INSET_Y = 5;',
      'const SELECTION_OVERLAP_X = 10;\nconst SELECTION_INSET_X = -SELECTION_OVERLAP_X;\nconst SELECTION_INSET_Y = 4;',
    ],
    [
      'width: slotWidth - SELECTION_INSET_X * 2,',
      'width: slotWidth + SELECTION_OVERLAP_X * 2,',
    ],
    [
      '? state.routes.map((_, index) => index * slotWidth + SELECTION_INSET_X)',
      '? state.routes.map((_, index) => index * slotWidth - SELECTION_OVERLAP_X)',
    ],
  ])
) {
  changed += 1;
}

if (
  patch('src/theme/stackContentColumn.ts', [
    [
      `    ...(phone ? null : { maxWidth }),
`,
      `    ...(phone ? { alignSelf: 'stretch' as const } : { maxWidth }),
`,
    ],
  ])
) {
  changed += 1;
}

if (
  patch('src/components/StackScreenHeader.tsx', [
    [
      `    <View style={[styles.wrap, { paddingTop: screenSafe.paddingTop + 16 }]}>`,
      `    <View style={[styles.wrap, styles.wrapStretch, { paddingTop: screenSafe.paddingTop + 16 }]}>`,
    ],
    [
      `  wrap: {
    paddingBottom: 16,
  },`,
      `  wrap: {
    paddingBottom: 16,
    width: '100%',
  },
  wrapStretch: {
    alignSelf: 'stretch',
  },`,
    ],
  ])
) {
  changed += 1;
}

if (
  patch('src/components/day/DaySectionPage.tsx', [
    [
      `              {
                paddingLeft: screenSafe.paddingLeft,
                paddingRight: screenSafe.paddingRight,
                paddingBottom: insets.bottom + 32,
                maxWidth: phone ? undefined : CONTENT_MAX,
              },`,
      `              stackContentColumnStyle({
                paddingLeft: screenSafe.paddingLeft,
                paddingRight: screenSafe.paddingRight,
                phone,
                maxWidth: CONTENT_MAX,
              }),
              { paddingBottom: insets.bottom + 32 },`,
    ],
    [
      `  content: {
    flexGrow: 1,
    width: '100%',
    alignSelf: 'center',
    paddingTop: 4,
    gap: 0,
  },`,
      `  content: {
    flexGrow: 1,
    gap: 0,
  },`,
    ],
  ])
) {
  changed += 1;
}

// Ensure DaySectionPage imports stack helper when patching older files.
if (fs.existsSync(path.join(root, 'src/components/day/DaySectionPage.tsx'))) {
  const dayPath = 'src/components/day/DaySectionPage.tsx';
  let day = fs.readFileSync(path.join(root, dayPath), 'utf8');
  const dayBefore = day;
  if (day.includes('stackContentColumnStyle(') && !day.includes("stackContentColumn")) {
    day = day.replace(
      "import { colors } from '../../theme/tokens';",
      "import { STACK_CONTENT_MAX_WIDTH } from '../../theme/layout';\nimport { stackContentColumnStyle } from '../../theme/stackContentColumn';\nimport { colors } from '../../theme/tokens';",
    );
  }
  if (day !== dayBefore) {
    fs.writeFileSync(path.join(root, dayPath), day);
    console.log('Updated', dayPath);
    changed += 1;
  }
}

console.log(changed ? `Done (${changed} file groups).` : 'No locked files changed — search zoom fix is already in source.');
