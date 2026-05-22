import { useEffect, useMemo, useState } from 'react';

import { fetchOrthocalDay } from '../lib/api/orthocal';
import { dateToJulianPlainDate } from '../lib/calendar/julianGregorian';
import { toDayIso } from '../lib/calendar/localDate';
import {
  feastRankFallbackFromAppearance,
  shouldShowCalendarTypikon,
} from '../lib/liturgical/calendarTypikon';
import { getLiturgicalAppearanceForLocalDate } from '../lib/calendar/dayAppearance';
import { getFeastRankDisplay, type FeastRankDisplay } from '../lib/liturgical/typikonSymbols';

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

export function useOrthocalMonth(visibleMonth: Date) {
  const monthKey = `${visibleMonth.getFullYear()}-${visibleMonth.getMonth()}`;
  const [apiRanks, setApiRanks] = useState<Record<string, FeastRankDisplay>>({});

  useEffect(() => {
    let cancelled = false;
    const days = daysInMonth(visibleMonth);

    async function load() {
      const entries = await Promise.all(
        days.map(async (date) => {
          const iso = toDayIso(date);
          const julian = dateToJulianPlainDate(date);
          try {
            const day = await fetchOrthocalDay('julian', julian);
            const rank = getFeastRankDisplay(day.feast_level, day.feast_level_description);
            return [iso, rank] as const;
          } catch {
            return [iso, null] as const;
          }
        }),
      );

      if (!cancelled) {
        const next: Record<string, FeastRankDisplay> = {};
        for (const [iso, rank] of entries) {
          if (rank) next[iso] = rank;
        }
        setApiRanks(next);
      }
    }

    setApiRanks({});
    load();
    return () => {
      cancelled = true;
    };
  }, [monthKey, visibleMonth]);

  const feastRankForDate = useMemo(
    () => (date: Date) => {
      const iso = toDayIso(date);
      const fromApi = apiRanks[iso];
      if (fromApi) return fromApi;
      const appearance = getLiturgicalAppearanceForLocalDate(date);
      return feastRankFallbackFromAppearance(appearance.key);
    },
    [apiRanks],
  );

  const showTypikonForDate = useMemo(
    () => (date: Date) => {
      const rank = feastRankForDate(date);
      return rank ? shouldShowCalendarTypikon(rank.glyph) : false;
    },
    [feastRankForDate],
  );

  return { feastRankForDate, showTypikonForDate };
}
