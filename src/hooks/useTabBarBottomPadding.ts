import { Platform } from 'react-native';
import { useLayoutSafeAreaInsets } from './useLayoutSafeAreaInsets';
import {
  SCROLL_EXTRA_BOTTOM_PADDING,
  TAB_BAR_CONTENT_HEIGHT,
  TAB_BAR_EDGE_PAD_PX,
} from '../theme/layout';
import { tabBarFloatScrollExtra } from '../theme/tabBarFloat';

/** Scroll padding so content clears the floating tab bar and home indicator. */
export function useTabBarBottomPadding(): number {
  const insets = useLayoutSafeAreaInsets();
  const isNativePhone = Platform.OS !== 'web';
  const floatGap = tabBarFloatScrollExtra(isNativePhone);
  return (
    TAB_BAR_CONTENT_HEIGHT +
    insets.bottom +
    floatGap +
    TAB_BAR_EDGE_PAD_PX +
    SCROLL_EXTRA_BOTTOM_PADDING
  );
}

/** Space from the screen bottom to just above the floating tab bar, plus optional margin. */
export function useTabBarClearance(extraMargin = 12): number {
  const insets = useLayoutSafeAreaInsets();
  const isNativePhone = Platform.OS !== 'web';
  const floatGap = tabBarFloatScrollExtra(isNativePhone);
  return TAB_BAR_CONTENT_HEIGHT + insets.bottom + floatGap + extraMargin;
}
