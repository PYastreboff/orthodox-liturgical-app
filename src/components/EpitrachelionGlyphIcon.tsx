import Svg, { Line, Path } from 'react-native-svg';

type Props = {
  size: number;
  color: string;
};

function strokeWidth(size: number): number {
  return Math.max(1.35, size * 0.085);
}

function stoleCross(x: number, y: number, sw: number, color: string) {
  const csw = sw * 0.55;
  const arm = 1.1;
  return (
    <>
      <Line
        x1={x - arm}
        y1={y}
        x2={x + arm}
        y2={y}
        stroke={color}
        strokeWidth={csw}
        strokeLinecap="round"
      />
      <Line
        x1={x}
        y1={y - arm}
        x2={x}
        y2={y + arm}
        stroke={color}
        strokeWidth={csw}
        strokeLinecap="round"
      />
    </>
  );
}

/** Priest stole — joined at the neck, two bands with crosses (distinct from the deacon’s orarion). */
export function EpitrachelionGlyphIcon({ size, color }: Props) {
  const sw = strokeWidth(size);
  const bandSw = sw * 1.35;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityRole="image">
      <Path
        d="M 7.8 7.4 Q 12 5.9 16.2 7.4"
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
      />
      <Path
        d="M 9.4 7.6 L 9.7 20.6 M 14.6 7.6 L 14.3 20.6"
        fill="none"
        stroke={color}
        strokeWidth={bandSw}
        strokeLinecap="round"
      />
      <Path
        d="M 9.7 7.6 L 12 9.1 L 14.3 7.6"
        fill="none"
        stroke={color}
        strokeWidth={sw * 0.85}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {stoleCross(9.7, 11.2, sw, color)}
      {stoleCross(9.7, 14.4, sw, color)}
      {stoleCross(9.7, 17.6, sw, color)}
      {stoleCross(14.3, 11.2, sw, color)}
      {stoleCross(14.3, 14.4, sw, color)}
      {stoleCross(14.3, 17.6, sw, color)}
    </Svg>
  );
}
