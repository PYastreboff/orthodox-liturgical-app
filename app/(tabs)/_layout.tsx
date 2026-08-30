import { useTheme } from '@react-navigation/native';
import { Platform, StyleSheet, View } from 'react-native';

import { MainTabBar } from '../../src/components/MainTabBar';
import { tabBarIconOptions } from '../../src/components/TabBarIcon';
import { useCalendarPrefetch } from '../../src/hooks/useCalendarPrefetch';
import { useAppTranslation } from '../../src/i18n/useAppTranslation';
import { SwipeTabs } from '../../src/navigation/SwipeTabs';
import { usePreferences } from '../../src/state/PreferencesContext';
import { useVestmentAccent } from '../../src/state/VestmentAccentContext';
import { useResolvedColorScheme } from '../../src/theme/useResolvedColorScheme';
import { TAB_BAR_CONTENT_HEIGHT } from '../../src/theme/layout';
import { colors } from '../../src/theme/tokens';

function TabsLayoutContent() {
  const theme = useTheme();
  const isDark = useResolvedColorScheme() === 'dark';
  const { primaryCalendar } = usePreferences();
  const vestmentAccent = useVestmentAccent();
  useCalendarPrefetch(primaryCalendar);
  const sceneBackground = theme.colors.background;
  const { t } = useAppTranslation();

  return (
    <View style={styles.shell}>
      <SwipeTabs
        tabBarPosition="bottom"
        tabBar={(props) => <MainTabBar {...props} />}
        screenOptions={{
          swipeEnabled: true,
          animationEnabled: true,
          lazy: true,
          lazyPreloadDistance: 1,
          tabBarScrollEnabled: false,
          sceneStyle: {
            flex: 1,
            backgroundColor: sceneBackground,
          },
          tabBarStyle: {
            backgroundColor: 'transparent',
            width: '100%',
            height: TAB_BAR_CONTENT_HEIGHT,
            minHeight: TAB_BAR_CONTENT_HEIGHT,
            elevation: 0,
            shadowOpacity: 0,
            ...(Platform.OS === 'web' ? ({ boxShadow: 'none' } as const) : null),
          },
          tabBarContentContainerStyle: {
            flex: 1,
            width: '100%',
            flexDirection: 'row',
            alignItems: 'stretch',
          },
          tabBarItemStyle: {
            flex: 1,
            paddingTop: 0,
            paddingBottom: 0,
            paddingVertical: 0,
            paddingHorizontal: 0,
            height: TAB_BAR_CONTENT_HEIGHT,
            minHeight: TAB_BAR_CONTENT_HEIGHT,
          },
          tabBarLabelStyle: {
            height: 0,
            margin: 0,
            padding: 0,
          },
          tabBarActiveTintColor: vestmentAccent.icon,
          tabBarInactiveTintColor: isDark ? '#7a746e' : colors.muted,
          tabBarIndicatorStyle: styles.hiddenIndicator,
          tabBarPressColor: 'transparent',
          tabBarShowIcon: true,
          tabBarShowLabel: false,
        }}
      >
        <SwipeTabs.Screen
          name="index"
          options={{
            title: 'OrthoDaily',
            tabBarLabel: t('tabs.today'),
            sceneStyle: { flex: 1, backgroundColor: 'transparent' },
            ...tabBarIconOptions('today', t),
          }}
        />
        <SwipeTabs.Screen
          name="calendar"
          options={{
            title: t('tabs.browserTitleCalendar'),
            tabBarLabel: t('tabs.calendar'),
            sceneStyle: { backgroundColor: sceneBackground },
            ...tabBarIconOptions('calendar', t),
          }}
        />
        <SwipeTabs.Screen
          name="prayers"
          options={{
            title: t('tabs.browserTitlePrayers'),
            tabBarLabel: t('tabs.prayers'),
            sceneStyle: { backgroundColor: sceneBackground },
            ...tabBarIconOptions('prayers', t),
          }}
        />
        <SwipeTabs.Screen
          name="liturgy"
          options={{
            title: t('tabs.browserTitleLiturgy'),
            tabBarLabel: t('tabs.liturgy'),
            sceneStyle: { backgroundColor: sceneBackground },
            ...tabBarIconOptions('liturgy', t),
          }}
        />
        <SwipeTabs.Screen
          name="settings"
          options={{
            title: t('tabs.browserTitleSettings'),
            tabBarLabel: t('tabs.settings'),
            sceneStyle: { backgroundColor: sceneBackground },
            ...tabBarIconOptions('settings', t),
          }}
        />
      </SwipeTabs>
    </View>
  );
}

export default function TabsLayout() {
  return <TabsLayoutContent />;
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  hiddenIndicator: {
    height: 0,
    width: 0,
  },
});
