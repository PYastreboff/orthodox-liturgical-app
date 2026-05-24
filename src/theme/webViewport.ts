import { Platform } from 'react-native';

/** Standalone “Add to Home Screen” — not the same as `display-mode: standalone` on iOS. */
export function isIosWebStandalone(): boolean {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  if (nav.standalone === true) return true;
  if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  return false;
}

/** Reliable read of env(safe-area-inset-*) on iOS (height probe, not getComputedStyle on :root). */
export function measureWebSafeAreaInset(
  edge: 'safe-area-inset-top' | 'safe-area-inset-bottom' | 'safe-area-inset-left' | 'safe-area-inset-right',
): number {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return 0;

  const el = document.createElement('div');
  el.style.cssText = [
    'position:fixed',
    'top:0',
    'left:0',
    'width:0',
    `height:env(${edge}, 0px)`,
    'visibility:hidden',
    'pointer-events:none',
  ].join(';');
  document.body.appendChild(el);
  const value = el.offsetHeight;
  document.body.removeChild(el);
  return value;
}

export function readWebSafeAreaInsets(): {
  top: number;
  bottom: number;
  left: number;
  right: number;
} {
  return {
    top: measureWebSafeAreaInset('safe-area-inset-top'),
    bottom: measureWebSafeAreaInset('safe-area-inset-bottom'),
    left: measureWebSafeAreaInset('safe-area-inset-left'),
    right: measureWebSafeAreaInset('safe-area-inset-right'),
  };
}

function appHeightExpression(): string {
  return isIosWebStandalone() ? '100vh' : '100dvh';
}

/**
 * iOS PWA: use 100vh + fixed shell (100dvh is short by ~safe-area-top on cold start).
 * Shell CSS lives in WEB_ROOT_CSS (+html); this sets --app-height at runtime.
 */
export function applyWebViewportHeight(): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  document.documentElement.style.setProperty('--app-height', appHeightExpression());
}

let installed = false;

export function installWebViewportShell(): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined' || installed) return;
  installed = true;

  applyWebViewportHeight();

  const onResize = () => applyWebViewportHeight();
  window.addEventListener('resize', onResize);
  window.visualViewport?.addEventListener('resize', onResize);
}
