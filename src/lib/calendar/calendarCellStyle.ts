import { colors } from '../../theme/tokens';
import { WEEKLY_FAST_APPEARANCE_KEYS } from './weeklyFast';

export type CalendarCellStyle = {
  backgroundColor: string;
  foreground: string;
};

/** Great feasts — reddish pink cell + red border on month grid. Bright Week (except Pascha) uses ordinary cells. */
export const MAJOR_FEAST_APPEARANCE_KEYS = new Set([
  'pascha',
  'pentecost',
  'all_saints',
  'nativity',
  'theophany',
  'annunciation',
  'transfiguration',
  'dormition',
  'elevation_cross',
]);

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

/**
 * Calendar month cells: white · light grey (fast) · reddish pink (feast).
 */
export function isMajorFeastAppearance(appearanceKey: string): boolean {
  return MAJOR_FEAST_APPEARANCE_KEYS.has(appearanceKey);
}

export function getCalendarCellStyle(appearanceKey: string): CalendarCellStyle {
  if (MAJOR_FEAST_APPEARANCE_KEYS.has(appearanceKey)) {
    return { backgroundColor: CELL_FEAST, foreground: colors.ink };
  }

  if (FASTING_KEYS.has(appearanceKey)) {
    return { backgroundColor: CELL_FASTING, foreground: colors.ink };
  }

  return { backgroundColor: CELL_WHITE, foreground: colors.ink };
}
