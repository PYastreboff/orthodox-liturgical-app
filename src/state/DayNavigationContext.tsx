import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { fromDayIso, startOfLocalDay, toDayIso } from '../lib/calendar/localDate';
import {
  parseStoredSelectedDay,
  persistSelectedDay,
  readStoredPreferences,
} from './PreferencesContext';

type DayNavigationContextValue = {
  /** Civil date shared by Today, Commemorations, and calendar navigation. */
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  /** ISO date (YYYY-MM-DD) requested from the calendar, if any. */
  pendingDayIso: string | null;
  requestOpenDay: (date: Date) => void;
  consumePendingDay: () => Date | null;
  navigationReady: boolean;
};

const DayNavigationContext = createContext<DayNavigationContextValue | null>(null);

export function DayNavigationProvider({ children }: { children: ReactNode }) {
  const [selectedDate, setSelectedDateState] = useState(() => startOfLocalDay(new Date()));
  const [pendingDayIso, setPendingDayIso] = useState<string | null>(null);
  const [navigationReady, setNavigationReady] = useState(false);
  const pendingRef = useRef<string | null>(null);
  const hydratedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await readStoredPreferences();
      if (cancelled) return;
      const restored = parseStoredSelectedDay(stored.selectedDayIso);
      if (restored) {
        setSelectedDateState(restored);
      }
      hydratedRef.current = true;
      setNavigationReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setSelectedDate = useCallback((date: Date) => {
    const day = startOfLocalDay(date);
    setSelectedDateState(day);
    if (hydratedRef.current) {
      void persistSelectedDay(day);
    }
  }, []);

  const requestOpenDay = useCallback((date: Date) => {
    const day = startOfLocalDay(date);
    setSelectedDateState(day);
    const iso = toDayIso(day);
    pendingRef.current = iso;
    setPendingDayIso(iso);
    if (hydratedRef.current) {
      void persistSelectedDay(day);
    }
  }, []);

  const consumePendingDay = useCallback(() => {
    const iso = pendingRef.current;
    pendingRef.current = null;
    setPendingDayIso(null);
    if (!iso) return null;
    const day = fromDayIso(iso);
    if (!day) return null;
    const normalized = startOfLocalDay(day);
    setSelectedDateState(normalized);
    if (hydratedRef.current) {
      void persistSelectedDay(normalized);
    }
    return normalized;
  }, []);

  const value = useMemo(
    () => ({
      selectedDate,
      setSelectedDate,
      pendingDayIso,
      requestOpenDay,
      consumePendingDay,
      navigationReady,
    }),
    [
      consumePendingDay,
      navigationReady,
      pendingDayIso,
      requestOpenDay,
      selectedDate,
      setSelectedDate,
    ],
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
