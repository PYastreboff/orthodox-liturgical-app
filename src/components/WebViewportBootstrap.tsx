import { useEffect } from 'react';
import { Platform } from 'react-native';

import { applyWebViewportMetrics, installWebViewportShell } from '../theme/webViewport';

/** Installs iOS innerHeight shell + keeps it synced on resize / Safari toolbar changes. */
export function WebViewportBootstrap() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    installWebViewportShell();

    const onResize = () => applyWebViewportMetrics();
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    window.visualViewport?.addEventListener('resize', onResize);
    window.visualViewport?.addEventListener('scroll', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      window.visualViewport?.removeEventListener('resize', onResize);
      window.visualViewport?.removeEventListener('scroll', onResize);
    };
  }, []);

  return null;
}
