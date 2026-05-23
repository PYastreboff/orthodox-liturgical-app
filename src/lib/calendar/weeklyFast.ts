import type { PlainDate } from './julianGregorian';
import { julianCalendarToJulianDayNumber } from './julianGregorian';
import { orthodoxPaschaJdn } from './pascha';

/** Weekday of the civil (Gregorian) date the user is viewing: 0 = Sunday … 6 = Saturday. */
export function civilWeekday(plain: PlainDate): number {
  return new Date(plain.year, plain.month - 1, plain.day).getDay();
}

export const WEEKLY_FAST_APPEARANCE_KEYS = new Set(['wednesday_fast', 'friday_fast']);

/** Pascha Sunday through the following Saturday — Wed/Fri fast is suspended. */
function isInBrightWeek(jdn: number, julianYear: number): boolean {
  const pascha = orthodoxPaschaJdn(julianYear);
  return jdn >= pascha && jdn <= pascha + 7;
}

/** Pentecost Sunday through the following Saturday — Wed/Fri fast is suspended. */
function isInPentecostWeek(jdn: number, julianYear: number): boolean {
  const pascha = orthodoxPaschaJdn(julianYear);
  const pentecost = pascha + 49;
  return jdn >= pentecost && jdn <= pentecost + 7;
}

/** Nativity (25 Dec Julian) through the following Saturday — Wed/Fri fast is suspended. */
function isInNativityWeek(jdn: number, julianYear: number): boolean {
  const nativity = julianCalendarToJulianDayNumber(julianYear, 12, 25);
  if (jdn >= nativity && jdn <= nativity + 7) return true;
  const prevNativity = julianCalendarToJulianDayNumber(julianYear - 1, 12, 25);
  return jdn >= prevNativity && jdn <= prevNativity + 7;
}

function isWednesdayOrFriday(weekday: number): boolean {
  return weekday === 3 || weekday === 5;
}

export function isWeeklyFastDay(jdn: number, weekday: number, julianYear: number): boolean {
  if (!isWednesdayOrFriday(weekday)) return false;
  if (isInBrightWeek(jdn, julianYear)) return false;
  if (isInPentecostWeek(jdn, julianYear)) return false;
  if (isInNativityWeek(jdn, julianYear)) return false;
  return true;
}

export function isWeeklyFastAppearanceKey(key: string): boolean {
  return WEEKLY_FAST_APPEARANCE_KEYS.has(key);
}

/**
 * Use local Wed/Fri fast when API reports no fast / fast-free without an exception.
 * `civilWeekday` must be the civil date being viewed (not Julian liturgical weekday).
 */
export function shouldApplyWeeklyFastOverride(
  day: { fast_level: number; fast_exception: number } | null | undefined,
  appearanceKey: string,
  civilWeekday: number,
): boolean {
  if (!isWednesdayOrFriday(civilWeekday)) return false;
  if (!isWeeklyFastAppearanceKey(appearanceKey)) return false;
  if (!day) return true;
  if (day.fast_exception !== 0) return false;
  return day.fast_level === 0 || day.fast_level === 1;
}
