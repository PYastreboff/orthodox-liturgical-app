import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppThemeProvider } from '../src/components/AppThemeProvider';
import { DayNavigationProvider } from '../src/state/DayNavigationContext';
import { PreferencesProvider } from '../src/state/PreferencesContext';

function RootStack() {
  return (
    <View style={styles.root}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }} />
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
