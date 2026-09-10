import type { MaterialTopTabBarProps } from "expo-router/js-top-tabs";
import { useEffect, useState, useSyncExternalStore } from 'react';
import { Animated, Dimensions, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { TabBarBleedBackground } from './TabBarBleedBackground';
import { useLayoutSafeAreaInsets } from '../hooks/useLayoutSafeAreaInsets';
import { usePreferences } from '../state/PreferencesContext';
import { useLiturgicalVestmentAccent } from '../state/VestmentAccentContext';
import { tabBarScrollStore } from '../state/tabBarScrollStore';
import { staticAppAccent } from '../lib/liturgical/vestmentAccent';
import { tabBarChrome } from '../theme/cards';
import { TAB_BAR_CONTENT_HEIGHT, TAB_BAR_EDGE_PAD_PX } from '../theme/layout';
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
  const { showTabBarLabels } = usePreferences();
  const isDark = useResolvedColorScheme() === 'dark';
  const insets = useLayoutSafeAreaInsets();
  const liturgicalAccent = useLiturgicalVestmentAccent();
  const accent = state.index === 0 ? liturgicalAccent : staticAppAccent(isDark);
  const isNativePhone = Platform.OS !== 'web';
  const float = tabBarFloatInsets(isNativePhone, insets.bottom);
  const tabBarBg = tabBarBackground(isDark);
  const chrome = tabBarChrome(isDark);

  // Start from a sensible estimate so the sliding pill never renders with a
  // zero/negative width before onLayout reports the real bar width.
  const [barWidth, setBarWidth] = useState(() =>
    Math.max(1, Dimensions.get('window').width - float.horizontal * 2),
  );
  const tabCount = state.routes.length;
  const slotWidth = Math.max(1, tabCount > 0 ? barWidth / tabCount : 0);
  const inputRange = state.routes.map((_route: unknown, index: number) => index);
  const outputRange =
    state.routes.map((_route: unknown, index: number) => index * slotWidth + SELECTION_INSET);
  const selectionTranslateX = position.interpolate({
    inputRange,
    outputRange,
    extrapolate: 'clamp',
  });

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
          </View>
          <View style={styles.itemRow}>
            {state.routes.map((route: { key: string; name: string }, index: number) => {
              const focused = index === state.index;
              const descriptor = props.descriptors[route.key];
              const icon = descriptor?.options.tabBarIcon?.({
                color: focused ? accent.icon : inactiveTint,
                focused,
              });
              return (
                <Pressable
                  key={route.key}
                  style={styles.tabItem}
                  onPress={() => {
                    tabBarScrollStore.touchReset();
                    props.navigation.navigate(route.name);
                  }}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: focused }}
                  accessibilityLabel={descriptor?.options.tabBarAccessibilityLabel}
                  hitSlop={4}
                >
                  <View
                    style={[styles.itemContent, showTabBarLabels ? styles.itemContentLabeled : null]}
                  >
                    {icon}
                    {showTabBarLabels ? (
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.itemLabel,
                          { color: focused ? accent.icon : inactiveTint },
                        ]}
                      >
                        {descriptor?.options.tabBarLabel as string}
                      </Text>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
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
  },
  selectionLayer: {
    ...StyleSheet.absoluteFill,
    pointerEvents: 'none',
  },
  selectionFill: {
    position: 'absolute',
    top: SELECTION_INSET,
    bottom: SELECTION_INSET,
    borderRadius: radii.pill,
  },
  itemRow: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  itemContentLabeled: {
    height: TAB_BAR_CONTENT_HEIGHT,
  },
  itemLabel: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 12,
    marginTop: 2,
    maxWidth: 76,
  },
});