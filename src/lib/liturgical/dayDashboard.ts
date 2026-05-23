import type { OrthocalDay } from '../api/orthocal';
import {
  localizedFastingFoodsForLevel,
  localizedOrthocalFastLabel,
} from '../../i18n/fastingLabels';
import { localizedToneLabel } from '../../i18n/feastRank';
import { translate } from '../../i18n/translate';
import type { UiLanguage } from '../../i18n/types';
import type { PlainDate } from '../calendar/julianGregorian';
import type { PrimaryCalendar } from '../calendar/dateDisplay';
import {
  formatOrthocalLiturgicalDate,
  liturgicalCalendarShortLabel,
  orthocalApiPath,
} from '../calendar/liturgicalCalendar';
import type { LiturgicalDayAppearance } from '../calendar/dayAppearance';
import { civilWeekday, shouldApplyWeeklyFastOverride } from '../calendar/weeklyFast';
import { feastRankForLiturgicalDay } from './calendarTypikon';
import { liturgicalDayTitle, shouldUseMajorFeastDayTitle } from './liturgicalDayTitle';
import {
  getFeastRankDisplay,
  sanitizeTypikonProse,
  type FeastRankDisplay,
} from './typikonSymbols';

export type DayDashboardData = {
  /** Primary feast name on great feasts; otherwise orthocal title. */
  dayTitle: string;
  /** orthocal great feast / fixed major feast — highlight in Date & Liturgical Day. */
  isMajorFeastDay: boolean;
  toneLabel: string;
  feastRank: FeastRankDisplay;
  fastLabel: string;
  fastingLevel: string;
  fastingFoods: string;
  fastingNote: string;
  orthocalQueryLabel: string;
  orthocalChurchDateLabel: string | null;
};

function buildFastingNote(day: OrthocalDay | null, appearanceKey: string, lang: UiLanguage): string {
  if (day?.service_notes?.length) {
    return sanitizeTypikonProse(day.service_notes.join(' '));
  }
  if (appearanceKey === 'wednesday_fast' || appearanceKey === 'friday_fast') {
    return translate(lang, 'fasting.noteWeekly');
  }
  if (appearanceKey.includes('lent')) {
    return translate(lang, 'fasting.noteLent');
  }
  return translate(lang, 'fasting.noteDefault');
}

export function buildDayDashboard(
  liturgicalDay: OrthocalDay | null,
  appearance: LiturgicalDayAppearance,
  liturgicalCalendar: PrimaryCalendar,
  civil: PlainDate,
  lang: UiLanguage = 'en',
): DayDashboardData {
  const appearanceKey = appearance.key;
  const localFallbackTitle = appearance.label || 'Liturgical Day';

  const toneLabel = liturgicalDay
    ? localizedToneLabel(liturgicalDay.tone, lang)
    : localizedToneLabel(4, lang);
  const apiFeastRank = getFeastRankDisplay(
    liturgicalDay?.feast_level,
    liturgicalDay?.feast_level_description,
  );
  const feastRank =
    feastRankForLiturgicalDay(appearanceKey, apiFeastRank, liturgicalDay) ??
    ({ glyph: 'ordinary', shortName: 'Ordinary', tint: '#2b2623' } as FeastRankDisplay);

  const weeklyFast = shouldApplyWeeklyFastOverride(
    liturgicalDay,
    appearanceKey,
    civilWeekday(civil),
  );

  const fastLabel = weeklyFast
    ? translate(lang, 'fasting.weeklyLevel')
    : liturgicalDay
      ? localizedOrthocalFastLabel(liturgicalDay, lang)
      : appearanceKey.includes('lent') || appearanceKey.includes('fast')
        ? translate(lang, 'fasting.strict')
        : translate(lang, 'fasting.noFast');

  const fastingLevel = fastLabel;
  const fastingFoods = weeklyFast
    ? translate(lang, 'fasting.weeklyFoods')
    : liturgicalDay
      ? localizedFastingFoodsForLevel(liturgicalDay.fast_level, appearanceKey, lang)
      : localizedFastingFoodsForLevel(0, appearanceKey, lang);

  const orthocalChurchDateLabel = liturgicalDay
    ? formatOrthocalLiturgicalDate(liturgicalDay, liturgicalCalendar, lang)
    : null;

  const isMajorFeastDay = shouldUseMajorFeastDayTitle(liturgicalDay, appearanceKey, feastRank);

  return {
    dayTitle: liturgicalDayTitle(
      liturgicalDay,
      appearanceKey,
      localFallbackTitle,
      feastRank,
    ),
    isMajorFeastDay,
    toneLabel,
    feastRank,
    fastLabel,
    fastingLevel,
    fastingFoods,
    fastingNote: buildFastingNote(liturgicalDay, appearanceKey, lang),
    orthocalQueryLabel: `orthocal.info${orthocalApiPath(liturgicalCalendar, civil)} (${liturgicalCalendarShortLabel(liturgicalCalendar)} rubrics)`,
    orthocalChurchDateLabel,
  };
}
