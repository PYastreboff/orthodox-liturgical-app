import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppTranslation } from '../i18n/useAppTranslation';
import { HoverAccessible } from './HoverAccessible';

export type SectionIconName =
  | 'serving-role'
  | 'date'
  | 'about-today'
  | 'feasts'
  | 'saints'
  | 'fasting'
  | 'vestments'
  | 'church-clothing'
  | 'services'
  | 'choir-guide'
  | 'altar-roles'
  | 'reader-guide'
  | 'deacon-guide'
  | 'priest-guide'
  | 'readings';

const SECTION_ICON_KEYS: Record<SectionIconName, string> = {
  'serving-role': 'today.servingRole',
  date: 'today.sectionDate',
  'about-today': 'dayAbout.sectionTitle',
  feasts: 'today.sectionFeasts',
  saints: 'today.sectionSaints',
  fasting: 'today.sectionFasting',
  vestments: 'today.sectionVestments',
  'church-clothing': 'today.sectionChurchDress',
  services: 'today.sectionServices',
  'choir-guide': 'today.sectionChoirGuide',
  'altar-roles': 'today.sectionAltarRoles',
  'reader-guide': 'today.sectionReaderGuide',
  'deacon-guide': 'today.sectionDeaconGuide',
  'priest-guide': 'today.sectionPriestGuide',
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
      case 'about-today':
        return <Feather name="book-open" size={SECTION_ICON_SIZE} color={color} />;
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
      case 'services':
        return <MaterialCommunityIcons name="church" size={SECTION_ICON_SIZE} color={color} />;
      case 'choir-guide':
        return (
          <MaterialCommunityIcons name="music-note-outline" size={SECTION_ICON_SIZE} color={color} />
        );
      case 'altar-roles':
        return <MaterialCommunityIcons name="candle" size={SECTION_ICON_SIZE} color={color} />;
      case 'reader-guide':
        return (
          <MaterialCommunityIcons
            name="book-open-page-variant-outline"
            size={SECTION_ICON_SIZE}
            color={color}
          />
        );
      case 'deacon-guide':
        return (
          <MaterialCommunityIcons name="account-tie-outline" size={SECTION_ICON_SIZE} color={color} />
        );
      case 'priest-guide':
        return <MaterialCommunityIcons name="cross" size={SECTION_ICON_SIZE} color={color} />;
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
