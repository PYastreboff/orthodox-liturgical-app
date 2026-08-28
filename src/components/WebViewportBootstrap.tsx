import { useEffect } from 'react';
import { Platform } from 'react-native';

import { applyWebViewportMetrics, installWebViewportShell } from '../theme/webViewport';

/** Installs iOS innerHeight shell + keeps it synced on resize / Safari toolbar changes. */
export function WebViewportBootstrap() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    installWebViewportShell();

    const onChange = () => applyWebViewportMetrics();
    window.addEventListener('resize', onChange);
    window.addEventListener('orientationchange', onChange);
    window.visualViewport?.addEventListener('resize', onChange);
    window.visualViewport?.addEventListener('scroll', onChange);

    return () => {
      window.removeEventListener('resize', onChange);
      window.removeEventListener('orientationchange', onChange);
      window.visualViewport?.removeEventListener('resize', onChange);
      window.visualViewport?.removeEventListener('scroll', onChange);
    };
  }, []);

  return null;
}
