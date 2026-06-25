import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { usePreferences } from '../state/PreferencesContext';
import { AppSplashScreen } from './AppSplashScreen';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Web or dev reload — splash may already be hidden.
});

type Props = {
  children: ReactNode;
};

/** Keeps the native splash visible until preferences load, then reveals the app. */
export function SplashGate({ children }: Props) {
  const { preferencesReady } = usePreferences();
  const [overlayVisible, setOverlayVisible] = useState(true);

  useEffect(() => {
    if (!preferencesReady) return;

    let cancelled = false;
    void SplashScreen.hideAsync()
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setOverlayVisible(false);
      });

    return () => {
      cancelled = true;
    };
  }, [preferencesReady]);

  return (
    <>
      {children}
      {overlayVisible ? (
        <View style={styles.overlay} pointerEvents="auto">
          <AppSplashScreen />
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
});
