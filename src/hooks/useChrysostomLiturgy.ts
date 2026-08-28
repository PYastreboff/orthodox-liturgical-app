import { useCallback, useEffect, useState } from 'react';

import type { ChrysostomSection } from '../lib/liturgy/chrysostomLiturgy';
import {
  fetchChrysostomLiturgy,
  getCachedChrysostomLiturgy,
  type ChrysostomLiturgyState,
} from '../lib/liturgy/chrysostomLiturgyRemote';

export function useChrysostomLiturgy(): ChrysostomLiturgyState & { reload: () => void } {
  const cached = getCachedChrysostomLiturgy();
  const [state, setState] = useState<ChrysostomLiturgyState>(() =>
    cached
      ? { status: 'ready', sections: cached }
      : { status: 'loading', sections: [] },
  );

  const load = useCallback((force = false) => {
    if (!force && getCachedChrysostomLiturgy()) {
      setState({ status: 'ready', sections: getCachedChrysostomLiturgy()! });
      return;
    }
    setState((prev) => ({ status: 'loading', sections: prev.sections }));
    void fetchChrysostomLiturgy({ force })
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
