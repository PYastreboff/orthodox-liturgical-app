import { Platform } from 'react-native';

import { todayPageBackgroundColor } from '../lib/liturgical/vestmentGradient';
import { colors } from './tokens';
import { applyWebViewportMetrics, IOS_WEB_CLASS } from './webViewport';

function pageBackground(isDark: boolean): string {
  return todayPageBackgroundColor(isDark);
}

export function syncWebDocumentTheme(isDark: boolean, chromeColor?: string): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;

  const bg = chromeColor ?? pageBackground(isDark);
  document.documentElement.style.setProperty('--orthodaily-page-bg', bg);
  applyWebViewportMetrics(bg);

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) {
    themeMeta.setAttribute('content', bg);
  }

  const appleStatus = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (appleStatus) {
    appleStatus.setAttribute('content', 'black-translucent');
  }
}

/**
 * Base document chrome. iOS uses --app-height-px (innerHeight); desktop uses 100dvh.
 */
export const WEB_ROOT_CSS = `
html {
  --app-height: 100dvh;
  --safari-bottom-chrome: 0px;
  --orthodaily-page-bg: ${colors.parchment};
  width: 100%;
  max-width: 100%;
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
html.${IOS_WEB_CLASS},
html.${IOS_WEB_CLASS} body {
  position: fixed !important;
  inset: 0 !important;
  width: 100% !important;
  max-width: 100% !important;
  min-height: 100lvh !important;
  min-height: 100dvh !important;
  height: var(--app-cover-height-px, 100%) !important;
  max-height: none !important;
  box-sizing: border-box;
}
html.${IOS_WEB_CLASS} #root {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: auto !important;
  width: 100% !important;
  max-width: 100% !important;
  height: var(--app-height-px, 100%) !important;
  min-height: var(--app-height-px, 100%) !important;
  max-height: var(--app-height-px, 100%) !important;
  box-sizing: border-box;
}
#orthodaily-viewport-backdrop {
  position: fixed !important;
  inset: 0 !important;
  min-height: 100lvh !important;
  min-height: 100dvh !important;
}
html:not(.${IOS_WEB_CLASS}) {
  min-height: 100dvh;
}
html:not(.${IOS_WEB_CLASS}) body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100dvh;
  background-color: var(--orthodaily-page-bg);
}
html:not(.${IOS_WEB_CLASS}) #root {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: var(--orthodaily-page-bg);
}
body {
  background-color: var(--orthodaily-page-bg);
}
#root {
  background-color: var(--orthodaily-page-bg);
}
#orthodaily-viewport-backdrop {
  background-color: var(--orthodaily-page-bg);
}
`;
