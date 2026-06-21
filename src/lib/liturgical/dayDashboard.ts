import type { OrthocalDay } from '../api/orthocal';
import {
  isGreatAndHolyFriday,
  isOrthocalFastDay,
  fastSummaryKindFromDetail,
  localizedFastSummaryLabel,
  localizedFastingFoodsDetail,
  heroFastChipDisplay,
  showHeroFeastRankChip,
  type HeroFastChipDisplay,
  type FastSummaryKind,
  type FastingFoodsDetail,
} from '../../i18n/fastingLabels';
import { localizedToneLabel } from '../../i18n/feastRank';
import { translate } from '../../i18n/translate';
import type { UiLanguage } from '../../i18n/types';
import type { PlainDate } from '../calendar/julianGregorian';
import type { LiturgicalDayAppearance } from '../calendar/dayAppearance';
import { isMeatFastRule } from '../calendar/meatFast';
import {
  isWeeklyFastForCivilDate,
  localizedWeeklyFastDayLabel,
  localizedWeeklyFastSuspensionNote,
  shouldApplyWeeklyFastOverride,
  weeklyFastSuspensionForCivilDate,
} from '../calendar/weeklyFast';
import { feastRankForLiturgicalDay } from './calendarTypikon';
import {
  greatFeastDisplayTitle,
  isMajorFeastDayForDateBlock,
  liturgicalDayTitle,
} from './liturgicalDayTitle';
import {
  getFeastRankDisplay,
  sanitizeTypikonProse,
  type FeastRankDisplay,
} from './typikonSymbols';

export type DayDashboardData = {
  /** Primary feast name on great feasts; otherwise orthocal title. */
  dayTitle: string;
  /** Great feast for Date major-feast block and Feasts highlight (may differ from dayTitle in Holy Week). */
  feastsHighlightTitle: string;
  /** orthocal great feast / fixed feast cell — hero, Date block, Feasts highlight, About Today. */
  isMajorFeastDay: boolean;
  toneLabel: string;
  feastRank: FeastRankDisplay;
  /** Short pill: "Fast" / "No fast" (date row, hero, Fasting section). */
  fastSummaryLabel: string;
  /** Pill colour: strict, wine & oil, fish, dairy, no fast, total abstinence. */
  fastSummaryKind: FastSummaryKind;
  /** Hero fast chip — null on non-fast days; "Fast" plus allowance icons. */
  heroFastChip: HeroFastChipDisplay | null;
  showHeroFeastRankChip: boolean;
  isFastDay: boolean;
  /** "Wednesday fast" / "Friday fast" in the Fasting section (null on other days). */
  weeklyFastSectionLabel: string | null;
  /** Rule name + allowed / not allowed for the Fasting section body. */
  fastingFoods: FastingFoodsDetail;
  fastingNote: string;
};

function buildFastingNote(
  day: OrthocalDay | null,
  appearanceKey: string,
  civil: PlainDate,
  lang: UiLanguage,
): string {
  if (day?.service_notes?.length) {
    return sanitizeTypikonProse(day.service_notes.join(' '));
  }
  if (isGreatAndHolyFriday(appearanceKey)) {
    return translate(lang, 'fasting.noteGoodFriday');
  }
  const weeklySuspension = weeklyFastSuspensionForCivilDate(civil);
  if (weeklySuspension) {
    return localizedWeeklyFastSuspensionNote(weeklySuspension, lang);
  }
  if (isWeeklyFastForCivilDate(civil)) {
    return translate(lang, 'fasting.noteWeekly');
  }
  if (appearanceKey.startsWith('cheesefare_fast')) {
    return translate(lang, 'fasting.noteMeatFast');
  }
  if (appearanceKey.includes('lent')) {
    return translate(lang, 'fasting.noteLent');
  }
  return translate(lang, 'fasting.noteDefault');
}

export function buildDayDashboard(
  liturgicalDay: OrthocalDay | null,
  appearance: LiturgicalDayAppearance,
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

  const weeklyFast = shouldApplyWeeklyFastOverride(liturgicalDay, civil);

  const isFastDay = isOrthocalFastDay(liturgicalDay, appearanceKey, weeklyFast);
  const weeklyFastSectionLabel =
    isFastDay &&
    !isGreatAndHolyFriday(appearanceKey) &&
    isWeeklyFastForCivilDate(civil) &&
    !(liturgicalDay && isMeatFastRule(liturgicalDay)) &&
    !appearanceKey.startsWith('cheesefare_fast')
      ? localizedWeeklyFastDayLabel(civil, lang)
      : null;
  const fastSummaryLabel = localizedFastSummaryLabel(
    liturgicalDay,
    appearanceKey,
    weeklyFast,
    lang,
  );

  const fastingFoods = localizedFastingFoodsDetail(
    liturgicalDay,
    appearanceKey,
    weeklyFast,
    lang,
    civil,
  );
  const fastSummaryKind = fastSummaryKindFromDetail(fastingFoods, isFastDay);

  const dayTitle = liturgicalDayTitle(
    liturgicalDay,
    appearanceKey,
    localFallbackTitle,
    feastRank,
    lang,
  );
  const feastsHighlightTitle = greatFeastDisplayTitle(
    liturgicalDay,
    appearanceKey,
    localFallbackTitle,
    feastRank,
    dayTitle,
    lang,
  );
  const isMajorFeastDay = isMajorFeastDayForDateBlock(
    liturgicalDay,
    appearanceKey,
    feastRank,
    dayTitle,
  );

  return {
    dayTitle,
    feastsHighlightTitle,
    isMajorFeastDay,
    toneLabel,
    feastRank,
    fastSummaryLabel,
    fastSummaryKind,
    heroFastChip: heroFastChipDisplay(fastingFoods, isFastDay, lang),
    showHeroFeastRankChip: showHeroFeastRankChip(feastRank, isMajorFeastDay),
    isFastDay,
    weeklyFastSectionLabel,
    fastingFoods,
    fastingNote: buildFastingNote(liturgicalDay, appearanceKey, civil, lang),
  };
}
