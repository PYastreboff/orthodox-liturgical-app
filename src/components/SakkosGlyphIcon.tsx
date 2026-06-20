import Svg, { Path, Rect } from 'react-native-svg';

type Props = {
  size: number;
  color: string;
};

/** Short-sleeved bishop’s sakkos — boxy tunic, distinct from the conical phelonion. */
export function SakkosGlyphIcon({ size, color }: Props) {
  const sw = Math.max(1.35, size * 0.085);

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityRole="image">
      <Rect
        x={3.5}
        y={10.2}
        width={4.8}
        height={3.6}
        rx={0.9}
        fill="none"
        stroke={color}
        strokeWidth={sw}
      />
      <Rect
        x={15.7}
        y={10.2}
        width={4.8}
        height={3.6}
        rx={0.9}
        fill="none"
        stroke={color}
        strokeWidth={sw}
      />
      <Path
        d="M 8 8.8 L 16 8.8 L 17.4 20.2 L 6.6 20.2 Z"
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      <Path
        d="M 10.4 8.8 Q 12 7.4 13.6 8.8"
        fill="none"
        stroke={color}
        strokeWidth={sw * 0.9}
        strokeLinecap="round"
      />
    </Svg>
  );
}
