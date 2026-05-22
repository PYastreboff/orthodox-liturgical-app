import Svg, { Line, Rect } from 'react-native-svg';

import { colors } from '../theme/tokens';

type Props = {
  size?: number;
};

/**
 * Simple Orthodox cross on a wine rounded square — readable at tab-bar and header sizes.
 */
export function OrthoDailyLogo({ size = 28 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" accessibilityRole="image">
      <Rect x={1} y={1} width={30} height={30} rx={7} fill={colors.accentWine} />
      <Line
        x1={16}
        y1={7}
        x2={16}
        y2={25}
        stroke={colors.accentGold}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Line
        x1={10.5}
        y1={12.5}
        x2={21.5}
        y2={12.5}
        stroke={colors.accentGold}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Line
        x1={13}
        y1={9.5}
        x2={19}
        y2={9.5}
        stroke={colors.accentGold}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}
