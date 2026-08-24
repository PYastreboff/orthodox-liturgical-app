import { calendarCellLegend } from '../calendar/calendarCellStyle';

/** @deprecated Use `calendarCellLegend(isDark)` for theme-aware swatches. */
export const CALENDAR_CELL_LEGEND = calendarCellLegend(false);

export { calendarCellLegend } from '../calendar/calendarCellStyle';

export const CALENDAR_ICON_LEGEND = [
  { kind: 'fish' as const, key: 'fasting.exceptionFish' },
  { kind: 'wine' as const, key: 'fasting.exceptionWine' },
  { kind: 'oil' as const, key: 'fasting.exceptionOil' },
  { kind: 'noMeat' as const, key: 'fasting.levelMeatFast' },
  { kind: 'noEating' as const, key: 'fasting.levelNoEating' },
] as const;

/** orthocal FeastLevels in Settings → service-type legend (low → high). Levels 7–8 share the level-6 mark. */
export const TYPIKON_LEGEND_ENTRIES = [
  { level: -1, labelKey: 'typikon.noLiturgy' },
  { level: 0, labelKey: 'typikon.liturgyUnranked' },
  { level: 1, labelKey: 'typikon.presanctified' },
  { level: 2, labelKey: 'typikon.sixStichera' },
  { level: 3, labelKey: 'typikon.doxology' },
  { level: 4, labelKey: 'typikon.polyeleos' },
  { level: 5, labelKey: 'typikon.vigil' },
  { level: 6, labelKey: 'settings.legendTypikonGreatFeast' },
] as const;

export type TypikonLegendEntry = (typeof TYPIKON_LEGEND_ENTRIES)[number];
