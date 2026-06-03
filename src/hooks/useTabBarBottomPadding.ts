import { useLayoutSafeAreaInsets } from './useLayoutSafeAreaInsets';
import { SCROLL_EXTRA_BOTTOM_PADDING, TAB_BAR_CONTENT_HEIGHT } from '../theme/layout';

/** Scroll padding so content clears the tab bar and home indicator. */
export function useTabBarBottomPadding(): number {
  const insets = useLayoutSafeAreaInsets();
  return TAB_BAR_CONTENT_HEIGHT + insets.bottom + SCROLL_EXTRA_BOTTOM_PADDING;
}
