import type { PlainDate } from './julianGregorian';
import { gregorianPlainToJulianPlain } from './julianGregorian';
import { formatGregorianReadable, formatJulianReadable } from './formatDate';
import type { PrimaryCalendar } from './dateDisplay';
import { translate } from '../../i18n/translate';
import type { UiLanguage } from '../../i18n/types';

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

export function liturgicalCalendarShortLabel(calendar: PrimaryCalendar): string {
  return calendar === 'julian' ? 'Julian' : 'Gregorian';
}

export function liturgicalCalendarDescription(calendar: PrimaryCalendar, lang: UiLanguage = 'en'): string {
  return calendar === 'julian'
    ? translate(lang, 'calendarHint.julian')
    : translate(lang, 'calendarHint.gregorian');
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
