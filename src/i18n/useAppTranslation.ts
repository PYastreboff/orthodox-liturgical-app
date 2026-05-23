import { useCallback } from 'react';

import { usePreferences } from '../state/PreferencesContext';
import { translate } from './translate';

export function useAppTranslation() {
  const { uiLanguage } = usePreferences();

  const t = useCallback(
    (path: string, params?: Record<string, string | number>) => translate(uiLanguage, path, params),
    [uiLanguage],
  );

  return { t, lang: uiLanguage };
}
