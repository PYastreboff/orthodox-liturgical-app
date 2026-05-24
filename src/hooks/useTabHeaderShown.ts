import { Platform, useWindowDimensions } from 'react-native';

/** Match calendar “desktop” layout breakpoint. */
const DESKTOP_TAB_HEADER_MIN_WIDTH = 768;

/** Expo tab header (OrthoDaily Home / Calendar / Settings) — wide web only. */
export function useTabHeaderShown(): boolean {
  const { width } = useWindowDimensions();
  if (Platform.OS !== 'web') return false;
  return width >= DESKTOP_TAB_HEADER_MIN_WIDTH;
}
