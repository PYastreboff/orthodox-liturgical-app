import * as SplashScreen from 'expo-splash-screen';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Modal } from 'react-native';

import { usePreferences } from '../state/PreferencesContext';
import { AppSplashScreen } from './AppSplashScreen';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Web or dev reload — splash may already be hidden.
});

type Props = {
  children: ReactNode;
};

const SplashRevealedContext = createContext(false);

/** True once the splash overlay is gone — other modals must wait (iOS shows one at a time). */
export function useSplashRevealed(): boolean {
  return useContext(SplashRevealedContext);
}

/**
 * Keeps the native splash visible until preferences load, then reveals the app.
 * Children mount only after preferences are ready so screens never fetch with the
 * default calendar and then refetch with the user's saved one.
 */
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
    <SplashRevealedContext.Provider value={!overlayVisible}>
      {preferencesReady ? children : null}
      {overlayVisible ? (
        <Modal visible transparent={false} animationType="fade" onRequestClose={() => {}}>
          <AppSplashScreen />
        </Modal>
      ) : null}
    </SplashRevealedContext.Provider>
  );
}
