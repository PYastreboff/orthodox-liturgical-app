import type { StyleProp, ViewStyle } from 'react-native';

import { feastRankAccessibilityLabel } from '../i18n/feastRank';
import { useAppTranslation } from '../i18n/useAppTranslation';
import {
  typikonIconColor,
  type FeastRankDisplay,
  type TypikonIconSurface,
} from '../lib/liturgical/typikonSymbols';
import { HoverAccessible } from './HoverAccessible';
import { TypikonGlyphIcon } from './TypikonGlyphIcon';

type Variant = 'chip' | 'medium' | 'large';

type Props = {
  feastRank: FeastRankDisplay;
  variant?: Variant;
  /** Override stroke colour (e.g. hero chip on pale background). */
  color?: string;
  /** Card/cell background — picks a contrasting stroke when `color` is omitted. */
  surface?: TypikonIconSurface;
  style?: StyleProp<ViewStyle>;
};

const PIXEL_SIZE: Record<Variant, number> = {
  chip: 22,
  medium: 26,
  large: 32,
};

export function TypikonSymbol({
  feastRank,
  variant = 'medium',
  color,
  surface = 'light',
  style,
}: Props) {
  const { t, lang } = useAppTranslation();
  const size = PIXEL_SIZE[variant];
  const stroke = color ?? typikonIconColor(feastRank, surface);
  const label = feastRankAccessibilityLabel(feastRank, lang);

  return (
    <HoverAccessible
      label={label}
      hint={t('calendarHover.typikonRankHint')}
      style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}
    >
      <TypikonGlyphIcon glyph={feastRank.glyph} size={size} color={stroke} />
    </HoverAccessible>
  );
}
