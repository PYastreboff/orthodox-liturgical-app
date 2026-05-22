import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

import { AppBrandHeader } from '../../src/components/AppBrandHeader';
import { tabBarIconOptions } from '../../src/components/TabBarIcon';
import { colors } from '../../src/theme/tokens';

export default function TabsLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: isDark ? colors.darkSurface : colors.parchment },
        headerTintColor: isDark ? colors.darkInk : colors.ink,
        headerTitleStyle: { fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: isDark ? colors.darkSurface : colors.parchment,
          borderTopColor: isDark ? colors.darkBorder : colors.border,
        },
        tabBarActiveTintColor: isDark ? colors.tabActiveDark : colors.tabActiveLight,
        tabBarInactiveTintColor: isDark ? '#8a8580' : colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
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
