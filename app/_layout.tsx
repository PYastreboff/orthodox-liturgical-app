import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { useTheme } from "expo-router/react-navigation";
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, type Metrics } from 'react-native-safe-area-context';

import { AppThemeProvider } from '../src/components/AppThemeProvider';
import { LiturgicalRemindersSync } from '../src/components/LiturgicalRemindersSync';
import { SplashGate } from '../src/components/SplashGate';
import { WebViewportBootstrap } from '../src/components/WebViewportBootstrap';
import { DayNavigationProvider } from '../src/state/DayNavigationContext';
import { PreferencesProvider } from '../src/state/PreferencesContext';
import { VestmentAccentProvider } from '../src/state/VestmentAccentContext';

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
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'slide_from_right',
          gestureEnabled: false,
          fullScreenGestureEnabled: false,
          freezeOnBlur: false,
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            animation: 'none',
            contentStyle: { backgroundColor: theme.colors.background },
          }}
        />
        <Stack.Screen
          name="day/[section]"
          options={{
            presentation: 'transparentModal',
            animation: 'none',
            contentStyle: { backgroundColor: 'transparent' },
            gestureEnabled: false,
          }}
        />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <>
      <Head>
        <title>OrthoDaily</title>
      </Head>
      <GestureHandlerRootView style={styles.flex}>
        <SafeAreaProvider initialMetrics={Platform.OS === 'web' ? WEB_SAFE_AREA_METRICS : undefined}>
          <WebViewportBootstrap />
          <PreferencesProvider>
            <AppThemeProvider>
              <SplashGate>
                <DayNavigationProvider>
                  <VestmentAccentProvider>
                    <LiturgicalRemindersSync />
                    <RootStack />
                  </VestmentAccentProvider>
                </DayNavigationProvider>
              </SplashGate>
            </AppThemeProvider>
          </PreferencesProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  root: {
    flex: 1,
    width: '100%',
    ...(Platform.OS === 'web' ? ({ minHeight: 0 } as const) : null),
  },
});
