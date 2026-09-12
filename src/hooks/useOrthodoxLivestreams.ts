import { useCallback, useEffect, useState } from 'react';

import {
  fetchOrthodoxLivestreams,
  type OrthodoxLivestream,
} from '../lib/livestreams/orthodoxLivestreams';

export type OrthodoxLivestreamsState =
  | { status: 'loading'; streams: readonly OrthodoxLivestream[] }
  | { status: 'ready'; streams: readonly OrthodoxLivestream[] }
  | { status: 'offline'; streams: readonly OrthodoxLivestream[]; error: string };

export function useOrthodoxLivestreams(): OrthodoxLivestreamsState & { reload: () => void } {
  const [state, setState] = useState<OrthodoxLivestreamsState>({
    status: 'loading',
    streams: [],
  });

  useEffect(() => {
    let cancelled = false;
    void fetchOrthodoxLivestreams({ force: false })
      .then((streams) => {
        if (!cancelled) setState({ status: 'ready', streams });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : 'Network error';
        setState({ status: 'offline', streams: [], error: message });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const reload = useCallback(() => {
    setState((prev) => ({ status: 'loading', streams: prev.streams }));
    void fetchOrthodoxLivestreams({ force: true })
      .then((streams) => {
        setState({ status: 'ready', streams });
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Network error';
        setState({ status: 'offline', streams: [], error: message });
      });
  }, []);

  return { ...state, reload };
}