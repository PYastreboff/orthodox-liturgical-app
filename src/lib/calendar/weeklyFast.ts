import { julianCalendarToJulianDayNumber } from './julianGregorian';
import { orthodoxPaschaJdn } from './pascha';

export const WEEKLY_FAST_APPEARANCE_KEYS = new Set(['wednesday_fast', 'friday_fast']);

/** Pascha Sunday through the following Saturday — Wed/Fri fast is suspended. */
export function isInBrightWeek(jdn: number, julianYear: number): boolean {
  const pascha = orthodoxPaschaJdn(julianYear);
  return jdn >= pascha && jdn <= pascha + 7;
}

/** Pentecost Sunday through the following Saturday — Wed/Fri fast is suspended. */
export function isInPentecostWeek(jdn: number, julianYear: number): boolean {
  const pascha = orthodoxPaschaJdn(julianYear);
  const pentecost = pascha + 49;
  return jdn >= pentecost && jdn <= pentecost + 7;
}

/** Nativity (25 Dec Julian) through the following Saturday — Wed/Fri fast is suspended. */
export function isInNativityWeek(jdn: number, julianYear: number): boolean {
  const nativity = julianCalendarToJulianDayNumber(julianYear, 12, 25);
  if (jdn >= nativity && jdn <= nativity + 7) return true;
  const prevNativity = julianCalendarToJulianDayNumber(julianYear - 1, 12, 25);
  return jdn >= prevNativity && jdn <= prevNativity + 7;
}

export function isWednesdayOrFriday(weekday: number): boolean {
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

export function weeklyFastShortLabel(weekday: number): string {
  return weekday === 3 ? 'Wednesday fast' : 'Friday fast';
}

export const WEEKLY_FAST_LEVEL_LABEL = 'Strict fast (Wednesday & Friday)';

export const WEEKLY_FAST_FOODS =
  'Strict fast: no meat, dairy, eggs, fish, wine, or oil (typical Wednesday & Friday rule).';

/** Use local Wed/Fri fast when API reports no fast / fast-free without an exception. */
export function shouldApplyWeeklyFastOverride(
  day: { fast_level: number; fast_exception: number } | null | undefined,
  appearanceKey: string,
): boolean {
  if (!isWeeklyFastAppearanceKey(appearanceKey)) return false;
  if (!day) return true;
  if (day.fast_exception !== 0) return false;
  return day.fast_level === 0 || day.fast_level === 1;
}
