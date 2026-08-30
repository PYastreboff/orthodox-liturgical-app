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

/** Uniform inset from the bar’s rounded edge — same gap on top, bottom, and sides. */
const SELECTION_INSET = 5;
/** Extra width so the pill overlaps adjacent tab slots (within the inset layer). */
const SELECTION_OVERLAP_X = 8;

function selectionWidthForIndex(index: number, tabCount: number, slotWidth: number): number {
  if (slotWidth <= 0 || tabCount <= 0) return 0;
  if (tabCount === 1) return slotWidth;
  if (index === 0 || index === tabCount - 1) return slotWidth + SELECTION_OVERLAP_X;
  return slotWidth + SELECTION_OVERLAP_X * 2;
}

function selectionXForIndex(index: number, tabCount: number, slotWidth: number): number {
  if (slotWidth <= 0) return 0;
  if (index === 0) return 0;
  if (index === tabCount - 1) return index * slotWidth - SELECTION_OVERLAP_X;
  return index * slotWidth - SELECTION_OVERLAP_X;
}

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
  const innerBarWidth = Math.max(0, barWidth - SELECTION_INSET * 2);
  const slotWidth = tabCount > 0 ? innerBarWidth / tabCount : 0;
  const inputRange = state.routes.map((_, index) => index);
  const widthOutputRange =
    slotWidth > 0
      ? state.routes.map((_, index) => selectionWidthForIndex(index, tabCount, slotWidth))
      : state.routes.map(() => 0);
  const selectionWidth =
    slotWidth > 0
      ? position.interpolate({
          inputRange,
          outputRange: widthOutputRange,
          extrapolate: 'clamp',
        })
      : null;
  const outputRange =
    slotWidth > 0
      ? state.routes.map((_, index) => selectionXForIndex(index, tabCount, slotWidth))
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
            {selectionTranslateX && selectionWidth ? (
              <Animated.View
                style={[
                  styles.selectionFill,
                  {
                    width: selectionWidth,
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
    position: 'absolute',
    top: SELECTION_INSET,
    bottom: SELECTION_INSET,
    left: SELECTION_INSET,
    right: SELECTION_INSET,
  },
  selectionFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: radii.pill,
  },
});
