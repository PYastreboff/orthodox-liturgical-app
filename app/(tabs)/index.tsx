import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useTheme } from '@react-navigation/native';

import { CollapsibleSection } from '../../src/components/CollapsibleSection';
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
type CollapsibleKey =
  | 'date'
  | 'feasts'
  | 'saints'
  | 'fasting'
  | 'vestments'
  | 'readings';

const ROLE_IDS: ClergyRole[] = ['layperson', 'altar_server', 'deacon', 'priest', 'bishop'];

function roleLabel(t: (path: string) => string, id: ClergyRole): string {
  const keys: Record<ClergyRole, string> = {
    layperson: 'today.roleLayperson',
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
): boolean {
  return (
    isMajorFeastDay &&
    entry.kind === 'feast' &&
    entry.name.trim() === primaryFeastTitle.trim()
  );
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
  const { primaryCalendar, showVestmentGradient, defaultTextLang, setDefaultTextLang, uiLanguage } =
    usePreferences();
  const today = useMemo(() => startOfLocalDay(new Date()), []);

  useFocusEffect(
    useCallback(() => {
      const day = consumePendingDay();
      if (day) setSelectedDate(day);
    }, [consumePendingDay, setSelectedDate]),
  );
  const [role, setRole] = useState<ClergyRole>('priest');
  const [collapsed, setCollapsed] = useState<Record<CollapsibleKey, boolean>>({
    date: false,
    feasts: true,
    saints: true,
    fasting: false,
    vestments: false,
    readings: true,
  });

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
  const appearance = useMemo(
    () => getLiturgicalAppearanceForLocalDate(selectedDate, primaryCalendar),
    [primaryCalendar, selectedDate],
  );
  const { liturgicalDay, loading, error } = useOrthocalDay(selectedDate, primaryCalendar);
  const dashboard = useMemo(
    () => buildDayDashboard(liturgicalDay, appearance, civilPlain, uiLanguage),
    [appearance, civilPlain, liturgicalDay, uiLanguage],
  );
  const { sections: liturgicalTextSections, loadingSlavonic } = useLiturgicalTexts(
    liturgicalDay,
    defaultTextLang,
    uiLanguage,
  );
  const { feasts, saints } = useMemo(() => {
    const entries = buildCommemorationEntries(liturgicalDay);
    return partitionCommemorations(entries);
  }, [liturgicalDay]);
  const vestmentLines = useMemo(
    () => vestmentGuidanceForRole(role, appearance, uiLanguage),
    [role, appearance, uiLanguage],
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
  const toggleSection = (key: CollapsibleKey) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <VestmentPageBackground appearance={appearance} gradientEnabled={showVestmentGradient}>
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
    >
      <DayHero
        appearance={appearance}
        dayTitle={dashboard.dayTitle}
        dateLabel={gregorianDateLabel}
        julianDateLabel={julianDateLabel}
        toneLabel={dashboard.toneLabel}
        feastRank={dashboard.feastRank}
        fastLabel={dashboard.fastLabel}
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

      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <SectionTitleRow
          title={t('today.servingRole')}
          icon="serving-role"
          color={theme.colors.text}
          marginBottom={10}
        />
        <View style={styles.roleRow}>
          {ROLE_IDS.map((id) => {
            const active = id === role;
            return (
              <Pressable
                key={id}
                style={[
                  styles.roleButton,
                  active
                    ? { backgroundColor: colors.accentWine, borderColor: colors.accentWine }
                    : { backgroundColor: 'transparent', borderColor: theme.colors.border },
                ]}
                onPress={() => setRole(id)}
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
        expanded={!collapsed.date}
        onToggle={() => toggleSection('date')}
        themeColors={theme.colors}
      >
        <View style={styles.rowBetween}>
          <Text style={[styles.dateLineValue, type.dateLine, { color: theme.colors.text }]}>
            {gregorianDateLabel}
          </Text>
          <Text style={[styles.pill, type.pill, styles.dateFastPill]}>{dashboard.fastLabel}</Text>
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
        expanded={!collapsed.fasting}
        onToggle={() => toggleSection('fasting')}
        themeColors={theme.colors}
      >
        <View style={styles.rowBetween}>
          <Text style={[styles.body, type.body, { color: theme.colors.text }]}>{t('today.level')}</Text>
          <Text style={[styles.pill, type.pill, { backgroundColor: '#5c3b2e', color: '#fff' }]}>
            {dashboard.fastingLevel}
          </Text>
        </View>
        <Text style={[styles.body, type.body, { color: theme.colors.text }]}>
          {t('today.allowedFoods', { foods: dashboard.fastingFoods })}
        </Text>
        <Text style={[styles.cardHint, type.hint]}>{dashboard.fastingNote}</Text>
      </CollapsibleSection>

      {vestmentLines ? (
        <CollapsibleSection
          title={t('today.sectionVestments')}
          icon="vestments"
          expanded={!collapsed.vestments}
          onToggle={() => toggleSection('vestments')}
          themeColors={theme.colors}
        >
          {vestmentLines.map((item) => (
            <View key={item.kind} style={styles.rowBetween}>
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
          ))}
          <Text style={[styles.cardHint, type.hint]}>{t('today.vestmentsHint')}</Text>
        </CollapsibleSection>
      ) : null}

      <CollapsibleSection
        title={t('today.sectionReadings')}
        icon="readings"
        expanded={!collapsed.readings}
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
        {defaultTextLang === 'chu' ? (
          <Text style={[styles.cardHint, type.hint, { color: isDark ? '#a39e98' : colors.muted }]}>
            {loadingSlavonic ? t('today.slavonicLoading') : t('today.slavonicHint')}
          </Text>
        ) : null}
        {liturgicalTextSections
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
            />
          ))}
      </CollapsibleSection>

      <CollapsibleSection
        title={t('today.sectionFeasts')}
        icon="feasts"
        expanded={!collapsed.feasts}
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
            isDark={isDark}
          />
        )}
      </CollapsibleSection>

      <CollapsibleSection
        title={t('today.sectionSaints')}
        icon="saints"
        expanded={!collapsed.saints}
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
    padding: 20,
    paddingBottom: 40,
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
    padding: 16,
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
  dateFastPill: {
    backgroundColor: '#5c3b2e',
    color: '#fff',
    alignSelf: 'flex-start',
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
