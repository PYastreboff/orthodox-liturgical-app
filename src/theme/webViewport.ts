import { Platform } from 'react-native';

const BACKDROP_ID = 'orthodaily-viewport-backdrop';

/** Unpatched visual viewport — needed for Safari toolbar inset math. */
let nativeVisualViewport: VisualViewport | null = null;

export function getNativeVisualViewport(): VisualViewport | null {
  if (typeof window === 'undefined') return null;
  return nativeVisualViewport ?? window.visualViewport ?? null;
}

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

/** Safari in-browser only (floating URL bar; page paints underneath). */
export function isIosSafariBrowser(): boolean {
  return isIosMobileWeb() && !isIosWebStandalone();
}

/** Layout viewport height — full screen behind Safari chrome on iOS. */
export function layoutViewportHeightPx(): number {
  if (typeof window === 'undefined') return 0;
  return Math.round(window.innerHeight);
}

/** Layout viewport width. */
export function layoutViewportWidthPx(): number {
  if (typeof window === 'undefined') return 0;
  return Math.round(window.innerWidth);
}

/**
 * RN Web reads `visualViewport` for Dimensions — shorter than `innerHeight` in Safari.
 * Proxy height/width to the layout viewport so flex layouts fill the painted shell.
 */
export function installVisualViewportLayoutPatch(): void {
  if (typeof window === 'undefined' || !isIosSafariBrowser()) return;
  const w = window as Window & { __orthodailyVvPatch?: boolean };
  if (w.__orthodailyVvPatch) return;
  const native = window.visualViewport;
  if (!native) return;

  nativeVisualViewport = native;
  const proxy = new Proxy(native, {
    get(target, prop, receiver) {
      if (prop === 'height') {
        return layoutViewportHeightPx() / (target.scale || 1);
      }
      if (prop === 'width') {
        return layoutViewportWidthPx() / (target.scale || 1);
      }
      const value = Reflect.get(target, prop, receiver);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });

  try {
    Object.defineProperty(window, 'visualViewport', {
      get: () => proxy,
      configurable: true,
    });
    w.__orthodailyVvPatch = true;
  } catch {
    // ignore — Dimensions will stay on the visual viewport
  }
}

/** Reliable read of env(safe-area-inset-*) on iOS (height probe). */
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

/** Safari floating toolbar height (tab bar sits above this). */
export function measureSafariBottomChrome(): number {
  if (typeof window === 'undefined') return 0;
  const vv = getNativeVisualViewport();
  if (!vv) return 0;
  return Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop));
}

function ensureViewportBackdrop(): HTMLElement {
  let el = document.getElementById(BACKDROP_ID);
  if (!el) {
    el = document.createElement('div');
    el.id = BACKDROP_ID;
    el.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(el, document.body.firstChild);
  }
  el.style.cssText = [
    'position:fixed',
    'top:0',
    'left:0',
    'right:0',
    'bottom:0',
    'width:100%',
    'height:100%',
    'z-index:0',
    'pointer-events:none',
  ].join(';');
  return el;
}

/** Pin document + RN host to layout viewport (px on iOS — 100vh/100% lie in Safari). */
export function applyWebViewportMetrics(pageBackground?: string): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;

  const ios = isIosMobileWeb();
  const heightPx = layoutViewportHeightPx();
  const heightExpr = ios && heightPx > 0 ? `${heightPx}px` : '100dvh';
  const safariBottom = isIosSafariBrowser() ? measureSafariBottomChrome() : 0;

  const doc = document.documentElement;
  doc.style.setProperty('--app-height', heightExpr);
  doc.style.setProperty('--safari-bottom-chrome', `${safariBottom}px`);
  doc.style.setProperty('--app-width', '100%');

  if (ios && heightPx > 0) {
    doc.style.height = `${heightPx}px`;
    doc.style.minHeight = `${heightPx}px`;
  }

  const body = document.body;
  body.style.position = 'fixed';
  body.style.top = '0';
  body.style.left = '0';
  body.style.right = '0';
  body.style.bottom = '0';
  body.style.width = '100%';
  body.style.margin = '0';
  body.style.overflow = 'hidden';
  body.style.overscrollBehavior = 'none';
  if (ios && heightPx > 0) {
    body.style.height = `${heightPx}px`;
  }

  const root = document.getElementById('root');
  if (root) {
    root.style.position = 'absolute';
    root.style.top = '0';
    root.style.left = '0';
    root.style.right = '0';
    root.style.bottom = '0';
    root.style.display = 'flex';
    root.style.flexDirection = 'column';
    root.style.width = '100%';
    root.style.height = '100%';
    root.style.minHeight = '100%';
    root.style.overflow = 'hidden';
    root.style.zIndex = '1';
  }

  const backdrop = ensureViewportBackdrop();
  if (pageBackground) {
    backdrop.style.backgroundColor = pageBackground;
    doc.style.backgroundColor = pageBackground;
    body.style.backgroundColor = pageBackground;
    if (root) root.style.backgroundColor = pageBackground;
  }
}

let installed = false;

export function installWebViewportShell(): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined' || installed) return;
  installed = true;

  installVisualViewportLayoutPatch();
  applyWebViewportMetrics();

  const onChange = () => applyWebViewportMetrics();
  window.addEventListener('resize', onChange);
  window.addEventListener('orientationchange', onChange);
  window.visualViewport?.addEventListener('resize', onChange);
  window.visualViewport?.addEventListener('scroll', onChange);
}

/** Runs before React — iOS uses innerHeight px; patch visualViewport for RN Web. */
export const WEB_VIEWPORT_BOOT_SCRIPT = `(function(){
  function ios(){return /iPhone|iPad|iPod/i.test(navigator.userAgent||'');}
  function standalone(){var n=navigator;return n.standalone===true||(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches);}
  function safariBrowser(){return ios()&&!standalone();}
  function layoutH(){return Math.round(window.innerHeight);}
  function layoutW(){return Math.round(window.innerWidth);}
  function patchVv(){
    if(!safariBrowser()||!window.visualViewport||window.__orthodailyVvPatch)return;
    var native=window.visualViewport;
    window.__orthodailyNativeVv=native;
    window.__orthodailyVvPatch=true;
    var proxy=new Proxy(native,{
      get:function(t,p,r){
        if(p==='height')return layoutH()/(t.scale||1);
        if(p==='width')return layoutW()/(t.scale||1);
        var v=Reflect.get(t,p,r);
        return typeof v==='function'?v.bind(t):v;
      }
    });
    try{Object.defineProperty(window,'visualViewport',{get:function(){return proxy},configurable:true});}catch(e){}
  }
  function ensureBackdrop(){
    var id='orthodaily-viewport-backdrop';
    var el=document.getElementById(id);
    if(!el){el=document.createElement('div');el.id=id;el.setAttribute('aria-hidden','true');document.body.insertBefore(el,document.body.firstChild);}
    el.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;width:100%;height:100%;z-index:0;pointer-events:none';
  }
  function sync(){
    try{
      patchVv();
      var d=document.documentElement,b=document.body,r=document.getElementById('root');
      var h=ios()?layoutH():0;
      var heightExpr=ios()&&h>0?h+'px':'100dvh';
      d.style.setProperty('--app-height',heightExpr);
      var bottom=0;
      if(safariBrowser()){
        var nv=window.__orthodailyNativeVv||null;
        if(nv){
          bottom=Math.max(0,Math.round(window.innerHeight-nv.height-nv.offsetTop));
        }
      }
      d.style.setProperty('--safari-bottom-chrome',bottom+'px');
      if(ios()&&h>0){d.style.height=h+'px';d.style.minHeight=h+'px';}
      b.style.position='fixed';b.style.top='0';b.style.left='0';b.style.right='0';b.style.bottom='0';
      b.style.width='100%';b.style.margin='0';b.style.overflow='hidden';
      if(ios()&&h>0){b.style.height=h+'px';}
      if(r){r.style.position='absolute';r.style.top='0';r.style.left='0';r.style.right='0';r.style.bottom='0';
        r.style.display='flex';r.style.flexDirection='column';r.style.width='100%';r.style.height='100%';r.style.zIndex='1';}
      if(document.body){ensureBackdrop();}
    }catch(e){}
  }
  patchVv();
  sync();
  window.addEventListener('resize',sync);
  window.addEventListener('orientationchange',sync);
  if(window.visualViewport){
    window.visualViewport.addEventListener('resize',sync);
    window.visualViewport.addEventListener('scroll',sync);
  }
})();`;
