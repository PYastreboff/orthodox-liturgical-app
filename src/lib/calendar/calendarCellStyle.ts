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
  'great_lent',
  'lent_sunday',
  'lent_saturday',
  'dormition_fast',
  'nativity_fast',
  'apostles_fast',
  ...WEEKLY_FAST_APPEARANCE_KEYS,
]);

/** Calendar cells always use the light palette (readable on parchment & in dark mode). */
const CELL_WHITE = '#ffffff';
const CELL_FASTING = '#c4c1b8';
const CELL_FEAST = '#f2a0ad';

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

  if (FASTING_KEYS.has(appearanceKey)) {
    return { backgroundColor: CELL_FASTING, foreground: colors.ink };
  }

  return { backgroundColor: CELL_WHITE, foreground: colors.ink };
}
