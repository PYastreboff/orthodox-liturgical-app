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

  const load = useCallback((force = false) => {
    if (!force && getCachedBasilLiturgy()) {
      setState({ status: 'ready', sections: getCachedBasilLiturgy()! });
      return;
    }
    setState((prev) => ({ status: 'loading', sections: prev.sections }));
    void fetchBasilLiturgy({ force })
      .then((sections) => {
        setState({ status: 'ready', sections });
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Network error';
        setState({ status: 'offline', sections: [], error: message });
      });
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  return { ...state, reload: () => load(true) };
}
