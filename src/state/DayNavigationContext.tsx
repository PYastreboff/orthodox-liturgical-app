import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { fromDayIso, startOfLocalDay, toDayIso } from '../lib/calendar/localDate';

type DayNavigationContextValue = {
  /** Civil date shared by Today, Commemorations, and calendar navigation. */
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  /** ISO date (YYYY-MM-DD) requested from the calendar, if any. */
  pendingDayIso: string | null;
  requestOpenDay: (date: Date) => void;
  consumePendingDay: () => Date | null;
};

const DayNavigationContext = createContext<DayNavigationContextValue | null>(null);

export function DayNavigationProvider({ children }: { children: ReactNode }) {
  const [selectedDate, setSelectedDateState] = useState(() => startOfLocalDay(new Date()));
  const [pendingDayIso, setPendingDayIso] = useState<string | null>(null);
  const pendingRef = useRef<string | null>(null);

  const setSelectedDate = useCallback((date: Date) => {
    setSelectedDateState(startOfLocalDay(date));
  }, []);

  const requestOpenDay = useCallback(
    (date: Date) => {
      const day = startOfLocalDay(date);
      setSelectedDateState(day);
      const iso = toDayIso(day);
      pendingRef.current = iso;
      setPendingDayIso(iso);
    },
    [],
  );

  const consumePendingDay = useCallback(() => {
    const iso = pendingRef.current;
    pendingRef.current = null;
    setPendingDayIso(null);
    if (!iso) return null;
    const day = fromDayIso(iso);
    if (!day) return null;
    setSelectedDateState(day);
    return day;
  }, []);

  const value = useMemo(
    () => ({
      selectedDate,
      setSelectedDate,
      pendingDayIso,
      requestOpenDay,
      consumePendingDay,
    }),
    [consumePendingDay, pendingDayIso, requestOpenDay, selectedDate, setSelectedDate],
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
