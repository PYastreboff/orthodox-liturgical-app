import { Platform } from 'react-native';

import { isIosSafariBrowser } from '../theme/webViewport';

/** iPhone Safari in the browser — scroll on html/body, not nested ScrollViews. */
export function useDocumentScrollWeb(): boolean {
  return Platform.OS === 'web' && isIosSafariBrowser();
}
