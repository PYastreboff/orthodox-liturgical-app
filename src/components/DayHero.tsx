import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useFontScale } from '../hooks/useFontScale';
import { useAppTranslation } from '../i18n/useAppTranslation';
import type { LiturgicalDayAppearance } from '../lib/calendar/dayAppearance';
import { vestmentHeroGradient } from '../lib/liturgical/vestmentGradient';
import { typikonIconColor, type FeastRankDisplay } from '../lib/liturgical/typikonSymbols';
import { useResolvedColorScheme } from '../theme/useResolvedColorScheme';
import { TypikonSymbol } from './TypikonSymbol';

type Props = {
  appearance: LiturgicalDayAppearance;
  dayTitle: string;
  dateLabel: string;
  julianDateLabel?: string | null;
  toneLabel: string;
  feastRank: FeastRankDisplay;
  fastLabel: string;
  canGoToToday: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
};

export function DayHero({
  appearance,
  dayTitle,
  dateLabel,
  julianDateLabel,
  toneLabel,
  feastRank,
  fastLabel,
  canGoToToday,
  onPrevious,
  onNext,
  onToday,
}: Props) {
  const { t } = useAppTranslation();
  const isDark = useResolvedColorScheme() === 'dark';
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
  const todayBtnType = text(13, 18);

  return (
    <LinearGradient
      colors={[...heroStyle.gradient]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.hero,
        isDark ? styles.heroDark : null,
        isDark ? styles.heroShadow : null,
      ]}
    >
      <Text style={[styles.dayTitle, dayTitleType, { color: fg }]} numberOfLines={3}>
        {dayTitle}
      </Text>

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
          <Feather name="chevron-left" size={26} color={fg} />
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
          <Feather name="chevron-right" size={26} color={fg} />
        </Pressable>
      </View>

      <View style={styles.chipRow}>
        <View style={[styles.chip, { backgroundColor: chipBg }]}>
          <Text style={[styles.chipText, chipType, { color: fg }]}>{toneLabel}</Text>
        </View>
        <View style={[styles.chip, { backgroundColor: chipBg }]}>
          <TypikonSymbol
            feastRank={feastRank}
            variant="chip"
            color={typikonIconColor(feastRank, lightHeroText ? 'light' : isDark ? 'dark' : 'light')}
            style={styles.chipIcon}
          />
        </View>
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
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 14,
    alignItems: 'center',
  },
  heroDark: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  heroShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 5,
  },
  dayTitle: {
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.2,
    marginBottom: 12,
    width: '100%',
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
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    flexShrink: 0,
  },
  navBtnPressed: {
    opacity: 0.75,
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
