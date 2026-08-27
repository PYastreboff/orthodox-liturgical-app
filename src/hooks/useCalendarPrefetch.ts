import { useEffect } from 'react';

import { hydrateOrthocalFromPersistentCache } from '../lib/api/orthocal';
import { prefetchOrthocalTodayWindow } from '../lib/api/prefetchOrthocalDays';
import { prefetchCalendarMonth } from '../lib/liturgical/orthocalMonthCache';
import type { PrimaryCalendar } from '../lib/calendar/dateDisplay';

/** Warm disk cache, current month, and today ±1 as soon as the app opens. */
export function useCalendarPrefetch(calendar: PrimaryCalendar) {
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await hydrateOrthocalFromPersistentCache();
      if (cancelled) return;
      prefetchCalendarMonth(calendar);
      prefetchOrthocalTodayWindow(calendar);
    })();
    return () => {
      cancelled = true;
    };
  }, [calendar]);
}
