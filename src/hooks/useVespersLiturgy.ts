import { useCallback, useEffect, useState } from 'react';

import {
  fetchVespersLiturgy,
  getCachedVespersLiturgy,
  type VespersLiturgyState,
} from '../lib/liturgy/vespersLiturgyRemote';

export function useVespersLiturgy(): VespersLiturgyState & { reload: () => void } {
  const cached = getCachedVespersLiturgy();
  const [state, setState] = useState<VespersLiturgyState>(() =>
    cached
      ? { status: 'ready', sections: cached }
      : { status: 'loading', sections: [] },
  );

  useEffect(() => {
    if (getCachedVespersLiturgy()) return;
    let cancelled = false;
    void fetchVespersLiturgy()
      .then((sections) => {
        if (!cancelled) setState({ status: 'ready', sections });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : 'Network error';
        setState({ status: 'offline', sections: [], error: message });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const reload = useCallback(() => {
    setState((prev) => ({ status: 'loading', sections: prev.sections }));
    void fetchVespersLiturgy()
      .then((sections) => {
        setState({ status: 'ready', sections });
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Network error';
        setState({ status: 'offline', sections: [], error: message });
      });
  }, []);

  return { ...state, reload };
}