import { StyleSheet, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { colors } from '../theme/tokens';
import { HoverAccessible } from './HoverAccessible';

type TabName = 'today' | 'calendar' | 'settings';

type Props = {
  name: TabName;
  color: string;
  size?: number;
  focused?: boolean;
};

export const TAB_ICON_SIZE = 22;
const ICON_SIZE = TAB_ICON_SIZE;

const TAB_LABELS: Record<TabName, string> = {
  today: 'OrthoDaily Home',
  calendar: 'Liturgical calendar',
  settings: 'Settings',
};

export function TabBarIcon({ name, color, size = ICON_SIZE, focused }: Props) {
  const label = focused ? `${TAB_LABELS[name]} (current tab)` : TAB_LABELS[name];

  const icon = (() => {
    switch (name) {
      case 'today':
        return <MaterialCommunityIcons name="book-cross" size={size} color={color} />;
      case 'calendar':
        return <Feather name="calendar" size={size} color={color} />;
      case 'settings':
        return <Feather name="settings" size={size} color={color} />;
      default:
        return <Feather name="circle" size={size} color={color} />;
    }
  })();

  return (
    <HoverAccessible label={label} accessibilityRole="button" style={styles.iconSlot}>
      <View style={styles.iconCenter}>{icon}</View>
    </HoverAccessible>
  );
}

const styles = StyleSheet.create({
  iconSlot: {
    width: TAB_ICON_SIZE,
    height: TAB_ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export function tabBarIconOptions(name: TabName) {
  return {
    tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
      <TabBarIcon name={name} color={color} size={TAB_ICON_SIZE} focused={focused} />
    ),
    tabBarAccessibilityLabel: TAB_LABELS[name],
  };
}
