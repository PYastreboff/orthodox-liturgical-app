import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBrandHeader } from '../../src/components/AppBrandHeader';
import { TAB_ICON_SIZE, tabBarIconOptions } from '../../src/components/TabBarIcon';
import { useResolvedColorScheme } from '../../src/theme/useResolvedColorScheme';
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
          paddingTop: 6,
          paddingBottom: bottomInset > 0 ? bottomInset : Platform.OS === 'android' ? 10 : 6,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 0,
          marginBottom: Platform.OS === 'ios' ? 2 : 4,
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
          ...tabBarIconOptions('today'),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{ title: 'Calendar', tabBarLabel: 'Calendar', ...tabBarIconOptions('calendar') }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings', tabBarLabel: 'Settings', ...tabBarIconOptions('settings') }}
      />
    </Tabs>
  );
}
