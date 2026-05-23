import type { FeastRankDisplay } from '../lib/liturgical/typikonSymbols';
import { FEAST_RANK_BY_LEVEL } from '../lib/liturgical/typikonSymbols';
import { translate } from './translate';
import type { UiLanguage } from './types';

const FEAST_LEVEL_MESSAGE_KEYS: Record<number, string> = {
  [-1]: 'typikon.noLiturgy',
  [0]: 'typikon.liturgyUnranked',
  [1]: 'typikon.presanctified',
  [2]: 'typikon.sixStichera',
  [3]: 'typikon.doxology',
  [4]: 'typikon.polyeleos',
  [5]: 'typikon.vigil',
  [6]: 'typikon.greatFeast',
  [7]: 'typikon.majorFeastTheotokos',
  [8]: 'typikon.majorFeast',
};

function feastLevelFromRank(rank: FeastRankDisplay): number | undefined {
  for (const [level, display] of Object.entries(FEAST_RANK_BY_LEVEL)) {
    const n = Number(level);
    if (display.glyph === rank.glyph && display.shortName === rank.shortName) {
      return n;
    }
  }
  return undefined;
}

export function feastRankServiceLabel(rank: FeastRankDisplay, lang: UiLanguage): string {
  const level = feastLevelFromRank(rank);
  if (level !== undefined) {
    const key = FEAST_LEVEL_MESSAGE_KEYS[level];
    if (key) return translate(lang, key);
  }
  if (rank.glyph === 'ordinary' || rank.shortName === 'Ordinary') {
    return translate(lang, 'typikon.ordinaryDay');
  }
  return rank.shortName;
}

/**
 * Typikon service rank beside the icon on major-feast days (orthocal FeastLevels 6–8).
 * Level 6 = great-feast circle; 7–8 = major feast Lord / Theotokos.
 */
export function feastRankServiceLabelForMajorFeastDay(
  rank: FeastRankDisplay,
  orthocalFeastLevel: number | undefined,
  lang: UiLanguage,
): string {
  if (orthocalFeastLevel === 7) {
    return translate(lang, 'typikon.majorFeastTheotokos');
  }
  if (orthocalFeastLevel === 8) {
    return translate(lang, 'typikon.majorFeast');
  }
  if (orthocalFeastLevel !== undefined && orthocalFeastLevel >= 6) {
    return translate(lang, 'typikon.greatFeast');
  }
  if (rank.glyph === 'great_feast') {
    return translate(lang, 'typikon.greatFeast');
  }
  return translate(lang, 'typikon.majorFeast');
}

export function feastRankAccessibilityLabel(rank: FeastRankDisplay, lang: UiLanguage): string {
  return feastRankServiceLabel(rank, lang);
}

export function localizedToneLabel(tone: number, lang: UiLanguage): string {
  if (tone >= 1 && tone <= 8) return translate(lang, 'typikon.tone', { n: tone });
  return translate(lang, 'typikon.toneUnknown');
}
