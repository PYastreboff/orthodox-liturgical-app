import * as Linking from 'expo-linking';
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
import { Platform } from 'react-native';

import { fromDayIso, startOfLocalDay, toDayIso } from '../lib/calendar/localDate';
import {
  parseDayIsoFromQueryParam,
  readDayIsoFromWebLocation,
  syncDayQueryParamOnWeb,
} from '../lib/share/dayShareLink';
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

  const applyDayFromIso = useCallback((iso: string) => {
    const day = fromDayIso(iso);
    if (!day) return;
    const normalized = startOfLocalDay(day);
    setSelectedDateState(normalized);
    if (hydratedRef.current) {
      void persistSelectedDay(normalized);
    }
    syncDayQueryParamOnWeb(toDayIso(normalized));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await readStoredPreferences();
      if (cancelled) return;
      const urlDayIso = readDayIsoFromWebLocation();
      const restored = parseStoredSelectedDay(stored.selectedDayIso);
      let initialDay = restored ?? startOfLocalDay(new Date());
      if (urlDayIso) {
        const fromUrl = fromDayIso(urlDayIso);
        if (fromUrl) initialDay = startOfLocalDay(fromUrl);
      }
      setSelectedDateState(initialDay);
      syncDayQueryParamOnWeb(toDayIso(initialDay));
      hydratedRef.current = true;
      void persistSelectedDay(initialDay);
      setNavigationReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [applyDayFromIso]);

  useEffect(() => {
    const handleUrl = (incoming: string) => {
      const parsed = Linking.parse(incoming);
      const iso = parseDayIsoFromQueryParam(parsed.queryParams?.date ?? null);
      if (iso) applyDayFromIso(iso);
    };

    void Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });

    const subscription = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => subscription.remove();
  }, [applyDayFromIso]);

  const setSelectedDate = useCallback((date: Date) => {
    const day = startOfLocalDay(date);
    setSelectedDateState(day);
    syncDayQueryParamOnWeb(toDayIso(day));
    if (hydratedRef.current) {
      void persistSelectedDay(day);
    }
  }, []);

  const requestOpenDay = useCallback((date: Date) => {
    const day = startOfLocalDay(date);
    setSelectedDateState(day);
    const iso = toDayIso(day);
    syncDayQueryParamOnWeb(iso);
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
