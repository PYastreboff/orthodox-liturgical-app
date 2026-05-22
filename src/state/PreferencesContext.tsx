import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type TextLanguage = 'en' | 'chu';

type Preferences = {
  showGregorianAlongside: boolean;
  defaultTextLang: TextLanguage;
};

type PreferencesContextValue = Preferences & {
  setShowGregorianAlongside: (value: boolean) => void;
  setDefaultTextLang: (value: TextLanguage) => void;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [showGregorianAlongside, setShowGregorianAlongsideState] = useState(true);
  const [defaultTextLang, setDefaultTextLangState] = useState<TextLanguage>('en');

  const setShowGregorianAlongside = useCallback((value: boolean) => {
    setShowGregorianAlongsideState(value);
  }, []);

  const setDefaultTextLang = useCallback((value: TextLanguage) => {
    setDefaultTextLangState(value);
  }, []);

  const value = useMemo(
    () => ({
      showGregorianAlongside,
      defaultTextLang,
      setShowGregorianAlongside,
      setDefaultTextLang,
    }),
    [defaultTextLang, setDefaultTextLang, setShowGregorianAlongside, showGregorianAlongside],
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
