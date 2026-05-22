import type { PlainDate } from './julianGregorian';
import { julianCalendarToJulianDayNumber } from './julianGregorian';

/**
 * Orthodox Pascha (Julian calendar) using the Julian Easter algorithm
 * (see e.g. https://www.tondering.dk/claus/cal/easter.php — Julian calendar).
 */
export function orthodoxPaschaJulian(year: number): PlainDate {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const f = d + e + 114;
  const month = Math.floor(f / 31);
  const day = (f % 31) + 1;
  return { year, month, day };
}

export function orthodoxPaschaJdn(year: number): number {
  const p = orthodoxPaschaJulian(year);
  return julianCalendarToJulianDayNumber(p.year, p.month, p.day);
}
