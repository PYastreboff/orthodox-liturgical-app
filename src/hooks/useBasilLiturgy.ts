import { useCallback, useEffect, useState } from 'react';

import {
  fetchBasilLiturgy,
  getCachedBasilLiturgy,
  type BasilLiturgyState,
} from '../lib/liturgy/basilLiturgyRemote';

export function useBasilLiturgy(): BasilLiturgyState & { reload: () => void } {
  const cached = getCachedBasilLiturgy();
  const [state, setState] = useState<BasilLiturgyState>(() =>
    cached
      ? { status: 'ready', sections: cached }
      : { status: 'loading', sections: [] },
  );

  useEffect(() => {
    if (getCachedBasilLiturgy()) return;
    let cancelled = false;
    void fetchBasilLiturgy({ force: false })
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
    void fetchBasilLiturgy({ force: true })
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