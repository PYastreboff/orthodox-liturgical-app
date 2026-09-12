import { StyleSheet, View, type ColorValue } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { HoverAccessible } from './HoverAccessible';
import { OrthodoxCrossGlyph } from './OrthodoxCrossGlyph';
import { usePreferences } from '../state/PreferencesContext';
import { TAB_BAR_CONTENT_HEIGHT } from '../theme/layout';

type TabName = 'today' | 'calendar' | 'prayers' | 'liturgy' | 'settings';

type Props = {
  name: TabName;
  color: ColorValue;
  size?: number;
  focused?: boolean;
  compact?: boolean;
  a11yLabel: string;
  a11yCurrentTabLabel: string;
};

export const TAB_ICON_SIZE = 26;
const ICON_SIZE = TAB_ICON_SIZE;
const COMPACT_ICON_SIZE = 22;

export function TabBarIcon({
  name,
  color,
  size = ICON_SIZE,
  focused,
  compact,
  a11yLabel,
  a11yCurrentTabLabel,
}: Props) {
  const label = focused ? a11yCurrentTabLabel : a11yLabel;
  const iconSize = compact ? COMPACT_ICON_SIZE : size;

  const icon = (() => {
    switch (name) {
      case 'today':
        return <OrthodoxCrossGlyph size={iconSize} color={color} />;
      case 'calendar':
        return <Feather name="calendar" size={iconSize} color={color} />;
      case 'prayers':
        return <MaterialCommunityIcons name="hands-pray" size={iconSize} color={color} />;
      case 'liturgy':
        return <MaterialCommunityIcons name="church" size={iconSize} color={color} />;
      case 'settings':
        return <Feather name="settings" size={iconSize} color={color} />;
      default:
        return <Feather name="circle" size={iconSize} color={color} />;
    }
  })();

  return (
    <HoverAccessible
      label={label}
      accessibilityRole="button"
      style={compact ? styles.hitAreaCompact : styles.hitArea}
    >
      <View style={compact ? styles.iconCenterCompact : styles.iconCenter}>{icon}</View>
    </HoverAccessible>
  );
}

const styles = StyleSheet.create({
  hitArea: {
    flex: 1,
    width: '100%',
    height: '100%',
    minHeight: TAB_BAR_CONTENT_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hitAreaCompact: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -2 }],
    zIndex: 1,
  },
  iconCenterCompact: {
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -1 }],
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

function TabNavIcon({
  name,
  color,
  focused,
  a11yLabel,
  a11yCurrentTabLabel,
}: Omit<Props, 'size' | 'compact'>) {
  const { showTabBarLabels } = usePreferences();
  return (
    <TabBarIcon
      name={name}
      color={color}
      size={ICON_SIZE}
      focused={focused}
      compact={showTabBarLabels}
      a11yLabel={a11yLabel}
      a11yCurrentTabLabel={a11yCurrentTabLabel}
    />
  );
}

export function tabBarIconOptions(
  name: TabName,
  t: (key: string, params?: Record<string, string>) => string,
) {
  const a11yLabel = t(TAB_A11Y_KEY[name]);
  return {
    tabBarIcon: ({ color, focused }: { color: ColorValue; focused: boolean }) => (
      <TabNavIcon
        name={name}
        color={color}
        focused={focused}
        a11yLabel={a11yLabel}
        a11yCurrentTabLabel={t('tabs.a11yCurrentTab', { label: a11yLabel })}
      />
    ),
    tabBarAccessibilityLabel: a11yLabel,
  };
}
