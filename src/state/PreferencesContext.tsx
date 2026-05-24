import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { PrimaryCalendar } from '../lib/calendar/dateDisplay';
import { fromDayIso, startOfLocalDay, toDayIso } from '../lib/calendar/localDate';
import type { UiLanguage } from '../i18n/types';
import type { ClergyRole } from '../types/liturgical';
import type { FontScalePreference } from '../theme/fontScale';
import {
  DEFAULT_TODAY_COLLAPSED,
  mergeTodayCollapsed,
  type TodayCollapsedState,
  type TodayCollapsibleKey,
} from './todayUiState';

export type TextLanguage = 'en' | 'chu' | 'both';
export type { UiLanguage };
export type ColorSchemePreference = 'system' | 'light' | 'dark';
export type { PrimaryCalendar };

const CLERGY_ROLES: ClergyRole[] = [
  'layperson',
  'reader',
  'altar_server',
  'deacon',
  'priest',
  'bishop',
];

function isClergyRole(value: unknown): value is ClergyRole {
  return typeof value === 'string' && CLERGY_ROLES.includes(value as ClergyRole);
}

type StoredPreferences = {
  showGregorianAlongside?: boolean;
  showAlternateCalendar?: boolean;
  primaryCalendar?: PrimaryCalendar;
  defaultTextLang?: TextLanguage;
  colorSchemePreference?: ColorSchemePreference;
  showVestmentGradient?: boolean;
  uiLanguage?: UiLanguage;
  fontScale?: FontScalePreference;
  servingRole?: ClergyRole;
  todayCollapsed?: Partial<TodayCollapsedState>;
  selectedDayIso?: string;
  /** Calendar grid month as `YYYY-MM`. */
  calendarMonth?: string;
};

type Preferences = {
  /** Show the non-primary calendar next to the primary one. */
  showAlternateCalendar: boolean;
  primaryCalendar: PrimaryCalendar;
  defaultTextLang: TextLanguage;
  colorSchemePreference: ColorSchemePreference;
  /** Subtle liturgical-colour gradient over the black Today background. */
  showVestmentGradient: boolean;
  uiLanguage: UiLanguage;
  /** Reading text size on Today (scripture, feasts, saints). */
  fontScale: FontScalePreference;
  servingRole: ClergyRole;
  todayCollapsed: TodayCollapsedState;
  preferencesReady: boolean;
};

type PreferencesContextValue = Preferences & {
  setShowAlternateCalendar: (value: boolean) => void;
  setPrimaryCalendar: (value: PrimaryCalendar) => void;
  setDefaultTextLang: (value: TextLanguage) => void;
  setColorSchemePreference: (value: ColorSchemePreference) => void;
  setShowVestmentGradient: (value: boolean) => void;
  setUiLanguage: (value: UiLanguage) => void;
  setFontScale: (value: FontScalePreference) => void;
  setServingRole: (value: ClergyRole) => void;
  setTodaySectionCollapsed: (key: TodayCollapsibleKey, collapsed: boolean) => void;
  toggleTodaySection: (key: TodayCollapsibleKey) => void;
};

export const PREFERENCES_STORAGE_KEY = '@orthodaily/preferences/v1';

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export async function readStoredPreferences(): Promise<StoredPreferences> {
  try {
    const raw = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredPreferences) : {};
  } catch {
    return {};
  }
}

export async function writeStoredPreferences(patch: StoredPreferences): Promise<void> {
  try {
    const prev = await readStoredPreferences();
    await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify({ ...prev, ...patch }));
  } catch {
    // Ignore write failures.
  }
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [showAlternateCalendar, setShowAlternateCalendarState] = useState(false);
  const [primaryCalendar, setPrimaryCalendarState] = useState<PrimaryCalendar>('julian');
  const [defaultTextLang, setDefaultTextLangState] = useState<TextLanguage>('en');
  const [colorSchemePreference, setColorSchemePreferenceState] =
    useState<ColorSchemePreference>('dark');
  const [showVestmentGradient, setShowVestmentGradientState] = useState(false);
  const [uiLanguage, setUiLanguageState] = useState<UiLanguage>('en');
  const [fontScale, setFontScaleState] = useState<FontScalePreference>('default');
  const [servingRole, setServingRoleState] = useState<ClergyRole>('layperson');
  const [todayCollapsed, setTodayCollapsedState] = useState<TodayCollapsedState>(
    DEFAULT_TODAY_COLLAPSED,
  );
  const [preferencesReady, setPreferencesReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const parsed = await readStoredPreferences();
        if (cancelled) return;

        if (typeof parsed.showAlternateCalendar === 'boolean') {
          setShowAlternateCalendarState(parsed.showAlternateCalendar);
        } else if (typeof parsed.showGregorianAlongside === 'boolean') {
          setShowAlternateCalendarState(parsed.showGregorianAlongside);
        }
        if (parsed.primaryCalendar === 'julian' || parsed.primaryCalendar === 'gregorian') {
          setPrimaryCalendarState(parsed.primaryCalendar);
        }
        if (
          parsed.defaultTextLang === 'en' ||
          parsed.defaultTextLang === 'chu' ||
          parsed.defaultTextLang === 'both'
        ) {
          setDefaultTextLangState(parsed.defaultTextLang);
        }
        if (
          parsed.colorSchemePreference === 'system' ||
          parsed.colorSchemePreference === 'light' ||
          parsed.colorSchemePreference === 'dark'
        ) {
          setColorSchemePreferenceState(parsed.colorSchemePreference);
        }
        if (typeof parsed.showVestmentGradient === 'boolean') {
          setShowVestmentGradientState(parsed.showVestmentGradient);
        }
        if (parsed.uiLanguage === 'en' || parsed.uiLanguage === 'ru') {
          setUiLanguageState(parsed.uiLanguage);
        }
        if (
          parsed.fontScale === 'small' ||
          parsed.fontScale === 'default' ||
          parsed.fontScale === 'large'
        ) {
          setFontScaleState(parsed.fontScale);
        } else if (parsed.fontScale === 'extraLarge') {
          setFontScaleState('large');
        }
        if (isClergyRole(parsed.servingRole)) {
          setServingRoleState(parsed.servingRole);
        }
        setTodayCollapsedState(mergeTodayCollapsed(parsed.todayCollapsed));
      } catch {
        // Keep defaults if storage is unavailable.
      } finally {
        if (!cancelled) setPreferencesReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (next: StoredPreferences) => {
    await writeStoredPreferences(next);
  }, []);

  const setShowAlternateCalendar = useCallback(
    (value: boolean) => {
      setShowAlternateCalendarState(value);
      void persist({ showAlternateCalendar: value });
    },
    [persist],
  );

  const setPrimaryCalendar = useCallback(
    (value: PrimaryCalendar) => {
      setPrimaryCalendarState(value);
      void persist({ primaryCalendar: value });
    },
    [persist],
  );

  const setDefaultTextLang = useCallback(
    (value: TextLanguage) => {
      setDefaultTextLangState(value);
      void persist({ defaultTextLang: value });
    },
    [persist],
  );

  const setColorSchemePreference = useCallback(
    (value: ColorSchemePreference) => {
      setColorSchemePreferenceState(value);
      void persist({ colorSchemePreference: value });
    },
    [persist],
  );

  const setShowVestmentGradient = useCallback(
    (value: boolean) => {
      setShowVestmentGradientState(value);
      void persist({ showVestmentGradient: value });
    },
    [persist],
  );

  const setUiLanguage = useCallback(
    (value: UiLanguage) => {
      setUiLanguageState(value);
      void persist({ uiLanguage: value });
    },
    [persist],
  );

  const setFontScale = useCallback(
    (value: FontScalePreference) => {
      setFontScaleState(value);
      void persist({ fontScale: value });
    },
    [persist],
  );

  const setServingRole = useCallback(
    (value: ClergyRole) => {
      setServingRoleState(value);
      void persist({ servingRole: value });
    },
    [persist],
  );

  const setTodaySectionCollapsed = useCallback(
    (key: TodayCollapsibleKey, collapsed: boolean) => {
      setTodayCollapsedState((prev) => {
        const next = { ...prev, [key]: collapsed };
        void persist({ todayCollapsed: next });
        return next;
      });
    },
    [persist],
  );

  const toggleTodaySection = useCallback(
    (key: TodayCollapsibleKey) => {
      setTodayCollapsedState((prev) => {
        const next = { ...prev, [key]: !prev[key] };
        void persist({ todayCollapsed: next });
        return next;
      });
    },
    [persist],
  );

  const value = useMemo(
    () => ({
      showAlternateCalendar,
      primaryCalendar,
      defaultTextLang,
      colorSchemePreference,
      showVestmentGradient,
      uiLanguage,
      fontScale,
      servingRole,
      todayCollapsed,
      preferencesReady,
      setShowAlternateCalendar,
      setPrimaryCalendar,
      setDefaultTextLang,
      setColorSchemePreference,
      setShowVestmentGradient,
      setUiLanguage,
      setFontScale,
      setServingRole,
      setTodaySectionCollapsed,
      toggleTodaySection,
    }),
    [
      colorSchemePreference,
      defaultTextLang,
      fontScale,
      preferencesReady,
      primaryCalendar,
      servingRole,
      setColorSchemePreference,
      setDefaultTextLang,
      setFontScale,
      setPrimaryCalendar,
      setServingRole,
      setShowAlternateCalendar,
      setShowVestmentGradient,
      setTodaySectionCollapsed,
      setUiLanguage,
      showAlternateCalendar,
      showVestmentGradient,
      todayCollapsed,
      toggleTodaySection,
      uiLanguage,
    ],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return ctx;
}

/** Persisted civil day for Today / calendar navigation. */
export function parseStoredSelectedDay(iso: string | undefined): Date | null {
  if (!iso) return null;
  const day = fromDayIso(iso);
  return day ? startOfLocalDay(day) : null;
}

export function formatCalendarMonth(date: Date): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  return `${y}-${String(m).padStart(2, '0')}`;
}

export function parseStoredCalendarMonth(value: string | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return null;
  const [y, m] = value.split('-').map(Number);
  if (!y || m < 1 || m > 12) return null;
  return new Date(y, m - 1, 1);
}

export async function persistSelectedDay(date: Date): Promise<void> {
  await writeStoredPreferences({ selectedDayIso: toDayIso(startOfLocalDay(date)) });
}

export async function persistCalendarMonth(date: Date): Promise<void> {
  await writeStoredPreferences({ calendarMonth: formatCalendarMonth(date) });
}
