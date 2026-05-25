import { Platform } from 'react-native';

import { todayPageBackgroundColor } from '../lib/liturgical/vestmentGradient';
import { colors } from './tokens';
import { applyWebViewportMetrics } from './webViewport';

function pageBackground(isDark: boolean): string {
  return todayPageBackgroundColor(isDark);
}

/**
 * Match Safari / PWA chrome to the app (same color on html, body, backdrop, #root).
 */
export function syncWebDocumentTheme(isDark: boolean, chromeColor?: string): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;

  const bg = chromeColor ?? pageBackground(isDark);
  applyWebViewportMetrics(bg);

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

/**
 * Shell CSS after ScrollViewStyleReset — no height:100% on html (breaks viewport-fit=cover on iOS).
 */
export const WEB_ROOT_CSS = `
html {
  --app-height: 100dvh;
  --safari-bottom-chrome: 0px;
  width: 100%;
  margin: 0;
  padding: 0;
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
  margin: 0;
  padding: 0;
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
  margin: 0;
  padding: 0;
  background-color: ${colors.parchment};
  background-color: var(--orthodaily-page-bg, ${colors.parchment});
}
@media (prefers-color-scheme: dark) {
  #root {
    background-color: ${colors.darkBg};
    background-color: var(--orthodaily-page-bg, ${colors.darkBg});
  }
}
#orthodaily-viewport-backdrop {
  background-color: ${colors.parchment};
  background-color: var(--orthodaily-page-bg, ${colors.parchment});
}
@media (prefers-color-scheme: dark) {
  #orthodaily-viewport-backdrop {
    background-color: ${colors.darkBg};
    background-color: var(--orthodaily-page-bg, ${colors.darkBg});
  }
}
`;
