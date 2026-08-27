import { useCallback, useEffect, useMemo, useState } from 'react';

import { useOrthocalDay } from './useOrthocalDay';
import { useFontScale } from './useFontScale';
import { useLiturgicalTexts } from './useLiturgicalTexts';
import { usePrintDay } from './usePrintDay';
import { useShareDay } from './useShareDay';
import {
  formatGregorianReadableFromDate,
  formatJulianReadable,
} from '../lib/calendar/formatDate';
import { gregorianPlainToJulianPlain } from '../lib/calendar/julianGregorian';
import { getLiturgicalAppearanceForLocalDate } from '../lib/calendar/dayAppearance';
import {
  appearanceLiturgicalPlainDate,
  civilPlainDateFromLocal,
  orthocalQueryDate,
} from '../lib/calendar/liturgicalCalendar';
import { startOfLocalDay, toDayIso } from '../lib/calendar/localDate';
import { getCachedOrthocalDay } from '../lib/api/orthocal';
import { gospelsFromLiturgicalSections } from '../lib/print/printDay';
import {
  buildCommemorationEntries,
  partitionCommemorations,
} from '../lib/liturgical/commemorations';
import { LITURGICAL_TEXT_SECTION_ORDER } from '../lib/liturgical/liturgicalTexts';
import { buildDayDashboard } from '../lib/liturgical/dayDashboard';
import { buildLiturgicalDayAbout } from '../lib/liturgical/liturgicalDayAbout';
import { vestmentGuidanceForRole } from '../lib/liturgical/vestments';
import {
  buildDayServices,
  isPresanctifiedDay,
  localizeDayServices,
} from '../lib/liturgical/dayServices';
import { personalDayOccurrencesOnCivilDate } from '../lib/personalDays';
import { useDayNavigation } from '../state/DayNavigationContext';
import { usePreferences } from '../state/PreferencesContext';
import { useAppTranslation } from '../i18n/useAppTranslation';
import { colors } from '../theme/tokens';
import { useResolvedColorScheme } from '../theme/useResolvedColorScheme';

function addDays(d: Date, days: number) {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return startOfLocalDay(next);
}

/** Shared day model for Today home + `/day/[section]` screens. */
export function useTodayDayModel() {
  const isDark = useResolvedColorScheme() === 'dark';
  const { t, lang } = useAppTranslation();
  const verseNumberColor = isDark ? '#a39e98' : colors.muted;
  const { selectedDate, setSelectedDate } = useDayNavigation();
  const {
    primaryCalendar,
    showVestmentGradient,
    defaultTextLang,
    setDefaultTextLang,
    readingsCategoryFilter,
    setReadingsCategoryFilter,
    uiLanguage,
    servingRole,
    setServingRole,
    enabledPrayers,
    personalDays,
  } = usePreferences();
  const today = useMemo(() => startOfLocalDay(new Date()), []);

  const [calendarMonth, setCalendarMonth] = useState(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  );
  const thisMonth = useMemo(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  }, []);

  useEffect(() => {
    setCalendarMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  }, [selectedDate]);

  const setCalendarMonthCursor = useCallback((date: Date) => {
    setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  }, []);

  const onCalendarChangeMonth = useCallback(
    (delta: -1 | 1) => {
      setCalendarMonthCursor(
        new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + delta, 1),
      );
    },
    [calendarMonth, setCalendarMonthCursor],
  );

  const canGoToThisMonth =
    calendarMonth.getFullYear() !== thisMonth.getFullYear() ||
    calendarMonth.getMonth() !== thisMonth.getMonth();

  const civilPlain = useMemo(() => civilPlainDateFromLocal(selectedDate), [selectedDate]);
  const gregorianDateLabel = useMemo(
    () => formatGregorianReadableFromDate(selectedDate, true, uiLanguage),
    [selectedDate, uiLanguage],
  );
  const julianDateLabel = useMemo(() => {
    const julian = gregorianPlainToJulianPlain(civilPlain);
    return t('today.julianDate', {
      date: formatJulianReadable(julian, true, uiLanguage),
    });
  }, [civilPlain, t, uiLanguage]);
  const julianMonthDay = useMemo(() => {
    const julian = gregorianPlainToJulianPlain(civilPlain);
    return `${String(julian.month).padStart(2, '0')}-${String(julian.day).padStart(2, '0')}`;
  }, [civilPlain]);

  const { liturgicalDay, loading, refreshing, error } = useOrthocalDay(selectedDate, primaryCalendar);
  const waitingForDay = loading && !liturgicalDay;
  const personalOnDay = useMemo(
    () => personalDayOccurrencesOnCivilDate(personalDays, selectedDate),
    [personalDays, selectedDate],
  );
  const appearance = useMemo(
    () => getLiturgicalAppearanceForLocalDate(selectedDate, primaryCalendar, liturgicalDay),
    [liturgicalDay, primaryCalendar, selectedDate],
  );
  const dashboard = useMemo(
    () => buildDayDashboard(liturgicalDay, appearance, civilPlain, uiLanguage),
    [appearance, civilPlain, liturgicalDay, uiLanguage],
  );
  const isGreatFeastRankDay = dashboard.feastRank.glyph === 'great_feast';
  const {
    englishSections,
    slavonicSections,
    displaySections,
    loadingSlavonic,
    sideBySide,
  } = useLiturgicalTexts(liturgicalDay, defaultTextLang, uiLanguage, {
    julianMonthDay,
    appearanceKey: appearance.key,
  });
  const [readingsCategoryMenuOpen, setReadingsCategoryMenuOpen] = useState(false);
  const readingsSourceSections = sideBySide ? englishSections : displaySections;
  const readingsAvailableCategories = useMemo(
    () =>
      LITURGICAL_TEXT_SECTION_ORDER.filter((id) =>
        readingsSourceSections.some((section) => section.id === id && section.items.length > 0),
      ),
    [readingsSourceSections],
  );
  const readingsVisibleSections = useMemo(() => {
    const nonEmpty = readingsSourceSections.filter((section) => section.items.length > 0);
    if (readingsCategoryFilter === 'all') return nonEmpty;
    return nonEmpty.filter((section) => section.id === readingsCategoryFilter);
  }, [readingsCategoryFilter, readingsSourceSections]);

  useEffect(() => {
    if (
      readingsCategoryFilter !== 'all' &&
      !readingsAvailableCategories.includes(readingsCategoryFilter)
    ) {
      setReadingsCategoryFilter('all');
    }
  }, [readingsAvailableCategories, readingsCategoryFilter, setReadingsCategoryFilter]);

  const { feasts, saints } = useMemo(() => {
    const entries = buildCommemorationEntries(liturgicalDay, uiLanguage);
    return partitionCommemorations(entries);
  }, [liturgicalDay, uiLanguage]);
  const showOrthocalContentNote =
    uiLanguage !== 'en' &&
    [...feasts, ...saints].some((entry) => Boolean(entry.body?.trim()));
  const aboutToday = useMemo(
    () =>
      buildLiturgicalDayAbout({
        day: liturgicalDay,
        appearance,
        dayTitle: dashboard.dayTitle,
        feastsHighlightTitle: dashboard.feastsHighlightTitle,
        isMajorFeastDay: dashboard.isMajorFeastDay,
        toneLabel: dashboard.toneLabel,
        feasts,
        saints,
        lang: uiLanguage,
      }),
    [
      appearance,
      dashboard.dayTitle,
      dashboard.feastsHighlightTitle,
      dashboard.isMajorFeastDay,
      dashboard.toneLabel,
      feasts,
      liturgicalDay,
      saints,
      uiLanguage,
    ],
  );
  const vestmentGuidance = useMemo(
    () => vestmentGuidanceForRole(servingRole, appearance, uiLanguage),
    [servingRole, appearance, uiLanguage],
  );
  const liturgicalPlain = useMemo(
    () => appearanceLiturgicalPlainDate(civilPlain, primaryCalendar),
    [civilPlain, primaryCalendar],
  );
  const tomorrowDate = useMemo(() => addDays(selectedDate, 1), [selectedDate]);
  const tomorrowAppearance = useMemo(
    () => getLiturgicalAppearanceForLocalDate(tomorrowDate, primaryCalendar, null),
    [primaryCalendar, tomorrowDate],
  );
  const dayServices = useMemo(() => {
    const tomorrowCivil = civilPlainDateFromLocal(tomorrowDate);
    const tomorrowQuery = orthocalQueryDate(tomorrowCivil);
    const tomorrowCached = getCachedOrthocalDay(primaryCalendar, tomorrowQuery);
    const raw = buildDayServices(appearance, liturgicalPlain, liturgicalDay, {
      appearance: tomorrowAppearance,
      feastLevel: tomorrowCached?.feast_level,
      weekday: tomorrowCached?.weekday ?? tomorrowDate.getDay(),
    });
    return localizeDayServices(raw, uiLanguage);
  }, [
    appearance,
    liturgicalDay,
    liturgicalPlain,
    primaryCalendar,
    tomorrowAppearance,
    tomorrowDate,
    uiLanguage,
  ]);
  const guideDayContext = useMemo(
    () => ({
      appearanceKey: appearance.key,
      feastLevel: liturgicalDay?.feast_level,
      weekday: liturgicalDay?.weekday,
      isPresanctified: isPresanctifiedDay(
        appearance.key,
        liturgicalDay?.feast_level,
        liturgicalDay?.weekday,
      ),
    }),
    [appearance.key, liturgicalDay?.feast_level, liturgicalDay?.weekday],
  );

  const { shareDay } = useShareDay();
  const { printDay } = usePrintDay();
  const shareFeastHighlight = dashboard.feastsHighlightTitle?.trim() || feasts[0]?.name?.trim() || null;
  const canGoToToday = selectedDate.getTime() !== today.getTime();

  const handleShareDay = useCallback(() => {
    void shareDay({
      dayIso: toDayIso(selectedDate),
      dayTitle: dashboard.dayTitle,
      dateLabel: gregorianDateLabel,
      fastLabel: dashboard.fastSummaryLabel,
      feastHighlight: shareFeastHighlight,
    });
  }, [
    dashboard.dayTitle,
    dashboard.fastSummaryLabel,
    gregorianDateLabel,
    selectedDate,
    shareDay,
    shareFeastHighlight,
  ]);
  const handlePrintDay = useCallback(() => {
    void printDay({
      dayTitle: dashboard.dayTitle,
      dateLabel: gregorianDateLabel,
      julianDateLabel,
      toneLabel: dashboard.toneLabel,
      fastLabel: dashboard.fastSummaryLabel,
      fastingExplanation: dashboard.fastingExplanation,
      feastHighlight: shareFeastHighlight,
      saints: saints.map((entry) => entry.name),
      feasts: feasts.map((entry) => entry.name),
      gospels: gospelsFromLiturgicalSections(readingsSourceSections),
    });
  }, [
    dashboard.dayTitle,
    dashboard.fastSummaryLabel,
    dashboard.fastingExplanation,
    dashboard.toneLabel,
    feasts,
    gregorianDateLabel,
    julianDateLabel,
    printDay,
    readingsSourceSections,
    saints,
    shareFeastHighlight,
  ]);

  const { text } = useFontScale();
  const type = {
    body: text(14, 20),
    hint: text(13, 20),
    status: text(13, 18),
    serviceRank: text(13, 18),
    dateLine: text(17, 22),
    pill: text(12, 16),
    majorFeastBadge: text(11, 14),
    majorFeastDash: text(16, 22),
    majorFeastName: text(16, 22),
  };

  return {
    isDark,
    t,
    lang,
    verseNumberColor,
    selectedDate,
    setSelectedDate,
    primaryCalendar,
    showVestmentGradient,
    defaultTextLang,
    setDefaultTextLang,
    readingsCategoryFilter,
    setReadingsCategoryFilter,
    servingRole,
    setServingRole,
    enabledPrayers,
    today,
    calendarMonth,
    thisMonth,
    setCalendarMonthCursor,
    onCalendarChangeMonth,
    canGoToThisMonth,
    gregorianDateLabel,
    julianDateLabel,
    liturgicalDay,
    waitingForDay,
    refreshing,
    error,
    personalOnDay,
    appearance,
    dashboard,
    isGreatFeastRankDay,
    slavonicSections,
    loadingSlavonic,
    sideBySide,
    readingsCategoryMenuOpen,
    setReadingsCategoryMenuOpen,
    readingsAvailableCategories,
    readingsVisibleSections,
    feasts,
    saints,
    showOrthocalContentNote,
    aboutToday,
    vestmentGuidance,
    dayServices,
    guideDayContext,
    canGoToToday,
    handleShareDay,
    handlePrintDay,
    type,
    addDays,
  };
}

export type TodayDayModel = ReturnType<typeof useTodayDayModel>;
