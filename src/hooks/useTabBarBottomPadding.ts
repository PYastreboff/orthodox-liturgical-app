import { useLayoutSafeAreaInsets } from './useLayoutSafeAreaInsets';
import { useSafariBottomChromeInset } from './useSafariBottomChromeInset';
import { SCROLL_EXTRA_BOTTOM_PADDING, TAB_BAR_CONTENT_HEIGHT } from '../theme/layout';

/** Scroll padding so content clears the tab bar (+ Safari toolbar when in browser). */
export function useTabBarBottomPadding(): number {
  const insets = useLayoutSafeAreaInsets();
  const safariChrome = useSafariBottomChromeInset();
  return (
    TAB_BAR_CONTENT_HEIGHT +
    insets.bottom +
    safariChrome +
    SCROLL_EXTRA_BOTTOM_PADDING
  );
}
