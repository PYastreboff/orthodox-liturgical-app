import { MaterialTopTabBar, type MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { Platform, StyleSheet, View } from 'react-native';

import { TabBarBleedBackground } from './TabBarBleedBackground';
import { useLayoutSafeAreaInsets } from '../hooks/useLayoutSafeAreaInsets';
import { useVestmentAccent } from '../state/VestmentAccentContext';
import { tabBarChrome } from '../theme/cards';
import { TAB_BAR_CONTENT_HEIGHT, TAB_BAR_EDGE_PAD_PX } from '../theme/layout';
import { radii } from '../theme/tokens';
import { tabBarFloatInsets } from '../theme/tabBarFloat';
import { useResolvedColorScheme } from '../theme/useResolvedColorScheme';

export function tabBarBackground(isDark: boolean): string {
  return isDark ? 'rgba(24, 22, 20, 0.92)' : 'rgba(255, 255, 255, 0.94)';
}

const SELECTION_INSET_X = 3;
const SELECTION_INSET_Y = 5;

/** Bottom-positioned floating pill tab bar (phone + web). */
export function MainTabBar(props: MaterialTopTabBarProps) {
  const isDark = useResolvedColorScheme() === 'dark';
  const insets = useLayoutSafeAreaInsets();
  const vestmentAccent = useVestmentAccent();
  const isNativePhone = Platform.OS !== 'web';
  const float = tabBarFloatInsets(isNativePhone, insets.bottom);
  const tabBarBg = tabBarBackground(isDark);
  const chrome = tabBarChrome(isDark);
  const activeIndex = props.state.index;

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
        <View style={styles.tabBarRow}>
          <View pointerEvents="none" style={styles.selectionLayer}>
            {props.state.routes.map((route, index) => (
              <View key={route.key} style={styles.selectionSlot}>
                {index === activeIndex ? (
                  <View
                    style={[
                      styles.selectionFill,
                      { backgroundColor: vestmentAccent.accentSoft },
                    ]}
                  />
                ) : null}
              </View>
            ))}
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
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  selectionSlot: {
    flex: 1,
    alignSelf: 'stretch',
  },
  selectionFill: {
    flex: 1,
    alignSelf: 'stretch',
    marginHorizontal: SELECTION_INSET_X,
    marginVertical: SELECTION_INSET_Y,
    borderRadius: radii.pill,
  },
});
