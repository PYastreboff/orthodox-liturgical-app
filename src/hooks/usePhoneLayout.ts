import { Platform, useWindowDimensions } from 'react-native';

/** Match tab header / desktop breakpoint — native is always phone layout. */
const PHONE_MAX_WIDTH = 768;

export function usePhoneLayout(): boolean {
  const { width } = useWindowDimensions();
  if (Platform.OS !== 'web') return true;
  return width < PHONE_MAX_WIDTH;
}
