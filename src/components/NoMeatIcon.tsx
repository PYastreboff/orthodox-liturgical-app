import Svg, { Line, Path } from 'react-native-svg';

export const FASTING_NO_MEAT_COLOR = '#b02222';
export const FASTING_NO_MEAT_SLASH_COLOR = '#5f1717';

const VIEW_SIZE = 24;
const SLASH_Y = VIEW_SIZE / 2;
/** M cap bounds (centered in the 24×24 viewBox). */
const GLYPH_LEFT = 5.55;
const GLYPH_RIGHT = 18.45;
/** Slash extends slightly past the M stems. */
const SLASH_EXTEND = 0.4;
const SLASH_LEFT = GLYPH_LEFT - SLASH_EXTEND;
const SLASH_RIGHT = GLYPH_RIGHT + SLASH_EXTEND;

/** Bold “M” — tall cap; outer width matches the slash line. */
const M_GLYPH_PATH = `M${GLYPH_LEFT} 19V5h2.5l3.9 9.5L15.95 5h2.5v14h-2.3v-8.7l-3.4 8.7h-1.5l-3.4-8.7V19H${GLYPH_LEFT}z`;

type Props = {
  size: number;
  color?: string;
  slashColor?: string;
};

/** Stroked “M” with horizontal slash — meat fast / Cheesefare week. */
export function NoMeatIcon({
  size,
  color = FASTING_NO_MEAT_COLOR,
  slashColor = FASTING_NO_MEAT_SLASH_COLOR,
}: Props) {
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}>
      <Path d={M_GLYPH_PATH} fill={color} />
      <Line
        x1={SLASH_LEFT}
        y1={SLASH_Y}
        x2={SLASH_RIGHT}
        y2={SLASH_Y}
        stroke={slashColor}
        strokeWidth={2.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}
