import { useColorScheme } from 'react-native';

import { usePreferences } from '../state/PreferencesContext';

/** Effective light/dark mode after applying user preference. */
export function useResolvedColorScheme(): 'light' | 'dark' {
  const { colorSchemePreference } = usePreferences();
  const system = useColorScheme();

  if (colorSchemePreference === 'system') {
    return system === 'dark' ? 'dark' : 'light';
  }

  return colorSchemePreference;
}
