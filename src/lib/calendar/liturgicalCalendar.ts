import type { PlainDate } from './julianGregorian';
import { gregorianPlainToJulianPlain } from './julianGregorian';
import { formatGregorianReadable, formatJulianReadable } from './formatDate';
import type { PrimaryCalendar } from './dateDisplay';

export function civilPlainDateFromLocal(d: Date): PlainDate {
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
  };
}

/**
 * Date components for orthocal.info URLs — always the civil (Gregorian) Y-M-D you are viewing.
 * The path prefix (`julian` or `gregorian`) selects which church calendar rubrics apply.
 */
export function orthocalQueryDate(civil: PlainDate): PlainDate {
  return civil;
}

/** @deprecated Use orthocalQueryDate — same civil date for both calendar modes. */
export function orthocalPlainDate(civil: PlainDate, _calendar: PrimaryCalendar): PlainDate {
  return orthocalQueryDate(civil);
}

export function liturgicalCalendarShortLabel(calendar: PrimaryCalendar): string {
  return calendar === 'julian' ? 'Julian' : 'Gregorian';
}

export function liturgicalCalendarDescription(calendar: PrimaryCalendar): string {
  return calendar === 'julian'
    ? 'Saints and readings from orthocal Julian rubrics for this civil date.'
    : 'Saints and readings from orthocal Gregorian rubrics for this civil date.';
}

export function orthocalApiPath(calendar: PrimaryCalendar, civil: PlainDate): string {
  const q = orthocalQueryDate(civil);
  return `/${calendar}/${q.year}/${q.month}/${q.day}/`;
}

/** `year` / `month` / `day` from the orthocal JSON (church date for that query). */
export function formatOrthocalLiturgicalDate(
  day: { year: number; month: number; day: number },
  calendar: PrimaryCalendar,
): string {
  const plain = { year: day.year, month: day.month, day: day.day };
  return calendar === 'gregorian'
    ? formatGregorianReadable(plain, true)
    : formatJulianReadable(plain, true);
}

/** Local vestment / season appearance uses Julian dates when Julian rubrics are selected. */
export function appearanceLiturgicalPlainDate(
  civil: PlainDate,
  calendar: PrimaryCalendar,
): PlainDate {
  if (calendar === 'gregorian') return civil;
  return gregorianPlainToJulianPlain(civil);
}
