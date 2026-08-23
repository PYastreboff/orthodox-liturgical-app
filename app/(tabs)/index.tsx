import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect, useTheme } from '@react-navigation/native';

import { CollapsibleSection } from '../../src/components/CollapsibleSection';
import { FastingFoodList } from '../../src/components/FastingFoodList';
import { FastSummaryPill } from '../../src/components/FastSummaryPill';
import { SectionTitleRow } from '../../src/components/SectionTitleRow';
import { DayHero } from '../../src/components/DayHero';
import { AltarServerRoleTable } from '../../src/components/AltarServerRoleTable';
import { ReaderGuideTable } from '../../src/components/ReaderGuideTable';
import { TypikonSymbol } from '../../src/components/TypikonSymbol';
import { VestmentIcon } from '../../src/components/VestmentIcon';
import { useOrthocalDay } from '../../src/hooks/useOrthocalDay';
import {
  formatGregorianReadableFromDate,
  formatJulianReadable,
} from '../../src/lib/calendar/formatDate';
import { gregorianPlainToJulianPlain } from '../../src/lib/calendar/julianGregorian';
import { getLiturgicalAppearanceForLocalDate } from '../../src/lib/calendar/dayAppearance';
import {
  appearanceLiturgicalPlainDate,
  civilPlainDateFromLocal,
  orthocalQueryDate,
} from '../../src/lib/calendar/liturgicalCalendar';
import { startOfLocalDay, toDayIso } from '../../src/lib/calendar/localDate';
import { getCachedOrthocalDay } from '../../src/lib/api/orthocal';
import { useShareDay } from '../../src/hooks/useShareDay';
import { CommemorationCard } from '../../src/components/CommemorationCard';
import { LiturgicalTextSectionBlock } from '../../src/components/LiturgicalPassageBlock';
import {
  buildCommemorationEntries,
  partitionCommemorations,
  type CommemorationEntry,
} from '../../src/lib/liturgical/commemorations';
import { ReadingsLanguageToggle } from '../../src/components/ReadingsLanguageToggle';
import { LiturgicalTextsCategoryToggle } from '../../src/components/LiturgicalTextsCategoryToggle';
import { LITURGICAL_TEXT_SECTION_ORDER } from '../../src/lib/liturgical/liturgicalTexts';
import { VestmentPageBackground } from '../../src/components/VestmentPageBackground';
import { useFontScale } from '../../src/hooks/useFontScale';
import { usePhoneLayout } from '../../src/hooks/usePhoneLayout';
import { useScreenSafePadding } from '../../src/hooks/useScreenSafePadding';
import { SECTION_CARD_PADDING, SECTION_CARD_PADDING_PHONE } from '../../src/theme/layout';
import { useTabBarBottomPadding } from '../../src/hooks/useTabBarBottomPadding';
import { useLiturgicalTexts } from '../../src/hooks/useLiturgicalTexts';
import {
  feastRankServiceLabel,
  feastRankServiceLabelForMajorFeastDay,
} from '../../src/i18n/feastRank';
import { useAppTranslation } from '../../src/i18n/useAppTranslation';
import { buildDayDashboard } from '../../src/lib/liturgical/dayDashboard';
import { buildLiturgicalDayAbout } from '../../src/lib/liturgical/liturgicalDayAbout';
import { vestmentGuidanceForRole } from '../../src/lib/liturgical/vestments';
import {
  buildDayServices,
  localizeDayServices,
} from '../../src/lib/liturgical/dayServices';
import { useDayNavigation } from '../../src/state/DayNavigationContext';
import { usePreferences } from '../../src/state/PreferencesContext';
import { colors } from '../../src/theme/tokens';
import { useResolvedColorScheme } from '../../src/theme/useResolvedColorScheme';

import type { TodayCollapsibleKey } from '../../src/state/todayUiState';

function addDays(d: Date, days: number) {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return startOfLocalDay(next);
}

function isPrimaryGreatFeastEntry(
  entry: CommemorationEntry,
  isMajorFeastDay: boolean,
  primaryFeastTitle: string,
): boolean {
  if (entry.kind !== 'feast') return false;
  if (!isMajorFeastDay) return false;
  return entry.name.trim() === primaryFeastTitle.trim();
}

function CommemorationEntryList({
  entries,
  emptyMessage,
  textColor,
  mutedColor,
  cardBg,
  borderColor,
  bodyType,
  isMajorFeastDay = false,
  primaryFeastTitle = '',
  isDark = false,
}: {
  entries: CommemorationEntry[];
  emptyMessage: string;
  textColor: string;
  mutedColor: string;
  cardBg: string;
  borderColor: string;
  bodyType: { fontSize: number; lineHeight: number };
  isMajorFeastDay?: boolean;
  primaryFeastTitle?: string;
  isDark?: boolean;
}) {
  if (!entries.length) {
    return <Text style={[styles.body, bodyType, { color: textColor }]}>{emptyMessage}</Text>;
  }
  return (
    <>
      {entries.map((entry) => (
        <CommemorationCard
          key={entry.id}
          entry={entry}
          textColor={textColor}
          mutedColor={mutedColor}
          cardBg={cardBg}
          borderColor={borderColor}
          isPrimaryGreatFeast={isPrimaryGreatFeastEntry(
            entry,
            isMajorFeastDay,
            primaryFeastTitle,
          )}
          isDark={isDark}
        />
      ))}
    </>
  );
}

export default function TodayScreen() {
  const theme = useTheme();
  const isDark = useResolvedColorScheme() === 'dark';
  const { t, lang } = useAppTranslation();
  const verseNumberColor = isDark ? '#a39e98' : colors.muted;
  const { selectedDate, setSelectedDate, consumePendingDay } = useDayNavigation();
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
    todayCollapsed,
    toggleTodaySection,
  } = usePreferences();
  const today = useMemo(() => startOfLocalDay(new Date()), []);
  const screenSafe = useScreenSafePadding();
  const phoneLayout = usePhoneLayout();
  const sectionCardPadding = phoneLayout ? SECTION_CARD_PADDING_PHONE : SECTION_CARD_PADDING;
  const scrollBottomPadding = useTabBarBottomPadding();

  useFocusEffect(
    useCallback(() => {
      const day = consumePendingDay();
      if (day) setSelectedDate(day);
    }, [consumePendingDay, setSelectedDate]),
  );
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
  const { shareDay } = useShareDay();
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
  const toggleSection = (key: TodayCollapsibleKey) => {
    toggleTodaySection(key);
  };

  return (
    <VestmentPageBackground appearance={appearance} gradientEnabled={showVestmentGradient}>
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: screenSafe.paddingTop + 20,
          paddingLeft: screenSafe.paddingLeft,
          paddingRight: screenSafe.paddingRight,
          paddingBottom: scrollBottomPadding,
        },
      ]}
    >
      <DayHero
        appearance={appearance}
        dayTitle={dashboard.dayTitle}
        dateLabel={gregorianDateLabel}
        julianDateLabel={julianDateLabel}
        toneLabel={dashboard.toneLabel}
        feastRank={dashboard.feastRank}
        heroFastChip={dashboard.heroFastChip}
        showFeastRankChip={dashboard.showHeroFeastRankChip}
        isMajorFeastDay={dashboard.isMajorFeastDay}
        orthocalFeastLevel={liturgicalDay?.feast_level}
        servingRole={servingRole}
        onServingRoleChange={setServingRole}
        canGoToToday={canGoToToday}
        onPrevious={() => setSelectedDate(addDays(selectedDate, -1))}
        onNext={() => setSelectedDate(addDays(selectedDate, 1))}
        onToday={() => setSelectedDate(today)}
        onShare={handleShareDay}
      />
      {waitingForDay ? (
        <Text style={[styles.statusLine, type.status, { color: colors.muted }]}>
          {t('today.loading')}
        </Text>
      ) : refreshing ? (
        <Text style={[styles.statusLine, type.status, { color: colors.muted }]}>
          {t('today.refreshing')}
        </Text>
      ) : null}
      {error ? (
        <Text style={[styles.statusLine, type.status, styles.statusError]}>
          {t('today.offline', { error })}
        </Text>
      ) : null}

      <CollapsibleSection
        title={t('today.sectionDate')}
        icon="date"
        expanded={!todayCollapsed.date}
        onToggle={() => toggleSection('date')}
        themeColors={theme.colors}
      >
        <View style={styles.rowBetween}>
          <Text style={[styles.dateLineValue, type.dateLine, { color: theme.colors.text }]}>
            {gregorianDateLabel}
          </Text>
          <FastSummaryPill
            label={dashboard.fastSummaryLabel}
            kind={dashboard.fastSummaryKind}
            textStyle={type.pill}
          />
        </View>
        {dashboard.isMajorFeastDay ? (
          <View
            style={[
              styles.majorFeastBlock,
              {
                backgroundColor: isDark ? 'rgba(139,46,60,0.22)' : 'rgba(139,46,60,0.1)',
                borderColor: isDark ? colors.feastHoverBorderDark : colors.feastBorder,
              },
            ]}
          >
            <View style={styles.majorFeastRow}>
              <Text
                style={[
                  styles.majorFeastBadge,
                  type.majorFeastBadge,
                  { color: '#fff', backgroundColor: colors.feastBorder },
                ]}
              >
                {t('today.majorFeastBadge')}
              </Text>
              <Text style={[styles.majorFeastDash, type.majorFeastDash, { color: colors.feastBorder }]}>
                —
              </Text>
              <Text
                style={[styles.majorFeastName, type.majorFeastName, { color: colors.feastBorder }]}
                numberOfLines={3}
              >
                {dashboard.feastsHighlightTitle}
              </Text>
            </View>
          </View>
        ) : null}
        <View style={styles.serviceRankRow}>
          <TypikonSymbol
            feastRank={dashboard.feastRank}
            variant="chip"
            surface={isDark ? 'dark' : 'light'}
          />
          <Text
            style={[
              styles.serviceRankLabel,
              type.serviceRank,
              {
                color:
                  dashboard.isMajorFeastDay || isGreatFeastRankDay
                    ? colors.feastBorder
                    : theme.colors.text,
              },
            ]}
          >
            {dashboard.isMajorFeastDay
              ? feastRankServiceLabelForMajorFeastDay(
                  dashboard.feastRank,
                  liturgicalDay?.feast_level,
                  lang,
                )
              : feastRankServiceLabel(dashboard.feastRank, lang)}
          </Text>
        </View>
        <Text style={[styles.dayAboutHeading, type.body, { color: theme.colors.text }]}>
          {t('dayAbout.sectionTitle')}
        </Text>
        <Text style={[styles.dayAboutBody, type.body, { color: theme.colors.text }]}>
          {aboutToday}
        </Text>
      </CollapsibleSection>

      <CollapsibleSection
        title={t('today.sectionFasting')}
        icon="fasting"
        expanded={!todayCollapsed.fasting}
        onToggle={() => toggleSection('fasting')}
        themeColors={theme.colors}
      >
        <View
          style={[
            styles.fastLevelBlock,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(43,38,35,0.04)',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(43,38,35,0.08)',
            },
          ]}
        >
          <View style={styles.fastLevelRow}>
            <View style={styles.fastLevelText}>
              {dashboard.isFastDay ? (
                <>
                  {dashboard.weeklyFastSectionLabel ? (
                    <Text style={[styles.fastLevelSubtitle, type.body, { color: theme.colors.text }]}>
                      {dashboard.weeklyFastSectionLabel}
                    </Text>
                  ) : null}
                  {dashboard.fastingFoods.totalAbstinence ? (
                    <Text style={[styles.fastLevelDetail, type.body, { color: theme.colors.text }]}>
                      {t('fasting.foodsNoEating')}
                    </Text>
                  ) : dashboard.fastingFoods.ruleLabel !== dashboard.weeklyFastSectionLabel ? (
                    <Text style={[styles.fastLevelDetail, type.body, { color: theme.colors.text }]}>
                      {t('today.fastRule', { rule: dashboard.fastingFoods.ruleLabel })}
                    </Text>
                  ) : null}
                </>
              ) : (
                <Text style={[styles.fastLevelDetail, type.body, { color: theme.colors.text }]}>
                  {t('fasting.foodsAllAllowed')}
                </Text>
              )}
            </View>
            <FastSummaryPill
              label={dashboard.fastSummaryLabel}
              kind={dashboard.fastSummaryKind}
              textStyle={type.pill}
              style={styles.fastLevelPill}
            />
          </View>
        </View>
        {dashboard.isFastDay && !dashboard.fastingFoods.totalAbstinence ? (
          <>
            <FastingFoodList
              heading={t('today.allowedHeading')}
              items={dashboard.fastingFoods.allowed}
              textColor={theme.colors.text}
              iconColor={colors.accentGold}
              bodyType={type.body}
            />
            <FastingFoodList
              heading={t('today.notAllowedHeading')}
              items={dashboard.fastingFoods.notAllowed}
              textColor={theme.colors.text}
              iconColor={colors.accentWine}
              bodyType={type.body}
            />
            {dashboard.fastingFoods.exceptionNote ? (
              <Text style={[styles.fastException, type.hint, { color: theme.colors.text }]}>
                {t('today.fastException', { note: dashboard.fastingFoods.exceptionNote })}
              </Text>
            ) : null}
          </>
        ) : null}
        <Text style={[styles.cardHint, type.hint]}>{dashboard.fastingNote}</Text>
      </CollapsibleSection>

      <CollapsibleSection
        title={
          servingRole === 'layperson' ? t('today.sectionChurchDress') : t('today.sectionVestments')
        }
        icon={servingRole === 'layperson' ? 'church-clothing' : 'vestments'}
        expanded={!todayCollapsed.vestments}
        onToggle={() => toggleSection('vestments')}
        themeColors={theme.colors}
      >
        <Text style={[styles.vestmentWhyHeading, type.body, { color: theme.colors.text }]}>
          {servingRole === 'layperson'
            ? t('today.churchClothingWhyHeading')
            : t('today.vestmentsWhyHeading')}
        </Text>
        <Text style={[styles.vestmentColorReason, type.hint, { color: theme.colors.text }]}>
          {vestmentGuidance.colorReason}
        </Text>
        {vestmentGuidance.lines.map((item, index) => {
          const prev = vestmentGuidance.lines[index - 1];
          const showSectionHeader =
            item.sectionHeader != null && item.sectionHeader !== prev?.sectionHeader;
          const whiteSetStart = prev && prev.pillBg !== item.pillBg;
          return (
            <View key={`${item.kind}-${index}-${item.pillBg}`}>
              {showSectionHeader ? (
                <Text
                  style={[styles.vestmentSectionHeader, type.hint, { color: theme.colors.text }]}
                >
                  {item.sectionHeader}
                </Text>
              ) : null}
              <View
                style={[styles.rowBetween, whiteSetStart ? styles.vestmentWhiteSetStart : null]}
              >
                <View style={styles.vestmentLabelRow}>
                  <VestmentIcon kind={item.kind} color={theme.colors.text} />
                  <Text style={[styles.body, type.body, { color: theme.colors.text }]}>
                    {item.label}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.pill,
                    type.pill,
                    { backgroundColor: item.pillBg, color: item.pillText },
                  ]}
                >
                  {item.value}
                </Text>
              </View>
            </View>
          );
        })}
        {vestmentGuidance.footnote ? (
          <Text style={[styles.cardHint, type.hint]}>{vestmentGuidance.footnote}</Text>
        ) : null}
        <Text style={[styles.cardHint, type.hint]}>{t('today.vestmentsHint')}</Text>
      </CollapsibleSection>

      <CollapsibleSection
        title={t('today.sectionServices')}
        icon="services"
        expanded={!todayCollapsed.services}
        onToggle={() => toggleSection('services')}
        themeColors={theme.colors}
      >
        {dayServices.items.length === 0 ? (
          <Text style={[styles.cardHint, type.hint, { color: isDark ? '#a39e98' : colors.muted }]}>
            {t('services.noneForDay')}
          </Text>
        ) : (
          dayServices.items.map((entry, index) => {
            const prevSlot = dayServices.items[index - 1]?.slot;
            const showSlotHeader = entry.slot !== prevSlot;
            return (
              <View key={`${entry.kind}-${index}`}>
                {showSlotHeader ? (
                  <Text
                    style={[
                      styles.serviceSlotHeader,
                      type.hint,
                      { color: theme.colors.text },
                      index > 0 ? styles.serviceSlotHeaderSpaced : null,
                    ]}
                  >
                    {entry.slotLabel}
                  </Text>
                ) : null}
                <View style={styles.rowBetween}>
                  <Text
                    style={[
                      styles.body,
                      type.body,
                      styles.serviceLabelCol,
                      { color: theme.colors.text },
                    ]}
                  >
                    {entry.title}
                  </Text>
                  <Text
                    style={[
                      styles.pill,
                      type.pill,
                      styles.serviceTypePill,
                      {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(43,38,35,0.08)',
                        color: theme.colors.text,
                      },
                    ]}
                  >
                    {entry.categoryLabel}
                  </Text>
                </View>
              </View>
            );
          })
        )}
        <Text style={[styles.cardHint, type.hint, { color: isDark ? '#a39e98' : colors.muted }]}>
          {dayServices.footnote}
        </Text>
      </CollapsibleSection>

      {servingRole === 'altar_server' ? (
        <CollapsibleSection
          title={t('today.sectionAltarRoles')}
          icon="altar-roles"
          expanded={!todayCollapsed.altarRoles}
          onToggle={() => toggleSection('altarRoles')}
          themeColors={theme.colors}
        >
          <AltarServerRoleTable
            textColor={theme.colors.text}
            mutedColor={isDark ? '#a39e98' : colors.muted}
            isDark={isDark}
          />
        </CollapsibleSection>
      ) : null}

      {servingRole === 'reader' ? (
        <CollapsibleSection
          title={t('today.sectionReaderGuide')}
          icon="reader-guide"
          expanded={!todayCollapsed.readerGuide}
          onToggle={() => toggleSection('readerGuide')}
          themeColors={theme.colors}
        >
          <ReaderGuideTable
            textColor={theme.colors.text}
            mutedColor={isDark ? '#a39e98' : colors.muted}
            isDark={isDark}
          />
        </CollapsibleSection>
      ) : null}

      <CollapsibleSection
        title={t('today.sectionReadings')}
        icon="readings"
        expanded={!todayCollapsed.readings}
        onToggle={() => toggleSection('readings')}
        themeColors={theme.colors}
        elevated={readingsCategoryMenuOpen}
        bodyTopLeading={
          readingsAvailableCategories.length > 1 ? (
            <LiturgicalTextsCategoryToggle
              value={readingsCategoryFilter}
              onChange={setReadingsCategoryFilter}
              availableCategories={readingsAvailableCategories}
              isDark={isDark}
              onOpenChange={setReadingsCategoryMenuOpen}
            />
          ) : undefined
        }
        bodyTopTrailing={
          <ReadingsLanguageToggle
            value={defaultTextLang}
            onChange={setDefaultTextLang}
            isDark={isDark}
          />
        }
      >
        {readingsVisibleSections.length === 0 ? (
          <Text style={[styles.cardHint, type.hint, { color: isDark ? '#a39e98' : colors.muted }]}>
            {t('readings.noneForDay')}
          </Text>
        ) : (
          readingsVisibleSections.map((section, index) => (
            <LiturgicalTextSectionBlock
              key={section.id}
              category={section.id}
              title={section.title}
              items={section.items}
              textColor={theme.colors.text}
              verseNumberColor={verseNumberColor}
              headingColor={theme.colors.text}
              topGap={index > 0}
              sideBySide={sideBySide}
              secondaryItems={
                sideBySide
                  ? slavonicSections?.find((s) => s.id === section.id)?.items
                  : undefined
              }
              slavonicLoading={sideBySide ? loadingSlavonic : undefined}
              mutedColor={isDark ? '#a39e98' : colors.muted}
            />
          ))
        )}
      </CollapsibleSection>

      <CollapsibleSection
        title={t('today.sectionFeasts')}
        icon="feasts"
        expanded={!todayCollapsed.feasts}
        onToggle={() => toggleSection('feasts')}
        themeColors={theme.colors}
      >
        {waitingForDay ? (
          <Text style={[styles.cardHint, type.hint, { color: isDark ? '#a39e98' : colors.muted }]}>
            {t('today.loadingFeasts')}
          </Text>
        ) : (
          <CommemorationEntryList
            entries={feasts}
            emptyMessage={t('today.noFeasts')}
            textColor={theme.colors.text}
            mutedColor={isDark ? '#a39e98' : colors.muted}
            cardBg={isDark ? colors.darkSurface : colors.card}
            borderColor={theme.colors.border}
            bodyType={type.body}
            isMajorFeastDay={dashboard.isMajorFeastDay}
            primaryFeastTitle={dashboard.feastsHighlightTitle}
            isDark={isDark}
          />
        )}
      </CollapsibleSection>

      <CollapsibleSection
        title={t('today.sectionSaints')}
        icon="saints"
        expanded={!todayCollapsed.saints}
        onToggle={() => toggleSection('saints')}
        themeColors={theme.colors}
      >
        {waitingForDay ? (
          <Text style={[styles.cardHint, type.hint, { color: isDark ? '#a39e98' : colors.muted }]}>
            {t('today.loadingSaints')}
          </Text>
        ) : (
          <>
            <CommemorationEntryList
              entries={saints}
              emptyMessage={t('today.noSaints')}
              textColor={theme.colors.text}
              mutedColor={isDark ? '#a39e98' : colors.muted}
              cardBg={isDark ? colors.darkSurface : colors.card}
              borderColor={theme.colors.border}
              bodyType={type.body}
              isDark={isDark}
            />
            {showOrthocalContentNote ? (
              <Text
                style={[styles.cardHint, type.hint, { color: isDark ? '#a39e98' : colors.muted }]}
              >
                {t('today.orthocalContentNote')}
              </Text>
            ) : null}
          </>
        )}
      </CollapsibleSection>
    </ScrollView>
    </VestmentPageBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flexGrow: 1,
  },
  statusLine: {
    textAlign: 'center',
    marginBottom: 10,
    marginTop: -6,
  },
  statusError: {
    color: colors.accentWine,
  },
  card: {
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  serviceRankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 2,
  },
  serviceRankLabel: {
    flex: 1,
    flexShrink: 1,
    fontWeight: '600',
    opacity: 0.85,
  },
  dayAboutHeading: {
    marginTop: 12,
    fontWeight: '700',
  },
  dayAboutBody: {
    marginTop: 4,
    opacity: 0.92,
  },
  dateLineValue: {
    fontWeight: '600',
    marginTop: 2,
  },
  fastLevelBlock: {
    marginBottom: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  fastLevelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  fastLevelPill: {
    flexShrink: 0,
    alignSelf: 'center',
  },
  fastLevelText: {
    flex: 1,
    minWidth: 0,
    gap: 4,
    alignSelf: 'center',
  },
  fastLevelSubtitle: {
    fontWeight: '700',
  },
  fastLevelDetail: {
    opacity: 0.92,
  },
  fastException: {
    marginTop: 10,
    fontStyle: 'italic',
    opacity: 0.85,
  },
  majorFeastBlock: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 2,
    gap: 4,
  },
  majorFeastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  majorFeastBadge: {
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  majorFeastDash: {
    fontWeight: '600',
  },
  majorFeastName: {
    flex: 1,
    flexShrink: 1,
    minWidth: 120,
    fontWeight: '700',
  },
  cardHint: {
    marginTop: 8,
    color: colors.muted,
    opacity: 0.9,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  vestmentWhyHeading: {
    fontWeight: '700',
    marginBottom: 4,
  },
  vestmentColorReason: {
    marginBottom: 12,
    opacity: 0.92,
  },
  vestmentSectionHeader: {
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 6,
    opacity: 0.85,
  },
  vestmentLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 8,
  },
  serviceLabelCol: {
    flex: 1,
    minWidth: 0,
  },
  serviceSlotHeader: {
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    opacity: 0.7,
    marginBottom: 6,
  },
  serviceSlotHeaderSpaced: {
    marginTop: 10,
  },
  serviceTypePill: {
    flexShrink: 0,
    alignSelf: 'center',
  },
  vestmentWhiteSetStart: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.25)',
  },
  pill: {
    fontWeight: '700',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  body: {
    opacity: 0.9,
  },
});
