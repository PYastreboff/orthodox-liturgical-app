import React from 'react';
import Svg, { Path } from 'react-native-svg';

type IconProps = {
  size?: number;
  color?: string;
};

export function PrayerRopeIcon({ size = 20, color = 'currentColor' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Smaller Circular Knotted Rope Loop */}
      <Path
        d="M 12 4 A 3.5 3.5 0 1 1 11.99 4"
        stroke={color}
        strokeWidth="1.75"
        strokeDasharray="1.5 1.5"
        strokeLinecap="round"
      />
      {/* Prominent Cross */}
      <Path
        d="M12 11V21M7 15H17"
        stroke={color}
        strokeWidth="2.25"
        strokeLinecap="round"
      />
    </Svg>
  );
}