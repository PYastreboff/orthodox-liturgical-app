import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { HoverAccessible } from './HoverAccessible';

export type SectionIconName =
  | 'serving-role'
  | 'date'
  | 'commemorations'
  | 'fasting'
  | 'vestments'
  | 'readings';

export const SECTION_ICON_LABELS: Record<SectionIconName, string> = {
  'serving-role': 'Serving role',
  date: 'Date and liturgical day',
  commemorations: 'Commemorations and feasts',
  fasting: 'Fasting information',
  vestments: 'Vestments',
  readings: 'Liturgical texts',
};

const ICON_SIZE = 22;

type Props = {
  name: SectionIconName;
  color: string;
};

export function SectionIcon({ name, color }: Props) {
  const icon = (() => {
    switch (name) {
      case 'serving-role':
        return (
          <MaterialCommunityIcons name="account-group-outline" size={ICON_SIZE} color={color} />
        );
      case 'date':
        return <Feather name="calendar" size={ICON_SIZE} color={color} />;
      case 'commemorations':
        return <MaterialCommunityIcons name="church" size={ICON_SIZE} color={color} />;
      case 'fasting':
        return <MaterialCommunityIcons name="baguette" size={ICON_SIZE} color={color} />;
      case 'vestments':
        return <MaterialCommunityIcons name="hanger" size={ICON_SIZE} color={color} />;
      case 'readings':
        return (
          <MaterialCommunityIcons
            name="book-open-page-variant-outline"
            size={ICON_SIZE}
            color={color}
          />
        );
      default:
        return <Feather name="circle" size={ICON_SIZE} color={color} />;
    }
  })();

  return (
    <HoverAccessible label={SECTION_ICON_LABELS[name]} accessibilityRole="image">
      {icon}
    </HoverAccessible>
  );
}
