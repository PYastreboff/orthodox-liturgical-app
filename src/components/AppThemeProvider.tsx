import { ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect, type ReactNode } from 'react';

import { navigationThemeDark, navigationThemeLight } from '../theme/navigationThemes';
import { syncWebDocumentTheme } from '../theme/syncWebDocumentTheme';
import { useResolvedColorScheme } from '../theme/useResolvedColorScheme';
import { WebShell } from './WebShell';

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useResolvedColorScheme();
  const navTheme = scheme === 'dark' ? navigationThemeDark : navigationThemeLight;
  const isDark = scheme === 'dark';

  useEffect(() => {
    syncWebDocumentTheme(isDark);
  }, [isDark]);

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <WebShell backgroundColor={navTheme.colors.background}>{children}</WebShell>
    </ThemeProvider>
  );
}
