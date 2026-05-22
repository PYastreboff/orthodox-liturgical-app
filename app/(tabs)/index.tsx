import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useTheme } from '@react-navigation/native';

import { CalendarKindBadge } from '../../src/components/CalendarKindBadge';
import { CollapsibleSection } from '../../src/components/CollapsibleSection';
import { SectionTitleRow } from '../../src/components/SectionTitleRow';
import { DayHero } from '../../src/components/DayHero';
import { TypikonSymbol } from '../../src/components/TypikonSymbol';
import { VestmentIcon } from '../../src/components/VestmentIcon';
import { useOrthocalDay } from '../../src/hooks/useOrthocalDay';
import { dateToJulianPlainDate } from '../../src/lib/calendar/julianGregorian';
import { formatGregorianReadableFromDate, formatJulianReadable } from '../../src/lib/calendar/formatDate';
import { getLiturgicalAppearanceForLocalDate } from '../../src/lib/calendar/dayAppearance';
import { startOfLocalDay } from '../../src/lib/calendar/localDate';
import {
  getDateDisplayFlags,
  numericDateHint,
  orderedDateLines,
} from '../../src/lib/calendar/dateDisplay';
import { LiturgicalTextSectionBlock } from '../../src/components/LiturgicalPassageBlock';
import { ReadingsLanguageToggle } from '../../src/components/ReadingsLanguageToggle';
import { VestmentPageBackground } from '../../src/components/VestmentPageBackground';
import { useLiturgicalTexts } from '../../src/hooks/useLiturgicalTexts';
import { buildDayDashboard } from '../../src/lib/liturgical/dayDashboard';
import { vestmentGuidanceForRole } from '../../src/lib/liturgical/vestments';
import { useDayNavigation } from '../../src/state/DayNavigationContext';
import { usePreferences } from '../../src/state/PreferencesContext';
import { colors } from '../../src/theme/tokens';
import { useResolvedColorScheme } from '../../src/theme/useResolvedColorScheme';

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatDateParts(y: number, m: number, d: number) {
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

type ClergyRole = 'layperson' | 'altar_server' | 'deacon' | 'priest' | 'bishop';
type CollapsibleKey =
  | 'date'
  | 'commemorations'
  | 'fasting'
  | 'vestments'
  | 'readings'
  | 'pipeline';

const ROLE_OPTIONS: { id: ClergyRole; label: string }[] = [
  { id: 'layperson', label: 'Layperson' },
  { id: 'altar_server', label: 'Altar server' },
  { id: 'deacon', label: 'Deacon' },
  { id: 'priest', label: 'Priest' },
  { id: 'bishop', label: 'Bishop' },
];

function addDays(d: Date, days: number) {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return startOfLocalDay(next);
}

export default function TodayScreen() {
  const theme = useTheme();
  const isDark = useResolvedColorScheme() === 'dark';
  const verseNumberColor = isDark ? '#a39e98' : colors.muted;
  const { consumePendingDay } = useDayNavigation();
  const { primaryCalendar, showAlternateCalendar, showVestmentGradient, defaultTextLang, setDefaultTextLang } =
    usePreferences();
  const today = useMemo(() => startOfLocalDay(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(today);

  useFocusEffect(
    useCallback(() => {
      const day = consumePendingDay();
      if (day) setSelectedDate(day);
    }, [consumePendingDay]),
  );
  const [role, setRole] = useState<ClergyRole>('priest');
  const [collapsed, setCollapsed] = useState<Record<CollapsibleKey, boolean>>({
    date: false,
    commemorations: false,
    fasting: false,
    vestments: false,
    readings: false,
    pipeline: true,
  });

  const civil = useMemo(
    () => ({
      y: selectedDate.getFullYear(),
      m: selectedDate.getMonth() + 1,
      d: selectedDate.getDate(),
    }),
    [selectedDate],
  );

  const gregorianLine = useMemo(
    () => formatDateParts(civil.y, civil.m, civil.d),
    [civil.d, civil.m, civil.y],
  );
  const liturgicalJulian = useMemo(() => dateToJulianPlainDate(selectedDate), [selectedDate]);
  const gregorianCivil = useMemo(
    () => ({
      year: selectedDate.getFullYear(),
      month: selectedDate.getMonth() + 1,
      day: selectedDate.getDate(),
    }),
    [selectedDate],
  );
  const appearance = useMemo(() => getLiturgicalAppearanceForLocalDate(selectedDate), [selectedDate]);
  const { julianDay, gregorianDay, loading, error } = useOrthocalDay(liturgicalJulian, gregorianCivil);
  const dashboard = useMemo(
    () => buildDayDashboard(julianDay, gregorianDay, appearance),
    [appearance, gregorianDay, julianDay],
  );
  const { sections: liturgicalTextSections, loadingSlavonic } = useLiturgicalTexts(
    julianDay,
    defaultTextLang,
  );

  const julianDateLabel = useMemo(() => formatJulianReadable(liturgicalJulian, true), [liturgicalJulian]);
  const gregorianDateLabel = useMemo(
    () => formatGregorianReadableFromDate(selectedDate),
    [selectedDate],
  );
  const vestmentLines = useMemo(
    () => vestmentGuidanceForRole(role, appearance),
    [role, appearance],
  );

  const dateDisplay = useMemo(
    () => getDateDisplayFlags({ primaryCalendar, showAlternateCalendar }),
    [primaryCalendar, showAlternateCalendar],
  );
  const heroDateLines = useMemo(
    () => orderedDateLines(dateDisplay, julianDateLabel, gregorianDateLabel),
    [dateDisplay, gregorianDateLabel, julianDateLabel],
  );
  const primaryFastLabel =
    primaryCalendar === 'julian' ? dashboard.julianFastLabel : dashboard.gregorianFastLabel;
  const alternateFastLabel =
    primaryCalendar === 'julian' ? dashboard.gregorianFastLabel : dashboard.julianFastLabel;
  const numericHint = useMemo(
    () =>
      numericDateHint(
        dateDisplay,
        formatDateParts(liturgicalJulian.year, liturgicalJulian.month, liturgicalJulian.day),
        gregorianLine,
      ),
    [dateDisplay, gregorianLine, liturgicalJulian.day, liturgicalJulian.month, liturgicalJulian.year],
  );

  const canGoToToday = selectedDate.getTime() !== today.getTime();
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
        dateLines={heroDateLines}
        toneLabel={dashboard.toneLabel}
        feastRank={dashboard.feastRank}
        fastLabel={primaryFastLabel}
        canGoToToday={canGoToToday}
        onPrevious={() => setSelectedDate((d) => addDays(d, -1))}
        onNext={() => setSelectedDate((d) => addDays(d, 1))}
        onToday={() => setSelectedDate(today)}
      />
      {loading ? (
        <Text style={[styles.statusLine, { color: colors.muted }]}>Loading liturgical data…</Text>
      ) : null}
      {error ? (
        <Text style={[styles.statusLine, styles.statusError]}>
          Offline or API unavailable — showing local calendar defaults. ({error})
        </Text>
      ) : null}

      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <SectionTitleRow
          title="Serving Role"
          icon="serving-role"
          color={theme.colors.text}
          marginBottom={10}
        />
        <View style={styles.roleRow}>
          {ROLE_OPTIONS.map((option) => {
            const active = option.id === role;
            return (
              <Pressable
                key={option.id}
                style={[
                  styles.roleButton,
                  active
                    ? { backgroundColor: colors.accentWine, borderColor: colors.accentWine }
                    : { backgroundColor: 'transparent', borderColor: theme.colors.border },
                ]}
                onPress={() => setRole(option.id)}
              >
                <Text style={[styles.roleButtonText, { color: active ? '#fff' : theme.colors.text }]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <CollapsibleSection
        title="Date & Liturgical Day"
        icon="date"
        expanded={!collapsed.date}
        onToggle={() => toggleSection('date')}
        themeColors={theme.colors}
      >
        {heroDateLines.map((line, index) => (
          <View
            key={line.kind}
            style={[styles.rowBetween, index > 0 ? styles.dateRowGap : null]}
          >
            <View style={styles.dateTextWrap}>
              <CalendarKindBadge kind={line.kind} variant="date" align="left" isDark={isDark} />
              <Text style={[styles.dateLineValue, { color: theme.colors.text }]}>
                {line.label}
              </Text>
            </View>
            <Text style={[styles.pill, styles.dateFastPill]}>
              {index === 0 ? primaryFastLabel : alternateFastLabel}
            </Text>
          </View>
        ))}
        <View style={styles.serviceRankRow}>
          <TypikonSymbol feastRank={dashboard.feastRank} variant="chip" />
          <Text style={[styles.serviceRankLabel, { color: theme.colors.text }]}>
            {dashboard.feastRank.shortName}
          </Text>
        </View>
        <Text style={styles.cardHint}>{numericHint}</Text>
      </CollapsibleSection>

      <CollapsibleSection
        title="Commemorations & Feasts"
        icon="commemorations"
        expanded={!collapsed.commemorations}
        onToggle={() => toggleSection('commemorations')}
        themeColors={theme.colors}
      >
        <View style={styles.feastRankRow}>
          <TypikonSymbol feastRank={dashboard.feastRank} variant="large" />
          <Text style={[styles.sectionHeading, styles.feastRankHeading, { color: theme.colors.text }]}>
            {dashboard.dayTitle}
          </Text>
        </View>
        {dashboard.feasts.length > 0 ? (
          <Text style={[styles.body, { color: theme.colors.text }]}>
            Feasts: {dashboard.feasts.join(' • ')}
          </Text>
        ) : null}
        <Text style={[styles.body, { color: theme.colors.text, marginTop: 8 }]}>
          Saints: {dashboard.saints.join(' • ')}
        </Text>
        {dashboard.titles.length > 1 ? (
          <Text style={styles.cardHint}>Also: {dashboard.titles.slice(1).join(' · ')}</Text>
        ) : null}
      </CollapsibleSection>

      <CollapsibleSection
        title="Fasting Information"
        icon="fasting"
        expanded={!collapsed.fasting}
        onToggle={() => toggleSection('fasting')}
        themeColors={theme.colors}
      >
        <View style={styles.rowBetween}>
          <Text style={[styles.body, { color: theme.colors.text }]}>Level</Text>
          <Text style={[styles.pill, { backgroundColor: '#5c3b2e', color: '#fff' }]}>{dashboard.fastingLevel}</Text>
        </View>
        <Text style={[styles.body, { color: theme.colors.text }]}>Allowed foods: {dashboard.fastingFoods}</Text>
        <Text style={styles.cardHint}>{dashboard.fastingNote}</Text>
      </CollapsibleSection>

      {vestmentLines ? (
        <CollapsibleSection
          title="Vestments"
          icon="vestments"
          expanded={!collapsed.vestments}
          onToggle={() => toggleSection('vestments')}
          themeColors={theme.colors}
        >
          {vestmentLines.map((item) => (
            <View key={item.kind} style={styles.rowBetween}>
              <View style={styles.vestmentLabelRow}>
                <VestmentIcon kind={item.kind} color={theme.colors.text} />
                <Text style={[styles.body, { color: theme.colors.text }]}>{item.label}</Text>
              </View>
              <Text
                style={[
                  styles.pill,
                  { backgroundColor: item.pillBg, color: item.pillText },
                ]}
              >
                {item.value}
              </Text>
            </View>
          ))}
          <Text style={styles.cardHint}>
            Colours follow this Julian liturgical day (approximate until your typikon pack is loaded).
          </Text>
        </CollapsibleSection>
      ) : null}

      <CollapsibleSection
        title="Liturgical Texts"
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
          <Text style={[styles.cardHint, { color: isDark ? '#a39e98' : colors.muted }]}>
            {loadingSlavonic
              ? 'Loading Church Slavonic scripture…'
              : 'Scripture from Elizabeth Bible (1757). Troparia and kontakia stay in English when orthocal has no Slavonic.'}
          </Text>
        ) : null}
        {liturgicalTextSections.map((section, index) => (
          <LiturgicalTextSectionBlock
            key={section.id}
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
        title="Data pipeline"
        icon="pipeline"
        expanded={!collapsed.pipeline}
        onToggle={() => toggleSection('pipeline')}
        themeColors={theme.colors}
      >
        <Text style={[styles.body, { color: theme.colors.text }]}>
          Liturgical day, saints, fasting, and readings load from orthocal.info (OCA rubrics, KJV scripture).
          Troparia and kontakia appear when the API includes them or when noted in a saint’s life; otherwise
          sections show “None for this day.” Vestment colours still use the local Pascha-based script until
          your typikon pack is added.
        </Text>
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
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 10,
    marginTop: -6,
  },
  statusError: {
    color: colors.accentWine,
    lineHeight: 18,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginBottom: 10,
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
    fontSize: 13,
    fontWeight: '700',
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  compactValue: {
    fontSize: 16,
    marginTop: 4,
  },
  serviceRankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 2,
  },
  serviceRankLabel: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    opacity: 0.85,
  },
  dateLineValue: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
    marginTop: 2,
  },
  dateTextWrap: {
    flex: 1,
    paddingRight: 8,
    alignItems: 'flex-start',
  },
  dateRowGap: {
    marginTop: 10,
  },
  dateFastPill: {
    backgroundColor: '#5c3b2e',
    color: '#fff',
    alignSelf: 'flex-start',
  },
  cardHint: {
    marginTop: 8,
    fontSize: 13,
    color: colors.muted,
    lineHeight: 20,
    opacity: 0.9,
  },
  feastRankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  feastRankHeading: {
    flex: 1,
    marginTop: 0,
    marginBottom: 0,
  },
  sectionHeading: {
    marginTop: 4,
    marginBottom: 6,
    fontSize: 16,
    fontWeight: '700',
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
    fontSize: 12,
    fontWeight: '700',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
});
