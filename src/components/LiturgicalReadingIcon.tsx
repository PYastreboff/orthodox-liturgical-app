import type { LiturgicalTextCategory } from '../lib/liturgical/liturgicalTexts';
import { useAppTranslation } from '../i18n/useAppTranslation';
import { HoverAccessible } from './HoverAccessible';
import { LiturgicalReadingGlyphIcon } from './LiturgicalReadingGlyphIcon';

const ICON_SIZE = 20;

const A11Y_KEYS: Record<LiturgicalTextCategory, string> = {
  troparion: 'readings.troparion',
  kontakion: 'readings.kontakion',
  prokeimenon: 'readings.prokeimenon',
  alleluia: 'readings.alleluia',
  epistle: 'readings.epistle',
  gospel: 'readings.gospel',
  communion: 'readings.communion',
};

type Props = {
  category: LiturgicalTextCategory;
  color: string;
  size?: number;
};

export function LiturgicalReadingIcon({ category, color, size = ICON_SIZE }: Props) {
  const { t } = useAppTranslation();

  return (
    <HoverAccessible label={t(A11Y_KEYS[category])} accessibilityRole="image">
      <LiturgicalReadingGlyphIcon category={category} size={size} color={color} />
    </HoverAccessible>
  );
}
