import { Platform } from 'react-native';

import { isIosWebStandalone } from '../theme/webViewport';
import { useLayoutSafeAreaInsets } from './useLayoutSafeAreaInsets';
import { usePhoneLayout } from './usePhoneLayout';
import { useTabHeaderShown } from './useTabHeaderShown';

/** Scroll content insets — backgrounds fill the shell; text stays readable. */
export function useScreenSafePadding() {
  const insets = useLayoutSafeAreaInsets();
  const showTabHeader = useTabHeaderShown();
  const phoneLayout = usePhoneLayout();

  let paddingTop = showTabHeader ? 0 : insets.top;
  if (phoneLayout && Platform.OS === 'web' && !isIosWebStandalone()) {
    // Safari browser: shell is pinned to visualViewport; only a small content inset.
    paddingTop = 12;
  }

  return {
    paddingTop,
    paddingLeft: insets.left,
    paddingRight: insets.right,
  };
}
