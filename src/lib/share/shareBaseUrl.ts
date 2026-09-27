import Constants from 'expo-constants';

import { buildAppWebBaseUrl } from './appWebBase';

/** App root URL for shared links (includes Expo `baseUrl`). */
export function getAppWebBaseUrl(): string {
  const basePath = (Constants.expoConfig?.experiments?.baseUrl as string | undefined) ?? '';
  const location = typeof window !== 'undefined' ? window.location : undefined;
  return buildAppWebBaseUrl({
    basePath,
    webOrigin: location?.origin,
    webPathname: location?.pathname,
  });
}
