import { translate } from '../../i18n/translate';
import type { UiLanguage } from '../../i18n/types';
import type { PlainDate } from './julianGregorian';
import {
  gregorianPlainToJulianPlain,
  julianCalendarToJulianDayNumber,
} from './julianGregorian';
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

/** Russian tradition: Wed/Fri fast on the civil date being viewed (with Bright Week, etc. excluded). */
export function isWeeklyFastForCivilDate(civil: PlainDate): boolean {
  const weekday = civilWeekday(civil);
  if (!isWednesdayOrFriday(weekday)) return false;
  const julian = gregorianPlainToJulianPlain(civil);
  const jdn = julianCalendarToJulianDayNumber(julian.year, julian.month, julian.day);
  return isWeeklyFastDay(jdn, weekday, julian.year);
}

function normalizeFastText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** True when orthocal already defines the day or feast rules lift Wed/Fri fast (level 0 only). */
function orthocalRelaxesWeeklyFast(day: {
  fast_level: number;
  fast_exception_desc?: string;
}): boolean {
  if (day.fast_level >= 1) return true;
  const exception = day.fast_exception_desc?.trim();
  if (!exception) return false;
  const normalized = normalizeFastText(exception);
  if (
    normalized === 'fast free' ||
    normalized === 'fast free day' ||
    normalized === 'no fast'
  ) {
    return true;
  }
  if (
    normalized === 'no overrides' ||
    normalized === 'no override'
  ) {
    return false;
  }
  return /allow|permit/i.test(exception);
}

/**
 * Fallback Wed/Fri strict fast when orthocal reports level 0 without a feast relaxation.
 */
/** "Wednesday fast" / "Friday fast" for the Fasting section when this civil day is a weekly fast day. */
export function localizedWeeklyFastDayLabel(civil: PlainDate, lang: UiLanguage): string | null {
  if (!isWeeklyFastForCivilDate(civil)) return null;
  return translate(lang, civilWeekday(civil) === 3 ? 'fasting.wednesdayFast' : 'fasting.fridayFast');
}

export function shouldApplyWeeklyFastOverride(
  day: { fast_level: number; fast_exception_desc?: string } | null | undefined,
  civil: PlainDate,
): boolean {
  if (!isWeeklyFastForCivilDate(civil)) return false;
  if (!day) return true;
  if (day.fast_level >= 1) return false;
  if (orthocalRelaxesWeeklyFast(day)) return false;
  return true;
}

