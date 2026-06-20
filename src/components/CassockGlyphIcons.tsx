import Svg, { Circle, Line, Path } from 'react-native-svg';

type Props = {
  size: number;
  color: string;
};

function strokeWidth(size: number): number {
  return Math.max(1.35, size * 0.085);
}

/** Inner under-cassock — narrow, crew neck, button placket. */
export function PodryasnikGlyphIcon({ size, color }: Props) {
  const sw = strokeWidth(size);

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityRole="image">
      <Path
        d="M 9.5 7.8 L 14.5 7.8 L 15.2 21.2 L 8.8 21.2 Z"
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      <Path
        d="M 10.2 7.8 Q 12 6.6 13.8 7.8"
        fill="none"
        stroke={color}
        strokeWidth={sw * 0.9}
        strokeLinecap="round"
      />
      <Line
        x1={12}
        y1={9.2}
        x2={12}
        y2={19.8}
        stroke={color}
        strokeWidth={sw * 0.55}
        strokeLinecap="round"
      />
      <Circle cx={12} cy={10.8} r={0.55} fill={color} />
      <Circle cx={12} cy={13.8} r={0.55} fill={color} />
      <Circle cx={12} cy={16.8} r={0.55} fill={color} />
    </Svg>
  );
}

/** Outer ryassa — wider cut, open V-neck. */
export function RyassaGlyphIcon({ size, color }: Props) {
  const sw = strokeWidth(size);

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityRole="image">
      <Path
        d="M 7.2 8.4 L 16.8 8.4 L 18 21.2 L 6 21.2 Z"
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      <Path
        d="M 9.2 8.4 L 12 11.2 L 14.8 8.4"
        fill="none"
        stroke={color}
        strokeWidth={sw * 0.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M 11.2 11.8 L 12 13.2 L 12.8 11.8 M 12 13.2 L 12 15.2 M 10.6 11.8 L 13.4 11.8"
        fill="none"
        stroke={color}
        strokeWidth={sw * 0.55}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
