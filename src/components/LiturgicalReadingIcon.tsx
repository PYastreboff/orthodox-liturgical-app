import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import type { LiturgicalTextCategory } from '../lib/liturgical/liturgicalTexts';
import { HoverAccessible } from './HoverAccessible';

const ICON_SIZE = 20;

const READING_ICON_LABELS: Record<LiturgicalTextCategory, string> = {
  troparion: 'Troparion',
  kontakion: 'Kontakion',
  prokeimenon: 'Prokeimenon',
  alleluia: 'Alleluia',
  epistle: 'Epistle reading',
  gospel: 'Gospel reading',
  communion: 'Communion verse',
};

type Props = {
  category: LiturgicalTextCategory;
  color: string;
  size?: number;
};

export function LiturgicalReadingIcon({ category, color, size = ICON_SIZE }: Props) {
  const icon = (() => {
    switch (category) {
      case 'troparion':
        return <MaterialCommunityIcons name="music-note-outline" size={size} color={color} />;
      case 'kontakion':
        return <MaterialCommunityIcons name="music-circle-outline" size={size} color={color} />;
      case 'prokeimenon':
        return <MaterialCommunityIcons name="format-quote-open" size={size} color={color} />;
      case 'alleluia':
        return <MaterialCommunityIcons name="format-quote-close" size={size} color={color} />;
      case 'epistle':
        return (
          <MaterialCommunityIcons name="book-open-page-variant-outline" size={size} color={color} />
        );
      case 'gospel':
        return <MaterialCommunityIcons name="book-cross" size={size} color={color} />;
      case 'communion':
        return <MaterialCommunityIcons name="cup-water" size={size} color={color} />;
      default:
        return <Feather name="book-open" size={size} color={color} />;
    }
  })();

  return (
    <HoverAccessible label={READING_ICON_LABELS[category]} accessibilityRole="image">
      {icon}
    </HoverAccessible>
  );
}
