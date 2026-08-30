import { useCallback, useEffect, useState } from 'react';

import type { VespersSection } from '../lib/liturgy/vespersLiturgy';
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

  const load = useCallback((force = false) => {
    if (!force && getCachedVespersLiturgy()) {
      setState({ status: 'ready', sections: getCachedVespersLiturgy()! });
      return;
    }
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

  useEffect(() => {
    load(false);
  }, [load]);

  return { ...state, reload: () => load(true) };
}
