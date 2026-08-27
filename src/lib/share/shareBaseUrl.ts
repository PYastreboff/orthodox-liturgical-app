import Constants from 'expo-constants';

const DEFAULT_WEB_ORIGIN = 'https://pyastreboff.github.io/orthodox-liturgical-app';

/** App root URL for shared links (includes Expo `baseUrl` on web). */
export function getAppWebBaseUrl(): string {
  const basePath = (Constants.expoConfig?.experiments?.baseUrl as string | undefined) ?? '';
  if (typeof window !== 'undefined' && window.location?.origin) {
    const path = window.location.pathname.replace(/\/$/, '') || basePath.replace(/\/$/, '');
    return `${window.location.origin}${path}`;
  }
  const trimmed = basePath.replace(/\/$/, '');
  return trimmed ? `${DEFAULT_WEB_ORIGIN}${trimmed}` : DEFAULT_WEB_ORIGIN;
}
