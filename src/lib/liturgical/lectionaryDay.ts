import type { OrthocalDay } from '../api/orthocal';
import type { TypikonGlyph } from './typikonSymbols';

/**
 * Ordinary Pentecostarion headings from orthocal (e.g. "Wednesday of the 7th Sunday after Pentecost").
 * These are lectionary labels, not great / polyeleos feasts on the month grid.
 */
const ORDINARY_SEASON_AFTER_PASCHA =
  /\bafter\s+(?:pentecost|pascha)\b/i;

const ORDINARY_SEASON_WEEK_OR_SUNDAY =
  /\b(?:\d+(?:st|nd|rd|th)?\s+)?(?:week|sunday)\s+after\s+(?:pentecost|pascha)\b/i;

const ORDINARY_WEEKDAY_OF_SEASON =
  /\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+of\s+the\s+.+?\bafter\s+(?:pentecost|pascha)\b/i;

const HOLY_TUESDAY_TITLE =
  /\b(?:great\s+(?:and\s+)?holy\s+tuesday|holy\s+tuesday)\b/i;

const GREAT_FRIDAY_TITLE =
  /\b(?:great\s+(?:and\s+)?holy\s+friday|holy\s+friday|good\s+friday)\b/i;

function dayTitleStrings(day: OrthocalDay | null | undefined): string[] {
  if (!day) return [];
  const parts = [day.titles?.[0], day.summary_title, ...(day.titles ?? [])];
  return parts.map((s) => s?.trim()).filter(Boolean) as string[];
}

function isOrdinarySeasonLectionaryTitle(title: string): boolean {
  const t = title.trim();
  if (!t) return false;
  if (/^pascha$/i.test(t) || /^pentecost$/i.test(t)) return false;
  if (ORDINARY_WEEKDAY_OF_SEASON.test(t)) return true;
  if (ORDINARY_SEASON_WEEK_OR_SUNDAY.test(t)) return true;
  if (ORDINARY_SEASON_AFTER_PASCHA.test(t)) return true;
  return false;
}

export function isHolyTuesdayDay(day: OrthocalDay | null | undefined): boolean {
  return dayTitleStrings(day).some((title) => HOLY_TUESDAY_TITLE.test(title));
}

export function isGreatFridayDay(day: OrthocalDay | null | undefined): boolean {
  return dayTitleStrings(day).some((title) => GREAT_FRIDAY_TITLE.test(title));
}

/** Orthocal ranks that must not drive calendar feast styling on non-feast days. */
export const INFLATED_ORTHOCAL_RANK_GLYPHS = new Set<TypikonGlyph>([
  'doxology',
  'polyeleos',
  'vigil',
  'great_feast',
]);

export function isPentecostarionLectionaryDay(day: OrthocalDay | null | undefined): boolean {
  return dayTitleStrings(day).some(isOrdinarySeasonLectionaryTitle);
}

/** Whether orthocal feast_level / rank may style the calendar (red text, pink cell). */
export function shouldUseOrthocalFeastRank(
  day: OrthocalDay | null | undefined,
  appearanceKey: string,
): boolean {
  if (isPentecostarionLectionaryDay(day)) return false;
  if (appearanceKey === 'holy_week') return isHolyTuesdayDay(day);
  return true;
}

export function isInflatedOrthocalRankGlyph(glyph: TypikonGlyph | undefined): boolean {
  return glyph !== undefined && INFLATED_ORTHOCAL_RANK_GLYPHS.has(glyph);
}
