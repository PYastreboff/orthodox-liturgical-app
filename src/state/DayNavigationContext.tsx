import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { fromDayIso, toDayIso } from '../lib/calendar/localDate';

type DayNavigationContextValue = {
  /** ISO date (YYYY-MM-DD) requested from the calendar, if any. */
  pendingDayIso: string | null;
  requestOpenDay: (date: Date) => void;
  consumePendingDay: () => Date | null;
};

const DayNavigationContext = createContext<DayNavigationContextValue | null>(null);

export function DayNavigationProvider({ children }: { children: ReactNode }) {
  const [pendingDayIso, setPendingDayIso] = useState<string | null>(null);
  const pendingRef = useRef<string | null>(null);

  const requestOpenDay = useCallback((date: Date) => {
    const iso = toDayIso(date);
    pendingRef.current = iso;
    setPendingDayIso(iso);
  }, []);

  const consumePendingDay = useCallback(() => {
    const iso = pendingRef.current;
    pendingRef.current = null;
    setPendingDayIso(null);
    if (!iso) return null;
    return fromDayIso(iso);
  }, []);

  const value = useMemo(
    () => ({ pendingDayIso, requestOpenDay, consumePendingDay }),
    [consumePendingDay, pendingDayIso, requestOpenDay],
  );

  return (
    <DayNavigationContext.Provider value={value}>{children}</DayNavigationContext.Provider>
  );
}

export function useDayNavigation() {
  const ctx = useContext(DayNavigationContext);
  if (!ctx) {
    throw new Error('useDayNavigation must be used within DayNavigationProvider');
  }
  return ctx;
}
