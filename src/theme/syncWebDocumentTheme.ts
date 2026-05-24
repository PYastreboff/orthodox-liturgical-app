import { Platform } from 'react-native';

/** Let app screens paint edge-to-edge; avoids a solid gutter band under notch / home indicator. */
export function syncWebDocumentTheme(_isDark: boolean): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;

  document.documentElement.style.backgroundColor = 'transparent';
  document.body.style.backgroundColor = 'transparent';
  document.body.style.margin = '0';

  const root = document.getElementById('root');
  if (root) {
    root.style.backgroundColor = 'transparent';
    root.style.minHeight = '100dvh';
  }

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) {
    themeMeta.setAttribute('content', 'transparent');
  }

  const appleStatus = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (appleStatus) {
    appleStatus.setAttribute('content', 'black-translucent');
  }
}
