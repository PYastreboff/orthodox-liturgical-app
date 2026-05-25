import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { readWebSafeAreaInsets } from '../theme/webViewport';

/**
 * Safe area for tab bar and scroll content padding.
 * On iPhone web, uses env() height probe (reliable on iOS 26 PWA).
 */
export function useLayoutSafeAreaInsets() {
  const insets = useSafeAreaInsets();
  if (Platform.OS !== 'web') return insets;

  const css = readWebSafeAreaInsets();
  return {
    top: Math.max(insets.top, css.top),
    bottom: Math.max(insets.bottom, css.bottom),
    left: Math.max(insets.left, css.left),
    right: Math.max(insets.right, css.right),
  };
}
