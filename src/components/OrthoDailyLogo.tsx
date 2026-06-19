import Svg, { G, Rect } from 'react-native-svg';

import { ORTHODOX_CROSS_VIEW } from '../brand/orthodoxCrossGeometry';
import { colors } from '../theme/tokens';
import { OrthodoxCrossPaths } from './OrthodoxCrossGlyph';

type Props = {
  size?: number;
};

/**
 * Branded app mark — wine rounded square with gold Russian Orthodox cross.
 */
export function OrthoDailyLogo({ size = 28 }: Props) {
  const inset = size * 0.13;
  const inner = size - inset * 2;
  const scale = inner / ORTHODOX_CROSS_VIEW;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} accessibilityRole="image">
      <Rect
        x={1}
        y={1}
        width={size - 2}
        height={size - 2}
        rx={size * 0.22}
        fill={colors.accentWine}
      />
      <G transform={`translate(${inset}, ${inset}) scale(${scale})`}>
        <OrthodoxCrossPaths color={colors.accentGold} size={inner} footrest />
      </G>
    </Svg>
  );
}
