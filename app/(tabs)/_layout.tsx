import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBrandHeader } from '../../src/components/AppBrandHeader';
import { TAB_ICON_SIZE, tabBarIconOptions } from '../../src/components/TabBarIcon';
import { useResolvedColorScheme } from '../../src/theme/useResolvedColorScheme';
import { PAGE_BACKGROUND_BLACK } from '../../src/lib/liturgical/vestmentGradient';
import { colors } from '../../src/theme/tokens';

const TAB_BAR_CONTENT_HEIGHT = 52;

export default function TabsLayout() {
  const isDark = useResolvedColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom;
  const tabBarHeight = TAB_BAR_CONTENT_HEIGHT + bottomInset;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: isDark ? colors.darkSurface : colors.parchment },
        headerTintColor: isDark ? colors.darkInk : colors.ink,
        headerTitleStyle: { fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: isDark ? colors.darkSurface : colors.parchment,
          borderTopColor: isDark ? colors.darkBorder : colors.border,
          height: tabBarHeight,
          paddingTop: 0,
          paddingBottom: bottomInset > 0 ? bottomInset : Platform.OS === 'android' ? 8 : 0,
        },
        tabBarItemStyle: {
          height: TAB_BAR_CONTENT_HEIGHT,
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 0,
        },
        tabBarIconStyle: {
          marginTop: 0,
          marginBottom: 0,
          height: TAB_ICON_SIZE,
          width: TAB_ICON_SIZE,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
          marginBottom: 0,
          includeFontPadding: false,
          textAlignVertical: 'center',
        },
        tabBarActiveTintColor: isDark ? colors.tabActiveDark : colors.tabActiveLight,
        tabBarInactiveTintColor: isDark ? '#8a8580' : colors.muted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'OrthoDaily',
          tabBarLabel: 'Today',
          headerTitle: () => <AppBrandHeader />,
          sceneStyle: { backgroundColor: PAGE_BACKGROUND_BLACK },
          ...tabBarIconOptions('today'),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'OrthoDaily',
          headerTitle: 'Calendar',
          tabBarLabel: 'Calendar',
          ...tabBarIconOptions('calendar'),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'OrthoDaily',
          headerTitle: 'Settings',
          tabBarLabel: 'Settings',
          ...tabBarIconOptions('settings'),
        }}
      />
    </Tabs>
  );
}
