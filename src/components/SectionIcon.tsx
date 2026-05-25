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
  | 'church-clothing'
  | 'readings';

const SECTION_ICON_KEYS: Record<SectionIconName, string> = {
  'serving-role': 'today.servingRole',
  date: 'today.sectionDate',
  feasts: 'today.sectionFeasts',
  saints: 'today.sectionSaints',
  fasting: 'today.sectionFasting',
  vestments: 'today.sectionVestments',
  'church-clothing': 'today.sectionChurchDress',
  readings: 'today.sectionReadings',
};

export const SECTION_ICON_SIZE = 22;

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
          <MaterialCommunityIcons name="account-group-outline" size={SECTION_ICON_SIZE} color={color} />
        );
      case 'date':
        return <Feather name="calendar" size={SECTION_ICON_SIZE} color={color} />;
      case 'feasts':
        return <MaterialCommunityIcons name="star-four-points-outline" size={SECTION_ICON_SIZE} color={color} />;
      case 'saints':
        return <MaterialCommunityIcons name="account-outline" size={SECTION_ICON_SIZE} color={color} />;
      case 'fasting':
        return <MaterialCommunityIcons name="baguette" size={SECTION_ICON_SIZE} color={color} />;
      case 'vestments':
        return <MaterialCommunityIcons name="hanger" size={SECTION_ICON_SIZE} color={color} />;
      case 'church-clothing':
        return (
          <MaterialCommunityIcons name="tshirt-crew-outline" size={SECTION_ICON_SIZE} color={color} />
        );
      case 'readings':
        return (
          <MaterialCommunityIcons
            name="book-open-page-variant-outline"
            size={SECTION_ICON_SIZE}
            color={color}
          />
        );
      default:
        return <Feather name="circle" size={SECTION_ICON_SIZE} color={color} />;
    }
  })();

  return (
    <HoverAccessible label={t(SECTION_ICON_KEYS[name])} accessibilityRole="image">
      {icon}
    </HoverAccessible>
  );
}
