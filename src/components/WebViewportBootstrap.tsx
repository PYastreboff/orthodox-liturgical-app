import { useEffect } from 'react';
import { Platform } from 'react-native';

import { applyWebViewportMetrics, installWebViewportShell, isIosSafariBrowser, unlockSafariDocumentScroll } from '../theme/webViewport';
import { installClipDebug } from '../lib/debug/clipDebug';

/** Installs iOS innerHeight shell + keeps it synced on resize / Safari toolbar changes. */
export function WebViewportBootstrap() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    installWebViewportShell();
    installClipDebug();

    const onChange = () => applyWebViewportMetrics();
    window.addEventListener('resize', onChange);
    window.addEventListener('orientationchange', onChange);
    window.visualViewport?.addEventListener('resize', onChange);
    window.visualViewport?.addEventListener('scroll', onChange);

    let unlockTimer: ReturnType<typeof setTimeout> | undefined;
    const scheduleUnlock = () => {
      if (!isIosSafariBrowser()) return;
      if (unlockTimer) clearTimeout(unlockTimer);
      unlockTimer = setTimeout(() => {
        unlockSafariDocumentScroll();
        requestAnimationFrame(unlockSafariDocumentScroll);
      }, 50);
    };

    scheduleUnlock();
    const root = document.getElementById('root');
    const observer =
      root && isIosSafariBrowser()
        ? new MutationObserver(scheduleUnlock)
        : null;
    if (root && observer) {
      observer.observe(root, { childList: true, subtree: true });
    }

    return () => {
      window.removeEventListener('resize', onChange);
      window.removeEventListener('orientationchange', onChange);
      window.visualViewport?.removeEventListener('resize', onChange);
      window.visualViewport?.removeEventListener('scroll', onChange);
      if (unlockTimer) clearTimeout(unlockTimer);
      observer?.disconnect();
    };
  }, []);

  return null;
}
