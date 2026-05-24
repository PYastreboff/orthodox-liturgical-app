import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Read iOS safe-area env vars when RN insets are not yet available on web. */
function webSafeAreaInsetsFromCss(): {
  top: number;
  bottom: number;
  left: number;
  right: number;
} {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }

  const probe = document.createElement('div');
  probe.style.position = 'fixed';
  probe.style.visibility = 'hidden';
  probe.style.pointerEvents = 'none';
  probe.style.paddingTop = 'env(safe-area-inset-top, 0px)';
  probe.style.paddingBottom = 'env(safe-area-inset-bottom, 0px)';
  probe.style.paddingLeft = 'env(safe-area-inset-left, 0px)';
  probe.style.paddingRight = 'env(safe-area-inset-right, 0px)';
  document.body.appendChild(probe);
  const style = getComputedStyle(probe);
  const top = parseFloat(style.paddingTop) || 0;
  const bottom = parseFloat(style.paddingBottom) || 0;
  const left = parseFloat(style.paddingLeft) || 0;
  const right = parseFloat(style.paddingRight) || 0;
  document.body.removeChild(probe);
  return { top, bottom, left, right };
}

/**
 * Safe area for tab bar and screen padding.
 * On iPhone Safari / PWA, requires `viewport-fit=cover` in `app/+html.tsx`.
 */
export function useLayoutSafeAreaInsets() {
  const insets = useSafeAreaInsets();
  if (Platform.OS !== 'web') return insets;

  const css = webSafeAreaInsetsFromCss();
  return {
    top: Math.max(insets.top, css.top),
    bottom: Math.max(insets.bottom, css.bottom),
    left: Math.max(insets.left, css.left),
    right: Math.max(insets.right, css.right),
  };
}
