import type { OrthocalDay } from '../api/orthocal';
import type { TypikonGlyph } from './typikonSymbols';

/**
 * Ordinary Pentecostarion headings from orthocal (e.g. "Wednesday of the 31st week after Pentecost").
 * These are lectionary labels, not great / polyeleos feasts.
 */
const PENTECOSTARION_LECTIONARY_TITLE =
  /\b(?:\d+(?:st|nd|rd|th)?\s+)?week after pentecost\b/i;

const HOLY_TUESDAY_TITLE =
  /\b(?:great\s+(?:and\s+)?holy\s+tuesday|holy\s+tuesday)\b/i;

const GREAT_FRIDAY_TITLE =
  /\b(?:great\s+(?:and\s+)?holy\s+friday|holy\s+friday|good\s+friday)\b/i;

export function isHolyTuesdayDay(day: OrthocalDay | null | undefined): boolean {
  const title = day?.titles?.[0]?.trim() ?? '';
  if (!title) return false;
  return HOLY_TUESDAY_TITLE.test(title);
}

export function isGreatFridayDay(day: OrthocalDay | null | undefined): boolean {
  const title = day?.titles?.[0]?.trim() ?? '';
  if (!title) return false;
  return GREAT_FRIDAY_TITLE.test(title);
}

/** Orthocal ranks that must not drive calendar feast styling on non-feast days. */
export const INFLATED_ORTHOCAL_RANK_GLYPHS = new Set<TypikonGlyph>([
  'doxology',
  'polyeleos',
  'vigil',
  'great_feast',
]);

export function isPentecostarionLectionaryDay(day: OrthocalDay | null | undefined): boolean {
  const title = day?.titles?.[0]?.trim() ?? '';
  if (!title) return false;
  return PENTECOSTARION_LECTIONARY_TITLE.test(title);
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
