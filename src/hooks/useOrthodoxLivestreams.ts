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

  const load = useCallback((force = false) => {
    setState((prev) => ({ status: 'loading', streams: prev.streams }));
    void fetchOrthodoxLivestreams({ force })
      .then((streams) => {
        setState({ status: 'ready', streams });
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Network error';
        setState({ status: 'offline', streams: [], error: message });
      });
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  return { ...state, reload: () => load(true) };
}
