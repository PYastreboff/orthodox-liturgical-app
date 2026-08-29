import { StyleSheet, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { HoverAccessible } from './HoverAccessible';
import { OrthodoxCrossGlyph } from './OrthodoxCrossGlyph';
import { TAB_BAR_CONTENT_HEIGHT } from '../theme/layout';

type TabName = 'today' | 'calendar' | 'prayers' | 'liturgy' | 'settings';

type Props = {
  name: TabName;
  color: string;
  size?: number;
  focused?: boolean;
  a11yLabel: string;
  a11yCurrentTabLabel: string;
};

export const TAB_ICON_SIZE = 26;
const ICON_SIZE = TAB_ICON_SIZE;

export function TabBarIcon({
  name,
  color,
  size = ICON_SIZE,
  focused,
  a11yLabel,
  a11yCurrentTabLabel,
}: Props) {
  const label = focused ? a11yCurrentTabLabel : a11yLabel;

  const icon = (() => {
    switch (name) {
      case 'today':
        return <OrthodoxCrossGlyph size={size} color={color} />;
      case 'calendar':
        return <Feather name="calendar" size={size} color={color} />;
      case 'prayers':
        return <MaterialCommunityIcons name="hands-pray" size={size} color={color} />;
      case 'liturgy':
        return <MaterialCommunityIcons name="church" size={size} color={color} />;
      case 'settings':
        return <Feather name="settings" size={size} color={color} />;
      default:
        return <Feather name="circle" size={size} color={color} />;
    }
  })();

  return (
    <HoverAccessible label={label} accessibilityRole="button" style={styles.hitArea}>
      <View style={styles.iconCenter}>{icon}</View>
    </HoverAccessible>
  );
}

const styles = StyleSheet.create({
  hitArea: {
    flex: 1,
    width: '100%',
    height: TAB_BAR_CONTENT_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});

const TAB_A11Y_KEY: Record<
  TabName,
  'tabs.a11yToday' | 'tabs.a11yCalendar' | 'tabs.a11yPrayers' | 'tabs.a11yLiturgy' | 'tabs.a11ySettings'
> = {
  today: 'tabs.a11yToday',
  calendar: 'tabs.a11yCalendar',
  prayers: 'tabs.a11yPrayers',
  liturgy: 'tabs.a11yLiturgy',
  settings: 'tabs.a11ySettings',
};

export function tabBarIconOptions(
  name: TabName,
  t: (key: string, params?: Record<string, string>) => string,
) {
  const a11yLabel = t(TAB_A11Y_KEY[name]);
  return {
    tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
      <TabBarIcon
        name={name}
        color={color}
        size={TAB_ICON_SIZE}
        focused={focused}
        a11yLabel={a11yLabel}
        a11yCurrentTabLabel={t('tabs.a11yCurrentTab', { label: a11yLabel })}
      />
    ),
    tabBarAccessibilityLabel: a11yLabel,
  };
}
