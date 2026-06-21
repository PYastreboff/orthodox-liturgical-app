import Svg, { Path } from 'react-native-svg';

type Props = {
  color: string;
  size: number;
};

/** Teardrop — olive oil allowed (calendar, hero, fasting lists). */
export function OilDropIcon({ color, size }: Props) {
  return (
    <Svg width={size} height={size} viewBox="7 4 10 15">
      <Path
        d="M12 4.5c-2.8 4.5-4.8 6.8-4.8 9.3a4.8 4.8 0 0 0 9.6 0c0-2.5-2-4.8-4.8-9.3z"
        fill={color}
      />
    </Svg>
  );
}
