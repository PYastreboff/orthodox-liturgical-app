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
  pascha: 6,
  bright_week: 6,
  pentecost: 6,
  all_saints: 6,
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
