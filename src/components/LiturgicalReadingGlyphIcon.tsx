import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type { LiturgicalTextCategory } from '../lib/liturgical/liturgicalTexts';

type Props = {
  category: LiturgicalTextCategory;
  size: number;
  color: string;
};

const VIEW = 24;

function strokeWidth(size: number): number {
  return Math.max(1.35, size * 0.075);
}

/** Apostolos — rolled scroll with text lines (not used elsewhere in the app). */
function EpistleGlyph({ color, sw }: { color: string; sw: number }) {
  return (
    <G>
      <Path
        d="M 7 6.5 Q 5.5 6.5 5.5 8 L 5.5 17 Q 5.5 18.5 7 18.5 L 16 18.5 Q 17.5 18.5 17.5 17 L 17.5 8 Q 17.5 6.5 16 6.5 Z"
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      <Path
        d="M 7 6.5 Q 8.8 5.2 10.5 6.2 Q 12 7 12 7"
        fill="none"
        stroke={color}
        strokeWidth={sw * 0.9}
        strokeLinecap="round"
      />
      <Line x1={8} y1={10.5} x2={15} y2={10.5} stroke={color} strokeWidth={sw * 0.75} strokeLinecap="round" />
      <Line x1={8} y1={13} x2={14} y2={13} stroke={color} strokeWidth={sw * 0.75} strokeLinecap="round" />
      <Line x1={8} y1={15.5} x2={13} y2={15.5} stroke={color} strokeWidth={sw * 0.75} strokeLinecap="round" />
    </G>
  );
}

/** Evangelion — open codex with central cross (distinct from tab book-cross). */
function GospelGlyph({ color, sw }: { color: string; sw: number }) {
  return (
    <G>
      <Path
        d="M 12 5.5 L 6.5 7.5 L 6.5 18 L 12 16.5 L 17.5 18 L 17.5 7.5 Z"
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      <Line x1={12} y1={5.5} x2={12} y2={16.5} stroke={color} strokeWidth={sw * 0.85} />
      <Line x1={10.2} y1={10.5} x2={13.8} y2={10.5} stroke={color} strokeWidth={sw * 0.8} strokeLinecap="round" />
      <Line x1={12} y1={9} x2={12} y2={12.5} stroke={color} strokeWidth={sw * 0.8} strokeLinecap="round" />
    </G>
  );
}

/** Troparion — hymn: flame over a short staff. */
function TroparionGlyph({ color, sw }: { color: string; sw: number }) {
  return (
    <G>
      <Line x1={8} y1={17} x2={16} y2={17} stroke={color} strokeWidth={sw * 0.7} strokeLinecap="round" />
      <Line x1={10} y1={17} x2={10} y2={13} stroke={color} strokeWidth={sw * 0.7} strokeLinecap="round" />
      <Path
        d="M 10 13 Q 10 9.5 12 8 Q 14 9.5 14 13 Q 13 11.5 12 12.5 Q 11 11.5 10 13 Z"
        fill={color}
        stroke="none"
      />
    </G>
  );
}

/** Kontakion — kontakion verse: two stacked phrases (double arc). */
function KontakionGlyph({ color, sw }: { color: string; sw: number }) {
  return (
    <G>
      <Path
        d="M 6 11 Q 12 7.5 18 11"
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
      />
      <Path
        d="M 7 15.5 Q 12 12 17 15.5"
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
      />
      <Circle cx={6} cy={11} r={sw * 0.45} fill={color} />
      <Circle cx={18} cy={11} r={sw * 0.45} fill={color} />
    </G>
  );
}

/** Prokeimenon — verse before epistle: bold vertical cadence bar. */
function ProkeimenonGlyph({ color, sw }: { color: string; sw: number }) {
  return (
    <G>
      <Line x1={12} y1={6} x2={12} y2={18} stroke={color} strokeWidth={sw * 1.15} strokeLinecap="round" />
      <Line x1={8.5} y1={9} x2={15.5} y2={9} stroke={color} strokeWidth={sw * 0.75} strokeLinecap="round" />
      <Line x1={9} y1={12.5} x2={15} y2={12.5} stroke={color} strokeWidth={sw * 0.75} strokeLinecap="round" />
      <Line x1={9.5} y1={16} x2={14.5} y2={16} stroke={color} strokeWidth={sw * 0.75} strokeLinecap="round" />
    </G>
  );
}

/** Alleluia — three rising “alleluia” arcs. */
function AlleluiaGlyph({ color, sw }: { color: string; sw: number }) {
  return (
    <G>
      <Path d="M 5 16 Q 6.5 11 8 16" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <Path d="M 10 16 Q 12 8.5 14 16" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <Path d="M 16 16 Q 17.5 11 19 16" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </G>
  );
}

/** Communion — chalice with bread disc (unique silhouette). */
function CommunionGlyph({ color, sw }: { color: string; sw: number }) {
  return (
    <G>
      <Path
        d="M 9 8.5 L 15 8.5 L 14 14 Q 12 16.5 10 14 Z"
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      <Line x1={8} y1={8.5} x2={16} y2={8.5} stroke={color} strokeWidth={sw * 0.85} strokeLinecap="round" />
      <Rect
        x={10.5}
        y={5.5}
        width={3}
        height={2.2}
        rx={0.4}
        fill="none"
        stroke={color}
        strokeWidth={sw * 0.75}
      />
      <Line x1={12} y1={16.5} x2={12} y2={18.5} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <Line x1={9.5} y1={18.5} x2={14.5} y2={18.5} stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </G>
  );
}

export function LiturgicalReadingGlyphIcon({ category, size, color }: Props) {
  const sw = strokeWidth(size);
  const glyph = (() => {
    switch (category) {
      case 'troparion':
        return <TroparionGlyph color={color} sw={sw} />;
      case 'kontakion':
        return <KontakionGlyph color={color} sw={sw} />;
      case 'prokeimenon':
        return <ProkeimenonGlyph color={color} sw={sw} />;
      case 'alleluia':
        return <AlleluiaGlyph color={color} sw={sw} />;
      case 'epistle':
        return <EpistleGlyph color={color} sw={sw} />;
      case 'gospel':
        return <GospelGlyph color={color} sw={sw} />;
      case 'communion':
        return <CommunionGlyph color={color} sw={sw} />;
      default:
        return <EpistleGlyph color={color} sw={sw} />;
    }
  })();

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${VIEW} ${VIEW}`}>
      {glyph}
    </Svg>
  );
}
