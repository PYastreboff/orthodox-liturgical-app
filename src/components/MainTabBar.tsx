import { MaterialTopTabBar, type MaterialTopTabBarProps } from "expo-router/js-top-tabs";
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

import { TabBarBleedBackground } from './TabBarBleedBackground';
import { useLayoutSafeAreaInsets } from '../hooks/useLayoutSafeAreaInsets';
import { useLiturgicalVestmentAccent } from '../state/VestmentAccentContext';
import { tabBarScrollStore } from '../state/tabBarScrollStore';
import { staticAppAccent } from '../lib/liturgical/vestmentAccent';
import { tabBarChrome } from '../theme/cards';
import { TAB_BAR_EDGE_PAD_PX } from '../theme/layout';
import { colors, radii } from '../theme/tokens';
import { tabBarFloatInsets } from '../theme/tabBarFloat';
import { useResolvedColorScheme } from '../theme/useResolvedColorScheme';

export function tabBarBackground(isDark: boolean): string {
  return isDark ? colors.darkSurface : colors.card;
}

const SELECTION_INSET = 5;

/** Bottom-positioned floating pill tab bar (phone + web). */
export function MainTabBar(props: MaterialTopTabBarProps) {
  const { position, state } = props;
  const isDark = useResolvedColorScheme() === 'dark';
  const insets = useLayoutSafeAreaInsets();
  const liturgicalAccent = useLiturgicalVestmentAccent();
  const accent = state.index === 0 ? liturgicalAccent : staticAppAccent(isDark);
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
      ? state.routes.map((_, index) => index * slotWidth + SELECTION_INSET)
      : state.routes.map(() => 0);
  const selectionTranslateX =
    slotWidth > 0
      ? position.interpolate({
          inputRange,
          outputRange,
          extrapolate: 'clamp',
        })
      : null;

  const activeRoute = state.routes[Math.max(0, state.index)]?.name ?? 'index';
  const activeScrolled = useSyncExternalStore(
    tabBarScrollStore.subscribe,
    () => tabBarScrollStore.isScrolledDown(activeRoute),
  );
  const [shrinkProgress] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(shrinkProgress, {
      toValue: activeScrolled ? 1 : 0,
      duration: 160,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [activeScrolled, shrinkProgress]);
  const barScale = shrinkProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.92],
  });

  const inactiveTint = isDark ? '#7a746e' : colors.muted;
  const descriptors = useMemo(() => {
    const next = { ...props.descriptors };
    for (const key of Object.keys(next)) {
      next[key] = {
        ...next[key],
        options: {
          ...next[key].options,
          tabBarActiveTintColor: accent.icon,
          tabBarInactiveTintColor: inactiveTint,
        },
      };
    }
    return next;
  }, [props.descriptors, accent, inactiveTint]);

  return (
      <View
        style={[
          styles.floatingHost,
          {
            paddingHorizontal: float.horizontal,
            paddingBottom: float.hostBottomPad,
          },
        ]}
      >
      <Animated.View
        style={[
          styles.floatingBar,
          chrome,
          { transform: [{ scale: barScale }] },
        ]}
        onTouchStart={() => tabBarScrollStore.touchReset()}
      >
        <TabBarBleedBackground color={tabBarBg} bleedPx={TAB_BAR_EDGE_PAD_PX} />
        <View
          style={styles.tabBarRow}
          onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
        >
          <View style={styles.selectionLayer}>
            {selectionTranslateX ? (
              <Animated.View
                style={[
                  styles.selectionFill,
                  {
                    width: slotWidth - SELECTION_INSET * 2,
                    backgroundColor: accent.accentSoft,
                    transform: [{ translateX: selectionTranslateX }],
                  },
                ]}
              />
            ) : null}
          </View>
          <MaterialTopTabBar {...props} descriptors={descriptors} />
        </View>
      </Animated.View>
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
    pointerEvents: 'none',
  },
  selectionFill: {
    position: 'absolute',
    top: SELECTION_INSET,
    bottom: SELECTION_INSET,
    borderRadius: radii.pill,
  },
});
