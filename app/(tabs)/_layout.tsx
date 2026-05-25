import { Tabs } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { Platform, StyleSheet } from 'react-native';

import { AppBrandHeader } from '../../src/components/AppBrandHeader';
import { TAB_ICON_SIZE, tabBarIconOptions } from '../../src/components/TabBarIcon';
import { useTabHeaderShown } from '../../src/hooks/useTabHeaderShown';
import { useAppTranslation } from '../../src/i18n/useAppTranslation';
import { useLayoutSafeAreaInsets } from '../../src/hooks/useLayoutSafeAreaInsets';
import { useSafariBottomChromeInset } from '../../src/hooks/useSafariBottomChromeInset';
import { useResolvedColorScheme } from '../../src/theme/useResolvedColorScheme';
import { TAB_BAR_CONTENT_HEIGHT } from '../../src/theme/layout';
import { colors } from '../../src/theme/tokens';

function tabBarBackground(isDark: boolean): string {
  if (isDark) {
    return 'rgba(28, 24, 20, 0.92)';
  }
  return 'rgba(245, 240, 232, 0.92)';
}

function tabBarBorderColor(isDark: boolean): string {
  if (isDark) {
    return 'rgba(46, 40, 34, 0.92)';
  }
  return 'rgba(226, 216, 202, 0.92)';
}

function TabsLayoutContent() {
  const theme = useTheme();
  const isDark = useResolvedColorScheme() === 'dark';
  const sceneBackground = theme.colors.background;
  const insets = useLayoutSafeAreaInsets();
  const { t } = useAppTranslation();
  const showTabHeader = useTabHeaderShown();
  const bottomInset = insets.bottom;
  const safariChrome = useSafariBottomChromeInset();
  const tabBarHeight = TAB_BAR_CONTENT_HEIGHT + bottomInset;

  return (
    <Tabs
      screenOptions={{
        headerShown: showTabHeader,
        headerStyle: { backgroundColor: isDark ? colors.darkSurface : colors.parchment },
        headerTintColor: isDark ? colors.darkInk : colors.ink,
        headerTitleStyle: { fontWeight: '600' },
        sceneStyle: {
          flex: 1,
          backgroundColor: sceneBackground,
        },
        tabBarStyle: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: safariChrome,
          width: '100%',
          backgroundColor: tabBarBackground(isDark),
          borderTopColor: tabBarBorderColor(isDark),
          borderTopWidth: StyleSheet.hairlineWidth,
          height: tabBarHeight,
          paddingTop: 0,
          paddingBottom: bottomInset > 0 ? bottomInset : Platform.OS === 'android' ? 8 : 0,
          elevation: 0,
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
          sceneStyle: { flex: 1, backgroundColor: 'transparent' },
          ...tabBarIconOptions('today'),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: t('tabs.browserTitleCalendar'),
          headerTitle: t('tabs.calendarHeader'),
          tabBarLabel: t('tabs.calendar'),
          sceneStyle: { backgroundColor: sceneBackground },
          ...tabBarIconOptions('calendar'),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.browserTitleSettings'),
          headerTitle: t('tabs.settings'),
          tabBarLabel: t('tabs.settings'),
          sceneStyle: { backgroundColor: sceneBackground },
          ...tabBarIconOptions('settings'),
        }}
      />
    </Tabs>
  );
}

export default function TabsLayout() {
  return <TabsLayoutContent />;
}
