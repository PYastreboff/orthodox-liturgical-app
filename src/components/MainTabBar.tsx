import { MaterialTopTabBar, type MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { useState } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

import { TabBarBleedBackground } from './TabBarBleedBackground';
import { useLayoutSafeAreaInsets } from '../hooks/useLayoutSafeAreaInsets';
import { useVestmentAccent } from '../state/VestmentAccentContext';
import { tabBarChrome } from '../theme/cards';
import { TAB_BAR_CONTENT_HEIGHT, TAB_BAR_EDGE_PAD_PX } from '../theme/layout';
import { colors, radii } from '../theme/tokens';
import { tabBarFloatInsets } from '../theme/tabBarFloat';
import { useResolvedColorScheme } from '../theme/useResolvedColorScheme';

export function tabBarBackground(isDark: boolean): string {
  return isDark ? colors.darkSurface : colors.card;
}

const SELECTION_INSET_X = 3;
const SELECTION_INSET_Y = 5;

/** Bottom-positioned floating pill tab bar (phone + web). */
export function MainTabBar(props: MaterialTopTabBarProps) {
  const { position, state } = props;
  const isDark = useResolvedColorScheme() === 'dark';
  const insets = useLayoutSafeAreaInsets();
  const vestmentAccent = useVestmentAccent();
  const isNativePhone = Platform.OS !== 'web';
  const float = tabBarFloatInsets(isNativePhone, insets.bottom);
  const tabBarBg = tabBarBackground(isDark);
  const chrome = tabBarChrome(isDark);
  const [barWidth, setBarWidth] = useState(0);
  const tabCount = state.routes.length;
  const slotWidth = tabCount > 0 ? barWidth / tabCount : 0;
  const inputRange = state.routes.map((_, index) => index);
  const outputRange =
    slotWidth > 0
      ? state.routes.map((_, index) => index * slotWidth + SELECTION_INSET_X)
      : state.routes.map(() => 0);
  const selectionTranslateX =
    slotWidth > 0
      ? position.interpolate({
          inputRange,
          outputRange,
          extrapolate: 'clamp',
        })
      : null;

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
          { height: TAB_BAR_CONTENT_HEIGHT },
        ]}
      >
        <TabBarBleedBackground color={tabBarBg} bleedPx={TAB_BAR_EDGE_PAD_PX} />
        <View
          style={styles.tabBarRow}
          onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
        >
          <View pointerEvents="none" style={styles.selectionLayer}>
            {selectionTranslateX ? (
              <Animated.View
                style={[
                  styles.selectionFill,
                  {
                    width: slotWidth - SELECTION_INSET_X * 2,
                    backgroundColor: vestmentAccent.accentSoft,
                    transform: [{ translateX: selectionTranslateX }],
                  },
                ]}
              />
            ) : null}
          </View>
          <MaterialTopTabBar {...props} />
        </View>
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
  tabBarRow: {
    flex: 1,
    width: '100%',
    alignItems: 'stretch',
  },
  selectionLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  selectionFill: {
    position: 'absolute',
    top: SELECTION_INSET_Y,
    bottom: SELECTION_INSET_Y,
    borderRadius: radii.pill,
  },
});
