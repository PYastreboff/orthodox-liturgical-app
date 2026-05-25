import { Platform } from 'react-native';

import { todayPageBackgroundColor } from '../lib/liturgical/vestmentGradient';
import { colors } from './tokens';
import { applyWebViewportMetrics } from './webViewport';

function pageBackground(isDark: boolean): string {
  return todayPageBackgroundColor(isDark);
}

/**
 * Match Safari / PWA chrome to the app (same color on html, body, #root).
 * Layout height is handled by installWebViewportShell (--app-height).
 */
export function syncWebDocumentTheme(isDark: boolean, chromeColor?: string): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;

  applyWebViewportMetrics();

  const bg = chromeColor ?? pageBackground(isDark);

  document.documentElement.style.backgroundColor = bg;
  document.body.style.backgroundColor = bg;
  document.documentElement.style.setProperty('--orthodaily-page-bg', bg);

  const root = document.getElementById('root');
  if (root) {
    root.style.backgroundColor = bg;
  }

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) {
    themeMeta.setAttribute('content', bg);
  }

  const appleStatus = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (appleStatus) {
    appleStatus.setAttribute('content', 'black-translucent');
  }
}

/** Overrides expo ScrollViewStyleReset — must load after that reset in +html. */
export const WEB_ROOT_CSS = `
html {
  --app-height: 100dvh;
  --safari-bottom-chrome: 0px;
  height: 100%;
  height: var(--app-height, 100dvh);
  min-height: var(--app-height, 100dvh);
  width: 100%;
  margin: 0;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
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
  position: fixed !important;
  inset: 0 !important;
  width: 100% !important;
  margin: 0 !important;
  overflow: hidden !important;
  overscroll-behavior: none;
  -webkit-overflow-scrolling: touch;
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
  position: absolute !important;
  inset: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  width: 100% !important;
  height: 100% !important;
  min-height: 100% !important;
  overflow: hidden !important;
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
