import { Platform } from 'react-native';

const BACKDROP_ID = 'orthodaily-viewport-backdrop';
/** Fixed innerHeight shell — iOS installed web app only. */
export const IOS_WEB_CLASS = 'orthodaily-ios-web';
/** Natural 100dvh scroll — iOS Safari in the browser (like a normal website). */
export const IOS_SAFARI_BROWSER_CLASS = 'orthodaily-safari-browser';

let nativeVisualViewport: VisualViewport | null = null;

export function getNativeVisualViewport(): VisualViewport | null {
  if (typeof window === 'undefined') return null;
  return nativeVisualViewport ?? window.visualViewport ?? null;
}

function isIosWebStandalone(): boolean {
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
  if (typeof window === 'undefined' || !isIosMobileWeb() || isIosSafariBrowser()) return;
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
    horizontal ? `width:env(${edge}, constant(${edge}, 0px))` : 'width:0',
    horizontal ? 'height:0' : `height:env(${edge}, constant(${edge}, 0px))`,
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
  doc.style.setProperty('--safari-bottom-chrome', '0px');
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

function clearFixedWebShellStyles(doc: HTMLElement, body: HTMLElement, root: HTMLElement | null): void {
  doc.classList.remove(IOS_WEB_CLASS);
  doc.style.removeProperty('--app-height-px');
  doc.style.removeProperty('--vh');
  doc.style.setProperty('--app-height', '100dvh');
  doc.style.setProperty('--safari-bottom-chrome', '0px');
  doc.style.removeProperty('height');
  doc.style.removeProperty('min-height');
  doc.style.removeProperty('max-height');
  doc.style.removeProperty('overflow');

  body.style.position = '';
  body.style.top = '';
  body.style.left = '';
  body.style.right = '';
  body.style.width = '';
  body.style.height = '';
  body.style.minHeight = '100dvh';
  body.style.maxHeight = '';
  body.style.margin = '0';
  body.style.padding = '0';
  body.style.overflow = 'hidden';
  body.style.overscrollBehavior = 'none';

  if (root) {
    root.style.position = '';
    root.style.top = '';
    root.style.left = '';
    root.style.right = '';
    root.style.width = '100%';
    root.style.height = '';
    root.style.minHeight = '100dvh';
    root.style.maxHeight = '';
    root.style.margin = '0';
    root.style.padding = '0';
    root.style.display = 'flex';
    root.style.flexDirection = 'column';
    root.style.boxSizing = 'border-box';
    root.style.overflow = 'hidden';
    root.style.zIndex = '1';
  }
}

function applySafariBrowserShell(pageBackground?: string): void {
  const doc = document.documentElement;
  const body = document.body;
  const root = document.getElementById('root');

  doc.classList.remove(IOS_WEB_CLASS);
  doc.classList.add(IOS_SAFARI_BROWSER_CLASS);
  doc.style.removeProperty('--app-height-px');
  doc.style.removeProperty('--vh');
  doc.style.setProperty('--app-height', '100dvh');
  doc.style.setProperty('--safari-bottom-chrome', '0px');
  doc.style.width = '100%';
  doc.style.margin = '0';
  doc.style.padding = '0';
  doc.style.height = '100%';
  doc.style.minHeight = '100dvh';
  doc.style.maxHeight = 'none';
  doc.style.overflowX = 'hidden';
  doc.style.overflowY = 'auto';
  doc.style.setProperty('-webkit-overflow-scrolling', 'touch');

  const insets = readWebSafeAreaInsets();
  doc.style.setProperty('--safe-area-top', `${insets.top}px`);
  doc.style.setProperty('--safe-area-bottom', `${insets.bottom}px`);

  body.style.position = '';
  body.style.top = '';
  body.style.left = '';
  body.style.right = '';
  body.style.width = '100%';
  body.style.height = 'auto';
  body.style.minHeight = '100%';
  body.style.maxHeight = 'none';
  body.style.margin = '0';
  body.style.padding = '0';
  body.style.overflow = 'visible';
  body.style.overscrollBehavior = 'auto';
  body.style.backgroundColor = 'transparent';

  if (root) {
    root.style.position = '';
    root.style.top = '';
    root.style.left = '';
    root.style.right = '';
    root.style.width = '100%';
    root.style.height = 'auto';
    root.style.minHeight = '100%';
    root.style.maxHeight = 'none';
    root.style.margin = '0';
    root.style.padding = '0';
    root.style.display = 'flex';
    root.style.flexDirection = 'column';
    root.style.flex = 'none';
    root.style.boxSizing = 'border-box';
    root.style.overflow = 'visible';
    root.style.zIndex = '0';
    root.style.backgroundColor = 'transparent';
  }

  const bg = pageBackground ?? readPageBackground();
  const backdrop = ensureViewportBackdrop();
  backdrop.style.cssText = [
    'position:fixed',
    'top:0',
    'left:0',
    'right:0',
    'bottom:0',
    'width:100%',
    'height:100%',
    'min-height:100dvh',
    'min-height:-webkit-fill-available',
    'z-index:-1',
    'pointer-events:none',
    bg ? `background-color:${bg}` : '',
  ]
    .filter(Boolean)
    .join(';');

  if (bg) {
    doc.style.backgroundColor = bg;
  }

  requestAnimationFrame(unlockSafariDocumentScroll);
}

/** RN tab shells use overflow:hidden + flex:1; unlock so html can scroll. */
export function unlockSafariDocumentScroll(): void {
  if (!isIosSafariBrowser()) return;
  const root = document.getElementById('root');
  if (!root) return;

  root.querySelectorAll('*').forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    const role = node.getAttribute('role');
    if (role === 'tablist' || role === 'tab') return;

    const style = getComputedStyle(node);
    if (style.position === 'fixed' || style.position === 'absolute') return;

    if (style.overflow === 'hidden' || style.overflowY === 'hidden') {
      node.style.setProperty('overflow', 'visible', 'important');
      node.style.setProperty('overflow-y', 'visible', 'important');
    }

    if (style.flex.startsWith('1') && style.height !== 'auto') {
      node.style.setProperty('flex', 'none', 'important');
      node.style.setProperty('height', 'auto', 'important');
      node.style.setProperty('max-height', 'none', 'important');
    }
  });
}

function applyDesktopWebShell(pageBackground?: string): void {
  const doc = document.documentElement;
  const body = document.body;
  const root = document.getElementById('root');
  clearFixedWebShellStyles(doc, body, root);

  const backdrop = ensureViewportBackdrop();
  backdrop.style.cssText = [
    'position:fixed',
    'inset:0',
    'width:100%',
    'min-height:100dvh',
    'z-index:-1',
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

  const doc = document.documentElement;

  if (isIosSafariBrowser()) {
    applySafariBrowserShell(pageBackground);
    return;
  }

  doc.classList.remove(IOS_SAFARI_BROWSER_CLASS);
  doc.style.removeProperty('--safe-area-top');
  doc.style.removeProperty('--safe-area-bottom');

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

  if (!isIosSafariBrowser()) {
    installVisualViewportLayoutPatch();
  }
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
  var SAFARI_CLASS='orthodaily-safari-browser';
  function ios(){return /iPhone|iPad|iPod/i.test(navigator.userAgent||'');}
  function safariBrowser(){
    if(!ios())return false;
    var nav=navigator;
    if(nav.standalone===true)return false;
    try{return !window.matchMedia('(display-mode: standalone)').matches;}catch(e){return true;}
  }
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
    if(!ios()||safariBrowser()||!window.visualViewport||window.__orthodailyVvPatch)return;
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
  function applyNaturalShell(){
    var d=document.documentElement,b=document.body,r=document.getElementById('root');
    d.classList.remove(IOS_CLASS);
    d.classList.add(SAFARI_CLASS);
    d.style.removeProperty('--app-height-px');
    d.style.removeProperty('--vh');
    d.style.setProperty('--app-height','100dvh');
    d.style.setProperty('--safari-bottom-chrome','0px');
    d.style.width='100%';
    d.style.margin='0';
    d.style.padding='0';
    d.style.height='100%';
    d.style.minHeight='100dvh';
    d.style.maxHeight='none';
    d.style.overflowX='hidden';
    d.style.overflowY='auto';
    d.style.webkitOverflowScrolling='touch';
    b.style.cssText='margin:0;padding:0;width:100%;height:auto;min-height:100%;max-height:none;overflow:visible;overscroll-behavior:auto;background:transparent';
    if(r){r.style.cssText='margin:0;padding:0;width:100%;height:auto;min-height:100%;max-height:none;display:flex;flex-direction:column;flex:none;box-sizing:border-box;overflow:visible;z-index:0;background:transparent';}
    var bd=ensureBackdrop();
    bd.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;width:100%;height:100%;min-height:100dvh;min-height:-webkit-fill-available;z-index:-1;pointer-events:none';
  }
  function applyIos(){
    var h=layoutH();
    if(h<=0)return;
    var d=document.documentElement,b=document.body,r=document.getElementById('root');
    d.classList.remove(SAFARI_CLASS);
    d.classList.add(IOS_CLASS);
    d.style.setProperty('--app-height-px',h+'px');
    d.style.setProperty('--vh',layoutVh()+'px');
    d.style.setProperty('--app-height',h+'px');
    d.style.setProperty('--safari-bottom-chrome','0px');
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
      if(safariBrowser()){applyNaturalShell();}
      else if(ios()){applyIos();}
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
