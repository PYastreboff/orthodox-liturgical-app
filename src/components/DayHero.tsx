import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { feastRankHeroLabelForMajorFeastDay } from '../i18n/feastRank';
import { useFontScale } from '../hooks/useFontScale';
import { usePhoneLayout } from '../hooks/usePhoneLayout';
import { useAppTranslation } from '../i18n/useAppTranslation';
import type { LiturgicalDayAppearance } from '../lib/calendar/dayAppearance';
import { vestmentHeroGradient } from '../lib/liturgical/vestmentGradient';
import { typikonIconColor, type FeastRankDisplay } from '../lib/liturgical/typikonSymbols';
import { colors } from '../theme/tokens';
import { useResolvedColorScheme } from '../theme/useResolvedColorScheme';
import { SECTION_CARD_PADDING, SECTION_CARD_PADDING_PHONE } from '../theme/layout';
import { TypikonSymbol } from './TypikonSymbol';

type Props = {
  appearance: LiturgicalDayAppearance;
  dayTitle: string;
  dateLabel: string;
  julianDateLabel?: string | null;
  toneLabel: string;
  feastRank: FeastRankDisplay;
  fastLabel: string;
  isMajorFeastDay?: boolean;
  orthocalFeastLevel?: number;
  canGoToToday: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onShare?: () => void;
};

export function DayHero({
  appearance,
  dayTitle,
  dateLabel,
  julianDateLabel,
  toneLabel,
  feastRank,
  fastLabel,
  isMajorFeastDay = false,
  orthocalFeastLevel,
  canGoToToday,
  onPrevious,
  onNext,
  onToday,
  onShare,
}: Props) {
  const { t, lang } = useAppTranslation();
  const isDark = useResolvedColorScheme() === 'dark';
  const phoneLayout = usePhoneLayout();
  const heroPaddingX = phoneLayout ? SECTION_CARD_PADDING_PHONE : SECTION_CARD_PADDING;
  const { text } = useFontScale();
  const heroStyle = useMemo(
    () => vestmentHeroGradient(appearance, isDark),
    [appearance.key, appearance.label, isDark],
  );
  const fg = heroStyle.foreground;
  const lightHeroText =
    fg.toLowerCase() === '#ffffff' ||
    fg.toLowerCase() === '#f7eef8' ||
    fg.toLowerCase() === '#e8eef8';
  const chipBg = lightHeroText
    ? 'rgba(255,255,255,0.14)'
    : isDark
      ? 'rgba(255,255,255,0.1)'
      : 'rgba(255,255,255,0.65)';
  const navBtnBg = lightHeroText ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.22)';
  const todayBtnBg = lightHeroText ? 'rgba(255,255,255,0.16)' : 'rgba(30,26,22,0.55)';
  const dayTitleType = text(28, 34);
  const primaryDateType = text(17, 22);
  const julianDateType = text(12, 16);
  const chipType = text(12, 16);
  const feastChipType = text(12, 16);
  const todayBtnType = text(13, 18);
  const typikonSurface = lightHeroText ? 'light' : isDark ? 'dark' : 'light';
  const typikonColor = typikonIconColor(feastRank, typikonSurface);
  const majorFeastServiceLabel = isMajorFeastDay
    ? feastRankHeroLabelForMajorFeastDay(feastRank, orthocalFeastLevel, lang)
    : null;
  const majorFeastChipBg = lightHeroText
    ? 'rgba(214,58,82,0.22)'
    : isDark
      ? 'rgba(214,58,82,0.28)'
      : 'rgba(214,58,82,0.16)';
  const majorFeastBorder = isDark ? colors.feastHoverBorderDark : colors.feastBorder;
  const majorFeastTypikonColor = lightHeroText ? colors.feastBorder : fg;
  const majorFeastTypikonBackdrop = lightHeroText
    ? 'rgba(255,255,255,0.28)'
    : isDark
      ? 'rgba(255,255,255,0.14)'
      : 'rgba(255,255,255,0.72)';

  return (
    <View
      style={[
        styles.heroShell,
        isDark ? styles.heroShellDark : null,
        isDark ? styles.heroShadow : null,
        isMajorFeastDay
          ? { borderWidth: 2, borderColor: majorFeastBorder }
          : null,
      ]}
    >
      <LinearGradient
        colors={[...heroStyle.gradient]}
        start={{ x: 0, y: 0.15 }}
        end={{ x: 0.92, y: 1 }}
        style={[styles.heroGradient, { paddingHorizontal: heroPaddingX }]}
      >
      <View style={styles.titleRow}>
        <Text
          style={[
            styles.dayTitle,
            dayTitleType,
            { color: fg },
            isMajorFeastDay ? styles.dayTitleFeast : null,
            onShare ? styles.dayTitleWithShare : null,
          ]}
          numberOfLines={3}
        >
          {dayTitle}
        </Text>
        {onShare ? (
          <Pressable
            style={({ pressed }) => [
              styles.shareBtn,
              { backgroundColor: navBtnBg },
              pressed && styles.navBtnPressed,
            ]}
            onPress={onShare}
            accessibilityLabel={t('today.shareDayA11y')}
            accessibilityRole="button"
            hitSlop={6}
          >
            <Feather name="share-2" size={16} color={fg} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.navRow}>
        <Pressable
          style={({ pressed }) => [
            styles.navBtn,
            { backgroundColor: navBtnBg },
            pressed && styles.navBtnPressed,
          ]}
          onPress={onPrevious}
          accessibilityLabel={t('today.prevDay')}
        >
          <View style={styles.navChevronSlot} pointerEvents="none">
            <Feather
              name="chevron-left"
              size={24}
              color={fg}
              style={styles.navChevronLeft}
            />
          </View>
        </Pressable>

        <View style={styles.dateBlock}>
          <Text style={[styles.primaryDate, primaryDateType, { color: fg }]}>{dateLabel}</Text>
          {julianDateLabel ? (
            <Text style={[styles.julianDate, julianDateType, { color: fg }]}>
              {julianDateLabel}
            </Text>
          ) : null}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.navBtn,
            { backgroundColor: navBtnBg },
            pressed && styles.navBtnPressed,
          ]}
          onPress={onNext}
          accessibilityLabel={t('today.nextDay')}
        >
          <View style={styles.navChevronSlot} pointerEvents="none">
            <Feather
              name="chevron-right"
              size={24}
              color={fg}
              style={styles.navChevronRight}
            />
          </View>
        </Pressable>
      </View>

      <View style={styles.chipRow}>
        <View style={[styles.chip, { backgroundColor: chipBg }]}>
          <Text style={[styles.chipText, chipType, { color: fg }]}>{toneLabel}</Text>
        </View>
        {isMajorFeastDay && majorFeastServiceLabel ? (
          <View style={[styles.chip, styles.feastChip, { backgroundColor: majorFeastChipBg }]}>
            <View
              style={[styles.feastTypikonBackdrop, { backgroundColor: majorFeastTypikonBackdrop }]}
            >
              <TypikonSymbol
                feastRank={feastRank}
                variant="chip"
                color={majorFeastTypikonColor}
                style={styles.chipIcon}
              />
            </View>
            <Text
              style={[styles.feastChipText, feastChipType, { color: fg }]}
              numberOfLines={2}
            >
              {majorFeastServiceLabel}
            </Text>
          </View>
        ) : (
          <View style={[styles.chip, { backgroundColor: chipBg }]}>
            <TypikonSymbol
              feastRank={feastRank}
              variant="chip"
              color={typikonColor}
              style={styles.chipIcon}
            />
          </View>
        )}
        <View style={[styles.chip, { backgroundColor: chipBg }]}>
          <Text style={[styles.chipText, chipType, { color: fg }]}>{fastLabel}</Text>
        </View>
      </View>

      {canGoToToday ? (
        <Pressable style={[styles.todayBtn, { backgroundColor: todayBtnBg }]} onPress={onToday}>
          <Text style={[styles.todayBtnText, todayBtnType, { color: fg }]}>{t('today.jumpToToday')}</Text>
        </Pressable>
      ) : null}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  heroShell: {
    borderRadius: 18,
    marginBottom: 14,
    width: '100%',
    alignSelf: 'stretch',
    overflow: 'hidden',
  },
  heroShellDark: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  heroGradient: {
    paddingVertical: 20,
    alignItems: 'center',
    width: '100%',
  },
  heroShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 5,
  },
  titleRow: {
    width: '100%',
    marginBottom: 12,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
  },
  dayTitle: {
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.2,
    width: '100%',
  },
  dayTitleFeast: {
    letterSpacing: 0.35,
  },
  dayTitleWithShare: {
    paddingHorizontal: 36,
  },
  shareBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 4,
  },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    flexShrink: 0,
  },
  navBtnPressed: {
    opacity: 0.75,
  },
  navChevronSlot: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navChevronLeft: {
    lineHeight: 24,
    textAlign: 'center',
    transform: [{ translateX: -1 }],
  },
  navChevronRight: {
    lineHeight: 24,
    textAlign: 'center',
    transform: [{ translateX: 1 }],
  },
  dateBlock: {
    flex: 1,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  primaryDate: {
    fontWeight: '600',
    textAlign: 'center',
  },
  julianDate: {
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.88,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontWeight: '600',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  chipIcon: {
    marginVertical: 0,
  },
  feastChip: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    maxWidth: '92%',
  },
  feastTypikonBackdrop: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  feastChipText: {
    fontWeight: '700',
    flexShrink: 1,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  todayBtn: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  todayBtnText: {
    fontWeight: '600',
  },
});
