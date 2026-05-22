export type PlainDate = { year: number; month: number; day: number };

/**
 * Julian Day Number (integer, noon convention) for a date on the **Gregorian** civil calendar.
 */
export function gregorianCalendarToJulianDayNumber(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

/**
 * Julian calendar (Old Style) date from a Julian Day Number (noon).
 */
export function julianDayNumberToJulianCalendar(jdn: number): PlainDate {
  const c = jdn + 32082;
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = d - 4800 + Math.floor(m / 10);
  return { year, month, day };
}

/** Civil `Date` in local time → same instant as Julian calendar Y-M-D. */
export function dateToJulianPlainDate(d: Date): PlainDate {
  const jdn = gregorianCalendarToJulianDayNumber(d.getFullYear(), d.getMonth() + 1, d.getDate());
  return julianDayNumberToJulianCalendar(jdn);
}

/** Local civil date parts → Julian calendar date for that civil day. */
export function gregorianPlainToJulianPlain(g: PlainDate): PlainDate {
  const jdn = gregorianCalendarToJulianDayNumber(g.year, g.month, g.day);
  return julianDayNumberToJulianCalendar(jdn);
}

/**
 * Julian Day Number at noon UTC for a date on the **Julian** (Old Style) calendar.
 * Valid for historical astronomical Julian calendar (every 4th year is leap).
 */
export function julianCalendarToJulianDayNumber(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083
  );
}

/**
 * Gregorian calendar (New Style) date from a Julian Day Number (at noon).
 */
export function julianDayNumberToGregorianCalendar(jdn: number): PlainDate {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);

  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);

  return { year, month, day };
}

/**
 * Given a date on the **Julian** calendar, return the same instant expressed as a **Gregorian**
 * civil calendar date (typical "parallel" display for ROC liturgical Julian dates).
 */
export function julianCalendarToGregorian(year: number, month: number, day: number): PlainDate {
  const jdn = julianCalendarToJulianDayNumber(year, month, day);
  return julianDayNumberToGregorianCalendar(jdn);
}
