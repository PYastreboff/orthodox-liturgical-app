import { useEffect, useState } from 'react';

import { fetchOrthocalDay, type OrthocalDay } from '../lib/api/orthocal';
import type { PlainDate } from '../lib/calendar/julianGregorian';

type State = {
  julianDay: OrthocalDay | null;
  gregorianDay: OrthocalDay | null;
  loading: boolean;
  error: string | null;
};

export function useOrthocalDay(julian: PlainDate, gregorianCivil: PlainDate) {
  const [state, setState] = useState<State>({
    julianDay: null,
    gregorianDay: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const [julianDay, gregorianDay] = await Promise.all([
          fetchOrthocalDay('julian', julian),
          fetchOrthocalDay('gregorian', gregorianCivil),
        ]);
        if (!cancelled) {
          setState({ julianDay, gregorianDay, loading: false, error: null });
        }
      } catch (e) {
        if (!cancelled) {
          setState({
            julianDay: null,
            gregorianDay: null,
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
  }, [julian.year, julian.month, julian.day, gregorianCivil.year, gregorianCivil.month, gregorianCivil.day]);

  return state;
}
