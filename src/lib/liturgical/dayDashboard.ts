import type { OrthocalDay } from '../api/orthocal';
import {
  abbreviatedReadings,
  fastingFoodsForLevel,
  formatOrthocalFastLabel,
  toneLabelFromApi,
} from '../api/orthocal';
import type { LiturgicalDayAppearance } from '../calendar/dayAppearance';
import {
  getFeastRankDisplay,
  sanitizeTypikonProse,
  sanitizeTypikonProseList,
  type FeastRankDisplay,
} from './typikonSymbols';

const DEFAULT_SAINTS = ['Commemorations will appear when connected.'];
const DEFAULT_TROPARION =
  'Troparion and kontakion texts require a licensed translation pack (not provided by Orthocal API).';
const DEFAULT_KONTAKION = '—';

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
  readings: ReturnType<typeof abbreviatedReadings>;
  troparion: string;
  kontakion: string;
  epistleSummary: string;
  gospelSummary: string;
  fromApi: boolean;
};

function buildFastingNote(day: OrthocalDay | null, appearanceKey: string): string {
  if (day?.service_notes?.length) {
    return sanitizeTypikonProse(day.service_notes.join(' '));
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

  const rawTitle =
    julianDay?.summary_title?.trim() ||
    julianDay?.titles?.[0]?.trim() ||
    localFallbackTitle;

  const toneLabel = julianDay ? toneLabelFromApi(julianDay.tone) : 'Tone 4';
  const feastRank = getFeastRankDisplay(
    julianDay?.feast_level,
    julianDay?.feast_level_description ??
      (appearanceKey === 'pascha' ? 'Red cross circle (great feast typikon symbol)' : undefined),
  );

  const julianFastLabel = julianDay
    ? formatOrthocalFastLabel(julianDay)
    : appearanceKey.includes('lent') || appearanceKey.includes('fast')
      ? 'Strict fast'
      : 'No fast';

  const gregorianFastLabel = gregorianDay
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

  const fastingLevel = julianDay?.fast_level_desc?.trim() || julianFastLabel;
  const fastingFoods = julianDay
    ? fastingFoodsForLevel(julianDay.fast_level, appearanceKey)
    : fastingFoodsForLevel(0, appearanceKey);

  const readings = julianDay ? abbreviatedReadings(julianDay) : [];

  const epistle = readings.find((r) => r.label === 'Epistle');
  const gospel = readings.find((r) => r.label === 'Gospel');

  return {
    dayTitle: sanitizeTypikonProse(rawTitle),
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
    readings,
    troparion: DEFAULT_TROPARION,
    kontakion: DEFAULT_KONTAKION,
    epistleSummary: epistle?.citation ?? '—',
    gospelSummary: gospel?.citation ?? '—',
    fromApi: Boolean(julianDay),
  };
}
