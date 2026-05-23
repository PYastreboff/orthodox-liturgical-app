import { fetchOrthocalDay } from '../api/orthocal';
import type { PrimaryCalendar } from '../calendar/dateDisplay';
import { civilPlainDateFromLocal, orthocalQueryDate } from '../calendar/liturgicalCalendar';
import { toDayIso } from '../calendar/localDate';
import { getLiturgicalAppearanceForLocalDate } from '../calendar/dayAppearance';
import { buildCalendarDayInfo, type CalendarDayInfo } from './calendarDayInfo';
import { feastRankForLiturgicalDay } from './calendarTypikon';
import { getFeastRankDisplay } from './typikonSymbols';

export type MonthDayMap = Record<string, CalendarDayInfo>;

const monthCache = new Map<string, MonthDayMap>();
const inFlight = new Map<string, Promise<MonthDayMap>>();

export function monthStart(year: number, monthIndex: number): Date {
  return new Date(year, monthIndex, 1);
}

export function monthCacheKey(calendar: PrimaryCalendar, month: Date): string {
  return `${calendar}:${month.getFullYear()}-${month.getMonth()}`;
}

export function adjacentMonth(month: Date, delta: -1 | 1): Date {
  return new Date(month.getFullYear(), month.getMonth() + delta, 1);
}

function daysInMonth(visibleMonth: Date): Date[] {
  const y = visibleMonth.getFullYear();
  const m = visibleMonth.getMonth();
  const count = new Date(y, m + 1, 0).getDate();
  const days: Date[] = [];
  for (let d = 1; d <= count; d++) {
    days.push(new Date(y, m, d));
  }
  return days;
}

async function fetchMonthDayMap(
  visibleMonth: Date,
  liturgicalCalendar: PrimaryCalendar,
): Promise<MonthDayMap> {
  const days = daysInMonth(visibleMonth);
  const entries = await Promise.all(
    days.map(async (date) => {
      const iso = toDayIso(date);
      const civil = civilPlainDateFromLocal(date);
      const queryDate = orthocalQueryDate(civil);
      const appearance = getLiturgicalAppearanceForLocalDate(date, liturgicalCalendar);

      try {
        const orthocalDay = await fetchOrthocalDay(liturgicalCalendar, queryDate);
        const apiRank = getFeastRankDisplay(
          orthocalDay.feast_level,
          orthocalDay.feast_level_description,
        );
        const feastRank = feastRankForLiturgicalDay(appearance.key, apiRank, orthocalDay);
        const info = buildCalendarDayInfo(
          orthocalDay,
          appearance.key,
          appearance.label,
          feastRank,
        );
        return [iso, info] as const;
      } catch {
        const info = buildCalendarDayInfo(null, appearance.key, appearance.label, null);
        return [iso, info] as const;
      }
    }),
  );

  const next: MonthDayMap = {};
  for (const [iso, info] of entries) {
    next[iso] = info;
  }
  return next;
}

export function getCachedMonth(
  calendar: PrimaryCalendar,
  month: Date,
): MonthDayMap | undefined {
  return monthCache.get(monthCacheKey(calendar, month));
}

/** Loads a month into cache; reuses in-flight work when prefetch and visible month overlap. */
export function loadOrthocalMonth(
  calendar: PrimaryCalendar,
  month: Date,
): Promise<MonthDayMap> {
  const key = monthCacheKey(calendar, month);
  const hit = monthCache.get(key);
  if (hit) return Promise.resolve(hit);

  const pending = inFlight.get(key);
  if (pending) return pending;

  const promise = fetchMonthDayMap(month, calendar).then((data) => {
    monthCache.set(key, data);
    inFlight.delete(key);
    return data;
  });
  inFlight.set(key, promise);
  return promise;
}

/** Warm previous and next month without blocking the UI. */
export function prefetchAdjacentMonths(calendar: PrimaryCalendar, centerMonth: Date): void {
  void loadOrthocalMonth(calendar, adjacentMonth(centerMonth, -1));
  void loadOrthocalMonth(calendar, adjacentMonth(centerMonth, 1));
}
