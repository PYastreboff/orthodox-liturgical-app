import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { colors } from '../theme/tokens';

type TabName = 'today' | 'calendar' | 'settings';

type Props = {
  name: TabName;
  color: string;
  size?: number;
  focused?: boolean;
};

export const TAB_ICON_SIZE = 22;
const ICON_SIZE = TAB_ICON_SIZE;

export function TabBarIcon({ name, color, size = ICON_SIZE, focused }: Props) {
  switch (name) {
    case 'today':
      return (
        <MaterialCommunityIcons name="book-cross" size={size} color={color} />
      );
    case 'calendar':
      return <Feather name="calendar" size={size} color={color} />;
    case 'settings':
      return <Feather name="settings" size={size} color={color} />;
    default:
      return <Feather name="circle" size={size} color={color} />;
  }
}

export function tabBarIconOptions(name: TabName) {
  return {
    tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
      <TabBarIcon name={name} color={color} size={TAB_ICON_SIZE} focused={focused} />
    ),
  };
}

/** Active tab accent when screens need a static reference. */
export const tabActiveColor = colors.tabActiveLight;
