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
import { fromDayIso, startOfLocalDay, toDayIso } from '../lib/calendar/localDate';
import {
  parseDayIsoFromQueryParam,
  readDayIsoFromWebLocation,
  syncDayQueryParamOnWeb,
} from '../lib/share/dayShareLink';

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

  const applyDayFromIso = useCallback((iso: string) => {
    const day = fromDayIso(iso);
    if (!day) return;
    const normalized = startOfLocalDay(day);
    setSelectedDateState(normalized);
    syncDayQueryParamOnWeb(toDayIso(normalized));
  }, []);

  useEffect(() => {
    const urlDayIso = readDayIsoFromWebLocation();
    let initialDay = startOfLocalDay(new Date());
    if (urlDayIso) {
      const fromUrl = fromDayIso(urlDayIso);
      if (fromUrl) initialDay = startOfLocalDay(fromUrl);
    }
    setSelectedDateState(initialDay);
    syncDayQueryParamOnWeb(toDayIso(initialDay));
    setNavigationReady(true);
  }, []);

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
  }, []);

  const requestOpenDay = useCallback((date: Date) => {
    const day = startOfLocalDay(date);
    setSelectedDateState(day);
    const iso = toDayIso(day);
    syncDayQueryParamOnWeb(iso);
    pendingRef.current = iso;
    setPendingDayIso(iso);
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
