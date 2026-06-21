import { colors } from '../../theme/tokens';
import { WEEKLY_FAST_APPEARANCE_KEYS } from './weeklyFast';

export type CalendarCellStyle = {
  backgroundColor: string;
  foreground: string;
};

/** Fixed great feasts that always use pink cell + red border on the month grid. */
export const FEAST_CELL_APPEARANCE_KEYS = new Set(['pascha', 'pentecost', 'transfiguration']);

/** Fasting seasons — very light grey cell. */
const FASTING_KEYS = new Set([
  'holy_week',
  'great_friday',
  'holy_saturday',
  'great_lent',
  'lent_sunday',
  'lent_saturday',
  'dormition_fast',
  'dormition_fast_sunday',
  'nativity_fast',
  'nativity_fast_sunday',
  'apostles_fast',
  'apostles_fast_sunday',
  'cheesefare_fast',
  'cheesefare_fast_sunday',
  'all_saints',
  'all_saints_russia',
  ...WEEKLY_FAST_APPEARANCE_KEYS,
]);

/** Calendar cells always use the light palette (readable on parchment & in dark mode). */
const CELL_WHITE = '#ffffff';
const CELL_FASTING = '#c4c1b8';
const CELL_FEAST = '#f2a0ad';
const CELL_PALM_SUNDAY = '#c8dcc4';

export function isFeastCellAppearance(appearanceKey: string): boolean {
  return FEAST_CELL_APPEARANCE_KEYS.has(appearanceKey);
}

export function isCalendarFastingAppearance(appearanceKey: string): boolean {
  return FASTING_KEYS.has(appearanceKey);
}

/**
 * Calendar month cells: white · light grey (fast) · reddish pink (selected great feasts only).
 */
export function getCalendarCellStyle(
  appearanceKey: string,
  options?: { feastCell?: boolean },
): CalendarCellStyle {
  if (options?.feastCell) {
    return { backgroundColor: CELL_FEAST, foreground: colors.ink };
  }

  if (appearanceKey === 'palm_sunday') {
    return { backgroundColor: CELL_PALM_SUNDAY, foreground: colors.ink };
  }

  if (FASTING_KEYS.has(appearanceKey)) {
    return { backgroundColor: CELL_FASTING, foreground: colors.ink };
  }

  return { backgroundColor: CELL_WHITE, foreground: colors.ink };
}

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const raw = hex.replace('#', '').trim();
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw.length === 6
        ? raw
        : null;
  if (!full) return null;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function toHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${[clamp(r), clamp(g), clamp(b)]
    .map((n) => n.toString(16).padStart(2, '0'))
    .join('')}`;
}

/** Slightly darken (light mode) or lighten (dark mode) — applied on the cell itself, not a square overlay. */
export function calendarCellHoverBackground(
  backgroundColor: string,
  hovered: boolean,
  isDark: boolean,
): string {
  if (!hovered) return backgroundColor;
  const rgb = parseHex(backgroundColor);
  if (!rgb) return backgroundColor;
  const factor = isDark ? 1.07 : 0.93;
  return toHex(rgb.r * factor, rgb.g * factor, rgb.b * factor);
}
