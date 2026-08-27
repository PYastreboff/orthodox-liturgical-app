import { MaterialTopTabBar, type MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { Platform, StyleSheet, View } from 'react-native';

import { TabBarBleedBackground } from './TabBarBleedBackground';
import { useLayoutSafeAreaInsets } from '../hooks/useLayoutSafeAreaInsets';
import { usePhoneLayout } from '../hooks/usePhoneLayout';
import { SAFARI_TAB_BAR_BLEED_PX, TAB_BAR_CONTENT_HEIGHT } from '../theme/layout';
import { isIosSafariBrowser } from '../theme/webViewport';
import { colors } from '../theme/tokens';
import { useResolvedColorScheme } from '../theme/useResolvedColorScheme';

function tabBarBackground(isDark: boolean, phoneLayout: boolean): string {
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

/** Extra paint past the screen bottom so a 1px seam never shows above the home indicator / chrome. */
function edgeBleedPx(phoneLayout: boolean): number {
  if (Platform.OS === 'web') {
    return phoneLayout || isIosSafariBrowser() ? SAFARI_TAB_BAR_BLEED_PX : 4;
  }
  if (Platform.OS === 'android') return 3;
  return phoneLayout ? 3 : 2;
}

/** Bottom-positioned material tab bar styled like the previous Expo Tabs bar. */
export function MainTabBar(props: MaterialTopTabBarProps) {
  const isDark = useResolvedColorScheme() === 'dark';
  const insets = useLayoutSafeAreaInsets();
  const phoneLayout = usePhoneLayout();
  const bottomInset = insets.bottom;
  const iosSafariBrowser = Platform.OS === 'web' && isIosSafariBrowser();
  const edgeBleed = edgeBleedPx(phoneLayout);
  const tabBarBottomPad =
    bottomInset +
    (Platform.OS === 'android' && bottomInset === 0 ? 8 : iosSafariBrowser ? 4 : 0);
  const tabBarHeight = TAB_BAR_CONTENT_HEIGHT + tabBarBottomPad + edgeBleed;
  const tabBarBg = tabBarBackground(isDark, phoneLayout);

  return (
    <View
      style={[
        styles.wrap,
        {
          height: tabBarHeight,
          paddingBottom: tabBarBottomPad + edgeBleed,
          bottom: -edgeBleed,
          backgroundColor: tabBarBg,
          borderTopColor: tabBarBorderColor(isDark),
        },
      ]}
    >
      <TabBarBleedBackground color={tabBarBg} bleedPx={edgeBleed} />
      <MaterialTopTabBar {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
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
