import type { OrthocalDay } from '../api/orthocal';
import { fastingFoodsForLevel, formatOrthocalFastLabel } from '../api/orthocal';
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
import { shouldApplyWeeklyFastOverride } from '../calendar/weeklyFast';
import { feastRankForLiturgicalDay } from './calendarTypikon';
import {
  getFeastRankDisplay,
  sanitizeTypikonProse,
  type FeastRankDisplay,
} from './typikonSymbols';

export type DayDashboardData = {
  /** orthocal `titles[0]` verbatim (typikon prose stripped). */
  dayTitle: string;
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

  const weeklyFast = shouldApplyWeeklyFastOverride(liturgicalDay, appearanceKey);

  const fastLabel = weeklyFast
    ? translate(lang, 'fasting.weeklyLevel')
    : liturgicalDay
      ? formatOrthocalFastLabel(liturgicalDay)
      : appearanceKey.includes('lent') || appearanceKey.includes('fast')
        ? translate(lang, 'fasting.strict')
        : translate(lang, 'fasting.noFast');

  const fastingLevel = weeklyFast
    ? translate(lang, 'fasting.weeklyLevel')
    : liturgicalDay?.fast_level_desc?.trim() || fastLabel;
  const fastingFoods = weeklyFast
    ? translate(lang, 'fasting.weeklyFoods')
    : liturgicalDay
      ? fastingFoodsForLevel(liturgicalDay.fast_level, appearanceKey)
      : fastingFoodsForLevel(0, appearanceKey);

  const orthocalChurchDateLabel = liturgicalDay
    ? formatOrthocalLiturgicalDate(liturgicalDay, liturgicalCalendar)
    : null;

  return {
    dayTitle: dayTitleFromOrthocal(liturgicalDay, localFallbackTitle),
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
