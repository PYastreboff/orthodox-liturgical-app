import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useCallback, useMemo } from 'react';
import { useFocusEffect, useTheme } from '@react-navigation/native';

import { CollapsibleSection } from '../../src/components/CollapsibleSection';
import { FastingFoodList } from '../../src/components/FastingFoodList';
import { FastSummaryPill } from '../../src/components/FastSummaryPill';
import { SectionTitleRow } from '../../src/components/SectionTitleRow';
import { DayHero } from '../../src/components/DayHero';
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
  civilPlainDateFromLocal,
} from '../../src/lib/calendar/liturgicalCalendar';
import { startOfLocalDay } from '../../src/lib/calendar/localDate';
import { CommemorationCard } from '../../src/components/CommemorationCard';
import { LiturgicalTextSectionBlock } from '../../src/components/LiturgicalPassageBlock';
import {
  buildCommemorationEntries,
  partitionCommemorations,
  type CommemorationEntry,
} from '../../src/lib/liturgical/commemorations';
import { ReadingsLanguageToggle } from '../../src/components/ReadingsLanguageToggle';
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
import { vestmentGuidanceForRole } from '../../src/lib/liturgical/vestments';
import { useDayNavigation } from '../../src/state/DayNavigationContext';
import { usePreferences } from '../../src/state/PreferencesContext';
import { colors } from '../../src/theme/tokens';
import { useResolvedColorScheme } from '../../src/theme/useResolvedColorScheme';

import type { ClergyRole } from '../../src/types/liturgical';
import type { TodayCollapsibleKey } from '../../src/state/todayUiState';

const ROLE_IDS: ClergyRole[] = ['layperson', 'reader', 'altar_server', 'deacon', 'priest', 'bishop'];

function roleLabel(t: (path: string) => string, id: ClergyRole): string {
  const keys: Record<ClergyRole, string> = {
    layperson: 'today.roleLayperson',
    reader: 'today.roleReader',
    altar_server: 'today.roleAltarServer',
    deacon: 'today.roleDeacon',
    priest: 'today.rolePriest',
    bishop: 'today.roleBishop',
  };
  return t(keys[id]);
}

function addDays(d: Date, days: number) {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return startOfLocalDay(next);
}

function isPrimaryGreatFeastEntry(
  entry: CommemorationEntry,
  isMajorFeastDay: boolean,
  primaryFeastTitle: string,
  dayTitle: string,
): boolean {
  if (entry.kind !== 'feast') return false;
  if (entry.name.trim() !== primaryFeastTitle.trim()) return false;
  if (isMajorFeastDay) return true;
  return primaryFeastTitle.trim() !== dayTitle.trim();
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
  dayTitle = '',
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
  dayTitle?: string;
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
            dayTitle,
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
  const appearance = useMemo(
    () => getLiturgicalAppearanceForLocalDate(selectedDate, primaryCalendar),
    [primaryCalendar, selectedDate],
  );
  const { liturgicalDay, loading, error } = useOrthocalDay(selectedDate, primaryCalendar);
  const dashboard = useMemo(
    () => buildDayDashboard(liturgicalDay, appearance, civilPlain, uiLanguage),
    [appearance, civilPlain, liturgicalDay, uiLanguage],
  );
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
  const { feasts, saints } = useMemo(() => {
    const entries = buildCommemorationEntries(liturgicalDay, {
      appearanceKey: appearance.key,
      appearanceLabel: appearance.label,
    });
    return partitionCommemorations(entries);
  }, [appearance.key, appearance.label, liturgicalDay]);
  const vestmentLines = useMemo(
    () => vestmentGuidanceForRole(servingRole, appearance, uiLanguage),
    [servingRole, appearance, uiLanguage],
  );

  const canGoToToday = selectedDate.getTime() !== today.getTime();
  const { text } = useFontScale();
  const type = {
    body: text(14, 20),
    hint: text(13, 20),
    status: text(13, 18),
    roleButton: text(13, 18),
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
        fastLabel={dashboard.fastSummaryLabel}
        canGoToToday={canGoToToday}
        onPrevious={() => setSelectedDate(addDays(selectedDate, -1))}
        onNext={() => setSelectedDate(addDays(selectedDate, 1))}
        onToday={() => setSelectedDate(today)}
      />
      {loading ? (
        <Text style={[styles.statusLine, type.status, { color: colors.muted }]}>
          {t('today.loading')}
        </Text>
      ) : null}
      {error ? (
        <Text style={[styles.statusLine, type.status, styles.statusError]}>
          {t('today.offline', { error })}
        </Text>
      ) : null}

      <View
        style={[
          styles.card,
          { backgroundColor: theme.colors.card, borderColor: theme.colors.border, padding: sectionCardPadding },
        ]}
      >
        <SectionTitleRow
          title={t('today.servingRole')}
          icon="serving-role"
          color={theme.colors.text}
          marginBottom={10}
        />
        <View style={styles.roleRow}>
          {ROLE_IDS.map((id) => {
            const active = id === servingRole;
            return (
              <Pressable
                key={id}
                style={[
                  styles.roleButton,
                  active
                    ? { backgroundColor: colors.accentWine, borderColor: colors.accentWine }
                    : { backgroundColor: 'transparent', borderColor: theme.colors.border },
                ]}
                onPress={() => setServingRole(id)}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    type.roleButton,
                    { color: active ? '#fff' : theme.colors.text },
                  ]}
                >
                  {roleLabel(t, id)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

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
              { color: dashboard.isMajorFeastDay ? colors.feastBorder : theme.colors.text },
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
      </CollapsibleSection>

      <CollapsibleSection
        title={t('today.sectionFasting')}
        icon="fasting"
        expanded={!todayCollapsed.fasting}
        onToggle={() => toggleSection('fasting')}
        themeColors={theme.colors}
      >
        <View style={styles.rowBetween}>
          <Text style={[styles.body, type.body, { color: theme.colors.text }]}>{t('today.level')}</Text>
          <FastSummaryPill
            label={dashboard.fastSummaryLabel}
            kind={dashboard.fastSummaryKind}
            textStyle={type.pill}
          />
        </View>
        {dashboard.isFastDay ? (
          <>
            {dashboard.weeklyFastSectionLabel ? (
              <Text style={[styles.fastWeeklyTitle, type.body, { color: theme.colors.text }]}>
                {dashboard.weeklyFastSectionLabel}
              </Text>
            ) : null}
            {dashboard.fastingFoods.totalAbstinence ? (
              <Text style={[styles.fastAllAllowed, type.body, { color: theme.colors.text }]}>
                {t('fasting.foodsNoEating')}
              </Text>
            ) : (
              <>
                {dashboard.fastingFoods.ruleLabel !== dashboard.weeklyFastSectionLabel ? (
                  <Text style={[styles.fastRule, type.body, { color: theme.colors.text }]}>
                    {t('today.fastRule', { rule: dashboard.fastingFoods.ruleLabel })}
                  </Text>
                ) : null}
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
            )}
          </>
        ) : (
          <Text style={[styles.fastAllAllowed, type.body, { color: theme.colors.text }]}>
            {t('fasting.foodsAllAllowed')}
          </Text>
        )}
        <Text style={[styles.cardHint, type.hint]}>{dashboard.fastingNote}</Text>
      </CollapsibleSection>

      {vestmentLines ? (
        <CollapsibleSection
          title={t('today.sectionVestments')}
          icon="vestments"
          expanded={!todayCollapsed.vestments}
          onToggle={() => toggleSection('vestments')}
          themeColors={theme.colors}
        >
          {vestmentLines.map((item, index) => {
            const prev = vestmentLines[index - 1];
            const whiteSetStart = prev && prev.pillBg !== item.pillBg;
            return (
              <View
                key={`${item.kind}-${item.pillBg}`}
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
            );
          })}
          <Text style={[styles.cardHint, type.hint]}>{t('today.vestmentsHint')}</Text>
        </CollapsibleSection>
      ) : null}

      <CollapsibleSection
        title={t('today.sectionReadings')}
        icon="readings"
        expanded={!todayCollapsed.readings}
        onToggle={() => toggleSection('readings')}
        themeColors={theme.colors}
        headerTrailing={
          <ReadingsLanguageToggle
            value={defaultTextLang}
            onChange={setDefaultTextLang}
            isDark={isDark}
          />
        }
      >
        {(defaultTextLang === 'chu' || defaultTextLang === 'both') && !sideBySide ? (
          <Text style={[styles.cardHint, type.hint, { color: isDark ? '#a39e98' : colors.muted }]}>
            {loadingSlavonic ? t('today.slavonicLoading') : t('today.slavonicHint')}
          </Text>
        ) : null}
        {(sideBySide ? englishSections : displaySections)
          .filter((section) => section.items.length > 0)
          .map((section, index) => (
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
          ))}
      </CollapsibleSection>

      <CollapsibleSection
        title={t('today.sectionFeasts')}
        icon="feasts"
        expanded={!todayCollapsed.feasts}
        onToggle={() => toggleSection('feasts')}
        themeColors={theme.colors}
      >
        {loading ? (
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
            dayTitle={dashboard.dayTitle}
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
        {loading ? (
          <Text style={[styles.cardHint, type.hint, { color: isDark ? '#a39e98' : colors.muted }]}>
            {t('today.loadingSaints')}
          </Text>
        ) : (
          <CommemorationEntryList
            entries={saints}
            emptyMessage={t('today.noSaints')}
            textColor={theme.colors.text}
            mutedColor={isDark ? '#a39e98' : colors.muted}
            cardBg={isDark ? colors.darkSurface : colors.card}
            borderColor={theme.colors.border}
            bodyType={type.body}
          />
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
  roleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  roleButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  roleButtonText: {
    fontWeight: '700',
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
  dateLineValue: {
    fontWeight: '600',
    marginTop: 2,
  },
  fastWeeklyTitle: {
    marginTop: 10,
    fontWeight: '700',
  },
  fastRule: {
    marginTop: 8,
    fontWeight: '600',
    opacity: 0.92,
  },
  fastAllAllowed: {
    marginTop: 10,
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
  vestmentLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 8,
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
