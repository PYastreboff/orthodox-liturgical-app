import type { OrthocalDay } from '../api/orthocal';
import {
  fastingFoodsForLevel,
  formatOrthocalFastLabel,
  toneLabelFromApi,
} from '../api/orthocal';
import type { PlainDate } from '../calendar/julianGregorian';
import type { PrimaryCalendar } from '../calendar/dateDisplay';
import {
  formatOrthocalLiturgicalDate,
  liturgicalCalendarShortLabel,
  orthocalApiPath,
} from '../calendar/liturgicalCalendar';
import {
  buildLiturgicalTextSections,
  type LiturgicalTextSection,
} from './liturgicalTexts';
import type { LiturgicalDayAppearance } from '../calendar/dayAppearance';
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

const DEFAULT_SAINTS = ['Commemorations will appear when connected.'];

export type DayDashboardData = {
  /** orthocal `titles[0]` verbatim (typikon prose stripped). */
  dayTitle: string;
  toneLabel: string;
  feastRank: FeastRankDisplay;
  fastLabel: string;
  saints: string[];
  feasts: string[];
  titles: string[];
  fastingLevel: string;
  fastingFoods: string;
  fastingNote: string;
  liturgicalTexts: LiturgicalTextSection[];
  orthocalQueryLabel: string;
  orthocalChurchDateLabel: string | null;
  fromApi: boolean;
};

function buildFastingNote(day: OrthocalDay | null, appearanceKey: string): string {
  if (day?.service_notes?.length) {
    return sanitizeTypikonProse(day.service_notes.join(' '));
  }
  if (appearanceKey === 'wednesday_fast' || appearanceKey === 'friday_fast') {
    return 'Wednesday and Friday are fasting days in the Russian tradition, except during Bright Week, the week after Pentecost, and the week after Nativity. Feasts may relax the fast; confirm with your typikon.';
  }
  if (appearanceKey.includes('lent')) {
    return 'Lenten rules may differ on weekends and feasts; confirm with your typikon.';
  }
  return 'Data from orthocal.info (OCA rubrics). Verify against Moscow Patriarchate practice where they differ.';
}

function dayTitleFromOrthocal(
  liturgicalDay: OrthocalDay | null,
  localFallbackTitle: string,
): string {
  if (liturgicalDay?.titles?.[0]?.trim()) {
    return sanitizeTypikonProse(liturgicalDay.titles[0]);
  }
  if (liturgicalDay?.summary_title?.trim()) {
    return sanitizeTypikonProse(liturgicalDay.summary_title);
  }
  return sanitizeTypikonProse(localFallbackTitle);
}

export function buildDayDashboard(
  liturgicalDay: OrthocalDay | null,
  appearance: LiturgicalDayAppearance,
  liturgicalCalendar: PrimaryCalendar,
  civil: PlainDate,
): DayDashboardData {
  const appearanceKey = appearance.key;
  const localFallbackTitle = appearance.label || 'Liturgical Day';

  const toneLabel = liturgicalDay ? toneLabelFromApi(liturgicalDay.tone) : 'Tone 4';
  const apiFeastRank = getFeastRankDisplay(
    liturgicalDay?.feast_level,
    liturgicalDay?.feast_level_description,
  );
  const feastRank =
    feastRankForLiturgicalDay(appearanceKey, apiFeastRank, liturgicalDay) ??
    ({ glyph: 'ordinary', shortName: 'Ordinary', tint: '#2b2623' } as FeastRankDisplay);

  const weeklyFast = shouldApplyWeeklyFastOverride(liturgicalDay, appearanceKey);

  const fastLabel = weeklyFast
    ? WEEKLY_FAST_LEVEL_LABEL
    : liturgicalDay
      ? formatOrthocalFastLabel(liturgicalDay)
      : appearanceKey.includes('lent') || appearanceKey.includes('fast')
        ? 'Strict fast'
        : 'No fast';

  const saints = liturgicalDay?.saints?.length
    ? sanitizeTypikonProseList(liturgicalDay.saints)
    : DEFAULT_SAINTS;

  const feasts =
    liturgicalDay?.feasts && liturgicalDay.feasts.length
      ? sanitizeTypikonProseList(liturgicalDay.feasts)
      : [];

  const titles = liturgicalDay?.titles?.length
    ? sanitizeTypikonProseList(liturgicalDay.titles)
    : [sanitizeTypikonProse(localFallbackTitle)];

  const fastingLevel = weeklyFast
    ? WEEKLY_FAST_LEVEL_LABEL
    : liturgicalDay?.fast_level_desc?.trim() || fastLabel;
  const fastingFoods = weeklyFast
    ? WEEKLY_FAST_FOODS
    : liturgicalDay
      ? fastingFoodsForLevel(liturgicalDay.fast_level, appearanceKey)
      : fastingFoodsForLevel(0, appearanceKey);

  const liturgicalTexts = buildLiturgicalTextSections(liturgicalDay);

  const orthocalChurchDateLabel = liturgicalDay
    ? formatOrthocalLiturgicalDate(liturgicalDay, liturgicalCalendar)
    : null;

  return {
    dayTitle: dayTitleFromOrthocal(liturgicalDay, localFallbackTitle),
    toneLabel,
    feastRank,
    fastLabel,
    saints,
    feasts,
    titles,
    fastingLevel,
    fastingFoods,
    fastingNote: buildFastingNote(liturgicalDay, appearanceKey),
    liturgicalTexts,
    orthocalQueryLabel: `orthocal.info${orthocalApiPath(liturgicalCalendar, civil)} (${liturgicalCalendarShortLabel(liturgicalCalendar)} rubrics)`,
    orthocalChurchDateLabel,
    fromApi: Boolean(liturgicalDay),
  };
}
