import { useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@react-navigation/native';

import { CalendarKindBadge } from './CalendarKindBadge';
import { colors } from '../theme/tokens';
import { getLiturgicalAppearanceForLocalDate } from '../lib/calendar/dayAppearance';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function buildMonthCells(visibleMonth: Date): (Date | null)[][] {
  const y = visibleMonth.getFullYear();
  const m = visibleMonth.getMonth();
  const firstDow = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const flat: (Date | null)[] = [...Array(firstDow).fill(null)];
  for (let d = 1; d <= daysInMonth; d++) {
    flat.push(new Date(y, m, d));
  }
  while (flat.length % 7 !== 0) {
    flat.push(null);
  }
  const rows: (Date | null)[][] = [];
  for (let i = 0; i < flat.length; i += 7) {
    rows.push(flat.slice(i, i + 7));
  }
  return rows;
}

function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

type Props = {
  visibleMonth: Date;
  onChangeMonth: (delta: -1 | 1) => void;
};

export function LiturgicalMonthGrid({ visibleMonth, onChangeMonth }: Props) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const today = useMemo(() => new Date(), []);
  const rows = useMemo(() => buildMonthCells(visibleMonth), [visibleMonth]);

  const title = new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(visibleMonth);

  const horizontalPad = 12;
  const gap = 5;
  const contentWidth = width - horizontalPad * 2;
  const cellWidth = (contentWidth - gap * 6) / 7;

  return (
    <View style={styles.outer}>
      <View style={styles.monthNav}>
        <Pressable
          onPress={() => onChangeMonth(-1)}
          style={({ pressed }) => [styles.navBtn, { opacity: pressed ? 0.6 : 1 }]}
          hitSlop={12}
        >
          <Text style={[styles.navBtnText, { color: theme.colors.text }]}>‹</Text>
        </Pressable>
        <Text style={[styles.monthTitle, { color: theme.colors.text }]}>{title}</Text>
        <Pressable
          onPress={() => onChangeMonth(1)}
          style={({ pressed }) => [styles.navBtn, { opacity: pressed ? 0.6 : 1 }]}
          hitSlop={12}
        >
          <Text style={[styles.navBtnText, { color: theme.colors.text }]}>›</Text>
        </Pressable>
      </View>

      <View style={[styles.weekHeaderRow, { width: contentWidth, gap }]}>
        {WEEKDAYS.map((d) => (
          <Text
            key={d}
            style={[
              styles.weekHeaderCell,
              { width: cellWidth, color: theme.colors.text },
            ]}
          >
            {d}
          </Text>
        ))}
      </View>

      {rows.map((week, wi) => (
        <View key={wi} style={[styles.weekRow, { width: contentWidth, gap }]}>
          {week.map((date, di) => (
            <View key={di} style={{ width: cellWidth }}>
              {date ? (
                <DayCell date={date} today={today} cellWidth={cellWidth} />
              ) : (
                <View style={{ height: CELL_MIN_HEIGHT }} />
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const CELL_MIN_HEIGHT = 88;

function DayCell({
  date,
  today,
  cellWidth,
}: {
  date: Date;
  today: Date;
  cellWidth: number;
}) {
  const scheme = useColorScheme();
  const appearance = getLiturgicalAppearanceForLocalDate(date);
  const isToday = isSameLocalDay(date, today);
  const isDark = scheme === 'dark';
  const defaultBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.cellWrap,
        {
          width: cellWidth,
          minHeight: CELL_MIN_HEIGHT,
          opacity: pressed ? 0.92 : 1,
          borderWidth: isToday ? 2 : StyleSheet.hairlineWidth,
          borderColor: isToday ? colors.accentGold : defaultBorder,
        },
      ]}
    >
      <LinearGradient
        colors={appearance.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={[styles.dayNum, { color: appearance.foreground }]}>{date.getDate()}</Text>
        <Text
          style={[styles.dayLabel, { color: appearance.foreground }]}
          numberOfLines={2}
        >
          {appearance.label}
        </Text>
        <CalendarKindBadge kind="julian" variant="compact" />
        <Text
          style={[styles.daySub, { color: appearance.foreground }]}
          numberOfLines={2}
        >
          {appearance.subtitle}
        </Text>
        <CalendarKindBadge kind="gregorian" variant="compact" />
        <Text
          style={[styles.daySubGregorian, { color: appearance.foreground }]}
          numberOfLines={2}
        >
          {appearance.gregorianSubtitle}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  navBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  navBtnText: {
    fontSize: 28,
    fontWeight: '300',
  },
  weekHeaderRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekHeaderCell: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.65,
    letterSpacing: 0.3,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  cellWrap: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 6,
    justifyContent: 'flex-start',
  },
  dayNum: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  dayLabel: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 11,
    opacity: 0.95,
  },
  daySub: {
    marginTop: 2,
    fontSize: 8,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 10,
  },
  daySubGregorian: {
    marginTop: 1,
    fontSize: 6,
    textAlign: 'center',
    opacity: 0.72,
  },
});
