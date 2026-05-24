import { useWebScrollBottomInset } from './useLayoutSafeAreaInsets';
import { SCROLL_EXTRA_BOTTOM_PADDING, TAB_BAR_CONTENT_HEIGHT } from '../theme/layout';

/**
 * Scroll content padding so the last lines clear the floating tab bar.
 * iOS standalone PWA: no extra home-indicator gap (layout uses full 100vh).
 */
export function useTabBarBottomPadding(): number {
  const scrollBottomInset = useWebScrollBottomInset();
  return TAB_BAR_CONTENT_HEIGHT + scrollBottomInset + SCROLL_EXTRA_BOTTOM_PADDING;
}
