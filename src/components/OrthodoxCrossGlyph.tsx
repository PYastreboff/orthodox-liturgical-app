import Svg, { G, Rect } from 'react-native-svg';

import {
  ORTHODOX_CROSS_BARS,
  ORTHODOX_CROSS_VIEW,
  orthodoxCrossCornerRadius,
} from '../brand/orthodoxCrossGeometry';

type PathProps = {
  color: string;
  size: number;
  footrest?: boolean;
};

/** Russian Orthodox cross — three bars plus slanted footrest. */
export function OrthodoxCrossPaths({ color, size, footrest = true }: PathProps) {
  const rx = orthodoxCrossCornerRadius(size);
  const { vertical, main, top, footrest: foot } = ORTHODOX_CROSS_BARS;

  const vLeft = vertical.cx - vertical.width / 2;
  const vHeight = vertical.bottom - vertical.top;
  const mainTop = main.cy - main.height / 2;
  const topTop = top.cy - top.height / 2;
  const footLeft = foot.cx - foot.width / 2;
  const footTop = foot.cy - foot.height / 2;

  return (
    <G>
      <Rect
        x={vLeft}
        y={vertical.top}
        width={vertical.width}
        height={vHeight}
        rx={rx}
        fill={color}
      />
      <Rect
        x={main.left}
        y={mainTop}
        width={main.right - main.left}
        height={main.height}
        rx={rx}
        fill={color}
      />
      <Rect
        x={top.left}
        y={topTop}
        width={top.right - top.left}
        height={top.height}
        rx={rx}
        fill={color}
      />
      {footrest ? (
        <G transform={`rotate(${foot.angleDeg}, ${foot.cx}, ${foot.cy})`}>
          <Rect
            x={footLeft}
            y={footTop}
            width={foot.width}
            height={foot.height}
            rx={rx}
            fill={color}
          />
        </G>
      ) : null}
    </G>
  );
}

type Props = {
  size: number;
  color: string;
  footrest?: boolean;
};

export function OrthodoxCrossGlyph({ size, color, footrest = true }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${ORTHODOX_CROSS_VIEW} ${ORTHODOX_CROSS_VIEW}`}
      accessibilityRole="image"
    >
      <OrthodoxCrossPaths color={color} size={size} footrest={footrest} />
    </Svg>
  );
}

export { ORTHODOX_CROSS_VIEW } from '../brand/orthodoxCrossGeometry';
