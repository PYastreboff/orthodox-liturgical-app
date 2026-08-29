import { MaterialTopTabBar, type MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { Platform, StyleSheet, View } from 'react-native';

import { TabBarBleedBackground } from './TabBarBleedBackground';
import { useLayoutSafeAreaInsets } from '../hooks/useLayoutSafeAreaInsets';
import { tabBarChrome } from '../theme/cards';
import { TAB_BAR_CONTENT_HEIGHT, TAB_BAR_EDGE_PAD_PX } from '../theme/layout';
import { tabBarFloatInsets } from '../theme/tabBarFloat';
import { isIosSafariBrowser } from '../theme/webViewport';
import { useResolvedColorScheme } from '../theme/useResolvedColorScheme';

export function tabBarBackground(isDark: boolean): string {
  return isDark ? 'rgba(24, 22, 20, 0.92)' : 'rgba(247, 243, 236, 0.92)';
}

function extraBottomPadPx(): number {
  if (Platform.OS === 'web') {
    return isIosSafariBrowser() ? 6 : TAB_BAR_EDGE_PAD_PX;
  }
  if (Platform.OS === 'android') return TAB_BAR_EDGE_PAD_PX + 1;
  return TAB_BAR_EDGE_PAD_PX;
}

/** Bottom-positioned floating pill tab bar (phone + web). */
export function MainTabBar(props: MaterialTopTabBarProps) {
  const isDark = useResolvedColorScheme() === 'dark';
  const insets = useLayoutSafeAreaInsets();
  const isNativePhone = Platform.OS !== 'web';
  const float = tabBarFloatInsets(isNativePhone, insets.bottom);
  const iosSafariBrowser = Platform.OS === 'web' && isIosSafariBrowser();
  const extraBottom = extraBottomPadPx();
  const tabBarBottomPad =
    extraBottom +
    (Platform.OS === 'android' && insets.bottom === 0 ? 8 : iosSafariBrowser ? 4 : 0);
  const tabBarHeight = TAB_BAR_CONTENT_HEIGHT + tabBarBottomPad;
  const tabBarBg = tabBarBackground(isDark);
  const chrome = tabBarChrome(isDark);

  return (
    <View
      style={[
        styles.floatingHost,
        {
          paddingHorizontal: float.horizontal,
          paddingBottom: float.hostBottomPad,
        },
      ]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.floatingBar,
          chrome,
          {
            height: tabBarHeight,
            paddingBottom: tabBarBottomPad,
          },
        ]}
      >
        <TabBarBleedBackground color={tabBarBg} bleedPx={extraBottom} />
        <MaterialTopTabBar {...props} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingHost: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'stretch',
    pointerEvents: 'box-none',
    zIndex: 10,
  },
  floatingBar: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? ({ boxShadow: 'none' } as const) : null),
  },
});
