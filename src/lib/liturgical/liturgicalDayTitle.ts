import type { OrthocalDay } from '../api/orthocal';
import { isFeastCellAppearance } from '../calendar/calendarCellStyle';
import type { FeastRankDisplay } from './typikonSymbols';
import { sanitizeTypikonProse } from './typikonSymbols';

/** Great feast circle and above (orthocal FeastLevels ≥ 6). */
export const ORTHOCAL_GREAT_FEAST_LEVEL_MIN = 6;

/** orthocal feast_level — authoritative for great-feast calendar styling. */
export function isOrthocalGreatFeastLevel(day: OrthocalDay | null | undefined): boolean {
  return (day?.feast_level ?? 0) >= ORTHOCAL_GREAT_FEAST_LEVEL_MIN;
}

export function allFeastsFromOrthocalDay(day: OrthocalDay | null | undefined): string[] {
  if (!day?.feasts?.length) return [];
  return day.feasts.map((f) => sanitizeTypikonProse(f)).filter(Boolean);
}

/** Use orthocal feast name(s) as the displayed day title (home + calendar). */
export function shouldUseMajorFeastDayTitle(
  day: OrthocalDay | null | undefined,
  appearanceKey: string,
  feastRank: FeastRankDisplay | null | undefined,
): boolean {
  if (isFeastCellAppearance(appearanceKey)) return true;
  if (isOrthocalGreatFeastLevel(day)) return true;
  if (feastRank?.glyph === 'great_feast') return true;
  return false;
}

function defaultTitleFromOrthocal(day: OrthocalDay | null | undefined, fallback: string): string {
  if (day?.titles?.[0]?.trim()) {
    return sanitizeTypikonProse(day.titles[0]);
  }
  if (day?.summary_title?.trim()) {
    return sanitizeTypikonProse(day.summary_title);
  }
  return sanitizeTypikonProse(fallback);
}

/**
 * Home hero and calendar heading: on great feasts, the primary orthocal feast name
 * (e.g. Transfiguration), not the lectionary weekday title.
 */
export function liturgicalDayTitle(
  day: OrthocalDay | null | undefined,
  appearanceKey: string,
  appearanceLabel: string,
  feastRank: FeastRankDisplay | null | undefined,
): string {
  if (shouldUseMajorFeastDayTitle(day, appearanceKey, feastRank)) {
    const feasts = allFeastsFromOrthocalDay(day);
    if (feasts[0]) return feasts[0];
    if (isFeastCellAppearance(appearanceKey)) {
      return sanitizeTypikonProse(appearanceLabel);
    }
  }
  return defaultTitleFromOrthocal(day, appearanceLabel);
}

/** Calendar cell feast bullets — orthocal feasts except the headline title. */
export function calendarFeastsForDay(
  day: OrthocalDay | null | undefined,
  dayTitle: string,
): string[] {
  const all = allFeastsFromOrthocalDay(day);
  if (!all.length) return [];
  return all.filter((f) => f !== dayTitle);
}
