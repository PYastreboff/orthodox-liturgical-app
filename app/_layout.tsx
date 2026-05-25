import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { useTheme } from '@react-navigation/native';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, type Metrics } from 'react-native-safe-area-context';

import { AppThemeProvider } from '../src/components/AppThemeProvider';
import { WebViewportBootstrap } from '../src/components/WebViewportBootstrap';
import { DayNavigationProvider } from '../src/state/DayNavigationContext';
import { PreferencesProvider } from '../src/state/PreferencesContext';

const WEB_SAFE_AREA_METRICS: Metrics = {
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
  frame: { x: 0, y: 0, width: 0, height: 0 },
};

function RootStack() {
  const theme = useTheme();
  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      />
    </View>
  );
}

export default function RootLayout() {
  return (
    <>
      <Head>
        <title>OrthoDaily</title>
      </Head>
      <SafeAreaProvider initialMetrics={Platform.OS === 'web' ? WEB_SAFE_AREA_METRICS : undefined}>
        <WebViewportBootstrap />
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
    width: '100%',
    ...(Platform.OS === 'web'
      ? ({ height: '100%', minHeight: '100%', maxHeight: '100%' } as const)
      : null),
  },
});
