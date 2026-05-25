import { Platform } from 'react-native';

import { SAFARI_TAB_BAR_BLEED_PX } from './layout';

const BACKDROP_ID = 'orthodaily-viewport-backdrop';
const IOS_SHELL_CLASS = 'orthodaily-ios-web';

/** Unpatched visual viewport — Safari toolbar inset math only. */
let nativeVisualViewport: VisualViewport | null = null;

export function getNativeVisualViewport(): VisualViewport | null {
  if (typeof window === 'undefined') return null;
  return nativeVisualViewport ?? window.visualViewport ?? null;
}

/** Standalone “Add to Home Screen”. */
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

export function isIosSafariBrowser(): boolean {
  return isIosMobileWeb() && !isIosWebStandalone();
}

/** Layout viewport — paints behind Safari UI with viewport-fit=cover. */
export function layoutViewportHeightPx(): number {
  if (typeof window === 'undefined') return 0;
  return Math.round(window.innerHeight);
}

export function layoutViewportWidthPx(): number {
  if (typeof window === 'undefined') return 0;
  return Math.round(window.innerWidth);
}

/**
 * RN Web uses visualViewport for Dimensions (shorter than layout viewport).
 * Proxy to innerHeight so flex layouts fill the fixed iOS shell.
 */
export function installVisualViewportLayoutPatch(): void {
  if (typeof window === 'undefined' || !isIosMobileWeb()) return;
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

export function measureSafariBottomChrome(): number {
  if (typeof window === 'undefined') return 0;
  const vv = getNativeVisualViewport();
  if (!vv) return 0;
  return Math.max(0, Math.floor(window.innerHeight - vv.height - vv.offsetTop));
}

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
  return el;
}

function paintChrome(bg: string | undefined): void {
  if (!bg || typeof document === 'undefined') return;
  const doc = document.documentElement;
  const body = document.body;
  const root = document.getElementById('root');
  const backdrop = document.getElementById(BACKDROP_ID);
  doc.style.backgroundColor = bg;
  body.style.backgroundColor = bg;
  if (root) root.style.backgroundColor = bg;
  if (backdrop) backdrop.style.backgroundColor = bg;
}

/** Fixed shell sized to innerHeight — avoids 100dvh/100vh letterboxing on iOS. */
function applyIosMobileShell(pageBackground?: string): void {
  const h = layoutViewportHeightPx();
  const w = layoutViewportWidthPx();
  if (h <= 0) return;

  const doc = document.documentElement;
  doc.classList.add(IOS_SHELL_CLASS);
  doc.style.setProperty('--orthodaily-shell-height', `${h}px`);
  doc.style.setProperty('--orthodaily-shell-width', `${w}px`);
  doc.style.setProperty('--app-height', `${h}px`);
  doc.style.setProperty(
    '--safari-bottom-chrome',
    `${isIosSafariBrowser() ? measureSafariBottomChrome() : 0}px`,
  );
  doc.style.height = `${h}px`;
  doc.style.minHeight = `${h}px`;
  doc.style.maxHeight = `${h}px`;
  doc.style.width = '100%';
  doc.style.margin = '0';
  doc.style.padding = '0';
  doc.style.overflow = 'hidden';

  const body = document.body;
  body.style.position = 'fixed';
  body.style.top = '0';
  body.style.left = '0';
  body.style.right = '0';
  body.style.width = '100%';
  body.style.height = `${h}px`;
  body.style.minHeight = `${h}px`;
  body.style.maxHeight = `${h}px`;
  body.style.margin = '0';
  body.style.padding = '0';
  body.style.overflow = 'hidden';
  body.style.overscrollBehavior = 'none';

  const backdrop = ensureViewportBackdrop();
  backdrop.style.cssText = [
    'position:fixed',
    'top:0',
    'left:0',
    'right:0',
    `height:${h}px`,
    'width:100%',
    'z-index:0',
    'pointer-events:none',
  ].join(';');

  const root = document.getElementById('root');
  if (root) {
    root.style.position = 'fixed';
    root.style.top = '0';
    root.style.left = '0';
    root.style.right = '0';
    root.style.width = '100%';
    root.style.height = `${h}px`;
    root.style.minHeight = `${h}px`;
    root.style.maxHeight = `${h}px`;
    root.style.margin = '0';
    root.style.padding = '0';
    root.style.display = 'flex';
    root.style.flexDirection = 'column';
    root.style.overflow = 'hidden';
    root.style.zIndex = '1';
    root.style.boxSizing = 'border-box';
  }

  paintChrome(pageBackground);
}

/** Desktop / Android web — dynamic viewport units, no fixed body. */
function applyStandardWebShell(pageBackground?: string): void {
  const doc = document.documentElement;
  doc.classList.remove(IOS_SHELL_CLASS);
  doc.style.removeProperty('--orthodaily-shell-height');
  doc.style.removeProperty('--orthodaily-shell-width');
  doc.style.setProperty('--app-height', '100dvh');
  doc.style.setProperty('--safari-bottom-chrome', '0px');
  doc.style.removeProperty('height');
  doc.style.removeProperty('minHeight');
  doc.style.removeProperty('maxHeight');

  const body = document.body;
  body.style.position = '';
  body.style.top = '';
  body.style.left = '';
  body.style.right = '';
  body.style.height = '';
  body.style.minHeight = '';
  body.style.maxHeight = '';
  body.style.overflow = '';
  body.style.overscrollBehavior = '';

  const root = document.getElementById('root');
  if (root) {
    root.style.position = '';
    root.style.top = '';
    root.style.left = '';
    root.style.right = '';
    root.style.height = '';
    root.style.minHeight = '';
    root.style.maxHeight = '';
    root.style.zIndex = '';
    root.style.boxSizing = '';
  }

  const backdrop = ensureViewportBackdrop();
  backdrop.style.cssText = [
    'position:fixed',
    'inset:0',
    'width:100%',
    'min-height:100dvh',
    'z-index:0',
    'pointer-events:none',
  ].join(';');

  paintChrome(pageBackground);
}

export function applyWebViewportMetrics(pageBackground?: string): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;

  const preservedBg = document.documentElement.style
    .getPropertyValue('--orthodaily-page-bg')
    .trim();
  const bg = pageBackground ?? (preservedBg || undefined);

  if (isIosMobileWeb()) {
    applyIosMobileShell(bg || undefined);
  } else {
    applyStandardWebShell(bg || undefined);
  }
}

let installed = false;

export function installWebViewportShell(): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined' || installed) return;
  installed = true;

  installVisualViewportLayoutPatch();
  applyWebViewportMetrics();

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('resize'));
  }

  const onChange = () => applyWebViewportMetrics();
  window.addEventListener('resize', onChange);
  window.addEventListener('orientationchange', onChange);
  const native = getNativeVisualViewport();
  native?.addEventListener('resize', onChange);
  native?.addEventListener('scroll', onChange);
  window.visualViewport?.addEventListener('resize', onChange);
  window.visualViewport?.addEventListener('scroll', onChange);
}

export const WEB_VIEWPORT_BOOT_SCRIPT = `(function(){
  function ios(){return /iPhone|iPad|iPod/i.test(navigator.userAgent||'');}
  function layoutH(){return Math.round(window.innerHeight);}
  function layoutW(){return Math.round(window.innerWidth);}
  function patchVv(){
    if(!ios()||!window.visualViewport||window.__orthodailyVvPatch)return;
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
    return el;
  }
  function applyIos(){
    var h=layoutH(),w=layoutW();
    if(h<=0)return;
    var d=document.documentElement,b=document.body,r=document.getElementById('root');
    d.classList.add('orthodaily-ios-web');
    d.style.setProperty('--orthodaily-shell-height',h+'px');
    d.style.setProperty('--app-height',h+'px');
    var bottom=0,nv=window.__orthodailyNativeVv;
    if(nv){bottom=Math.max(0,Math.floor(window.innerHeight-nv.height-nv.offsetTop));}
    d.style.setProperty('--safari-bottom-chrome',bottom+'px');
    d.style.height=h+'px';d.style.minHeight=h+'px';d.style.maxHeight=h+'px';
    d.style.width='100%';d.style.margin='0';d.style.padding='0';d.style.overflow='hidden';
    b.style.position='fixed';b.style.top='0';b.style.left='0';b.style.right='0';
    b.style.width='100%';b.style.height=h+'px';b.style.minHeight=h+'px';b.style.maxHeight=h+'px';
    b.style.margin='0';b.style.padding='0';b.style.overflow='hidden';b.style.overscrollBehavior='none';
    var bd=ensureBackdrop();
    bd.style.cssText='position:fixed;top:0;left:0;right:0;height:'+h+'px;width:100%;z-index:0;pointer-events:none';
    if(r){
      r.style.position='fixed';r.style.top='0';r.style.left='0';r.style.right='0';
      r.style.width='100%';r.style.height=h+'px';r.style.minHeight=h+'px';r.style.maxHeight=h+'px';
      r.style.margin='0';r.style.padding='0';r.style.display='flex';r.style.flexDirection='column';
      r.style.overflow='hidden';r.style.zIndex='1';r.style.boxSizing='border-box';
    }
  }
  function sync(){
    try{
      patchVv();
      if(ios()){applyIos();}
    }catch(e){}
  }
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
