import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBrandHeader } from '../../src/components/AppBrandHeader';
import { TAB_ICON_SIZE, tabBarIconOptions } from '../../src/components/TabBarIcon';
import { useTabHeaderShown } from '../../src/hooks/useTabHeaderShown';
import { useAppTranslation } from '../../src/i18n/useAppTranslation';
import { useResolvedColorScheme } from '../../src/theme/useResolvedColorScheme';
import { todayPageBackgroundColor } from '../../src/lib/liturgical/vestmentGradient';
import { colors } from '../../src/theme/tokens';

const TAB_BAR_CONTENT_HEIGHT = 52;

function TabsLayoutContent() {
  const isDark = useResolvedColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const { t } = useAppTranslation();
  const showTabHeader = useTabHeaderShown();
  const bottomInset = insets.bottom;
  const tabBarHeight = TAB_BAR_CONTENT_HEIGHT + bottomInset;
  const sceneTopPadding = showTabHeader ? 0 : insets.top;

  return (
    <Tabs
      screenOptions={{
        headerShown: showTabHeader,
        headerStyle: { backgroundColor: isDark ? colors.darkSurface : colors.parchment },
        headerTintColor: isDark ? colors.darkInk : colors.ink,
        headerTitleStyle: { fontWeight: '600' },
        sceneStyle: { paddingTop: sceneTopPadding },
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
          tabBarLabel: t('tabs.today'),
          headerTitle: () => <AppBrandHeader />,
          sceneStyle: {
            backgroundColor: todayPageBackgroundColor(isDark),
            paddingTop: sceneTopPadding,
          },
          ...tabBarIconOptions('today'),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: t('tabs.browserTitleCalendar'),
          headerTitle: t('tabs.calendarHeader'),
          tabBarLabel: t('tabs.calendar'),
          ...tabBarIconOptions('calendar'),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.browserTitleSettings'),
          headerTitle: t('tabs.settings'),
          tabBarLabel: t('tabs.settings'),
          ...tabBarIconOptions('settings'),
        }}
      />
    </Tabs>
  );
}

export default function TabsLayout() {
  return <TabsLayoutContent />;
}
