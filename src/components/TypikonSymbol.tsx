import { View, type StyleProp, type ViewStyle } from 'react-native';

import type { FeastRankDisplay } from '../lib/liturgical/typikonSymbols';
import { TypikonGlyphIcon } from './TypikonGlyphIcon';

type Variant = 'chip' | 'medium' | 'large';

type Props = {
  feastRank: FeastRankDisplay;
  variant?: Variant;
  /** Override stroke colour (e.g. hero chip on pale background). */
  color?: string;
  style?: StyleProp<ViewStyle>;
};

const PIXEL_SIZE: Record<Variant, number> = {
  chip: 22,
  medium: 26,
  large: 32,
};

export function TypikonSymbol({ feastRank, variant = 'medium', color, style }: Props) {
  const size = PIXEL_SIZE[variant];
  const stroke = color ?? feastRank.tint ?? '#2b2623';

  return (
    <View
      accessibilityLabel={feastRank.shortName}
      style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}
    >
      <TypikonGlyphIcon glyph={feastRank.glyph} size={size} color={stroke} />
    </View>
  );
}
