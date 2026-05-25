import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import {
  isIosSafariBrowser,
  measureSafariBottomChrome,
} from '../theme/webViewport';

/**
 * Height of Safari’s floating bottom toolbar (URL bar).
 * Tab bar sits above it; page background extends underneath.
 */
export function useSafariBottomChromeInset(): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'web' || !isIosSafariBrowser()) {
      setInset(0);
      return;
    }

    const sync = () => setInset(measureSafariBottomChrome());
    sync();

    window.addEventListener('resize', sync);
    window.addEventListener('orientationchange', sync);
    window.visualViewport?.addEventListener('resize', sync);
    window.visualViewport?.addEventListener('scroll', sync);

    return () => {
      window.removeEventListener('resize', sync);
      window.removeEventListener('orientationchange', sync);
      window.visualViewport?.removeEventListener('resize', sync);
      window.visualViewport?.removeEventListener('scroll', sync);
    };
  }, []);

  return inset;
}
