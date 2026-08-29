import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import {
  layoutPrayerRope,
  ropeBeadMetrics,
  type RopeLength,
} from '../lib/prayers/jesusPrayerRope';

const ROPE_MAX_WIDTH = 300;

type Props = {
  length: RopeLength;
  count: number;
  isDark: boolean;
  knotActive: string;
  knotIdle: string;
  dividerActive: string;
  dividerIdle: string;
};

export function PrayerRopeVisual({
  length,
  count,
  isDark,
  knotActive,
  knotIdle,
  dividerActive,
  dividerIdle,
}: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const metrics = useMemo(() => ropeBeadMetrics(length), [length]);
  const layout = useMemo(() => layoutPrayerRope(length, metrics), [length, metrics]);

  const ropeMain = isDark ? '#8a7358' : '#9a7b5c';
  const ropeShadow = isDark ? '#4a3d30' : '#6f5640';
  const beadStroke = isDark ? '#5c4a38' : '#7a6248';

  const pad = 4;
  const viewWidth = layout.width + pad * 2;
  const viewHeight = layout.height + pad * 2;
  const maxWidth = Math.min(screenWidth - 72, ROPE_MAX_WIDTH);
  const displayWidth = Math.min(viewWidth, maxWidth);
  const displayHeight = (viewHeight / viewWidth) * displayWidth;

  const first = layout.sequence[0];
  const last = layout.sequence[layout.sequence.length - 1];
  const ropeStart = first ? first.x - first.size / 2 : 0;
  const ropeEnd = last ? last.x + last.size / 2 : layout.width;
  const ropeY = layout.centerY;

  return (
    <View
      style={styles.wrap}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width={displayWidth} height={displayHeight} viewBox={`${-pad} ${-pad} ${viewWidth} ${viewHeight}`}>
        <Line
          x1={ropeStart}
          y1={ropeY}
          x2={ropeEnd}
          y2={ropeY}
          stroke={ropeShadow}
          strokeWidth={4}
          strokeLinecap="round"
        />
        <Line
          x1={ropeStart}
          y1={ropeY}
          x2={ropeEnd}
          y2={ropeY}
          stroke={ropeMain}
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {layout.sequence.map((node) => {
          const filled = count >= node.prayerIndex;
          const isDivider = node.kind === 'divider';
          const fill = filled
            ? isDivider
              ? dividerActive
              : knotActive
            : isDivider
              ? dividerIdle
              : knotIdle;

          return (
            <Circle
              key={node.id}
              cx={node.x}
              cy={node.y}
              r={node.size / 2}
              fill={fill}
              stroke={beadStroke}
              strokeWidth={1}
            />
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
  },
});
