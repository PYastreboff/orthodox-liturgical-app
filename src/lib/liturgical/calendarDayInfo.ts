import { calendarFastingFoodIcons, type CalendarFastingFoodIcons } from '../../i18n/fastingLabels';
import type { OrthocalDay } from '../api/orthocal';
import { isFeastCellAppearance } from '../calendar/calendarCellStyle';
import type { PlainDate } from '../calendar/julianGregorian';
import { shouldApplyWeeklyFastOverride } from '../calendar/weeklyFast';
import { isGreatFridayDay, shouldUseOrthocalFeastRank } from './lectionaryDay';
import {
  calendarFeastsForDay,
  isHolyWeekWeekdayHeadline,
  isOrthocalGreatFeastForCalendar,
  liturgicalDayTitle,
  transferredGreatFeastOnHolyWeekDay,
} from './liturgicalDayTitle';
import type { FeastRankDisplay } from './typikonSymbols';
import { sanitizeTypikonProse } from './typikonSymbols';

/** Polyeleos and above (orthocal FeastLevels ≥ 4). */
const ORTHOCAL_POLYELEOS_LEVEL_MIN = 4;

export type CalendarDayInfo = {
  dayTitle: string;
  feasts: string[];
  saints: string[];
  feastRank: FeastRankDisplay | null;
  /** Red title / saints line (polyeleos+). */
  isFeastTitleRed: boolean;
  /** Pink cell + thick red border (Pascha, Pentecost, Transfiguration, or API great feast). */
  isFeastCell: boolean;
  /** Great and Holy Friday — thick black border on the month grid. */
  isGreatFridayBorder: boolean;
  appearanceKey: string;
  /** Feast names that use great-feast red styling (search, lists). */
  greatFeastNames: string[];
  /** Blue fish / gold oil icons on fast days when orthocal allows them. */
  fastingFoodIcons: CalendarFastingFoodIcons;
  /** False for the local appearance shell before orthocal data arrives. */
  orthocalLoaded: boolean;
};

/** Max feast/saint lines shown inside a calendar month cell (feasts listed before saints). */
export const CALENDAR_CELL_MAX_COMMEMORATIONS = 3;

export type CalendarCommemorationLine = { kind: 'feast' | 'saint'; name: string };

export function calendarCellCommemorations(
  dayTitle: string,
  feasts: string[],
  saints: string[],
  max = CALENDAR_CELL_MAX_COMMEMORATIONS,
): { lines: CalendarCommemorationLine[]; hiddenCount: number } {
  const normalizedTitle = dayTitle.trim();
  const feastLines = feasts
    .filter((name) => name.trim() && name.trim() !== normalizedTitle)
    .map((name) => ({ kind: 'feast' as const, name }));
  const saintLines = saints.map((name) => ({ kind: 'saint' as const, name }));
  const all = [...feastLines, ...saintLines];
  return {
    lines: all.slice(0, max),
    hiddenCount: Math.max(0, all.length - max),
  };
}

export function saintsFromOrthocalDay(day: OrthocalDay | null): string[] {
  if (!day?.saints?.length) return [];
  return day.saints.map((s) => sanitizeTypikonProse(s)).filter(Boolean);
}

function useOrthocalFeastRank(day: OrthocalDay | null, appearanceKey: string): boolean {
  return shouldUseOrthocalFeastRank(day, appearanceKey);
}

/** Pink background + red border: Pascha / Pentecost / Transfiguration or orthocal great feast. */
export function isCalendarFeastCell(
  day: OrthocalDay | null,
  appearanceKey: string,
  feastRank: FeastRankDisplay | null,
  dayTitle: string,
): boolean {
  if (isFeastCellAppearance(appearanceKey)) return true;
  if (transferredGreatFeastOnHolyWeekDay(day, appearanceKey, dayTitle)) return true;
  if (isOrthocalGreatFeastForCalendar(day, appearanceKey, dayTitle)) return true;
  if (!useOrthocalFeastRank(day, appearanceKey)) return false;
  return feastRank?.glyph === 'great_feast';
}

/** Red text: polyeleos-ranked services and above (includes great-feast cells). */
export function isCalendarFeastTitleRed(
  day: OrthocalDay | null,
  appearanceKey: string,
  feastRank: FeastRankDisplay | null,
  dayTitle: string,
): boolean {
  if (isCalendarFeastCell(day, appearanceKey, feastRank, dayTitle)) return true;
  if (!useOrthocalFeastRank(day, appearanceKey)) return false;
  if (feastRank?.glyph === 'polyeleos' || feastRank?.glyph === 'vigil') return true;
  if ((day?.feast_level ?? 0) >= ORTHOCAL_POLYELEOS_LEVEL_MIN) {
    return Boolean(transferredGreatFeastOnHolyWeekDay(day, appearanceKey, dayTitle));
  }
  return false;
}

/** Names that qualify as great feasts for red highlighting (matches pink calendar cells). */
export function greatFeastNamesForCalendarDay(
  day: OrthocalDay | null,
  appearanceKey: string,
  feastRank: FeastRankDisplay | null,
  dayTitle: string,
): string[] {
  const names = new Set<string>();

  const transferred = transferredGreatFeastOnHolyWeekDay(day, appearanceKey, dayTitle);
  if (transferred) names.add(transferred);

  if (isCalendarFeastCell(day, appearanceKey, feastRank, dayTitle)) {
    if (dayTitle && !isHolyWeekWeekdayHeadline(day, appearanceKey, dayTitle)) {
      names.add(dayTitle);
    }
  }

  return [...names];
}

export function buildCalendarDayInfo(
  day: OrthocalDay | null,
  appearanceKey: string,
  appearanceLabel: string,
  feastRank: FeastRankDisplay | null,
  civil: PlainDate,
): CalendarDayInfo {
  const dayTitle = liturgicalDayTitle(day, appearanceKey, appearanceLabel, feastRank);
  const isFeastCell = isCalendarFeastCell(day, appearanceKey, feastRank, dayTitle);
  const isFeastTitleRed = isCalendarFeastTitleRed(day, appearanceKey, feastRank, dayTitle);
  const greatFeastNames = greatFeastNamesForCalendarDay(day, appearanceKey, feastRank, dayTitle);
  const weeklyFast = shouldApplyWeeklyFastOverride(day, civil);
  const fastingFoodIcons = calendarFastingFoodIcons(day, appearanceKey, weeklyFast, civil);
  return {
    dayTitle,
    feasts: calendarFeastsForDay(day, dayTitle),
    saints: saintsFromOrthocalDay(day),
    feastRank,
    isFeastTitleRed,
    isFeastCell,
    isGreatFridayBorder: isGreatFridayDay(day),
    appearanceKey,
    greatFeastNames,
    fastingFoodIcons,
    orthocalLoaded: day !== null,
  };
}
