import { useEffect, useMemo, useState } from 'react';

import type { PrimaryCalendar } from '../lib/calendar/dateDisplay';
import { getLiturgicalAppearanceForLocalDate } from '../lib/calendar/dayAppearance';
import {
  buildCalendarDayInfo,
  type CalendarDayInfo,
} from '../lib/liturgical/calendarDayInfo';
import {
  getCachedMonth,
  loadOrthocalMonth,
  prefetchAdjacentMonths,
} from '../lib/liturgical/orthocalMonthCache';
import {
  feastRankForLiturgicalDay,
  shouldShowCalendarTypikon,
} from '../lib/liturgical/calendarTypikon';
import { toDayIso } from '../lib/calendar/localDate';

export function useOrthocalMonth(visibleMonth: Date, liturgicalCalendar: PrimaryCalendar) {
  const monthKey = `${visibleMonth.getFullYear()}-${visibleMonth.getMonth()}`;
  const cachedInitially = getCachedMonth(liturgicalCalendar, visibleMonth);
  const [dayByIso, setDayByIso] = useState<Record<string, CalendarDayInfo>>(cachedInitially ?? {});
  const [loading, setLoading] = useState(!cachedInitially);

  useEffect(() => {
    let cancelled = false;
    const cached = getCachedMonth(liturgicalCalendar, visibleMonth);

    if (cached) {
      setDayByIso(cached);
      setLoading(false);
    } else {
      setLoading(true);
      setDayByIso({});
    }

    loadOrthocalMonth(liturgicalCalendar, visibleMonth).then((next) => {
      if (!cancelled) {
        setDayByIso(next);
        setLoading(false);
      }
    });

    prefetchAdjacentMonths(liturgicalCalendar, visibleMonth);

    return () => {
      cancelled = true;
    };
  }, [liturgicalCalendar, monthKey, visibleMonth]);

  const dayInfoForDate = useMemo(
    () =>
      (date: Date): CalendarDayInfo => {
        const iso = toDayIso(date);
        const cached = dayByIso[iso];
        if (cached) return cached;
        const appearance = getLiturgicalAppearanceForLocalDate(date, liturgicalCalendar);
        return buildCalendarDayInfo(null, appearance.key, appearance.label, null);
      },
    [dayByIso, liturgicalCalendar],
  );

  const feastRankForDate = useMemo(
    () => (date: Date) => dayInfoForDate(date).feastRank,
    [dayInfoForDate],
  );

  const showTypikonForDate = useMemo(
    () => (date: Date) => {
      const rank = feastRankForDate(date);
      return rank ? shouldShowCalendarTypikon(rank.glyph) : false;
    },
    [feastRankForDate],
  );

  return { dayInfoForDate, feastRankForDate, showTypikonForDate, loading };
}
