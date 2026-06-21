import { useEffect } from 'react';

import { prefetchCalendarMonth } from '../lib/liturgical/orthocalMonthCache';
import type { PrimaryCalendar } from '../lib/calendar/dateDisplay';

/** Warm the current month (and neighbors) in the background as soon as the app opens. */
export function useCalendarPrefetch(calendar: PrimaryCalendar) {
  useEffect(() => {
    prefetchCalendarMonth(calendar);
  }, [calendar]);
}
