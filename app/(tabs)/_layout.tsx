import { useTheme } from '@react-navigation/native';
import { Platform, StyleSheet } from 'react-native';

import { MainTabBar } from '../../src/components/MainTabBar';
import { TAB_ICON_SIZE, tabBarIconOptions } from '../../src/components/TabBarIcon';
import { useCalendarPrefetch } from '../../src/hooks/useCalendarPrefetch';
import { useAppTranslation } from '../../src/i18n/useAppTranslation';
import { SwipeTabs } from '../../src/navigation/SwipeTabs';
import { usePreferences } from '../../src/state/PreferencesContext';
import { useResolvedColorScheme } from '../../src/theme/useResolvedColorScheme';
import { colors } from '../../src/theme/tokens';

function TabsLayoutContent() {
  const theme = useTheme();
  const isDark = useResolvedColorScheme() === 'dark';
  const { primaryCalendar } = usePreferences();
  useCalendarPrefetch(primaryCalendar);
  const sceneBackground = theme.colors.background;
  const { t } = useAppTranslation();

  return (
    <SwipeTabs
      tabBarPosition="bottom"
      tabBar={(props) => <MainTabBar {...props} />}
      screenOptions={{
        swipeEnabled: true,
        animationEnabled: true,
        lazy: true,
        lazyPreloadDistance: 1,
        sceneStyle: {
          flex: 1,
          backgroundColor: sceneBackground,
        },
        tabBarStyle: {
          backgroundColor: 'transparent',
          elevation: 0,
          shadowOpacity: 0,
          ...(Platform.OS === 'web' ? ({ boxShadow: 'none' } as const) : null),
        },
        tabBarItemStyle: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 0,
          paddingBottom: 0,
          minHeight: 52,
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
          marginTop: 2,
          marginBottom: 0,
          textTransform: 'none',
        },
        tabBarActiveTintColor: isDark ? colors.tabActiveDark : colors.tabActiveLight,
        tabBarInactiveTintColor: isDark ? '#8a8580' : colors.muted,
        tabBarIndicatorStyle: styles.hiddenIndicator,
        tabBarPressColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(43,38,35,0.08)',
        tabBarShowIcon: true,
      }}
    >
      <SwipeTabs.Screen
        name="index"
        options={{
          title: 'OrthoDaily',
          tabBarLabel: t('tabs.today'),
          sceneStyle: { flex: 1, backgroundColor: 'transparent' },
          ...tabBarIconOptions('today'),
        }}
      />
      <SwipeTabs.Screen
        name="calendar"
        options={{
          title: t('tabs.browserTitleCalendar'),
          tabBarLabel: t('tabs.calendar'),
          sceneStyle: { backgroundColor: sceneBackground },
          ...tabBarIconOptions('calendar'),
        }}
      />
      <SwipeTabs.Screen
        name="settings"
        options={{
          title: t('tabs.browserTitleSettings'),
          tabBarLabel: t('tabs.settings'),
          sceneStyle: { backgroundColor: sceneBackground },
          ...tabBarIconOptions('settings'),
        }}
      />
    </SwipeTabs>
  );
}

export default function TabsLayout() {
  return <TabsLayoutContent />;
}

const styles = StyleSheet.create({
  hiddenIndicator: {
    height: 0,
    width: 0,
  },
});
