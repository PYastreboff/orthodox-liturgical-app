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

/** Only these periods suspend Wed/Fri fasting in the Russian tradition. */
export type WeeklyFastSuspension =
  | 'bright_week'
  | 'week_after_pentecost'
  | 'dodekahemeron'
  | 'publican_pharisee';

function paschaForJulianYear(julianYear: number): number {
  return orthodoxPaschaJdn(julianYear);
}

/** Pascha Sunday through the following Saturday — Bright Week. */
function isInBrightWeek(jdn: number, julianYear: number): boolean {
  const pascha = paschaForJulianYear(julianYear);
  return jdn >= pascha && jdn <= pascha + 7;
}

/** Pentecost Sunday through the following Saturday (before the Fast of the Apostles). */
function isInWeekAfterPentecost(jdn: number, julianYear: number): boolean {
  const pascha = paschaForJulianYear(julianYear);
  const pentecost = pascha + 49;
  return jdn >= pentecost && jdn <= pentecost + 6;
}

/** Nativity (25 Dec Julian) through Theophany (6 Jan Julian) — the Dodekahemeron. */
function isInDodekahemeron(jdn: number, julian: PlainDate): boolean {
  const y = julian.year;
  const nativity = julianCalendarToJulianDayNumber(y, 12, 25);
  const theophanyAfterNativity = julianCalendarToJulianDayNumber(y + 1, 1, 6);
  const nativityPrevYear = julianCalendarToJulianDayNumber(y - 1, 12, 25);
  const theophanySameYear = julianCalendarToJulianDayNumber(y, 1, 6);

  if (jdn >= nativity && jdn <= theophanyAfterNativity) return true;
  if (jdn >= nativityPrevYear && jdn <= theophanySameYear) return true;
  return false;
}

/** Sunday of the Publican and the Pharisee through the following Saturday. */
function isInPublicanPhariseeWeek(jdn: number, julianYear: number): boolean {
  const pascha = paschaForJulianYear(julianYear);
  const publicanSunday = pascha - 63;
  return jdn >= publicanSunday && jdn <= publicanSunday + 6;
}

function isWednesdayOrFriday(weekday: number): boolean {
  return weekday === 3 || weekday === 5;
}

export function weeklyFastSuspension(
  jdn: number,
  weekday: number,
  julian: PlainDate,
): WeeklyFastSuspension | null {
  if (!isWednesdayOrFriday(weekday)) return null;
  const y = julian.year;
  if (isInBrightWeek(jdn, y)) return 'bright_week';
  if (isInWeekAfterPentecost(jdn, y)) return 'week_after_pentecost';
  if (isInDodekahemeron(jdn, julian)) return 'dodekahemeron';
  if (isInPublicanPhariseeWeek(jdn, y)) return 'publican_pharisee';
  return null;
}

export function weeklyFastSuspensionForCivilDate(civil: PlainDate): WeeklyFastSuspension | null {
  const weekday = civilWeekday(civil);
  const julian = gregorianPlainToJulianPlain(civil);
  const jdn = julianCalendarToJulianDayNumber(julian.year, julian.month, julian.day);
  return weeklyFastSuspension(jdn, weekday, julian);
}

export function isWeeklyFastDay(
  jdn: number,
  weekday: number,
  julian: PlainDate,
): boolean {
  if (!isWednesdayOrFriday(weekday)) return false;
  return weeklyFastSuspension(jdn, weekday, julian) === null;
}

export function isWeeklyFastAppearanceKey(key: string): boolean {
  return WEEKLY_FAST_APPEARANCE_KEYS.has(key);
}

/** Russian tradition: Wed/Fri fast unless one of the four suspension periods applies. */
export function isWeeklyFastForCivilDate(civil: PlainDate): boolean {
  const weekday = civilWeekday(civil);
  if (!isWednesdayOrFriday(weekday)) return false;
  const julian = gregorianPlainToJulianPlain(civil);
  const jdn = julianCalendarToJulianDayNumber(julian.year, julian.month, julian.day);
  return isWeeklyFastDay(jdn, weekday, julian);
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

/** "Wednesday fast" / "Friday fast" for the Fasting section when this civil day is a weekly fast day. */
export function localizedWeeklyFastDayLabel(civil: PlainDate, lang: UiLanguage): string | null {
  if (!isWeeklyFastForCivilDate(civil)) return null;
  return translate(lang, civilWeekday(civil) === 3 ? 'fasting.wednesdayFast' : 'fasting.fridayFast');
}

export function localizedWeeklyFastSuspensionNote(
  suspension: WeeklyFastSuspension,
  lang: UiLanguage,
): string {
  return translate(lang, `fasting.weeklySuspension.${suspension}`);
}

/** Fallback Wed/Fri strict fast when orthocal reports level 0 without a feast relaxation. */
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
