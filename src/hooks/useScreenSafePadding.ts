import { SCREEN_GUTTER_X, SCREEN_GUTTER_X_PHONE } from '../theme/layout';
import { useLayoutSafeAreaInsets } from './useLayoutSafeAreaInsets';
import { usePhoneLayout } from './usePhoneLayout';
import { useTabHeaderShown } from './useTabHeaderShown';

/** Scroll content insets — backgrounds fill the shell; content respects env(safe-area-*). */
export function useScreenSafePadding() {
  const insets = useLayoutSafeAreaInsets();
  const showTabHeader = useTabHeaderShown();
  const phoneLayout = usePhoneLayout();

  const paddingTop = showTabHeader ? 0 : insets.top;
  const gutterX = phoneLayout ? SCREEN_GUTTER_X_PHONE : SCREEN_GUTTER_X;

  return {
    paddingTop,
    paddingLeft: insets.left + gutterX,
    paddingRight: insets.right + gutterX,
    gutterX,
  };
}
