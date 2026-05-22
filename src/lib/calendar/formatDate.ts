import type { PlainDate } from './julianGregorian';
import { julianCalendarToGregorian } from './julianGregorian';

/** e.g. 1 → "1st", 14 → "14th" */
export function ordinalDay(day: number): string {
  const mod100 = day % 100;
  const mod10 = day % 10;
  if (mod100 >= 11 && mod100 <= 13) return `${day}th`;
  if (mod10 === 1) return `${day}st`;
  if (mod10 === 2) return `${day}nd`;
  if (mod10 === 3) return `${day}rd`;
  return `${day}th`;
}

function monthName(month: number): string {
  return new Intl.DateTimeFormat('en-GB', { month: 'long' }).format(new Date(2000, month - 1, 1));
}

function weekdayForGregorianPlain(plain: PlainDate): string {
  return new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(
    new Date(plain.year, plain.month - 1, plain.day),
  );
}

/** Weekday for a Julian calendar date (via its Gregorian equivalent). */
export function weekdayForJulianPlain(julian: PlainDate): string {
  const g = julianCalendarToGregorian(julian.year, julian.month, julian.day);
  return weekdayForGregorianPlain(g);
}

/**
 * Human-readable date: "Thursday 14th May" (optional year).
 */
export function formatReadableDate(plain: PlainDate, options?: { includeYear?: boolean; weekday?: string }) {
  const weekday = options?.weekday ?? weekdayForGregorianPlain(plain);
  const base = `${weekday} ${ordinalDay(plain.day)} ${monthName(plain.month)}`;
  return options?.includeYear ? `${base} ${plain.year}` : base;
}

export function formatJulianReadable(julian: PlainDate, includeYear = true): string {
  return formatReadableDate(julian, {
    weekday: weekdayForJulianPlain(julian),
    includeYear,
  });
}

export function formatGregorianReadable(plain: PlainDate, includeYear = true): string {
  return formatReadableDate(plain, { includeYear });
}

export function formatGregorianReadableFromDate(d: Date, includeYear = true): string {
  return formatGregorianReadable(
    { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() },
    includeYear,
  );
}
