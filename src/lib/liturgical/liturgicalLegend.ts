import {
  CALENDAR_CELL_FASTING,
  CALENDAR_CELL_FEAST,
  CALENDAR_CELL_WHITE,
} from '../calendar/calendarCellStyle';

export const CALENDAR_CELL_LEGEND = [
  { key: 'calendar.legendNonFasting', swatch: CALENDAR_CELL_WHITE, border: true },
  { key: 'calendar.legendFasting', swatch: CALENDAR_CELL_FASTING, border: false },
  { key: 'calendar.legendFeast', swatch: CALENDAR_CELL_FEAST, feastOutline: true },
  { key: 'calendar.legendToday', swatch: CALENDAR_CELL_WHITE, todayRing: true },
] as const;

export const CALENDAR_ICON_LEGEND = [
  { kind: 'fish' as const, key: 'fasting.exceptionFish' },
  { kind: 'wine' as const, key: 'fasting.exceptionWine' },
  { kind: 'oil' as const, key: 'fasting.exceptionOil' },
  { kind: 'noMeat' as const, key: 'fasting.levelMeatFast' },
  { kind: 'noEating' as const, key: 'fasting.levelNoEating' },
] as const;
