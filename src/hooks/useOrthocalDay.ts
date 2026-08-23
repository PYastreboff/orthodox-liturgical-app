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
  liturgicalDay: OrthocalDay | null;
  /** True only when there is no cached day to show yet. */
  loading: boolean;
  /** Background refresh while cached content is visible. */
  refreshing: boolean;
  error: string | null;
};

export function useOrthocalDay(civilDate: Date, liturgicalCalendar: PrimaryCalendar) {
  const civil = civilPlainDateFromLocal(civilDate);
  const queryDate = orthocalQueryDate(civil);
  const queryKey = `${liturgicalCalendar}:${queryDate.year}-${queryDate.month}-${queryDate.day}`;

  const [state, setState] = useState<State>(() => {
    const memHit = getCachedOrthocalDay(liturgicalCalendar, queryDate);
    return {
      liturgicalDay: memHit ?? null,
      loading: !memHit,
      refreshing: false,
      error: null,
    };
  });

  useEffect(() => {
    let cancelled = false;

    const memHit = getCachedOrthocalDay(liturgicalCalendar, queryDate);
    if (memHit) {
      setState({
        liturgicalDay: memHit,
        loading: false,
        refreshing: true,
        error: null,
      });
    } else {
      setState({
        liturgicalDay: null,
        loading: true,
        refreshing: false,
        error: null,
      });
    }

    async function load() {
      let hadCached = Boolean(memHit);

      if (!memHit) {
        const persisted = await loadOrthocalDayFromPersistentCache(liturgicalCalendar, queryDate);
        if (cancelled) return;
        if (persisted) {
          hadCached = true;
          setState({
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
  }, [queryKey, liturgicalCalendar, civilDate]);

  return state;
}
