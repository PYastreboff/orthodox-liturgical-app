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

export function isIosMobileWeb(): boolean {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
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

/**
 * Pin the app shell to the visible viewport.
 * - Standalone PWA: 100vh (100dvh lies on cold start).
 * - Safari browser: visualViewport height + offset (eliminates letterbox bands).
 */
export function applyWebViewportHeight(): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;

  const root = document.documentElement;

  if (isIosWebStandalone()) {
    root.style.setProperty('--app-height', '100vh');
    root.style.setProperty('--viewport-offset-top', '0px');
    return;
  }

  const vv = window.visualViewport;
  if (vv && isIosMobileWeb()) {
    root.style.setProperty('--app-height', `${Math.round(vv.height)}px`);
    root.style.setProperty('--viewport-offset-top', `${Math.round(vv.offsetTop)}px`);
    return;
  }

  root.style.setProperty('--app-height', '100dvh');
  root.style.setProperty('--viewport-offset-top', '0px');
}

let installed = false;

export function installWebViewportShell(): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined' || installed) return;
  installed = true;

  applyWebViewportHeight();

  const onGeometryChange = () => applyWebViewportHeight();
  window.addEventListener('resize', onGeometryChange);
  window.addEventListener('orientationchange', onGeometryChange);
  window.visualViewport?.addEventListener('resize', onGeometryChange);
  window.visualViewport?.addEventListener('scroll', onGeometryChange);
}

/** Inline boot script for +html (runs before React). */
export const WEB_VIEWPORT_BOOT_SCRIPT = `(function(){
  function sync(){
    try{
      var d=document.documentElement;
      var n=window.navigator;
      var standalone=n.standalone===true||(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches);
      if(standalone){
        d.style.setProperty('--app-height','100vh');
        d.style.setProperty('--viewport-offset-top','0px');
        return;
      }
      var vv=window.visualViewport;
      var ios=/iPhone|iPad|iPod/i.test(n.userAgent||'');
      if(vv&&ios){
        d.style.setProperty('--app-height',Math.round(vv.height)+'px');
        d.style.setProperty('--viewport-offset-top',Math.round(vv.offsetTop)+'px');
        return;
      }
      d.style.setProperty('--app-height','100dvh');
      d.style.setProperty('--viewport-offset-top','0px');
    }catch(e){}
  }
  sync();
  window.addEventListener('resize',sync);
  window.addEventListener('orientationchange',sync);
  if(window.visualViewport){
    window.visualViewport.addEventListener('resize',sync);
    window.visualViewport.addEventListener('scroll',sync);
  }
})();`;
