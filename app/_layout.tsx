import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppThemeProvider } from '../src/components/AppThemeProvider';
import { DayNavigationProvider } from '../src/state/DayNavigationContext';
import { PreferencesProvider } from '../src/state/PreferencesContext';
import { useResolvedColorScheme } from '../src/theme/useResolvedColorScheme';
import { colors } from '../src/theme/tokens';

function RootStack() {
  const isDark = useResolvedColorScheme() === 'dark';
  const backgroundColor = isDark ? colors.darkBg : colors.parchment;

  return (
    <View style={[styles.root, { backgroundColor }]}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor } }} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <>
      <Head>
        <title>OrthoDaily</title>
      </Head>
      <SafeAreaProvider>
        <PreferencesProvider>
          <AppThemeProvider>
            <DayNavigationProvider>
              <RootStack />
            </DayNavigationProvider>
          </AppThemeProvider>
        </PreferencesProvider>
      </SafeAreaProvider>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
