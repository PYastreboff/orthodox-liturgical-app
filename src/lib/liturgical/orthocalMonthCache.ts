import { fetchOrthocalDay, fetchOrthocalGregorianMonth } from '../api/orthocal';
import type { PrimaryCalendar } from '../calendar/dateDisplay';
import { civilPlainDateFromLocal, orthocalQueryDate } from '../calendar/liturgicalCalendar';
import { toDayIso } from '../calendar/localDate';
import { getLiturgicalAppearanceForLocalDate } from '../calendar/dayAppearance';
import { buildCalendarDayInfo, type CalendarDayInfo } from './calendarDayInfo';
import { feastRankForLiturgicalDay } from './calendarTypikon';
import { getFeastRankDisplay } from './typikonSymbols';

export type MonthDayMap = Record<string, CalendarDayInfo>;

const monthCache = new Map<string, MonthDayMap>();
const monthComplete = new Set<string>();
const inFlight = new Map<string, Promise<MonthDayMap>>();
const progressListeners = new Map<string, Set<(partial: MonthDayMap) => void>>();

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

function subscribeMonthProgress(
  key: string,
  listener: (partial: MonthDayMap) => void,
): () => void {
  let listeners = progressListeners.get(key);
  if (!listeners) {
    listeners = new Set();
    progressListeners.set(key, listeners);
  }
  listeners.add(listener);
  return () => {
    listeners?.delete(listener);
    if (listeners?.size === 0) progressListeners.delete(key);
  };
}

function emitMonthProgress(key: string, partial: MonthDayMap): void {
  const snapshot = { ...partial };
  progressListeners.get(key)?.forEach((listener) => listener(snapshot));
}

/** Instant grey cells / seasons from the local calendar — no network. */
export function buildAppearanceOnlyMonth(
  visibleMonth: Date,
  liturgicalCalendar: PrimaryCalendar,
): MonthDayMap {
  const next: MonthDayMap = {};
  for (const date of daysInMonth(visibleMonth)) {
    const iso = toDayIso(date);
    const civil = civilPlainDateFromLocal(date);
    const appearance = getLiturgicalAppearanceForLocalDate(date, liturgicalCalendar);
    next[iso] = buildCalendarDayInfo(null, appearance.key, appearance.label, null, civil);
  }
  return next;
}

function buildDayInfo(
  date: Date,
  liturgicalCalendar: PrimaryCalendar,
  orthocalDay: Awaited<ReturnType<typeof fetchOrthocalDay>> | null,
): readonly [string, CalendarDayInfo] {
  const iso = toDayIso(date);
  const civil = civilPlainDateFromLocal(date);
  if (!orthocalDay) {
    const appearance = getLiturgicalAppearanceForLocalDate(date, liturgicalCalendar);
    return [iso, buildCalendarDayInfo(null, appearance.key, appearance.label, null, civil)];
  }
  const appearance = getLiturgicalAppearanceForLocalDate(
    date,
    liturgicalCalendar,
    orthocalDay,
  );
  const apiRank = getFeastRankDisplay(
    orthocalDay.feast_level,
    orthocalDay.feast_level_description,
  );
  const feastRank = feastRankForLiturgicalDay(appearance.key, apiRank, orthocalDay);
  return [
    iso,
    buildCalendarDayInfo(
      orthocalDay,
      appearance.key,
      appearance.label,
      feastRank,
      civil,
    ),
  ];
}

async function fetchDayEntry(
  date: Date,
  liturgicalCalendar: PrimaryCalendar,
): Promise<readonly [string, CalendarDayInfo]> {
  const queryDate = orthocalQueryDate(civilPlainDateFromLocal(date));
  try {
    const orthocalDay = await fetchOrthocalDay(liturgicalCalendar, queryDate);
    return buildDayInfo(date, liturgicalCalendar, orthocalDay);
  } catch {
    return buildDayInfo(date, liturgicalCalendar, null);
  }
}

function publishMonthDay(
  key: string,
  iso: string,
  info: CalendarDayInfo,
  next: MonthDayMap,
): void {
  next[iso] = info;
  const snapshot = { ...next };
  monthCache.set(key, snapshot);
  emitMonthProgress(key, snapshot);
}

async function fetchMonthDayMap(
  visibleMonth: Date,
  liturgicalCalendar: PrimaryCalendar,
  cacheKey: string,
): Promise<MonthDayMap> {
  const days = daysInMonth(visibleMonth);
  const next: MonthDayMap = {
    ...buildAppearanceOnlyMonth(visibleMonth, liturgicalCalendar),
    ...monthCache.get(cacheKey),
  };
  emitMonthProgress(cacheKey, next);

  if (liturgicalCalendar === 'gregorian') {
    const y = visibleMonth.getFullYear();
    const m = visibleMonth.getMonth() + 1;
    const orthocalDays = await fetchOrthocalGregorianMonth(y, m);
    for (const orthocalDay of orthocalDays) {
      const date = new Date(orthocalDay.year, orthocalDay.month - 1, orthocalDay.day);
      const [iso, info] = buildDayInfo(date, liturgicalCalendar, orthocalDay);
      publishMonthDay(cacheKey, iso, info, next);
    }
    return next;
  }

  await Promise.all(
    days.map(async (date) => {
      const [iso, info] = await fetchDayEntry(date, liturgicalCalendar);
      publishMonthDay(cacheKey, iso, info, next);
    }),
  );

  return next;
}

export function isMonthCacheComplete(calendar: PrimaryCalendar, month: Date): boolean {
  return monthComplete.has(monthCacheKey(calendar, month));
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
  onProgress?: (partial: MonthDayMap) => void,
): Promise<MonthDayMap> {
  const key = monthCacheKey(calendar, month);
  if (monthComplete.has(key)) {
    const hit = monthCache.get(key)!;
    onProgress?.(hit);
    return Promise.resolve(hit);
  }

  const unsubscribe = onProgress ? subscribeMonthProgress(key, onProgress) : undefined;
  const deliverCachedSnapshot = () => {
    const cached = monthCache.get(key);
    if (cached && onProgress) onProgress({ ...cached });
  };

  const pending = inFlight.get(key);
  if (pending) {
    deliverCachedSnapshot();
    void pending.finally(() => unsubscribe?.());
    return pending;
  }

  deliverCachedSnapshot();

  const promise = fetchMonthDayMap(month, calendar, key).then((data) => {
    monthCache.set(key, data);
    monthComplete.add(key);
    inFlight.delete(key);
    emitMonthProgress(key, data);
    return data;
  }).finally(() => {
    unsubscribe?.();
  });
  inFlight.set(key, promise);
  return promise;
}

/** Warm previous and next month without blocking the UI. */
export function prefetchAdjacentMonths(calendar: PrimaryCalendar, centerMonth: Date): void {
  void loadOrthocalMonth(calendar, adjacentMonth(centerMonth, -1));
  void loadOrthocalMonth(calendar, adjacentMonth(centerMonth, 1));
}

/** Start loading the visible civil month as soon as the app opens. */
export function prefetchCalendarMonth(calendar: PrimaryCalendar, month = new Date()): void {
  const civilMonth = monthStart(month.getFullYear(), month.getMonth());
  void loadOrthocalMonth(calendar, civilMonth);
  prefetchAdjacentMonths(calendar, civilMonth);
}

/** All civil days currently in the month cache for this church calendar. */
export function getCachedDaysForCalendar(calendar: PrimaryCalendar): MonthDayMap {
  const merged: MonthDayMap = {};
  const prefix = `${calendar}:`;
  for (const [key, map] of monthCache.entries()) {
    if (key.startsWith(prefix)) {
      Object.assign(merged, map);
    }
  }
  return merged;
}

/** Load every month in a civil year (reuses cache / in-flight loads). */
export function loadCalendarYear(
  calendar: PrimaryCalendar,
  year: number,
): Promise<MonthDayMap> {
  return Promise.all(
    Array.from({ length: 12 }, (_, monthIndex) =>
      loadOrthocalMonth(calendar, monthStart(year, monthIndex)),
    ),
  ).then((months) => Object.assign({}, ...months));
}
