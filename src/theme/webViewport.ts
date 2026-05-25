import { Platform } from 'react-native';

import { SAFARI_TAB_BAR_BLEED_PX } from './layout';

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

/** Layout viewport height — used for standalone PWA shell sync only. */
export function layoutViewportHeightPx(): number {
  if (typeof window === 'undefined') return 0;
  return Math.round(window.innerHeight);
}

/** Layout viewport width. */
export function layoutViewportWidthPx(): number {
  if (typeof window === 'undefined') return 0;
  return Math.round(window.innerWidth);
}

function appHeightExpression(): string {
  if (typeof window === 'undefined') return '100dvh';
  if (isIosWebStandalone()) return '100vh';
  return '100dvh';
}

/**
 * RN Web reads `visualViewport` for Dimensions — shorter than layout viewport in Safari.
 * Proxy height/width so flex layouts fill the painted shell (100dvh).
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
    // ignore
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
  // Floor avoids rounding up and leaving a ~1px gap above Safari’s toolbar.
  return Math.max(0, Math.floor(window.innerHeight - vv.height - vv.offsetTop));
}

/** Tab bar `bottom` offset — bleeds slightly into chrome to hide hairline gaps. */
export function safariTabBarBottomOffset(chromePx: number): number {
  if (chromePx <= 0) return 0;
  return Math.max(0, chromePx - SAFARI_TAB_BAR_BLEED_PX);
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
    'min-height:100dvh',
    'min-height:-webkit-fill-available',
    'z-index:0',
    'pointer-events:none',
  ].join(';');
  return el;
}

/** Sync CSS vars + theme backdrop. Safari browser uses 100dvh (no fixed-body / innerHeight px). */
export function applyWebViewportMetrics(pageBackground?: string): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;

  const heightExpr = appHeightExpression();
  const safariBottom = isIosSafariBrowser() ? measureSafariBottomChrome() : 0;

  const doc = document.documentElement;
  doc.style.setProperty('--app-height', heightExpr);
  doc.style.setProperty('--safari-bottom-chrome', `${safariBottom}px`);

  const body = document.body;
  const root = document.getElementById('root');

  if (isIosWebStandalone()) {
    const heightPx = layoutViewportHeightPx();
    if (heightPx > 0) {
      doc.style.height = `${heightPx}px`;
      doc.style.minHeight = `${heightPx}px`;
      body.style.position = 'fixed';
      body.style.top = '0';
      body.style.left = '0';
      body.style.right = '0';
      body.style.bottom = '0';
      body.style.width = '100%';
      body.style.margin = '0';
      body.style.overflow = 'hidden';
      body.style.height = `${heightPx}px`;
      if (root) {
        root.style.position = 'absolute';
        root.style.inset = '0';
        root.style.display = 'flex';
        root.style.flexDirection = 'column';
        root.style.width = '100%';
        root.style.height = '100%';
        root.style.overflow = 'hidden';
        root.style.zIndex = '1';
      }
    }
  } else {
    doc.style.removeProperty('height');
    body.style.position = '';
    body.style.top = '';
    body.style.left = '';
    body.style.right = '';
    body.style.bottom = '';
    body.style.height = '';
    body.style.overflow = '';
    if (root) {
      root.style.position = '';
      root.style.inset = '';
      root.style.height = '';
      root.style.zIndex = '';
    }
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
  getNativeVisualViewport()?.addEventListener('resize', onChange);
  getNativeVisualViewport()?.addEventListener('scroll', onChange);
  window.visualViewport?.addEventListener('resize', onChange);
  window.visualViewport?.addEventListener('scroll', onChange);
}

/** Runs before React — 100dvh shell; standalone PWA keeps 100vh fixed body. */
export const WEB_VIEWPORT_BOOT_SCRIPT = `(function(){
  function ios(){return /iPhone|iPad|iPod/i.test(navigator.userAgent||'');}
  function standalone(){var n=navigator;return n.standalone===true||(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches);}
  function safariBrowser(){return ios()&&!standalone();}
  function layoutH(){return Math.round(window.innerHeight);}
  function patchVv(){
    if(!safariBrowser()||!window.visualViewport||window.__orthodailyVvPatch)return;
    var native=window.visualViewport;
    window.__orthodailyNativeVv=native;
    window.__orthodailyVvPatch=true;
    var proxy=new Proxy(native,{
      get:function(t,p,r){
        if(p==='height')return layoutH()/(t.scale||1);
        if(p==='width')return Math.round(window.innerWidth)/(t.scale||1);
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
    el.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;width:100%;min-height:100dvh;min-height:-webkit-fill-available;z-index:0;pointer-events:none';
  }
  function sync(){
    try{
      patchVv();
      var d=document.documentElement,b=document.body,r=document.getElementById('root');
      var heightExpr=standalone()?'100vh':'100dvh';
      d.style.setProperty('--app-height',heightExpr);
      var bottom=0;
      if(safariBrowser()){
        var nv=window.__orthodailyNativeVv||null;
        if(nv){bottom=Math.max(0,Math.floor(window.innerHeight-nv.height-nv.offsetTop));}
      }
      d.style.setProperty('--safari-bottom-chrome',bottom+'px');
      if(standalone()){
        var h=layoutH();
        if(h>0){
          d.style.height=h+'px';d.style.minHeight=h+'px';
          b.style.position='fixed';b.style.top='0';b.style.left='0';b.style.right='0';b.style.bottom='0';
          b.style.width='100%';b.style.margin='0';b.style.overflow='hidden';b.style.height=h+'px';
          if(r){r.style.position='absolute';r.style.top='0';r.style.left='0';r.style.right='0';r.style.bottom='0';
            r.style.display='flex';r.style.flexDirection='column';r.style.width='100%';r.style.height='100%';r.style.zIndex='1';}
        }
      }else{
        d.style.removeProperty('height');
        b.style.position='';b.style.top='';b.style.left='';b.style.right='';b.style.bottom='';
        b.style.height='';b.style.overflow='';
        if(r){r.style.position='';r.style.height='';r.style.zIndex='';}
      }
      ensureBackdrop();
    }catch(e){}
  }
  patchVv();
  sync();
  window.addEventListener('resize',sync);
  window.addEventListener('orientationchange',sync);
  var nv=window.__orthodailyNativeVv;
  if(nv){nv.addEventListener('resize',sync);nv.addEventListener('scroll',sync);}
  if(window.visualViewport){
    window.visualViewport.addEventListener('resize',sync);
    window.visualViewport.addEventListener('scroll',sync);
  }
})();`;
