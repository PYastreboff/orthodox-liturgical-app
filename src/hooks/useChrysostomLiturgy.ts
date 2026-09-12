import { useCallback, useEffect, useState } from 'react';

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

  useEffect(() => {
    if (getCachedChrysostomLiturgy()) return;
    let cancelled = false;
    void fetchChrysostomLiturgy({ force: false })
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
    void fetchChrysostomLiturgy({ force: true })
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