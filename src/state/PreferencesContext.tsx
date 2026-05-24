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
import type { UiLanguage } from '../i18n/types';
import type { FontScalePreference } from '../theme/fontScale';

export type TextLanguage = 'en' | 'chu' | 'both';
export type { UiLanguage };
export type ColorSchemePreference = 'system' | 'light' | 'dark';
export type { PrimaryCalendar };

type StoredPreferences = {
  showGregorianAlongside?: boolean;
  showAlternateCalendar?: boolean;
  primaryCalendar?: PrimaryCalendar;
  defaultTextLang?: TextLanguage;
  colorSchemePreference?: ColorSchemePreference;
  showVestmentGradient?: boolean;
  uiLanguage?: UiLanguage;
  fontScale?: FontScalePreference;
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
};

const STORAGE_KEY = '@orthodaily/preferences/v1';

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [showAlternateCalendar, setShowAlternateCalendarState] = useState(false);
  const [primaryCalendar, setPrimaryCalendarState] = useState<PrimaryCalendar>('julian');
  const [defaultTextLang, setDefaultTextLangState] = useState<TextLanguage>('en');
  const [colorSchemePreference, setColorSchemePreferenceState] =
    useState<ColorSchemePreference>('dark');
  const [showVestmentGradient, setShowVestmentGradientState] = useState(false);
  const [uiLanguage, setUiLanguageState] = useState<UiLanguage>('en');
  const [fontScale, setFontScaleState] = useState<FontScalePreference>('default');
  const [preferencesReady, setPreferencesReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && !cancelled) {
          const parsed = JSON.parse(raw) as StoredPreferences;
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
        }
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

  const persist = useCallback(
    async (next: StoredPreferences) => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const prev = raw ? (JSON.parse(raw) as StoredPreferences) : {};
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prev, ...next }));
      } catch {
        // Ignore write failures.
      }
    },
    [],
  );

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

  const value = useMemo(
    () => ({
      showAlternateCalendar,
      primaryCalendar,
      defaultTextLang,
      colorSchemePreference,
      showVestmentGradient,
      uiLanguage,
      fontScale,
      preferencesReady,
      setShowAlternateCalendar,
      setPrimaryCalendar,
      setDefaultTextLang,
      setColorSchemePreference,
      setShowVestmentGradient,
      setUiLanguage,
      setFontScale,
    }),
    [
      colorSchemePreference,
      defaultTextLang,
      fontScale,
      preferencesReady,
      primaryCalendar,
      setColorSchemePreference,
      setDefaultTextLang,
      setFontScale,
      setPrimaryCalendar,
      setShowAlternateCalendar,
      setShowVestmentGradient,
      setUiLanguage,
      showAlternateCalendar,
      showVestmentGradient,
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
