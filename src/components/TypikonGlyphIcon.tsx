import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { TypikonGlyph } from '../lib/liturgical/typikonSymbols';

type Props = {
  glyph: TypikonGlyph;
  size: number;
  color: string;
};

/** Pommée cross used on polyeleos / great-feast typikon marks. */
function PommeeCross({ color, sw }: { color: string; sw: number }) {
  return (
    <G>
      <Line x1={12} y1={5.5} x2={12} y2={18.5} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <Line x1={6.5} y1={11} x2={17.5} y2={11} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <Line x1={9.5} y1={8.2} x2={14.5} y2={8.2} stroke={color} strokeWidth={sw * 0.85} strokeLinecap="round" />
    </G>
  );
}

function GreatFeastMark({ color, sw }: { color: string; sw: number }) {
  return (
    <G>
      <Circle cx={12} cy={12} r={9.5} fill="none" stroke={color} strokeWidth={sw} />
      <PommeeCross color={color} sw={sw} />
    </G>
  );
}

function VigilMark({ color, sw }: { color: string; sw: number }) {
  return (
    <G>
      <Path
        d="M 3.2 12 A 8.8 8.8 0 0 0 20.8 12"
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
      />
      <PommeeCross color={color} sw={sw} />
    </G>
  );
}

function PolyeleosMark({ color, sw }: { color: string; sw: number }) {
  return <PommeeCross color={color} sw={sw} />;
}

function ThreeDotsMark({ color, sw }: { color: string; sw: number }) {
  const dot = sw * 0.55;
  return (
    <G>
      <Path
        d="M 4.8 13.5 A 7.2 7.2 0 0 1 19.2 13.5"
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
      />
      <Circle cx={8.2} cy={14.8} r={dot} fill={color} />
      <Circle cx={12} cy={15.6} r={dot} fill={color} />
      <Circle cx={15.8} cy={14.8} r={dot} fill={color} />
    </G>
  );
}

function LiturgyWheelMark({ color, sw }: { color: string; sw: number }) {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <G>
      {rays.map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x2 = 12 + Math.cos(rad) * 8.5;
        const y2 = 12 + Math.sin(rad) * 8.5;
        return (
          <Line
            key={deg}
            x1={12}
            y1={12}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth={sw * 0.75}
            strokeLinecap="round"
          />
        );
      })}
      <Circle cx={12} cy={12} r={2.2} fill={color} />
    </G>
  );
}

function NoLiturgyMark({ color, sw }: { color: string; sw: number }) {
  return (
    <G>
      <Circle cx={12} cy={12} r={9} fill="none" stroke={color} strokeWidth={sw} />
      <Line
        x1={6.2}
        y1={6.2}
        x2={17.8}
        y2={17.8}
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
      />
    </G>
  );
}

function OrdinaryMark({ color, sw }: { color: string; sw: number }) {
  return (
    <Line
      x1={7}
      y1={12}
      x2={17}
      y2={12}
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
    />
  );
}

export function TypikonGlyphIcon({ glyph, size, color }: Props) {
  const sw = Math.max(1.4, size * 0.09);

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityRole="image">
      {glyph === 'great_feast' ? <GreatFeastMark color={color} sw={sw} /> : null}
      {glyph === 'vigil' ? <VigilMark color={color} sw={sw} /> : null}
      {glyph === 'polyeleos' ? <PolyeleosMark color={color} sw={sw} /> : null}
      {glyph === 'presanctified' ? <PolyeleosMark color={color} sw={sw} /> : null}
      {glyph === 'six_stichera' || glyph === 'doxology' ? (
        <ThreeDotsMark color={color} sw={sw} />
      ) : null}
      {glyph === 'liturgy' ? <LiturgyWheelMark color={color} sw={sw} /> : null}
      {glyph === 'no_liturgy' ? <NoLiturgyMark color={color} sw={sw} /> : null}
      {glyph === 'ordinary' ? <OrdinaryMark color={color} sw={sw} /> : null}
    </Svg>
  );
}
