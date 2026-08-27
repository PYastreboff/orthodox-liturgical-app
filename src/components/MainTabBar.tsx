import { MaterialTopTabBar, type MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { Platform, StyleSheet, View } from 'react-native';

import { TabBarBleedBackground } from './TabBarBleedBackground';
import { useLayoutSafeAreaInsets } from '../hooks/useLayoutSafeAreaInsets';
import { usePhoneLayout } from '../hooks/usePhoneLayout';
import { TAB_BAR_CONTENT_HEIGHT, TAB_BAR_EDGE_PAD_PX } from '../theme/layout';
import { isIosSafariBrowser } from '../theme/webViewport';
import { colors } from '../theme/tokens';
import { useResolvedColorScheme } from '../theme/useResolvedColorScheme';

export function tabBarBackground(isDark: boolean, phoneLayout: boolean): string {
  if (isDark) {
    return phoneLayout ? colors.darkSurface : 'rgba(28, 24, 20, 0.92)';
  }
  return phoneLayout ? colors.parchment : 'rgba(245, 240, 232, 0.92)';
}

function tabBarBorderColor(isDark: boolean): string {
  if (isDark) {
    return 'rgba(46, 40, 34, 0.92)';
  }
  return 'rgba(226, 216, 202, 0.92)';
}

/**
 * Extra bottom pad so the bar always paints past sub-pixel / home-indicator seams.
 * (Parent TabView uses overflow:hidden, so negative `bottom` bleed is clipped.)
 */
function extraBottomPadPx(): number {
  if (Platform.OS === 'web') {
    return isIosSafariBrowser() ? 6 : TAB_BAR_EDGE_PAD_PX;
  }
  if (Platform.OS === 'android') return TAB_BAR_EDGE_PAD_PX + 1;
  return TAB_BAR_EDGE_PAD_PX;
}

/** Bottom-positioned material tab bar styled like the previous Expo Tabs bar. */
export function MainTabBar(props: MaterialTopTabBarProps) {
  const isDark = useResolvedColorScheme() === 'dark';
  const insets = useLayoutSafeAreaInsets();
  const phoneLayout = usePhoneLayout();
  const bottomInset = insets.bottom;
  const iosSafariBrowser = Platform.OS === 'web' && isIosSafariBrowser();
  const extraBottom = extraBottomPadPx();
  const tabBarBottomPad =
    bottomInset +
    extraBottom +
    (Platform.OS === 'android' && bottomInset === 0 ? 8 : iosSafariBrowser ? 4 : 0);
  const tabBarHeight = TAB_BAR_CONTENT_HEIGHT + tabBarBottomPad;
  const tabBarBg = tabBarBackground(isDark, phoneLayout);

  return (
    <View
      style={[
        styles.wrap,
        {
          height: tabBarHeight,
          paddingBottom: tabBarBottomPad,
          backgroundColor: tabBarBg,
          borderTopColor: tabBarBorderColor(isDark),
        },
      ]}
    >
      <TabBarBleedBackground color={tabBarBg} bleedPx={extraBottom} />
      <MaterialTopTabBar {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    shadowRadius: 0,
    overflow: 'visible',
    ...(Platform.OS === 'web' ? ({ boxShadow: 'none' } as const) : null),
  },
});
