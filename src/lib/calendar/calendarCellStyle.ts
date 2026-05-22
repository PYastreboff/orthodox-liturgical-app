import { colors } from '../../theme/tokens';

export type CalendarCellStyle = {
  backgroundColor: string;
  foreground: string;
};

/** Great feasts & paschal season — reddish pink cell. */
const FEAST_KEYS = new Set([
  'pascha',
  'bright_week',
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
]);

/** Calendar cells always use the light palette (readable on parchment & in dark mode). */
const CELL_WHITE = '#ffffff';
const CELL_FASTING = '#c4c1b8';
const CELL_FEAST = '#f2a0ad';

/**
 * Calendar month cells: white · light grey (fast) · reddish pink (feast).
 */
export function getCalendarCellStyle(appearanceKey: string): CalendarCellStyle {
  if (FEAST_KEYS.has(appearanceKey)) {
    return { backgroundColor: CELL_FEAST, foreground: colors.ink };
  }

  if (FASTING_KEYS.has(appearanceKey)) {
    return { backgroundColor: CELL_FASTING, foreground: colors.ink };
  }

  return { backgroundColor: CELL_WHITE, foreground: colors.ink };
}
