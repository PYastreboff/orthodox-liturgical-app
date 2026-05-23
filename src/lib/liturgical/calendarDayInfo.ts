import type { OrthocalDay } from '../api/orthocal';
import { isFeastCellAppearance } from '../calendar/calendarCellStyle';
import { isGreatFridayDay, isHolyTuesdayDay, shouldUseOrthocalFeastRank } from './lectionaryDay';
import type { FeastRankDisplay } from './typikonSymbols';
import { sanitizeTypikonProse } from './typikonSymbols';

/** Polyeleos and above (orthocal FeastLevels ≥ 4). */
const ORTHOCAL_POLYELEOS_LEVEL_MIN = 4;

/** Great feast circle and above (orthocal FeastLevels ≥ 6). */
const ORTHOCAL_GREAT_FEAST_LEVEL_MIN = 6;

export type CalendarDayInfo = {
  dayTitle: string;
  saints: string[];
  feastRank: FeastRankDisplay | null;
  /** Red title / saints line (polyeleos+). */
  isFeastTitleRed: boolean;
  /** Pink cell + thick red border (Pascha, Pentecost, Transfiguration, or API great feast). */
  isFeastCell: boolean;
  /** Great and Holy Friday — thick black border on the month grid. */
  isGreatFridayBorder: boolean;
  appearanceKey: string;
};

export function dayTitleFromOrthocalDay(day: OrthocalDay | null, fallback: string): string {
  if (day?.titles?.[0]?.trim()) {
    return sanitizeTypikonProse(day.titles[0]);
  }
  if (day?.summary_title?.trim()) {
    return sanitizeTypikonProse(day.summary_title);
  }
  return fallback;
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
): boolean {
  if (isFeastCellAppearance(appearanceKey)) return true;
  if (isHolyTuesdayDay(day)) return true;
  if (!useOrthocalFeastRank(day, appearanceKey)) return false;
  if (feastRank?.glyph === 'great_feast') return true;
  if ((day?.feast_level ?? 0) >= ORTHOCAL_GREAT_FEAST_LEVEL_MIN) return true;
  return false;
}

/** Red text: polyeleos-ranked services and above (includes great-feast cells). */
export function isCalendarFeastTitleRed(
  day: OrthocalDay | null,
  appearanceKey: string,
  feastRank: FeastRankDisplay | null,
): boolean {
  if (isCalendarFeastCell(day, appearanceKey, feastRank)) return true;
  if (!useOrthocalFeastRank(day, appearanceKey)) return false;
  if (feastRank?.glyph === 'polyeleos' || feastRank?.glyph === 'vigil') return true;
  if ((day?.feast_level ?? 0) >= ORTHOCAL_POLYELEOS_LEVEL_MIN) return true;
  return false;
}

export function buildCalendarDayInfo(
  day: OrthocalDay | null,
  appearanceKey: string,
  appearanceLabel: string,
  feastRank: FeastRankDisplay | null,
): CalendarDayInfo {
  const isFeastCell = isCalendarFeastCell(day, appearanceKey, feastRank);
  const isFeastTitleRed = isCalendarFeastTitleRed(day, appearanceKey, feastRank);
  return {
    dayTitle: dayTitleFromOrthocalDay(day, appearanceLabel),
    saints: saintsFromOrthocalDay(day),
    feastRank,
    isFeastTitleRed,
    isFeastCell,
    isGreatFridayBorder: isGreatFridayDay(day),
    appearanceKey,
  };
}
