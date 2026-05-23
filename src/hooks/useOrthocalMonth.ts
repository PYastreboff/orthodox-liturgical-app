import { useEffect, useMemo, useState } from 'react';

import { fetchOrthocalDay } from '../lib/api/orthocal';
import type { PrimaryCalendar } from '../lib/calendar/dateDisplay';
import { civilPlainDateFromLocal, orthocalQueryDate } from '../lib/calendar/liturgicalCalendar';
import { toDayIso } from '../lib/calendar/localDate';
import { getLiturgicalAppearanceForLocalDate } from '../lib/calendar/dayAppearance';
import {
  buildCalendarDayInfo,
  type CalendarDayInfo,
} from '../lib/liturgical/calendarDayInfo';
import {
  feastRankForLiturgicalDay,
  shouldShowCalendarTypikon,
} from '../lib/liturgical/calendarTypikon';
import { getFeastRankDisplay } from '../lib/liturgical/typikonSymbols';

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

export function useOrthocalMonth(visibleMonth: Date, liturgicalCalendar: PrimaryCalendar) {
  const monthKey = `${visibleMonth.getFullYear()}-${visibleMonth.getMonth()}`;
  const [dayByIso, setDayByIso] = useState<Record<string, CalendarDayInfo>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const days = daysInMonth(visibleMonth);
    setLoading(true);
    setDayByIso({});

    async function load() {
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

      if (!cancelled) {
        const next: Record<string, CalendarDayInfo> = {};
        for (const [iso, info] of entries) {
          next[iso] = info;
        }
        setDayByIso(next);
        setLoading(false);
      }
    }

    load();
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
