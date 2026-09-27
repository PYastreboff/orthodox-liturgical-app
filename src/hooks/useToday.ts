import { useSyncExternalStore } from 'react';
import { AppState, Platform } from 'react-native';

import { startOfLocalDay } from '../lib/calendar/localDate';

let today = startOfLocalDay(new Date());
const listeners = new Set<() => void>();
let midnightTimer: ReturnType<typeof setTimeout> | null = null;
let stopWatching: (() => void) | null = null;

function refresh(): void {
  const next = startOfLocalDay(new Date());
  if (next.getTime() !== today.getTime()) {
    today = next;
    for (const listener of listeners) listener();
  }
  scheduleMidnight();
}

function scheduleMidnight(): void {
  if (midnightTimer) clearTimeout(midnightTimer);
  const now = new Date();
  const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  // Timers are paused in the background, so resume/visibility events also call refresh().
  midnightTimer = setTimeout(refresh, nextMidnight.getTime() - now.getTime() + 1000);
}

function startWatching(): () => void {
  scheduleMidnight();
  const appState = AppState.addEventListener('change', (status) => {
    if (status === 'active') refresh();
  });
  const onVisible = () => {
    if (document.visibilityState === 'visible') refresh();
  };
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', onVisible);
  }
  return () => {
    appState.remove();
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', onVisible);
    }
    if (midnightTimer) clearTimeout(midnightTimer);
    midnightTimer = null;
  };
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (!stopWatching) {
    refresh();
    stopWatching = startWatching();
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && stopWatching) {
      stopWatching();
      stopWatching = null;
    }
  };
}

const getSnapshot = () => today;

/**
 * Local midnight of the current day. Stable identity within a day, and updates when
 * the date rolls over — at midnight or when the app returns from the background.
 */
export function useToday(): Date {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Subscribe outside React (e.g. to move a selection that was pinned to "today"). */
export function onTodayChange(listener: (previous: Date, next: Date) => void): () => void {
  let previous = today;
  return subscribe(() => {
    listener(previous, today);
    previous = today;
  });
}
