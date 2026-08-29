import Constants from 'expo-constants';

/** User-facing app version — native store version when available, else app config. */
export function getAppVersion(): string {
  const native = Constants.nativeApplicationVersion?.trim();
  if (native) return native;

  const config = Constants.expoConfig?.version?.trim();
  if (config) return config;

  return '0.1.0';
}
