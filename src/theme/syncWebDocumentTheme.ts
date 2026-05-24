import { Platform } from 'react-native';

import { todayPageBackgroundColor } from '../lib/liturgical/vestmentGradient';
import { colors } from './tokens';

const BACKDROP_ID = 'orthodaily-safe-area-backdrop';

function pageBackground(isDark: boolean): string {
  return todayPageBackgroundColor(isDark);
}

function ensureSafeAreaBackdrop(): HTMLElement {
  if (typeof document === 'undefined') {
    throw new Error('document unavailable');
  }
  let backdrop = document.getElementById(BACKDROP_ID);
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = BACKDROP_ID;
    backdrop.setAttribute('aria-hidden', 'true');
    const style = backdrop.style;
    style.position = 'fixed';
    style.left = '0';
    style.right = '0';
    style.top = 'calc(-1 * env(safe-area-inset-top, 0px))';
    style.bottom = 'calc(-1 * env(safe-area-inset-bottom, 0px))';
    style.zIndex = '-1';
    style.pointerEvents = 'none';
    document.body.insertBefore(backdrop, document.body.firstChild);
  }
  return backdrop;
}

/**
 * Paint Safari / PWA chrome (notch, home bar, overscroll) with app colors.
 * Never use transparent — iOS shows white behind translucent UI.
 */
export function syncWebDocumentTheme(isDark: boolean, chromeColor?: string): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;

  const bg = chromeColor ?? pageBackground(isDark);

  document.documentElement.style.backgroundColor = bg;
  document.body.style.backgroundColor = bg;
  document.body.style.margin = '0';

  const root = document.getElementById('root');
  if (root) {
    root.style.backgroundColor = bg;
    root.style.minHeight = '100dvh';
  }

  const backdrop = ensureSafeAreaBackdrop();
  backdrop.style.backgroundColor = bg;

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) {
    themeMeta.setAttribute('content', bg);
  }

  const appleStatus = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (appleStatus) {
    appleStatus.setAttribute('content', 'black-translucent');
  }

  document.documentElement.style.setProperty('--orthodaily-page-bg', bg);
}

/** Initial paint in +html before React hydrates (matches tokens). */
export const WEB_ROOT_CSS = `
html {
  height: 100%;
  background-color: ${colors.parchment};
  background-color: var(--orthodaily-page-bg, ${colors.parchment});
}
@media (prefers-color-scheme: dark) {
  html {
    background-color: ${colors.darkBg};
    background-color: var(--orthodaily-page-bg, ${colors.darkBg});
  }
}
body {
  height: 100%;
  margin: 0;
  overflow: hidden;
  background-color: ${colors.parchment};
  background-color: var(--orthodaily-page-bg, ${colors.parchment});
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: ${colors.darkBg};
    background-color: var(--orthodaily-page-bg, ${colors.darkBg});
  }
}
#root {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 100%;
  min-height: 100dvh;
  background-color: ${colors.parchment};
  background-color: var(--orthodaily-page-bg, ${colors.parchment});
}
@media (prefers-color-scheme: dark) {
  #root {
    background-color: ${colors.darkBg};
    background-color: var(--orthodaily-page-bg, ${colors.darkBg});
  }
}
`;
