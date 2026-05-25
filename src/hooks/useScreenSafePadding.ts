import {
  SCREEN_GUTTER_X,
  SCREEN_GUTTER_X_CALENDAR,
  SCREEN_GUTTER_X_CALENDAR_PHONE,
  SCREEN_GUTTER_X_PHONE,
} from '../theme/layout';
import { useLayoutSafeAreaInsets } from './useLayoutSafeAreaInsets';
import { usePhoneLayout } from './usePhoneLayout';
import { useTabHeaderShown } from './useTabHeaderShown';

type Options = {
  /** Calendar tab uses a slightly narrower gutter on all breakpoints. */
  calendar?: boolean;
};

/** Scroll content insets — backgrounds fill the shell; content respects env(safe-area-*). */
export function useScreenSafePadding(options?: Options) {
  const insets = useLayoutSafeAreaInsets();
  const showTabHeader = useTabHeaderShown();
  const phoneLayout = usePhoneLayout();
  const calendar = options?.calendar === true;

  const paddingTop = showTabHeader ? 0 : insets.top;

  const gutterX = phoneLayout
    ? calendar
      ? SCREEN_GUTTER_X_CALENDAR_PHONE
      : SCREEN_GUTTER_X_PHONE
    : calendar
      ? SCREEN_GUTTER_X_CALENDAR
      : SCREEN_GUTTER_X;

  return {
    paddingTop,
    paddingLeft: insets.left + gutterX,
    paddingRight: insets.right + gutterX,
    gutterX,
  };
}
