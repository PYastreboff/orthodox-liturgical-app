/**
 * Orthodox Typikon rank symbols — drawn as SVG (see TypikonGlyphIcon).
 * Maps orthocal.info feast_level integers — see calendarium/datetools.py FeastLevels.
 *
 * Reference: https://www.ponomar.net/typicon.html
 */

export type TypikonGlyph =
  | 'no_liturgy'
  | 'liturgy'
  | 'presanctified'
  | 'six_stichera'
  | 'doxology'
  | 'polyeleos'
  | 'vigil'
  | 'great_feast'
  | 'ordinary';

export type FeastRankDisplay = {
  glyph: TypikonGlyph;
  shortName: string;
  /** Stroke/fill colour for the drawn symbol. */
  tint?: string;
};

const RED = '#8b2e3c';
const BLACK = '#2b2623';

/** orthocal FeastLevels keys → display */
export const FEAST_RANK_BY_LEVEL: Record<number, FeastRankDisplay> = {
  [-1]: { glyph: 'no_liturgy', shortName: 'No Liturgy', tint: BLACK },
  [0]: { glyph: 'liturgy', shortName: 'Liturgy', tint: BLACK },
  [1]: { glyph: 'presanctified', shortName: 'Presanctified', tint: '#5c3b2e' },
  [2]: { glyph: 'six_stichera', shortName: 'Six stichera', tint: BLACK },
  [3]: { glyph: 'doxology', shortName: 'Doxology', tint: RED },
  [4]: { glyph: 'polyeleos', shortName: 'Polyeleos', tint: RED },
  [5]: { glyph: 'vigil', shortName: 'Vigil', tint: RED },
  [6]: { glyph: 'great_feast', shortName: 'Great Feast', tint: RED },
  [7]: { glyph: 'great_feast', shortName: 'Major feast (Theotokos)', tint: RED },
  [8]: { glyph: 'great_feast', shortName: 'Major feast (Lord)', tint: RED },
};

/** Exact orthocal API feast_level_description strings. */
const ORTHOCAL_PROSE_TO_LEVEL: Record<string, number> = {
  'No Liturgy': -1,
  Liturgy: 0,
  Presanctified: 1,
  'Black squigg (6-stich typikon symbol)': 2,
  'Red squigg (doxology typikon symbol)': 3,
  'Red cross (polyeleos typikon symbol)': 4,
  'Red cross half-circle (vigil typikon symbol)': 5,
  'Red cross circle (great feast typikon symbol)': 6,
  'Major feast Theotokos': 7,
  'Major feast Lord': 8,
};

const ORTHOCAL_PROSE_PHRASES = Object.keys(ORTHOCAL_PROSE_TO_LEVEL).sort(
  (a, b) => b.length - a.length,
);

function fromDescription(description: string): FeastRankDisplay | null {
  const level = ORTHOCAL_PROSE_TO_LEVEL[description.trim()];
  if (level !== undefined) return FEAST_RANK_BY_LEVEL[level];
  const d = description.toLowerCase();
  if (d.includes('no liturgy')) return FEAST_RANK_BY_LEVEL[-1];
  if (d.includes('presanctified')) return FEAST_RANK_BY_LEVEL[1];
  if (d.includes('6-stich') || d.includes('black squigg')) return FEAST_RANK_BY_LEVEL[2];
  if (d.includes('doxology') || d.includes('red squigg')) return FEAST_RANK_BY_LEVEL[3];
  if (d.includes('polyeleos') || d.includes('red cross (polyeleos')) return FEAST_RANK_BY_LEVEL[4];
  if (d.includes('half-circle') || d.includes('vigil typikon')) return FEAST_RANK_BY_LEVEL[5];
  if (d.includes('red cross circle') || d.includes('great feast typikon')) return FEAST_RANK_BY_LEVEL[6];
  if (d.includes('theotokos')) return FEAST_RANK_BY_LEVEL[7];
  if (d.includes('major feast lord')) return FEAST_RANK_BY_LEVEL[8];
  if (d === 'liturgy') return FEAST_RANK_BY_LEVEL[0];
  return null;
}

export function getFeastRankDisplay(
  feastLevel: number | undefined,
  feastLevelDescription?: string,
): FeastRankDisplay {
  if (feastLevel !== undefined && FEAST_RANK_BY_LEVEL[feastLevel]) {
    return FEAST_RANK_BY_LEVEL[feastLevel];
  }
  const parsed = feastLevelDescription ? fromDescription(feastLevelDescription) : null;
  if (parsed) return parsed;
  return { glyph: 'ordinary', shortName: 'Ordinary', tint: BLACK };
}

/** Remove orthocal typikon prose from running text (symbols are rendered separately as SVG). */
export function sanitizeTypikonProse(text: string): string {
  let out = text;
  for (const prose of ORTHOCAL_PROSE_PHRASES) {
    const re = new RegExp(prose.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    out = out.replace(re, '');
  }
  return out.replace(/\s{2,}/g, ' ').replace(/\s+([.,;:])/g, '$1').trim();
}

export function sanitizeTypikonProseList(items: string[]): string[] {
  return items.map(sanitizeTypikonProse);
}
