import type { OrthocalDay } from '../api/orthocal';
import {
  fastingFoodsForLevel,
  formatOrthocalFastLabel,
  toneLabelFromApi,
} from '../api/orthocal';
import {
  buildLiturgicalTextSections,
  type LiturgicalTextSection,
} from './liturgicalTexts';
import type { LiturgicalDayAppearance } from '../calendar/dayAppearance';
import { isMajorFeastAppearance } from '../calendar/calendarCellStyle';
import {
  shouldApplyWeeklyFastOverride,
  WEEKLY_FAST_FOODS,
  WEEKLY_FAST_LEVEL_LABEL,
} from '../calendar/weeklyFast';
import { feastRankForLiturgicalDay } from './calendarTypikon';
import {
  getFeastRankDisplay,
  sanitizeTypikonProse,
  sanitizeTypikonProseList,
  type FeastRankDisplay,
} from './typikonSymbols';

/** Match orthocal `feasts[]` strings to local paschal / fixed feast appearance keys. */
const FEAST_MATCHERS: Partial<Record<string, RegExp[]>> = {
  pascha: [/pascha/i, /easter/i, /resurrection/i],
  bright_week: [/bright\s*week/i],
  pentecost: [/pentecost/i, /holy spirit/i, /trinity sunday/i],
  all_saints: [/all saints/i],
  nativity: [/nativity/i, /christmas/i],
  theophany: [/theophany/i, /epiphany/i],
  annunciation: [/annunciation/i],
  transfiguration: [/transfiguration/i],
  dormition: [/dormition/i, /assumption/i],
  elevation_cross: [/elevation.*cross/i, /exaltation.*cross/i],
};

function feastMatchesAppearance(feast: string, appearanceKey: string): boolean {
  const patterns = FEAST_MATCHERS[appearanceKey];
  if (!patterns?.length) return false;
  return patterns.some((re) => re.test(feast));
}

function resolveDayTitle(
  julianDay: OrthocalDay | null,
  appearance: LiturgicalDayAppearance,
  localFallbackTitle: string,
): string {
  const appearanceKey = appearance.key;

  if (isMajorFeastAppearance(appearanceKey)) {
    const matchingFeast = julianDay?.feasts?.find((f) =>
      feastMatchesAppearance(f, appearanceKey),
    );
    if (matchingFeast?.trim()) {
      return sanitizeTypikonProse(matchingFeast);
    }
    if (appearance.label?.trim()) {
      return sanitizeTypikonProse(appearance.label);
    }
  }

  if (
    appearanceKey !== 'bright_week' &&
    julianDay?.feasts?.length &&
    (julianDay.feast_level ?? 0) >= 6
  ) {
    return sanitizeTypikonProse(julianDay.feasts[0]);
  }

  const rawTitle =
    julianDay?.summary_title?.trim() ||
    julianDay?.titles?.[0]?.trim() ||
    localFallbackTitle;
  return sanitizeTypikonProse(rawTitle);
}

const DEFAULT_SAINTS = ['Commemorations will appear when connected.'];

export type DayDashboardData = {
  dayTitle: string;
  toneLabel: string;
  feastRank: FeastRankDisplay;
  julianFastLabel: string;
  gregorianFastLabel: string;
  saints: string[];
  feasts: string[];
  titles: string[];
  fastingLevel: string;
  fastingFoods: string;
  fastingNote: string;
  liturgicalTexts: LiturgicalTextSection[];
  fromApi: boolean;
};

function buildFastingNote(day: OrthocalDay | null, appearanceKey: string): string {
  if (day?.service_notes?.length) {
    return sanitizeTypikonProse(day.service_notes.join(' '));
  }
  if (appearanceKey === 'wednesday_fast' || appearanceKey === 'friday_fast') {
    return 'Wednesday and Friday are fasting days in the Russian tradition, except during Bright Week after Pascha. Feasts may relax the fast; confirm with your typikon.';
  }
  if (appearanceKey.includes('lent')) {
    return 'Lenten rules may differ on weekends and feasts; confirm with your typikon.';
  }
  return 'Data from orthocal.info (OCA rubrics). Verify against Moscow Patriarchate practice where they differ.';
}

export function buildDayDashboard(
  julianDay: OrthocalDay | null,
  gregorianDay: OrthocalDay | null,
  appearance: LiturgicalDayAppearance,
): DayDashboardData {
  const appearanceKey = appearance.key;
  const localFallbackTitle = appearance.label || 'Liturgical Day';

  const toneLabel = julianDay ? toneLabelFromApi(julianDay.tone) : 'Tone 4';
  const apiFeastRank = getFeastRankDisplay(
    julianDay?.feast_level,
    julianDay?.feast_level_description ??
      (appearanceKey === 'pascha' ? 'Red cross circle (great feast typikon symbol)' : undefined),
  );
  const feastRank =
    feastRankForLiturgicalDay(appearanceKey, apiFeastRank) ??
    ({ glyph: 'ordinary', shortName: 'Ordinary', tint: '#2b2623' } as FeastRankDisplay);

  const julianWeeklyFast = shouldApplyWeeklyFastOverride(julianDay, appearanceKey);

  const julianFastLabel = julianWeeklyFast
    ? WEEKLY_FAST_LEVEL_LABEL
    : julianDay
      ? formatOrthocalFastLabel(julianDay)
      : appearanceKey.includes('lent') || appearanceKey.includes('fast')
        ? 'Strict fast'
        : 'No fast';

  const gregorianFastLabel = julianWeeklyFast
    ? WEEKLY_FAST_LEVEL_LABEL
    : gregorianDay
      ? formatOrthocalFastLabel(gregorianDay)
      : julianFastLabel;

  const saints = julianDay?.saints?.length
    ? sanitizeTypikonProseList(julianDay.saints)
    : DEFAULT_SAINTS;

  const feasts = julianDay?.feasts?.length
    ? sanitizeTypikonProseList(julianDay.feasts)
    : [];

  const titles = julianDay?.titles?.length
    ? sanitizeTypikonProseList(julianDay.titles)
    : [sanitizeTypikonProse(localFallbackTitle)];

  const fastingLevel = julianWeeklyFast
    ? WEEKLY_FAST_LEVEL_LABEL
    : julianDay?.fast_level_desc?.trim() || julianFastLabel;
  const fastingFoods = julianWeeklyFast
    ? WEEKLY_FAST_FOODS
    : julianDay
      ? fastingFoodsForLevel(julianDay.fast_level, appearanceKey)
      : fastingFoodsForLevel(0, appearanceKey);

  const liturgicalTexts = buildLiturgicalTextSections(julianDay);

  return {
    dayTitle: resolveDayTitle(julianDay, appearance, localFallbackTitle),
    toneLabel,
    feastRank,
    julianFastLabel,
    gregorianFastLabel,
    saints,
    feasts,
    titles,
    fastingLevel,
    fastingFoods,
    fastingNote: buildFastingNote(julianDay, appearanceKey),
    liturgicalTexts,
    fromApi: Boolean(julianDay),
  };
}
