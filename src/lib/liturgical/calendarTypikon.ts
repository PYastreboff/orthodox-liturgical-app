import type { OrthocalDay } from '../api/orthocal';
import { isOrthocalGreatFeastLevel } from './liturgicalDayTitle';
import { isInflatedOrthocalRankGlyph, shouldUseOrthocalFeastRank } from './lectionaryDay';
import type { FeastRankDisplay, TypikonGlyph } from './typikonSymbols';
import { getFeastRankDisplay } from './typikonSymbols';

/** Typikon marks shown in the calendar cell corner (not unranked liturgy). */
const CALENDAR_GLYPHS = new Set<TypikonGlyph>([
  'presanctified',
  'six_stichera',
  'doxology',
  'polyeleos',
  'vigil',
  'great_feast',
]);

/** Local appearance keys → orthocal feast_level when API is unavailable. */
const APPEARANCE_FEAST_LEVEL: Record<string, number> = {
  palm_sunday: 6,
  pascha: 6,
  pentecost: 6,
  all_saints: 6,
  all_saints_russia: 6,
  ascension: 6,
  holy_spirit: 6,
  peter_and_paul: 6,
  nativity_theotokos: 6,
  presentation: 6,
  nativity: 6,
  theophany: 6,
  annunciation: 6,
  transfiguration: 6,
  dormition: 6,
  elevation_cross: 6,
};

export function shouldShowCalendarTypikon(glyph: TypikonGlyph): boolean {
  return CALENDAR_GLYPHS.has(glyph);
}

export function feastRankFallbackFromAppearance(appearanceKey: string): FeastRankDisplay | null {
  const level = APPEARANCE_FEAST_LEVEL[appearanceKey];
  if (level === undefined) return null;
  return getFeastRankDisplay(level);
}

/** Bright Week weekdays are not great feasts — only Pascha Sunday uses red feast styling. */
export function feastRankForLiturgicalDay(
  appearanceKey: string,
  apiRank: FeastRankDisplay | null,
  orthocalDay?: OrthocalDay | null,
): FeastRankDisplay | null {
  const rank = apiRank ?? feastRankFallbackFromAppearance(appearanceKey);
  if (appearanceKey === 'bright_week' && rank?.glyph === 'great_feast') {
    return null;
  }
  if (
    !shouldUseOrthocalFeastRank(orthocalDay, appearanceKey) &&
    isInflatedOrthocalRankGlyph(rank?.glyph) &&
    !isOrthocalGreatFeastLevel(orthocalDay)
  ) {
    return null;
  }
  return rank;
}
