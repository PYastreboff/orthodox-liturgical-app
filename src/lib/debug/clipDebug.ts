import {
  IOS_SAFARI_BROWSER_CLASS,
  IOS_WEB_CLASS,
  layoutViewportHeightPx,
  measureSafariBottomChrome,
  readWebSafeAreaInsets,
} from '../../theme/webViewport';

const OUTLINE = '2px dashed magenta';
const HIGHLIGHT_CLASS = 'orthodaily-clip-debug';

function isClipDebugEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return /[?&]debug=clip\b/.test(window.location.search);
}

function logViewportMetrics(): void {
  const doc = document.documentElement;
  const root = document.getElementById('root');
  const vv = window.visualViewport;
  const insets = readWebSafeAreaInsets();

  console.group('[OrthoDaily clip debug] viewport');
  console.table({
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    layoutHeight: layoutViewportHeightPx(),
    visualViewportHeight: vv?.height ?? null,
    visualViewportOffsetTop: vv?.offsetTop ?? null,
    safariBottomChrome: measureSafariBottomChrome(),
    safeAreaTop: insets.top,
    safeAreaBottom: insets.bottom,
    htmlClass: doc.className,
    isSafariBrowserShell: doc.classList.contains(IOS_SAFARI_BROWSER_CLASS),
    isFixedIosShell: doc.classList.contains(IOS_WEB_CLASS),
    rootHeight: root ? getComputedStyle(root).height : null,
    bodyOverflow: getComputedStyle(document.body).overflow,
    rootOverflow: root ? getComputedStyle(root).overflow : null,
  });
  console.groupEnd();
}

function clipsOverflow(style: CSSStyleDeclaration): boolean {
  return (
    style.overflow === 'hidden' ||
    style.overflow === 'clip' ||
    style.overflowY === 'hidden' ||
    style.overflowY === 'clip' ||
    style.overflowX === 'hidden' ||
    style.overflowX === 'clip'
  );
}

/** Walk up from a node and return ancestors that likely clip content. */
export function clippingAncestorsOf(el: Element | null): Element[] {
  if (!el) return [];
  const found: Element[] = [];
  let node: Element | null = el;
  while (node && node !== document.documentElement) {
    const style = getComputedStyle(node);
    if (clipsOverflow(style)) found.push(node);
    node = node.parentElement;
  }
  return found;
}

function highlightClippingElements(): void {
  document.querySelectorAll(`.${HIGHLIGHT_CLASS}`).forEach((el) => {
    el.classList.remove(HIGHLIGHT_CLASS);
    (el as HTMLElement).style.outline = '';
  });

  const suspects = new Set<Element>();
  document.querySelectorAll('body, #root, #root *').forEach((el) => {
    if (clipsOverflow(getComputedStyle(el))) suspects.add(el);
  });

  console.group(`[OrthoDaily clip debug] ${suspects.size} overflow:hidden/clip nodes`);
  suspects.forEach((el) => {
    const htmlEl = el as HTMLElement;
    const style = getComputedStyle(htmlEl);
    const rect = htmlEl.getBoundingClientRect();
    htmlEl.classList.add(HIGHLIGHT_CLASS);
    htmlEl.style.outline = OUTLINE;
    console.log(el.tagName, el.className?.slice?.(0, 80) ?? '', {
      overflow: style.overflow,
      overflowY: style.overflowY,
      height: style.height,
      maxHeight: style.maxHeight,
      top: Math.round(rect.top),
      bottom: Math.round(rect.bottom),
    });
  });
  console.groupEnd();
}

function installGlobalHelpers(): void {
  const w = window as Window & {
    __orthoClipAt?: (x: number, y: number) => void;
    __orthoClipRefresh?: () => void;
  };

  w.__orthoClipRefresh = () => {
    logViewportMetrics();
    highlightClippingElements();
  };

  /** Tap coordinates or center-top: __orthoClipAt(window.innerWidth/2, 40) */
  w.__orthoClipAt = (x: number, y: number) => {
    const stack = document.elementsFromPoint(x, y);
    const target = stack.find((el) => el.id !== 'orthodaily-clip-debug-banner') ?? stack[0];
    console.group(`[OrthoDaily clip debug] stack at (${x}, ${y})`);
    stack.slice(0, 8).forEach((el, i) => {
      const s = getComputedStyle(el);
      console.log(i, el, { overflow: s.overflow, height: s.height, maxHeight: s.maxHeight });
    });
    console.log('Clipping ancestors of top element:', clippingAncestorsOf(target));
    console.groupEnd();
  };
}

function showBanner(): void {
  if (document.getElementById('orthodaily-clip-debug-banner')) return;
  const banner = document.createElement('div');
  banner.id = 'orthodaily-clip-debug-banner';
  banner.textContent = 'clip debug — magenta = overflow hidden. Console: __orthoClipRefresh()';
  banner.style.cssText = [
    'position:fixed',
    'left:0',
    'right:0',
    'top:0',
    'z-index:99999',
    'padding:6px 10px',
    'padding-top:max(6px, env(safe-area-inset-top))',
    'font:11px/1.3 -apple-system, sans-serif',
    'background:rgba(120,0,120,0.92)',
    'color:#fff',
    'pointer-events:none',
  ].join(';');
  document.body.appendChild(banner);
}

/** Enable with ?debug=clip on the URL (e.g. after redeploy). */
export function installClipDebug(): void {
  if (!isClipDebugEnabled()) return;

  const run = () => {
    installGlobalHelpers();
    showBanner();
    logViewportMetrics();
    highlightClippingElements();
  };

  if (document.body) run();
  else document.addEventListener('DOMContentLoaded', run, { once: true });

  window.addEventListener('resize', () => logViewportMetrics());
}
