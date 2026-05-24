import { Platform } from 'react-native';

import { colors } from './tokens';

/** Match `html` / `body` / `#root` to the app so notch and home-indicator gutters are not white. */
export function syncWebDocumentTheme(isDark: boolean): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;

  const background = isDark ? colors.darkBg : colors.parchment;
  const themeColor = isDark ? colors.darkBg : colors.parchment;

  document.documentElement.style.backgroundColor = background;
  document.body.style.backgroundColor = background;
  document.body.style.margin = '0';

  const root = document.getElementById('root');
  if (root) {
    root.style.backgroundColor = background;
    root.style.minHeight = '100dvh';
  }

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) {
    themeMeta.setAttribute('content', themeColor);
  }

  const appleStatus = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (appleStatus) {
    appleStatus.setAttribute('content', isDark ? 'black-translucent' : 'default');
  }
}
