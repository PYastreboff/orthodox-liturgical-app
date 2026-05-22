import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';

import { colors } from '../src/theme/tokens';
import { PreferencesProvider } from '../src/state/PreferencesContext';

const navigationThemeLight = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.accentGold,
    background: colors.parchment,
    card: colors.parchment,
    text: colors.ink,
    border: colors.border,
    notification: colors.accentWine,
  },
};

const navigationThemeDark = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accentGold,
    background: colors.darkBg,
    card: colors.darkSurface,
    text: colors.darkInk,
    border: colors.darkBorder,
    notification: colors.accentWine,
  },
};

export default function RootLayout() {
  const scheme = useColorScheme();
  const navTheme = scheme === 'dark' ? navigationThemeDark : navigationThemeLight;

  return (
    <PreferencesProvider>
      <ThemeProvider value={navTheme}>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </PreferencesProvider>
  );
}
