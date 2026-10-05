import { Platform, type TextStyle } from 'react-native';

/** New York on Apple platforms — the system reading serif used by Books and News. */
export const READING_SERIF = Platform.select({
  ios: 'ui-serif',
  android: 'serif',
  default: 'ui-serif, "New York", Georgia, "Times New Roman", serif',
});

/**
 * SF tightens display sizes natively; browsers rendering system-ui do not, so large
 * titles on web get the equivalent negative tracking (~-0.02em).
 */
export function largeTitleTracking(fontSize: number): TextStyle {
  return Platform.OS === 'web' ? { letterSpacing: -0.02 * fontSize } : { letterSpacing: 0 };
}
