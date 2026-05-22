import { useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';

import { CalendarKindBadge } from './CalendarKindBadge';
import { TypikonGlyphIcon } from './TypikonGlyphIcon';
import { useOrthocalMonth } from '../hooks/useOrthocalMonth';
import { getCalendarCellStyle, isMajorFeastAppearance } from '../lib/calendar/calendarCellStyle';
import { getLiturgicalAppearanceForLocalDate } from '../lib/calendar/dayAppearance';
import {
  getDateDisplayFlags,
  orderedDateLines,
  type DateDisplayOptions,
} from '../lib/calendar/dateDisplay';
import { feastRankAccessibilityLabel, type FeastRankDisplay } from '../lib/liturgical/typikonSymbols';
import { HoverAccessible } from './HoverAccessible';
import { colors } from '../theme/tokens';

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
  onDayPress?: (date: Date) => void;
  dateDisplayOptions: DateDisplayOptions;
};

export function LiturgicalMonthGrid({
  visibleMonth,
  onChangeMonth,
  onDayPress,
  dateDisplayOptions,
}: Props) {
  const dateDisplay = useMemo(
    () => getDateDisplayFlags(dateDisplayOptions),
    [dateDisplayOptions.primaryCalendar, dateDisplayOptions.showAlternateCalendar],
  );
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const today = useMemo(() => new Date(), []);
  const rows = useMemo(() => buildMonthCells(visibleMonth), [visibleMonth]);
  const { feastRankForDate, showTypikonForDate } = useOrthocalMonth(visibleMonth);

  const title = new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(visibleMonth);

  const horizontalPad = 12;
  const gap = 5;
  const contentWidth = width - horizontalPad * 2;
  const cellWidth = (contentWidth - gap * 6) / 7;
  const typikonSize = width < 430 ? 14 : 20;

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
            <View key={di} style={[styles.cellSlot, { width: cellWidth, height: CELL_HEIGHT }]}>
              {date ? (
                <DayCell
                  date={date}
                  today={today}
                  typikonSize={typikonSize}
                  onPress={onDayPress}
                  dateDisplay={dateDisplay}
                  feastRankForDate={feastRankForDate}
                  showTypikonForDate={showTypikonForDate}
                />
              ) : null}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

/** Fixed height so every day in a week row aligns on phone. */
const CELL_HEIGHT = 96;
const CELL_BORDER_RADIUS = 10;

function DayCell({
  date,
  today,
  typikonSize,
  onPress,
  dateDisplay,
  feastRankForDate,
  showTypikonForDate,
}: {
  date: Date;
  today: Date;
  typikonSize: number;
  onPress?: (date: Date) => void;
  dateDisplay: ReturnType<typeof getDateDisplayFlags>;
  feastRankForDate: (date: Date) => FeastRankDisplay | null;
  showTypikonForDate: (date: Date) => boolean;
}) {
  const scheme = useColorScheme();
  const appearance = getLiturgicalAppearanceForLocalDate(date);
  const cellStyle = getCalendarCellStyle(appearance.key);
  const feastRank = feastRankForDate(date);
  const showTypikon = showTypikonForDate(date);
  const subtitleLines = orderedDateLines(
    dateDisplay,
    appearance.subtitle,
    appearance.gregorianSubtitle,
  );
  const isToday = isSameLocalDay(date, today);
  const hasFeastBackground = isMajorFeastAppearance(appearance.key);
  const isDark = scheme === 'dark';
  const defaultBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
  const borderWidth = hasFeastBackground ? 3 : isToday ? 2 : StyleSheet.hairlineWidth;
  const borderColor = hasFeastBackground
    ? colors.feastBorder
    : isToday
      ? colors.accentGold
      : defaultBorder;

  return (
    <Pressable
      onPress={() => onPress?.(date)}
      accessibilityRole="button"
      accessibilityLabel={`Open liturgical day for ${[
        isToday ? 'today' : null,
        feastRank && showTypikon ? feastRank.shortName : null,
        date.toLocaleDateString(),
      ]
        .filter(Boolean)
        .join(', ')}`}
      style={({ pressed }) => [
        styles.cellWrap,
        {
          opacity: pressed ? 0.92 : 1,
          backgroundColor: cellStyle.backgroundColor,
          borderWidth,
          borderColor,
        },
      ]}
    >
      <View style={styles.cellBody}>
        {showTypikon && feastRank ? (
          <HoverAccessible
            label={feastRankAccessibilityLabel(feastRank)}
            hint="Typikon service rank for this day"
            style={styles.typikonCorner}
          >
            <TypikonGlyphIcon
              glyph={feastRank.glyph}
              size={typikonSize}
              color={feastRank.tint ?? cellStyle.foreground}
            />
          </HoverAccessible>
        ) : null}
        <View style={styles.dayNumWrap}>
          {isToday ? (
            <View
              style={[styles.todayRing, { borderColor: colors.accentGold }]}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            />
          ) : null}
          <Text
            style={[
              styles.dayNum,
              { color: cellStyle.foreground },
              isToday ? styles.dayNumToday : null,
            ]}
          >
            {date.getDate()}
          </Text>
        </View>
        <Text
          style={[styles.dayLabel, { color: cellStyle.foreground }]}
          numberOfLines={2}
        >
          {appearance.label}
        </Text>
        {subtitleLines.map((line, index) => (
          <View key={line.kind}>
            <CalendarKindBadge kind={line.kind} variant="compact" />
            <Text
              style={[
                index === 0 ? styles.daySub : styles.daySubGregorian,
                { color: cellStyle.foreground },
              ]}
              numberOfLines={2}
            >
              {line.label}
            </Text>
          </View>
        ))}
      </View>
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
    alignItems: 'stretch',
    marginBottom: 5,
  },
  cellSlot: {
    overflow: 'hidden',
  },
  cellWrap: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: CELL_BORDER_RADIUS,
    overflow: 'hidden',
  },
  cellBody: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 4,
    paddingTop: 6,
    paddingBottom: 6,
    justifyContent: 'flex-start',
    position: 'relative',
  },
  typikonCorner: {
    position: 'absolute',
    top: 2,
    left: 2,
    zIndex: 1,
  },
  dayNumWrap: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 1,
  },
  todayRing: {
    position: 'absolute',
    top: -3,
    left: -6,
    right: -6,
    bottom: -3,
    borderRadius: 999,
    borderWidth: 2,
  },
  dayNum: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  dayNumToday: {
    fontWeight: '800',
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
