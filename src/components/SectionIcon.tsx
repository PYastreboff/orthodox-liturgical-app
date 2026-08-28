import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppTranslation } from '../i18n/useAppTranslation';
import { HoverAccessible } from './HoverAccessible';
import { TypikonGlyphIcon } from './TypikonGlyphIcon';

export type SectionIconName =
  | 'serving-role'
  | 'date'
  | 'about-today'
  | 'feasts'
  | 'saints'
  | 'fasting'
  | 'recipes'
  | 'vestments'
  | 'church-clothing'
  | 'services'
  | 'choir-guide'
  | 'altar-roles'
  | 'reader-guide'
  | 'deacon-guide'
  | 'priest-guide'
  | 'readings'
  | 'prayers'
  | 'jesus-prayer'
  | 'liturgy';

const SECTION_ICON_KEYS: Record<SectionIconName, string> = {
  'serving-role': 'today.servingRole',
  date: 'today.sectionDate',
  'about-today': 'dayAbout.sectionTitle',
  feasts: 'today.sectionFeasts',
  saints: 'today.sectionSaints',
  fasting: 'today.sectionFasting',
  recipes: 'today.sectionRecipes',
  vestments: 'today.sectionVestments',
  'church-clothing': 'today.sectionChurchDress',
  services: 'today.sectionServices',
  'choir-guide': 'today.sectionChoirGuide',
  'altar-roles': 'today.sectionAltarRoles',
  'reader-guide': 'today.sectionReaderGuide',
  'deacon-guide': 'today.sectionDeaconGuide',
  'priest-guide': 'today.sectionPriestGuide',
  readings: 'today.sectionReadings',
  prayers: 'today.sectionPrayers',
  'jesus-prayer': 'today.sectionJesusPrayer',
  liturgy: 'today.sectionLiturgy',
};

export const SECTION_ICON_SIZE = 22;

type Props = {
  name: SectionIconName;
  color: string;
  size?: number;
};

export function SectionIcon({ name, color, size = SECTION_ICON_SIZE }: Props) {
  const { t } = useAppTranslation();
  const icon = (() => {
    switch (name) {
      case 'serving-role':
        return (
          <MaterialCommunityIcons name="account-group-outline" size={size} color={color} />
        );
      case 'date':
        return <Feather name="calendar" size={size} color={color} />;
      case 'about-today':
        return <Feather name="book-open" size={size} color={color} />;
      case 'feasts':
        return <MaterialCommunityIcons name="star-four-points-outline" size={size} color={color} />;
      case 'saints':
        return <MaterialCommunityIcons name="account-outline" size={size} color={color} />;
      case 'fasting':
        return <MaterialCommunityIcons name="baguette" size={size} color={color} />;
      case 'recipes':
        return <MaterialCommunityIcons name="food-variant" size={size} color={color} />;
      case 'vestments':
        return <MaterialCommunityIcons name="hanger" size={size} color={color} />;
      case 'church-clothing':
        return (
          <MaterialCommunityIcons name="tshirt-crew-outline" size={size} color={color} />
        );
      case 'services':
        return <MaterialCommunityIcons name="church" size={size} color={color} />;
      case 'choir-guide':
        return (
          <MaterialCommunityIcons name="music-note-outline" size={size} color={color} />
        );
      case 'altar-roles':
        return <MaterialCommunityIcons name="candle" size={size} color={color} />;
      case 'reader-guide':
        return (
          <MaterialCommunityIcons name="book-cross" size={size} color={color} />
        );
      case 'deacon-guide':
        return (
          <MaterialCommunityIcons name="account-tie-outline" size={size} color={color} />
        );
      case 'priest-guide':
        return <MaterialCommunityIcons name="cross" size={size} color={color} />;
      case 'readings':
        return (
          <MaterialCommunityIcons
            name="book-open-page-variant-outline"
            size={size}
            color={color}
          />
        );
      case 'prayers':
        return <MaterialCommunityIcons name="hands-pray" size={size} color={color} />;
      case 'jesus-prayer':
        return <MaterialCommunityIcons name="meditation" size={size} color={color} />;
      case 'liturgy':
        return <TypikonGlyphIcon glyph="liturgy" size={size} color={color} />;
      default:
        return <Feather name="circle" size={size} color={color} />;
    }
  })();

  return (
    <HoverAccessible label={t(SECTION_ICON_KEYS[name])} accessibilityRole="image">
      {icon}
    </HoverAccessible>
  );
}
