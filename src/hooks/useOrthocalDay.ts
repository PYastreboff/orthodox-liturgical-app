import { useEffect, useState } from 'react';

import {
  fetchOrthocalDay,
  getCachedOrthocalDay,
  loadOrthocalDayFromPersistentCache,
  type OrthocalDay,
} from '../lib/api/orthocal';
import { prefetchOrthocalDayNeighbors } from '../lib/api/prefetchOrthocalDays';
import type { PrimaryCalendar } from '../lib/calendar/dateDisplay';
import {
  civilPlainDateFromLocal,
  orthocalQueryDate,
} from '../lib/calendar/liturgicalCalendar';

type State = {
  queryKey: string;
  liturgicalDay: OrthocalDay | null;
  /** True only when there is no cached day to show yet. */
  loading: boolean;
  /** Background refresh while cached content is visible. */
  refreshing: boolean;
  error: string | null;
};

function shellFor(
  queryKey: string,
  liturgicalDay: OrthocalDay | null | undefined,
): State {
  return {
    queryKey,
    liturgicalDay: liturgicalDay ?? null,
    loading: !liturgicalDay,
    refreshing: Boolean(liturgicalDay),
    error: null,
  };
}

export function useOrthocalDay(civilDate: Date, liturgicalCalendar: PrimaryCalendar) {
  const civil = civilPlainDateFromLocal(civilDate);
  const queryDate = orthocalQueryDate(civil);
  const queryKey = `${liturgicalCalendar}:${queryDate.year}-${queryDate.month}-${queryDate.day}`;

  const [state, setState] = useState<State>(() =>
    shellFor(queryKey, getCachedOrthocalDay(liturgicalCalendar, queryDate)),
  );

  /** Cached-day shell for the requested date — derived, so no query-key reset effect. */
  const current =
    state.queryKey === queryKey
      ? state
      : shellFor(queryKey, getCachedOrthocalDay(liturgicalCalendar, queryDate));

  useEffect(() => {
    let cancelled = false;
    const memHit = getCachedOrthocalDay(liturgicalCalendar, queryDate);

    async function load() {
      let hadCached = Boolean(memHit);

      if (!memHit) {
        const persisted = await loadOrthocalDayFromPersistentCache(liturgicalCalendar, queryDate);
        if (cancelled) return;
        if (persisted) {
          hadCached = true;
          setState({
            queryKey,
            liturgicalDay: persisted,
            loading: false,
            refreshing: true,
            error: null,
          });
        }
      }

      try {
        const liturgicalDay = await fetchOrthocalDay(liturgicalCalendar, queryDate, {
          refresh: hadCached,
        });
        if (!cancelled) {
          setState({
            queryKey,
            liturgicalDay,
            loading: false,
            refreshing: false,
            error: null,
          });
        }
      } catch (e) {
        if (!cancelled) {
          const message = e instanceof Error ? e.message : 'Could not load liturgical data';
          setState((prev) => ({
            queryKey,
            liturgicalDay: prev.liturgicalDay,
            loading: false,
            refreshing: false,
            error: prev.liturgicalDay ? null : message,
          }));
        }
      }

      prefetchOrthocalDayNeighbors(liturgicalCalendar, civilDate);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [queryKey, queryDate, liturgicalCalendar, civilDate]);

  return current;
}
