import { useEffect, useState } from 'react';

import { fetchOrthocalDay, type OrthocalDay } from '../lib/api/orthocal';
import type { PrimaryCalendar } from '../lib/calendar/dateDisplay';
import {
  civilPlainDateFromLocal,
  orthocalQueryDate,
} from '../lib/calendar/liturgicalCalendar';

type State = {
  liturgicalDay: OrthocalDay | null;
  loading: boolean;
  error: string | null;
};

export function useOrthocalDay(civilDate: Date, liturgicalCalendar: PrimaryCalendar) {
  const [state, setState] = useState<State>({
    liturgicalDay: null,
    loading: true,
    error: null,
  });

  const civil = civilPlainDateFromLocal(civilDate);
  const queryDate = orthocalQueryDate(civil);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const liturgicalDay = await fetchOrthocalDay(liturgicalCalendar, queryDate);
        if (!cancelled) {
          setState({ liturgicalDay, loading: false, error: null });
        }
      } catch (e) {
        if (!cancelled) {
          setState({
            liturgicalDay: null,
            loading: false,
            error: e instanceof Error ? e.message : 'Could not load liturgical data',
          });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [queryDate.year, queryDate.month, queryDate.day, liturgicalCalendar]);

  return state;
}
