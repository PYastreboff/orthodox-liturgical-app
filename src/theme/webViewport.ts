import { Platform } from 'react-native';

import { SAFARI_TAB_BAR_BLEED_PX } from './layout';

const BACKDROP_ID = 'orthodaily-viewport-backdrop';
export const IOS_WEB_CLASS = 'orthodaily-ios-web';

let nativeVisualViewport: VisualViewport | null = null;

export function getNativeVisualViewport(): VisualViewport | null {
  if (typeof window === 'undefined') return null;
  return nativeVisualViewport ?? window.visualViewport ?? null;
}

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

export function layoutViewportHeightPx(): number {
  if (typeof window === 'undefined') return 0;
  return Math.round(window.innerHeight);
}

export function layoutViewportWidthPx(): number {
  if (typeof window === 'undefined') return 0;
  return Math.round(window.innerWidth);
}

/** 1% of layout viewport — reliable on iOS Safari (unlike 1dvh). */
export function layoutVhUnitPx(): number {
  const h = layoutViewportHeightPx();
  return h > 0 ? h / 100 : 0;
}

/**
 * RN Web reads visualViewport for Dimensions (shorter than layout viewport).
 * Proxy to innerHeight on all iOS mobile web.
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

  const horizontal = edge === 'safe-area-inset-left' || edge === 'safe-area-inset-right';
  const el = document.createElement('div');
  el.style.cssText = [
    'position:fixed',
    'top:0',
    'left:0',
    horizontal ? `width:env(${edge}, 0px)` : 'width:0',
    horizontal ? 'height:0' : `height:env(${edge}, 0px)`,
    'visibility:hidden',
    'pointer-events:none',
  ].join(';');
  document.body.appendChild(el);
  const value = horizontal ? el.offsetWidth : el.offsetHeight;
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

function readPageBackground(): string | undefined {
  const fromVar = document.documentElement.style.getPropertyValue('--orthodaily-page-bg').trim();
  return fromVar || undefined;
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

/** iOS: pixel shell from innerHeight (no 100dvh). Desktop: 100dvh flex shell. */
function applyIosWebShell(pageBackground?: string): void {
  const h = layoutViewportHeightPx();
  if (h <= 0) return;

  const doc = document.documentElement;
  const shellHeight = `${h}px`;

  doc.classList.add(IOS_WEB_CLASS);
  doc.style.setProperty('--app-height-px', shellHeight);
  doc.style.setProperty('--vh', `${layoutVhUnitPx()}px`);
  doc.style.setProperty('--app-height', shellHeight);
  doc.style.setProperty(
    '--safari-bottom-chrome',
    `${isIosSafariBrowser() ? measureSafariBottomChrome() : 0}px`,
  );
  doc.style.height = shellHeight;
  doc.style.minHeight = shellHeight;
  doc.style.maxHeight = shellHeight;
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
  body.style.height = shellHeight;
  body.style.minHeight = shellHeight;
  body.style.maxHeight = shellHeight;
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
    root.style.height = shellHeight;
    root.style.minHeight = shellHeight;
    root.style.maxHeight = shellHeight;
    root.style.margin = '0';
    root.style.padding = '0';
    root.style.display = 'flex';
    root.style.flexDirection = 'column';
    root.style.boxSizing = 'border-box';
    root.style.overflow = 'hidden';
    root.style.zIndex = '1';
  }

  const bg = pageBackground ?? readPageBackground();
  if (bg) {
    doc.style.backgroundColor = bg;
    body.style.backgroundColor = bg;
    backdrop.style.backgroundColor = bg;
    if (root) root.style.backgroundColor = bg;
  }
}

function applyDesktopWebShell(pageBackground?: string): void {
  const doc = document.documentElement;
  doc.classList.remove(IOS_WEB_CLASS);
  doc.style.removeProperty('--app-height-px');
  doc.style.removeProperty('--app-cover-height-px');
  doc.style.removeProperty('--vh');
  doc.style.setProperty('--app-height', '100dvh');
  doc.style.setProperty('--safari-bottom-chrome', '0px');
  doc.style.removeProperty('height');
  doc.style.removeProperty('min-height');
  doc.style.removeProperty('max-height');

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

  const bg = pageBackground ?? readPageBackground();
  if (bg) {
    doc.style.backgroundColor = bg;
    body.style.backgroundColor = bg;
    backdrop.style.backgroundColor = bg;
    if (root) root.style.backgroundColor = bg;
  }
}

export function applyWebViewportMetrics(pageBackground?: string): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;

  if (isIosMobileWeb()) {
    applyIosWebShell(pageBackground);
  } else {
    applyDesktopWebShell(pageBackground);
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

  window.dispatchEvent(new Event('resize'));
}

export const WEB_VIEWPORT_BOOT_SCRIPT = `(function(){
  var IOS_CLASS='orthodaily-ios-web';
  function ios(){return /iPhone|iPad|iPod/i.test(navigator.userAgent||'');}
  function layoutH(){return Math.round(window.innerHeight);}
  function layoutVh(){var h=layoutH();return h>0?h/100:0;}
  function syncPageBackground(){
    var d=document.documentElement,b=document.body;
    if(!b)return;
    var bg=(d.style.getPropertyValue('--orthodaily-page-bg')||'').trim();
    if(!bg){
      var cs=getComputedStyle(d);
      bg=(cs.getPropertyValue('--orthodaily-page-bg')||cs.backgroundColor||'').trim();
    }
    if(bg){
      d.style.backgroundColor=bg;
      b.style.backgroundColor=bg;
      var bd=document.getElementById('orthodaily-viewport-backdrop');
      if(bd)bd.style.backgroundColor=bg;
      var r=document.getElementById('root');
      if(r)r.style.backgroundColor=bg;
    }
  }
  function patchVv(){
    if(!ios()||!window.visualViewport||window.__orthodailyVvPatch)return;
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
    return el;
  }
  function applyIos(){
    var h=layoutH();
    if(h<=0)return;
    var d=document.documentElement,b=document.body,r=document.getElementById('root');
    d.classList.add(IOS_CLASS);
    d.style.setProperty('--app-height-px',h+'px');
    d.style.setProperty('--vh',layoutVh()+'px');
    d.style.setProperty('--app-height',h+'px');
    var bottom=0,nv=window.__orthodailyNativeVv;
    if(nv){bottom=Math.max(0,Math.floor(window.innerHeight-nv.height-nv.offsetTop));}
    d.style.setProperty('--safari-bottom-chrome',bottom+'px');
    var shell='height:'+h+'px;min-height:'+h+'px;max-height:'+h+'px;width:100%;margin:0;padding:0;overflow:hidden';
    d.style.height=h+'px';d.style.minHeight=h+'px';d.style.maxHeight=h+'px';d.style.width='100%';d.style.margin='0';d.style.padding='0';d.style.overflow='hidden';
    b.style.cssText='position:fixed;top:0;left:0;right:0;'+shell+';overscroll-behavior:none';
    var bd=ensureBackdrop();
    bd.style.cssText='position:fixed;top:0;left:0;right:0;height:'+h+'px;width:100%;z-index:0;pointer-events:none';
    if(r){r.style.cssText='position:fixed;top:0;left:0;right:0;'+shell+';display:flex;flex-direction:column;box-sizing:border-box;z-index:1';}
  }
  function sync(){
    try{
      patchVv();
      syncPageBackground();
      if(ios()){applyIos();}
      syncPageBackground();
    }catch(e){}
  }
  if(document.body){sync();}
  else{document.addEventListener('DOMContentLoaded',sync,{once:true});}
  window.addEventListener('resize',sync);
  window.addEventListener('orientationchange',sync);
  var nv=window.__orthodailyNativeVv;
  if(nv){nv.addEventListener('resize',sync);nv.addEventListener('scroll',sync);}
  if(window.visualViewport){
    window.visualViewport.addEventListener('resize',sync);
    window.visualViewport.addEventListener('scroll',sync);
  }
})();`;
