import { useLayoutSafeAreaInsets } from './useLayoutSafeAreaInsets';
import {
  SCROLL_EXTRA_BOTTOM_PADDING,
  TAB_BAR_CONTENT_HEIGHT,
  TAB_BAR_EDGE_PAD_PX,
} from '../theme/layout';

/** Scroll padding so content clears the tab bar and home indicator. */
export function useTabBarBottomPadding(): number {
  const insets = useLayoutSafeAreaInsets();
  return TAB_BAR_CONTENT_HEIGHT + insets.bottom + TAB_BAR_EDGE_PAD_PX + SCROLL_EXTRA_BOTTOM_PADDING;
}
