import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useAppTranslation } from '../i18n/useAppTranslation';
import type { LiturgicalDayAppearance } from '../lib/calendar/dayAppearance';
import { typikonIconColor, type FeastRankDisplay } from '../lib/liturgical/typikonSymbols';
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
  const fg = appearance.foreground;

  return (
    <LinearGradient
      colors={appearance.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <Text style={[styles.dayTitle, { color: fg }]} numberOfLines={3}>
        {dayTitle}
      </Text>

      <View style={styles.navRow}>
        <Pressable
          style={({ pressed }) => [styles.navBtn, pressed && styles.navBtnPressed]}
          onPress={onPrevious}
          accessibilityLabel={t('today.prevDay')}
        >
          <Feather name="chevron-left" size={26} color={fg} />
        </Pressable>

        <View style={styles.dateBlock}>
          <Text style={[styles.primaryDate, { color: fg }]}>{dateLabel}</Text>
          {julianDateLabel ? (
            <Text style={[styles.julianDate, { color: fg }]}>{julianDateLabel}</Text>
          ) : null}
        </View>

        <Pressable
          style={({ pressed }) => [styles.navBtn, pressed && styles.navBtnPressed]}
          onPress={onNext}
          accessibilityLabel={t('today.nextDay')}
        >
          <Feather name="chevron-right" size={26} color={fg} />
        </Pressable>
      </View>

      <View style={styles.chipRow}>
        <View style={styles.chip}>
          <Text style={styles.chipText}>{toneLabel}</Text>
        </View>
        <View style={styles.chip}>
          <TypikonSymbol
            feastRank={feastRank}
            variant="chip"
            color={typikonIconColor(feastRank, 'light')}
            style={styles.chipIcon}
          />
        </View>
        <View style={styles.chip}>
          <Text style={styles.chipText}>{fastLabel}</Text>
        </View>
      </View>

      {canGoToToday ? (
        <Pressable style={styles.todayBtn} onPress={onToday}>
          <Text style={styles.todayBtnText}>{t('today.jumpToToday')}</Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 5,
  },
  dayTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 34,
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
    backgroundColor: 'rgba(255,255,255,0.22)',
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
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
  julianDate: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 16,
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
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 999,
    paddingHorizontal: 12,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2b2623',
    lineHeight: 16,
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
    backgroundColor: 'rgba(30,26,22,0.55)',
  },
  todayBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
