import type { OrthocalDay } from '../api/orthocal';
import { isFeastCellAppearance } from '../calendar/calendarCellStyle';
import { shouldUseOrthocalFeastRank } from './lectionaryDay';
import type { FeastRankDisplay } from './typikonSymbols';
import { sanitizeTypikonProse } from './typikonSymbols';

/** Polyeleos and above (orthocal FeastLevels ≥ 4). */
const ORTHOCAL_POLYELEOS_LEVEL_MIN = 4;

/** Great feast circle and above (orthocal FeastLevels ≥ 6). */
const ORTHOCAL_GREAT_FEAST_LEVEL_MIN = 6;

export type CalendarDayInfo = {
  dayTitle: string;
  saintsPreview: string | null;
  feastRank: FeastRankDisplay | null;
  /** Red title / saints line (polyeleos+). */
  isFeastTitleRed: boolean;
  /** Pink cell + thick red border (Pascha, Pentecost, Transfiguration, or API great feast). */
  isFeastCell: boolean;
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

export function saintsPreviewFromOrthocalDay(day: OrthocalDay | null): string | null {
  if (!day?.saints?.length) return null;
  const names = day.saints.map((s) => sanitizeTypikonProse(s)).filter(Boolean);
  if (!names.length) return null;
  if (names.length === 1) return names[0];
  return `${names[0]} · +${names.length - 1}`;
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
    saintsPreview: saintsPreviewFromOrthocalDay(day),
    feastRank,
    isFeastTitleRed,
    isFeastCell,
    appearanceKey,
  };
}
