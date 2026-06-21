import { useCallback, useEffect, useMemo, useState } from 'react';

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

function initialMonthData(
  liturgicalCalendar: PrimaryCalendar,
  visibleMonth: Date,
): MonthDayMap {
  return getCachedMonth(liturgicalCalendar, visibleMonth) ?? buildAppearanceOnlyMonth(visibleMonth, liturgicalCalendar);
}

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

export function useOrthocalMonth(visibleMonth: Date, liturgicalCalendar: PrimaryCalendar) {
  const monthKey = `${visibleMonth.getFullYear()}-${visibleMonth.getMonth()}`;
  const [dayByIso, setDayByIso] = useState<MonthDayMap>(() =>
    initialMonthData(liturgicalCalendar, visibleMonth),
  );
  const [loading, setLoading] = useState(
    () => !isMonthCacheComplete(liturgicalCalendar, visibleMonth),
  );

  const onMonthProgress = useCallback((partial: MonthDayMap) => {
    setDayByIso((prev) => mergeMonthMaps(prev, partial));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const cached = getCachedMonth(liturgicalCalendar, visibleMonth);
    const shell = buildAppearanceOnlyMonth(visibleMonth, liturgicalCalendar);

    setDayByIso(cached ?? shell);
    setLoading(!isMonthCacheComplete(liturgicalCalendar, visibleMonth));

    const handleProgress = (partial: MonthDayMap) => {
      if (!cancelled) onMonthProgress(partial);
    };

    loadOrthocalMonth(liturgicalCalendar, visibleMonth, handleProgress).then((next) => {
      if (!cancelled) {
        setDayByIso((prev) => mergeMonthMaps(prev, next));
        setLoading(false);
      }
    });

    prefetchAdjacentMonths(liturgicalCalendar, visibleMonth);

    return () => {
      cancelled = true;
    };
  }, [liturgicalCalendar, monthKey, onMonthProgress, visibleMonth]);

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
