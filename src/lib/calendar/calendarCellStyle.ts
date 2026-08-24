import { colors } from '../../theme/tokens';
import { WEEKLY_FAST_APPEARANCE_KEYS } from './weeklyFast';

export type CalendarCellStyle = {
  backgroundColor: string;
  foreground: string;
};

/** Fixed great feasts that always use pink cell + red border on the month grid. */
export const FEAST_CELL_APPEARANCE_KEYS = new Set(['pascha', 'pentecost', 'transfiguration']);

/** Fasting seasons — muted cell on the month grid. */
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
  ...WEEKLY_FAST_APPEARANCE_KEYS,
]);

/** Light mode month grid cells. */
export const CALENDAR_CELL_WHITE = '#ffffff';
export const CALENDAR_CELL_FASTING = '#c4c1b8';
export const CALENDAR_CELL_FEAST = '#f2a0ad';
export const CALENDAR_CELL_PALM_SUNDAY = '#c8dcc4';
/** Pascha — royal gold vestments; light enough for ink text, rich enough to read as gold. */
export const CALENDAR_CELL_PASCHA = '#e8c878';

/** Dark mode month grid cells. */
export const CALENDAR_CELL_DARK_NORMAL = '#2c2822';
export const CALENDAR_CELL_DARK_FASTING = '#181614';
export const CALENDAR_CELL_DARK_FEAST = '#3a2228';
export const CALENDAR_CELL_DARK_PALM_SUNDAY = '#243028';
/** Pascha — warm darker gold on the dark grid. */
export const CALENDAR_CELL_DARK_PASCHA = '#5a4824';

export type CalendarCellLegendItem = {
  key:
    | 'calendar.legendNonFasting'
    | 'calendar.legendFasting'
    | 'calendar.legendFeast'
    | 'calendar.legendToday';
  swatch: string;
  border?: true;
  feastOutline?: true;
  todayRing?: true;
};

export function calendarCellLegend(isDark: boolean): readonly CalendarCellLegendItem[] {
  if (isDark) {
    return [
      { key: 'calendar.legendNonFasting', swatch: CALENDAR_CELL_DARK_NORMAL, border: true },
      { key: 'calendar.legendFasting', swatch: CALENDAR_CELL_DARK_FASTING },
      { key: 'calendar.legendFeast', swatch: CALENDAR_CELL_DARK_FEAST, feastOutline: true },
      { key: 'calendar.legendToday', swatch: CALENDAR_CELL_DARK_NORMAL, todayRing: true },
    ];
  }
  return [
    { key: 'calendar.legendNonFasting', swatch: CALENDAR_CELL_WHITE, border: true },
    { key: 'calendar.legendFasting', swatch: CALENDAR_CELL_FASTING },
    { key: 'calendar.legendFeast', swatch: CALENDAR_CELL_FEAST, feastOutline: true },
    { key: 'calendar.legendToday', swatch: CALENDAR_CELL_WHITE, todayRing: true },
  ];
}

export function isFeastCellAppearance(appearanceKey: string): boolean {
  return FEAST_CELL_APPEARANCE_KEYS.has(appearanceKey);
}

export function isCalendarFastingAppearance(appearanceKey: string): boolean {
  return FASTING_KEYS.has(appearanceKey);
}

/**
 * Calendar month cells: normal · fasting grey · feast pink (light) or muted dark tints (dark mode).
 */
export function getCalendarCellStyle(
  appearanceKey: string,
  options?: {
    feastCell?: boolean;
    fastingCell?: boolean;
    meatFastCell?: boolean;
  },
  isDark = false,
): CalendarCellStyle {
  const foreground = isDark ? colors.darkInk : colors.ink;

  if (isDark) {
    if (appearanceKey === 'pascha') {
      return { backgroundColor: CALENDAR_CELL_DARK_PASCHA, foreground };
    }
    if (options?.feastCell) {
      return { backgroundColor: CALENDAR_CELL_DARK_FEAST, foreground };
    }
    if (appearanceKey === 'palm_sunday') {
      return { backgroundColor: CALENDAR_CELL_DARK_PALM_SUNDAY, foreground };
    }
    if (options?.meatFastCell) {
      return { backgroundColor: CALENDAR_CELL_DARK_NORMAL, foreground };
    }
    if (options?.fastingCell || FASTING_KEYS.has(appearanceKey)) {
      return { backgroundColor: CALENDAR_CELL_DARK_FASTING, foreground };
    }
    return { backgroundColor: CALENDAR_CELL_DARK_NORMAL, foreground };
  }

  if (appearanceKey === 'pascha') {
    return { backgroundColor: CALENDAR_CELL_PASCHA, foreground: colors.ink };
  }

  if (options?.feastCell) {
    return { backgroundColor: CALENDAR_CELL_FEAST, foreground: colors.ink };
  }

  if (appearanceKey === 'palm_sunday') {
    return { backgroundColor: CALENDAR_CELL_PALM_SUNDAY, foreground: colors.ink };
  }

  // Meat-fast days keep normal feast/weekday backgrounds (not grey fasting cells).
  if (options?.meatFastCell) {
    return { backgroundColor: CALENDAR_CELL_WHITE, foreground: colors.ink };
  }

  if (options?.fastingCell || FASTING_KEYS.has(appearanceKey)) {
    return { backgroundColor: CALENDAR_CELL_FASTING, foreground: colors.ink };
  }

  return { backgroundColor: CALENDAR_CELL_WHITE, foreground: colors.ink };
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
  if (isDark) {
    // Multiply-by-1.07 was imperceptible on dark cells — mix toward white instead.
    const mix = 0.14;
    return toHex(
      rgb.r + (255 - rgb.r) * mix,
      rgb.g + (255 - rgb.g) * mix,
      rgb.b + (255 - rgb.b) * mix,
    );
  }
  return toHex(rgb.r * 0.93, rgb.g * 0.93, rgb.b * 0.93);
}
