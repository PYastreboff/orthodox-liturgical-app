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

/** Safari in-browser only (toolbar visible, page should paint underneath). */
export function isIosSafariBrowser(): boolean {
  return isIosMobileWeb() && !isIosWebStandalone();
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
 * Gap between layout viewport bottom and visual viewport (Safari floating toolbar).
 * Page background uses full 100vh; tab bar sits above this inset.
 */
export function measureSafariBottomChrome(): number {
  if (typeof window === 'undefined') return 0;
  const vv = window.visualViewport;
  if (!vv) return 0;
  return Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop));
}

function shellHeightUnit(): string {
  if (isIosMobileWeb()) return '100vh';
  return '100dvh';
}

/** Full layout viewport on iOS (paints behind Safari URL bar with viewport-fit=cover). */
export function applyWebViewportHeight(): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  document.documentElement.style.setProperty('--app-height', shellHeightUnit());
}

export function applyWebSafariChromeInsets(): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  const bottom = isIosSafariBrowser() ? measureSafariBottomChrome() : 0;
  document.documentElement.style.setProperty('--safari-bottom-chrome', `${bottom}px`);
}

export function applyWebViewportMetrics(): void {
  applyWebViewportHeight();
  applyWebSafariChromeInsets();
}

let installed = false;

export function installWebViewportShell(): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined' || installed) return;
  installed = true;

  applyWebViewportMetrics();

  const onChange = () => applyWebViewportMetrics();
  window.addEventListener('resize', onChange);
  window.addEventListener('orientationchange', onChange);
  window.visualViewport?.addEventListener('resize', onChange);
  window.visualViewport?.addEventListener('scroll', onChange);
}

/** Inline boot script for +html (runs before React). */
export const WEB_VIEWPORT_BOOT_SCRIPT = `(function(){
  function ios(){return /iPhone|iPad|iPod/i.test(navigator.userAgent||'');}
  function standalone(){var n=navigator;return n.standalone===true||(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches);}
  function sync(){
    try{
      var d=document.documentElement;
      d.style.setProperty('--app-height',ios()?'100vh':'100dvh');
      var bottom=0;
      if(ios()&&!standalone()&&window.visualViewport){
        var vv=window.visualViewport;
        bottom=Math.max(0,Math.round(window.innerHeight-vv.height-vv.offsetTop));
      }
      d.style.setProperty('--safari-bottom-chrome',bottom+'px');
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
