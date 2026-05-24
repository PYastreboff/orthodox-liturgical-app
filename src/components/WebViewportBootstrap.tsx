import { useEffect } from 'react';
import { Platform } from 'react-native';

import { installWebViewportShell } from '../theme/webViewport';

/** One-time iOS PWA viewport shell (100vh in standalone, fixed body/#root). */
export function WebViewportBootstrap() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    installWebViewportShell();
  }, []);

  return null;
}
