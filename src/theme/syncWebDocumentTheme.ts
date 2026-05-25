import { Platform } from 'react-native';

import { todayPageBackgroundColor } from '../lib/liturgical/vestmentGradient';
import { colors } from './tokens';
import { applyWebViewportMetrics } from './webViewport';

function pageBackground(isDark: boolean): string {
  return todayPageBackgroundColor(isDark);
}

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
 * Base document chrome. iOS shell dimensions are set in JS (applyWebViewportMetrics).
 */
export const WEB_ROOT_CSS = `
html {
  --app-height: 100dvh;
  --safari-bottom-chrome: 0px;
  --orthodaily-page-bg: ${colors.parchment};
  width: 100%;
  margin: 0;
  padding: 0;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
  background-color: ${colors.parchment};
  background-color: var(--orthodaily-page-bg);
}
@media (prefers-color-scheme: dark) {
  html {
    --orthodaily-page-bg: ${colors.darkBg};
    background-color: ${colors.darkBg};
  }
}
html.orthodaily-ios-web {
  min-height: var(--orthodaily-shell-height, 100%);
  height: var(--orthodaily-shell-height, 100%) !important;
  max-height: var(--orthodaily-shell-height, 100%);
  overflow: hidden;
}
html.orthodaily-ios-web body,
html.orthodaily-ios-web #root {
  height: var(--orthodaily-shell-height, 100%) !important;
  min-height: var(--orthodaily-shell-height, 100%) !important;
  max-height: var(--orthodaily-shell-height, 100%) !important;
}
body {
  margin: 0;
  padding: 0;
  width: 100%;
  background-color: ${colors.parchment};
  background-color: var(--orthodaily-page-bg);
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: ${colors.darkBg};
  }
}
html:not(.orthodaily-ios-web) body {
  min-height: 100dvh;
  min-height: -webkit-fill-available;
}
#root {
  margin: 0;
  padding: 0;
  width: 100%;
  background-color: ${colors.parchment};
  background-color: var(--orthodaily-page-bg);
}
@media (prefers-color-scheme: dark) {
  #root {
    background-color: ${colors.darkBg};
  }
}
html:not(.orthodaily-ios-web) #root {
  min-height: 100dvh;
  min-height: -webkit-fill-available;
  display: flex;
  flex-direction: column;
}
#orthodaily-viewport-backdrop {
  background-color: ${colors.parchment};
  background-color: var(--orthodaily-page-bg);
}
@media (prefers-color-scheme: dark) {
  #orthodaily-viewport-backdrop {
    background-color: ${colors.darkBg};
  }
}
`;
