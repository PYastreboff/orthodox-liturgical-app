import type { PrimaryCalendar } from '../calendar/dateDisplay';
import { civilPlainDateFromLocal, orthocalQueryDate } from '../calendar/liturgicalCalendar';
import { startOfLocalDay } from '../calendar/localDate';
import { fetchOrthocalDay } from './orthocal';

function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return startOfLocalDay(next);
}

/** Fire-and-forget orthocal loads for the given civil dates. */
export function prefetchOrthocalDays(calendar: PrimaryCalendar, civilDates: Date[]): void {
  for (const date of civilDates) {
    const queryDate = orthocalQueryDate(civilPlainDateFromLocal(date));
    void fetchOrthocalDay(calendar, queryDate).catch(() => {});
  }
}

/** Warm yesterday, today, and tomorrow for snappy day swipes. */
export function prefetchOrthocalDayNeighbors(calendar: PrimaryCalendar, center: Date): void {
  prefetchOrthocalDays(calendar, [addDays(center, -1), center, addDays(center, 1)]);
}

/** Warm today ±1 as soon as the app opens. */
export function prefetchOrthocalTodayWindow(calendar: PrimaryCalendar, today = new Date()): void {
  prefetchOrthocalDayNeighbors(calendar, startOfLocalDay(today));
}
