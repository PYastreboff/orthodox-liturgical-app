import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { DayPagePanel } from './day/DayPagePanel';
import { AltarServerRoleTable } from './AltarServerRoleTable';
import { ChoirGuideTable } from './ChoirGuideTable';
import { DeaconGuideTable } from './DeaconGuideTable';
import { FastingFoodList } from './FastingFoodList';
import { FastSummaryPill } from './FastSummaryPill';
import { LiturgicalTextSectionBlock } from './LiturgicalPassageBlock';
import { LiturgicalTextsCategoryToggle } from './LiturgicalTextsCategoryToggle';
import { PriestGuideTable } from './PriestGuideTable';
import { PrayersSectionBody } from './PrayersSectionBody';
import { ReaderGuideTable } from './ReaderGuideTable';
import { ReadingsLanguageToggle } from './ReadingsLanguageToggle';
import { TodayPersonalDays } from './TodayPersonalDays';
import { TypikonSymbol } from './TypikonSymbol';
import { VestmentIcon } from './VestmentIcon';
import { CommemorationCard } from './CommemorationCard';
import type { TodayDayModel } from '../hooks/useTodayDayModel';
import { usePhoneLayout } from '../hooks/usePhoneLayout';
import {
  feastRankServiceLabel,
  feastRankServiceLabelForMajorFeastDay,
} from '../i18n/feastRank';
import type { CommemorationEntry } from '../lib/liturgical/commemorations';
import type { TodaySectionId } from '../lib/today/todaySections';
import { colors } from '../theme/tokens';

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
  borderColor,
  bodyType,
  hintType,
  isMajorFeastDay = false,
  primaryFeastTitle = '',
  isDark = false,
}: {
  entries: CommemorationEntry[];
  emptyMessage: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  bodyType: { fontSize: number; lineHeight: number };
  hintType: { fontSize: number; lineHeight: number };
  isMajorFeastDay?: boolean;
  primaryFeastTitle?: string;
  isDark?: boolean;
}) {
  if (!entries.length) {
    return <Text style={[styles.body, bodyType, { color: textColor }]}>{emptyMessage}</Text>;
  }
  return (
    <View style={styles.commemorationList}>
      {entries.map((entry) => (
        <CommemorationCard
          key={entry.id}
          entry={entry}
          textColor={textColor}
          mutedColor={mutedColor}
          borderColor={borderColor}
          isDark={isDark}
          bodyType={bodyType}
          hintType={hintType}
          isPrimaryGreatFeast={isPrimaryGreatFeastEntry(
            entry,
            isMajorFeastDay,
            primaryFeastTitle,
          )}
        />
      ))}
    </View>
  );
}

type Props = {
  section: TodaySectionId;
  model: TodayDayModel;
};

export function TodaySectionContent({ section, model }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const phone = usePhoneLayout();
  const {
    isDark,
    t,
    lang,
    verseNumberColor,
    liturgicalDay,
    waitingForDay,
    dashboard,
    isGreatFeastRankDay,
    gregorianDateLabel,
    aboutToday,
    vestmentGuidance,
    servingRole,
    dayServices,
    guideDayContext,
    enabledPrayers,
    type,
    readingsAvailableCategories,
    readingsCategoryFilter,
    setReadingsCategoryFilter,
    setReadingsCategoryMenuOpen,
    defaultTextLang,
    setDefaultTextLang,
    readingsVisibleSections,
    slavonicSections,
    sideBySide,
    loadingSlavonic,
    feasts,
    saints,
    showOrthocalContentNote,
    handlePrintDay,
    personalOnDay,
  } = model;

  const muted = isDark ? '#a39e98' : colors.muted;
  const panel = {
    textColor: theme.colors.text,
    borderColor: theme.colors.border,
    isDark,
  };

  const wrap = (children: ReactNode, title?: string) => (
    <DayPagePanel {...panel} title={title} first>
      {children}
    </DayPagePanel>
  );

  switch (section) {
    case 'date':
      return (
        <View style={styles.pageStack}>
          <DayPagePanel {...panel} first>
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
                  <Text
                    style={[
                      styles.majorFeastDash,
                      type.majorFeastDash,
                      { color: colors.feastBorder },
                    ]}
                  >
                    —
                  </Text>
                  <Text
                    style={[
                      styles.majorFeastName,
                      type.majorFeastName,
                      { color: colors.feastBorder },
                    ]}
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
            <Pressable
              onPress={handlePrintDay}
              style={({ pressed }) => [
                styles.actionRow,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(43,38,35,0.05)',
                  borderColor: theme.colors.border,
                  opacity: pressed ? 0.88 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={t('print.a11y')}
            >
              <Feather
                name="printer"
                size={18}
                color={isDark ? colors.tabActiveDark : colors.accentWine}
              />
              <View style={styles.actionRowText}>
                <Text style={[styles.actionRowLabel, type.body, { color: theme.colors.text }]}>
                  {t('print.button')}
                </Text>
                <Text style={[type.hint, { color: muted }]}>{t('print.hint')}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={muted} />
            </Pressable>
          </DayPagePanel>
          <DayPagePanel {...panel} title={t('today.personalOnDay')}>
            <TodayPersonalDays
              occurrences={personalOnDay}
              isDark={isDark}
              textColor={theme.colors.text}
              variant="list"
              emptyMessage={t('today.noPersonalOnDay')}
              hintMessage={t('today.personalManageHint')}
            />
          </DayPagePanel>
          <DayPagePanel {...panel} title={t('dayAbout.sectionTitle')}>
            <Text style={[styles.dayAboutBody, type.body, { color: theme.colors.text }]}>
              {aboutToday}
            </Text>
          </DayPagePanel>
        </View>
      );

    case 'fasting':
      return (
        <View style={styles.pageStack}>
          <DayPagePanel {...panel} first>
            <View style={styles.fastLevelRow}>
              <View style={styles.fastLevelText}>
                {dashboard.isFastDay ? (
                  <>
                    {dashboard.weeklyFastSectionLabel ? (
                      <Text
                        style={[styles.fastLevelSubtitle, type.body, { color: theme.colors.text }]}
                      >
                        {dashboard.weeklyFastSectionLabel}
                      </Text>
                    ) : null}
                    {dashboard.fastingFoods.totalAbstinence ? (
                      <Text style={[styles.fastLevelDetail, type.body, { color: theme.colors.text }]}>
                        {t('fasting.foodsNoEating')}
                      </Text>
                    ) : dashboard.fastingFoods.ruleLabel !== dashboard.weeklyFastSectionLabel ? (
                      <Text style={[styles.fastLevelDetail, type.body, { color: theme.colors.text }]}>
                        {dashboard.fastingFoods.ruleLabel}
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
          </DayPagePanel>
          <DayPagePanel {...panel} title={t('recipes.forFastingDays')}>
            <Pressable
              onPress={() => router.push('/recipes')}
              style={({ pressed }) => [
                styles.actionRow,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(43,38,35,0.05)',
                  borderColor: theme.colors.border,
                  opacity: pressed ? 0.88 : 1,
                  marginTop: 0,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={t('recipes.openFromFasting')}
            >
              <MaterialCommunityIcons
                name="food-variant"
                size={20}
                color={isDark ? colors.tabActiveDark : colors.accentWine}
              />
              <View style={styles.actionRowText}>
                <Text style={[styles.actionRowLabel, type.body, { color: theme.colors.text }]}>
                  {t('recipes.openFromFasting')}
                </Text>
                <Text style={[type.hint, { color: muted }]}>
                  {t('recipes.openFromFastingHint')}
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color={muted} />
            </Pressable>
          </DayPagePanel>
          {dashboard.isFastDay && !dashboard.fastingFoods.totalAbstinence ? (
            <DayPagePanel {...panel}>
              <View style={styles.fastingFoodsStack}>
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
              </View>
            </DayPagePanel>
          ) : null}
          {dashboard.fastingExplanation || dashboard.fastingNote ? (
            <DayPagePanel {...panel}>
              <View style={styles.fastingNotesStack}>
                {dashboard.fastingExplanation ? (
                  <Text style={[styles.fastingExplain, type.body, { color: theme.colors.text }]}>
                    {dashboard.fastingExplanation}
                  </Text>
                ) : null}
                {dashboard.fastingNote ? (
                  <Text style={[styles.cardHintFlat, type.hint]}>{dashboard.fastingNote}</Text>
                ) : null}
              </View>
            </DayPagePanel>
          ) : null}
        </View>
      );

    case 'prayers':
      return wrap(
        <PrayersSectionBody
          enabledPrayers={enabledPrayers}
          textColor={theme.colors.text}
          mutedColor={muted}
          borderColor={theme.colors.border}
          isDark={isDark}
          bodyType={type.body}
          hintType={type.hint}
        />,
      );

    case 'vestments':
      return wrap(
        <View style={styles.cardBody}>
          <Text style={[styles.vestmentWhyHeading, type.body, { color: theme.colors.text }]}>
            {servingRole === 'layperson' || servingRole === 'chorister'
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
        </View>,
      );

    case 'services':
      return wrap(
        <View style={styles.cardBody}>
          {dayServices.items.length === 0 ? (
            <Text style={[styles.cardHint, type.hint, { color: muted }]}>
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
          <Text style={[styles.cardHint, type.hint, { color: muted }]}>{dayServices.footnote}</Text>
        </View>,
      );

    case 'choirGuide':
      return wrap(
        <ChoirGuideTable
          textColor={theme.colors.text}
          mutedColor={muted}
          isDark={isDark}
          dayContext={guideDayContext}
        />,
      );
    case 'altarRoles':
      return wrap(
        <AltarServerRoleTable
          textColor={theme.colors.text}
          mutedColor={muted}
          isDark={isDark}
          dayContext={guideDayContext}
        />,
      );
    case 'readerGuide':
      return wrap(
        <ReaderGuideTable
          textColor={theme.colors.text}
          mutedColor={muted}
          isDark={isDark}
          dayContext={guideDayContext}
        />,
      );
    case 'deaconGuide':
      return wrap(
        <DeaconGuideTable
          textColor={theme.colors.text}
          mutedColor={muted}
          isDark={isDark}
          dayContext={guideDayContext}
        />,
      );
    case 'priestGuide':
      return wrap(
        <PriestGuideTable
          textColor={theme.colors.text}
          mutedColor={muted}
          isDark={isDark}
          dayContext={guideDayContext}
        />,
      );

    case 'readings':
      return wrap(
        <View style={styles.cardBody}>
          <View
            style={[
              styles.readingsToolbar,
              phone ? styles.readingsToolbarPhone : null,
            ]}
          >
            {readingsAvailableCategories.length > 1 ? (
              <LiturgicalTextsCategoryToggle
                value={readingsCategoryFilter}
                onChange={setReadingsCategoryFilter}
                availableCategories={readingsAvailableCategories}
                isDark={isDark}
                onOpenChange={setReadingsCategoryMenuOpen}
              />
            ) : null}
            <ReadingsLanguageToggle
              value={defaultTextLang}
              onChange={setDefaultTextLang}
              isDark={isDark}
            />
          </View>
          {readingsVisibleSections.length === 0 ? (
            <Text style={[styles.cardHint, type.hint, { color: muted }]}>
              {t('readings.noneForDay')}
            </Text>
          ) : (
            readingsVisibleSections.map((sectionBlock, index) => (
              <LiturgicalTextSectionBlock
                key={sectionBlock.id}
                category={sectionBlock.id}
                title={sectionBlock.title}
                items={sectionBlock.items}
                textColor={theme.colors.text}
                verseNumberColor={verseNumberColor}
                headingColor={theme.colors.text}
                topGap={index > 0}
                sideBySide={sideBySide}
                secondaryItems={
                  sideBySide
                    ? slavonicSections?.find((s) => s.id === sectionBlock.id)?.items
                    : undefined
                }
                slavonicLoading={sideBySide ? loadingSlavonic : undefined}
                mutedColor={muted}
              />
            ))
          )}
        </View>,
      );

    case 'feasts':
      return wrap(
        waitingForDay ? (
          <Text style={[styles.cardHint, type.hint, { color: muted }]}>
            {t('today.loadingFeasts')}
          </Text>
        ) : (
          <CommemorationEntryList
            entries={feasts}
            emptyMessage={t('today.noFeasts')}
            textColor={theme.colors.text}
            mutedColor={muted}
            borderColor={theme.colors.border}
            bodyType={type.body}
            hintType={type.hint}
            isMajorFeastDay={dashboard.isMajorFeastDay}
            primaryFeastTitle={dashboard.feastsHighlightTitle}
            isDark={isDark}
          />
        ),
      );

    case 'saints':
      return wrap(
        waitingForDay ? (
          <Text style={[styles.cardHint, type.hint, { color: muted }]}>
            {t('today.loadingSaints')}
          </Text>
        ) : (
          <>
            <CommemorationEntryList
              entries={saints}
              emptyMessage={t('today.noSaints')}
              textColor={theme.colors.text}
              mutedColor={muted}
              borderColor={theme.colors.border}
              bodyType={type.body}
              hintType={type.hint}
              isDark={isDark}
            />
            {showOrthocalContentNote ? (
              <Text style={[styles.cardHint, type.hint, { color: muted }]}>
                {t('today.orthocalContentNote')}
              </Text>
            ) : null}
          </>
        ),
      );

    default:
      return null;
  }
}

const styles = StyleSheet.create({
  pageStack: {
    gap: 0,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  actionRowText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  actionRowLabel: {
    fontWeight: '700',
  },
  cardBody: {
    gap: 0,
  },
  body: {},
  readingsToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
    zIndex: 2,
  },
  readingsToolbarPhone: {
    justifyContent: 'space-between',
    flexWrap: 'wrap',
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
  dayAboutBody: {
    marginTop: 0,
    opacity: 0.92,
  },
  dateLineValue: {
    fontWeight: '600',
    marginTop: 2,
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
    fontStyle: 'italic',
    opacity: 0.85,
  },
  fastingExplain: {
    lineHeight: 22,
    opacity: 0.92,
  },
  fastingFoodsStack: {
    gap: 14,
  },
  fastingNotesStack: {
    gap: 8,
  },
  cardHintFlat: {
    color: colors.muted,
    opacity: 0.9,
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
  commemorationList: {
    gap: 12,
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
    overflow: 'hidden',
  },
});
