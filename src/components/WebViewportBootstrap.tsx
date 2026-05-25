import { useEffect } from 'react';
import { Platform } from 'react-native';

import { installWebViewportShell } from '../theme/webViewport';

/** Installs iOS fixed innerHeight shell + RN visualViewport patch. */
export function WebViewportBootstrap() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    installWebViewportShell();
  }, []);

  return null;
}
