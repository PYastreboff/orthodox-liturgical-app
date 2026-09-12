import { useCallback, useEffect, useState } from 'react';

import type { PrimaryCalendar } from '../lib/calendar/dateDisplay';
import { getLiturgicalAppearanceForLocalDate } from '../lib/calendar/dayAppearance';
import { civilPlainDateFromLocal } from '../lib/calendar/liturgicalCalendar';
import {
  buildCalendarDayInfo,
  type CalendarDayInfo,
} from '../lib/liturgical/calendarDayInfo';
import {
  buildAppearanceOnlyMonth,
  getCachedMonth,
  isMonthCacheComplete,
  loadOrthocalMonth,
  prefetchAdjacentMonths,
  type MonthDayMap,
} from '../lib/liturgical/orthocalMonthCache';
import { shouldShowCalendarTypikon } from '../lib/liturgical/calendarTypikon';
import { toDayIso } from '../lib/calendar/localDate';

function mergeMonthMaps(prev: MonthDayMap, partial: MonthDayMap): MonthDayMap {
  let changed = false;
  const next = { ...prev };
  for (const [iso, info] of Object.entries(partial)) {
    if (next[iso] !== info) {
      next[iso] = info;
      changed = true;
    }
  }
  return changed ? next : prev;
}

type MonthDayState = {
  key: string;
  dayByIso: MonthDayMap;
};

export function useOrthocalMonth(visibleMonth: Date, liturgicalCalendar: PrimaryCalendar) {
  const monthKey = `${visibleMonth.getFullYear()}-${visibleMonth.getMonth()}`;
  const seedDayByIso =
    getCachedMonth(liturgicalCalendar, visibleMonth) ??
    buildAppearanceOnlyMonth(visibleMonth, liturgicalCalendar);
  const [dayState, setDayState] = useState<MonthDayState>(() => ({
    key: monthKey,
    dayByIso: seedDayByIso,
  }));
  const [loadingState, setLoadingState] = useState<{ key: string; loading: boolean }>(() => ({
    key: monthKey,
    loading: !isMonthCacheComplete(liturgicalCalendar, visibleMonth),
  }));

  /** Cached-month shell for the visible month — derived, so no query-key reset effect. */
  const dayByIso = dayState.key === monthKey ? dayState.dayByIso : seedDayByIso;
  const loading =
    loadingState.key === monthKey
      ? loadingState.loading
      : !isMonthCacheComplete(liturgicalCalendar, visibleMonth);

  useEffect(() => {
    let cancelled = false;
    const cached = getCachedMonth(liturgicalCalendar, visibleMonth);
    const shell = buildAppearanceOnlyMonth(visibleMonth, liturgicalCalendar);

    const mergeIntoMonth = (prev: MonthDayState, partial: MonthDayMap): MonthDayState => {
      const base = prev.key === monthKey ? prev.dayByIso : cached ?? shell;
      return { key: monthKey, dayByIso: mergeMonthMaps(base, partial) };
    };

    const handleProgress = (partial: MonthDayMap) => {
      if (!cancelled) setDayState((prev) => mergeIntoMonth(prev, partial));
    };

    loadOrthocalMonth(liturgicalCalendar, visibleMonth, handleProgress).then((next) => {
      if (!cancelled) {
        setDayState((prev) => mergeIntoMonth(prev, next));
        setLoadingState({ key: monthKey, loading: false });
      }
    });

    prefetchAdjacentMonths(liturgicalCalendar, visibleMonth);

    return () => {
      cancelled = true;
    };
  }, [liturgicalCalendar, monthKey, visibleMonth]);

  const dayInfoForDate = useCallback(
    (date: Date): CalendarDayInfo => {
      const iso = toDayIso(date);
      const cached = dayByIso[iso];
      if (cached) return cached;
      const appearance = getLiturgicalAppearanceForLocalDate(date, liturgicalCalendar);
      const civil = civilPlainDateFromLocal(date);
      return buildCalendarDayInfo(null, appearance.key, appearance.label, null, civil);
    },
    [dayByIso, liturgicalCalendar],
  );

  const feastRankForDate = useCallback(
    (date: Date) => dayInfoForDate(date).feastRank,
    [dayInfoForDate],
  );

  const showTypikonForDate = useCallback(
    (date: Date) => {
      const rank = feastRankForDate(date);
      return rank ? shouldShowCalendarTypikon(rank.glyph) : false;
    },
    [feastRankForDate],
  );

  return { dayByIso, dayInfoForDate, feastRankForDate, showTypikonForDate, loading };
}

export type OrthocalMonthLoading = {
  loading: boolean;
  loadedCount: number;
  totalCount: number;
  pendingCount: number;
};

export function orthocalMonthLoadingStats(
  dates: Date[],
  dayByIso: MonthDayMap,
): OrthocalMonthLoading {
  let loadedCount = 0;
  for (const date of dates) {
    if (dayByIso[toDayIso(date)]?.orthocalLoaded) loadedCount += 1;
  }
  const totalCount = dates.length;
  return {
    loading: loadedCount < totalCount,
    loadedCount,
    totalCount,
    pendingCount: totalCount - loadedCount,
  };
}
