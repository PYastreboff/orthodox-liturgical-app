import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppTranslation } from '../i18n/useAppTranslation';
import { HoverAccessible } from './HoverAccessible';

export type SectionIconName =
  | 'serving-role'
  | 'date'
  | 'feasts'
  | 'saints'
  | 'fasting'
  | 'vestments'
  | 'readings';

const SECTION_ICON_KEYS: Record<SectionIconName, string> = {
  'serving-role': 'today.servingRole',
  date: 'today.sectionDate',
  feasts: 'today.sectionFeasts',
  saints: 'today.sectionSaints',
  fasting: 'today.sectionFasting',
  vestments: 'today.sectionVestments',
  readings: 'today.sectionReadings',
};

const ICON_SIZE = 22;

type Props = {
  name: SectionIconName;
  color: string;
};

export function SectionIcon({ name, color }: Props) {
  const { t } = useAppTranslation();
  const icon = (() => {
    switch (name) {
      case 'serving-role':
        return (
          <MaterialCommunityIcons name="account-group-outline" size={ICON_SIZE} color={color} />
        );
      case 'date':
        return <Feather name="calendar" size={ICON_SIZE} color={color} />;
      case 'feasts':
        return <MaterialCommunityIcons name="star-four-points-outline" size={ICON_SIZE} color={color} />;
      case 'saints':
        return <MaterialCommunityIcons name="account-outline" size={ICON_SIZE} color={color} />;
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
    <HoverAccessible label={t(SECTION_ICON_KEYS[name])} accessibilityRole="image">
      {icon}
    </HoverAccessible>
  );
}
