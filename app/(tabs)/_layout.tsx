import { useTheme } from '@react-navigation/native';
import { Platform, StyleSheet, View } from 'react-native';

import { MainTabBar } from '../../src/components/MainTabBar';
import { TAB_ICON_SIZE, tabBarIconOptions } from '../../src/components/TabBarIcon';
import { useCalendarPrefetch } from '../../src/hooks/useCalendarPrefetch';
import { useAppTranslation } from '../../src/i18n/useAppTranslation';
import { SwipeTabs } from '../../src/navigation/SwipeTabs';
import { usePreferences } from '../../src/state/PreferencesContext';
import { useVestmentAccent } from '../../src/state/VestmentAccentContext';
import { useResolvedColorScheme } from '../../src/theme/useResolvedColorScheme';
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
          sceneStyle: {
            flex: 1,
            backgroundColor: sceneBackground,
          },
          tabBarStyle: {
            backgroundColor: 'transparent',
            width: '100%',
            elevation: 0,
            shadowOpacity: 0,
            ...(Platform.OS === 'web' ? ({ boxShadow: 'none' } as const) : null),
          },
          tabBarContentContainerStyle: { width: '100%', flexGrow: 1 },
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
            fontWeight: '700',
            marginTop: 3,
            marginBottom: 0,
            textTransform: 'none',
            letterSpacing: 0.25,
          },
          tabBarActiveTintColor: vestmentAccent.accent,
          tabBarInactiveTintColor: isDark ? '#7a746e' : colors.muted,
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
