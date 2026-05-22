import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import type { LiturgicalDayAppearance } from '../lib/calendar/dayAppearance';
import type { OrderedDateLine } from '../lib/calendar/dateDisplay';
import type { FeastRankDisplay } from '../lib/liturgical/typikonSymbols';
import { CalendarKindBadge } from './CalendarKindBadge';
import { TypikonSymbol } from './TypikonSymbol';

type Props = {
  appearance: LiturgicalDayAppearance;
  dayTitle: string;
  dateLines: OrderedDateLine[];
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
  dateLines,
  toneLabel,
  feastRank,
  fastLabel,
  canGoToToday,
  onPrevious,
  onNext,
  onToday,
}: Props) {
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
          accessibilityLabel="Previous day"
        >
          <Text style={[styles.navArrow, { color: fg }]}>‹</Text>
        </Pressable>

        <View style={styles.dateBlock}>
          {dateLines.map((line, index) => (
            <View
              key={line.kind}
              style={[styles.dateLine, index > 0 ? styles.dateLineSecondary : null]}
            >
              <CalendarKindBadge kind={line.kind} variant="hero" />
              <Text
                style={[
                  index === 0 ? styles.primaryDate : styles.secondaryDate,
                  { color: fg },
                ]}
              >
                {line.label}
              </Text>
            </View>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [styles.navBtn, pressed && styles.navBtnPressed]}
          onPress={onNext}
          accessibilityLabel="Next day"
        >
          <Text style={[styles.navArrow, { color: fg }]}>›</Text>
        </Pressable>
      </View>

      <View style={styles.chipRow}>
        <View style={styles.chip}>
          <Text style={styles.chipText}>{toneLabel}</Text>
        </View>
        <View
          style={styles.chip}
          accessibilityLabel={`Service rank: ${feastRank.shortName}`}
        >
          <TypikonSymbol
            feastRank={feastRank}
            variant="chip"
            color={feastRank.tint ?? '#2b2623'}
            style={styles.chipIcon}
          />
        </View>
        <View style={styles.chip}>
          <Text style={styles.chipText}>{fastLabel}</Text>
        </View>
      </View>

      {canGoToToday ? (
        <Pressable style={styles.todayBtn} onPress={onToday}>
          <Text style={styles.todayBtnText}>Jump to today</Text>
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
  },
  navBtnPressed: {
    opacity: 0.75,
  },
  navArrow: {
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 36,
    marginTop: -2,
  },
  dateBlock: {
    flex: 1,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateLine: {
    alignItems: 'center',
    width: '100%',
  },
  dateLineSecondary: {
    marginTop: 8,
  },
  primaryDate: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
  secondaryDate: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.88,
    lineHeight: 18,
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
