import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppThemeProvider } from '../src/components/AppThemeProvider';
import { DayNavigationProvider } from '../src/state/DayNavigationContext';
import { PreferencesProvider } from '../src/state/PreferencesContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PreferencesProvider>
        <AppThemeProvider>
          <DayNavigationProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </DayNavigationProvider>
        </AppThemeProvider>
      </PreferencesProvider>
    </SafeAreaProvider>
  );
}
