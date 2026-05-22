import { ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';

import { navigationThemeDark, navigationThemeLight } from '../theme/navigationThemes';
import { useResolvedColorScheme } from '../theme/useResolvedColorScheme';

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useResolvedColorScheme();
  const navTheme = scheme === 'dark' ? navigationThemeDark : navigationThemeLight;

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      {children}
    </ThemeProvider>
  );
}
