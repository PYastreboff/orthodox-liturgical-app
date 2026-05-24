import { Platform } from 'react-native';

import { todayPageBackgroundColor } from '../lib/liturgical/vestmentGradient';
import { colors } from './tokens';
import { applyWebViewportHeight } from './webViewport';

function pageBackground(isDark: boolean): string {
  return todayPageBackgroundColor(isDark);
}

/**
 * Match Safari / PWA chrome to the app (same color on html, body, #root).
 * Layout height is handled by installWebViewportShell (--app-height).
 */
export function syncWebDocumentTheme(isDark: boolean, chromeColor?: string): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;

  applyWebViewportHeight();

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

/** Initial paint + iOS PWA shell (100dvh default; JS sets 100vh in standalone). */
export const WEB_ROOT_CSS = `
html {
  --app-height: 100dvh;
  height: 100%;
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
  position: fixed;
  inset: 0;
  width: 100%;
  height: var(--app-height, 100dvh);
  margin: 0;
  overflow: hidden;
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
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 100%;
  overflow: hidden;
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
