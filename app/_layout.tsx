import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { useTheme } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppThemeProvider } from '../src/components/AppThemeProvider';
import { WebViewportBootstrap } from '../src/components/WebViewportBootstrap';
import { DayNavigationProvider } from '../src/state/DayNavigationContext';
import { PreferencesProvider } from '../src/state/PreferencesContext';

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
      <SafeAreaProvider>
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
  },
});
