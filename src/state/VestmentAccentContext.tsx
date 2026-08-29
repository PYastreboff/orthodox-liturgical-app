import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { useOrthocalDay } from '../hooks/useOrthocalDay';
import { useIsTodayHomeTab } from '../hooks/useIsTodayHomeTab';
import { getLiturgicalAppearanceForLocalDate } from '../lib/calendar/dayAppearance';
import {
  defaultVestmentAccent,
  staticAppAccent,
  vestmentAccentForAppearance,
  type VestmentAccent,
} from '../lib/liturgical/vestmentAccent';
import { useResolvedColorScheme } from '../theme/useResolvedColorScheme';
import { useDayNavigation } from './DayNavigationContext';
import { usePreferences } from './PreferencesContext';

const VestmentAccentContext = createContext<VestmentAccent | null>(null);

/** Liturgical vestment colour as the app-wide accent for the selected day. */
export function VestmentAccentProvider({ children }: { children: ReactNode }) {
  const isDark = useResolvedColorScheme() === 'dark';
  const { selectedDate } = useDayNavigation();
  const { primaryCalendar } = usePreferences();
  const { liturgicalDay } = useOrthocalDay(selectedDate, primaryCalendar);

  const appearance = useMemo(
    () => getLiturgicalAppearanceForLocalDate(selectedDate, primaryCalendar, liturgicalDay),
    [liturgicalDay, primaryCalendar, selectedDate],
  );

  const accent = useMemo(
    () => vestmentAccentForAppearance(appearance, isDark),
    [appearance, isDark],
  );

  return (
    <VestmentAccentContext.Provider value={accent}>{children}</VestmentAccentContext.Provider>
  );
}

/** Accent for the current screen — vestment on Today home, wine/gold elsewhere. */
export function useVestmentAccent(): VestmentAccent {
  const ctx = useContext(VestmentAccentContext);
  const isDark = useResolvedColorScheme() === 'dark';
  const onHomeTab = useIsTodayHomeTab();

  if (!onHomeTab) return staticAppAccent(isDark);
  return ctx ?? defaultVestmentAccent(isDark);
}

/** Liturgical vestment accent for Today home content (ignores active tab). */
export function useLiturgicalVestmentAccent(): VestmentAccent {
  const ctx = useContext(VestmentAccentContext);
  const isDark = useResolvedColorScheme() === 'dark';
  return ctx ?? defaultVestmentAccent(isDark);
}
