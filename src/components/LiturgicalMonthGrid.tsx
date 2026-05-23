import { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';

import { TypikonGlyphIcon } from './TypikonGlyphIcon';
import { useOrthocalMonth } from '../hooks/useOrthocalMonth';
import type { CalendarDayInfo } from '../lib/liturgical/calendarDayInfo';
import { getCalendarCellStyle } from '../lib/calendar/calendarCellStyle';
import type { PrimaryCalendar } from '../lib/calendar/dateDisplay';
import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import type { FeastRankDisplay } from '../lib/liturgical/typikonSymbols';
import { feastRankAccessibilityLabel } from '../lib/liturgical/typikonSymbols';
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

function calendarDayHoverLabel(
  date: Date,
  dayInfo: CalendarDayInfo,
  feastRank: FeastRankDisplay | null,
  showTypikon: boolean,
  isToday: boolean,
): string {
  return [
    new Intl.DateTimeFormat(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }).format(date),
    isToday ? 'Today' : null,
    dayInfo.dayTitle,
    dayInfo.saintsPreview,
    feastRank && showTypikon ? feastRank.shortName : null,
    'Click to open',
  ]
    .filter(Boolean)
    .join(' · ');
}

type Props = {
  visibleMonth: Date;
  onChangeMonth: (delta: -1 | 1) => void;
  onDayPress?: (date: Date) => void;
  liturgicalCalendar: PrimaryCalendar;
};

export function LiturgicalMonthGrid({
  visibleMonth,
  onChangeMonth,
  onDayPress,
  liturgicalCalendar,
}: Props) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const today = useMemo(() => new Date(), []);
  const rows = useMemo(() => buildMonthCells(visibleMonth), [visibleMonth]);
  const { dayInfoForDate, feastRankForDate, showTypikonForDate } = useOrthocalMonth(
    visibleMonth,
    liturgicalCalendar,
  );

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
                  dayInfo={dayInfoForDate(date)}
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
const CELL_HEIGHT = 108;
const CELL_BORDER_RADIUS = 10;

function DayCell({
  date,
  today,
  typikonSize,
  onPress,
  dayInfo,
  showTypikonForDate,
}: {
  date: Date;
  today: Date;
  typikonSize: number;
  onPress?: (date: Date) => void;
  dayInfo: CalendarDayInfo;
  showTypikonForDate: (date: Date) => boolean;
}) {
  const scheme = useColorScheme();
  const isWeb = Platform.OS === 'web';
  const [hovered, setHovered] = useState(false);
  const cellStyle = getCalendarCellStyle(dayInfo.appearanceKey, {
    feastCell: dayInfo.isFeastCell,
  });
  const feastRank = dayInfo.feastRank;
  const showTypikon = showTypikonForDate(date);
  const isToday = isSameLocalDay(date, today);
  const hasFeastBorder = dayInfo.isFeastCell;
  const isDark = scheme === 'dark';
  const defaultBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
  const borderWidth = hasFeastBorder ? 3 : isToday ? 2 : StyleSheet.hairlineWidth;
  const borderColor = hasFeastBorder
    ? colors.feastBorder
    : isToday
      ? colors.accentGold
      : defaultBorder;
  const titleColor = dayInfo.isFeastTitleRed ? colors.feastBorder : cellStyle.foreground;
  const subColor = dayInfo.isFeastTitleRed ? colors.feastBorder : cellStyle.foreground;
  const dayNumColor = dayInfo.isFeastCell ? colors.feastBorder : cellStyle.foreground;
  const hoverLabel = calendarDayHoverLabel(date, dayInfo, feastRank, showTypikon, isToday);

  return (
    <Pressable
      onPress={() => onPress?.(date)}
      onHoverIn={isWeb ? () => setHovered(true) : undefined}
      onHoverOut={isWeb ? () => setHovered(false) : undefined}
      {...hoverAccessibilityProps(hoverLabel, {
        hint: 'Opens this day on Today',
        role: 'button',
      })}
      style={({ pressed }) => [
        styles.cellWrap,
        isWeb ? styles.cellWrapWeb : null,
        {
          opacity: pressed ? 0.92 : 1,
          backgroundColor: cellStyle.backgroundColor,
          borderWidth,
          borderColor: isWeb && hovered ? colors.accentGold : borderColor,
        },
        isWeb && hovered ? (isDark ? styles.cellHoveredDark : styles.cellHoveredLight) : null,
      ]}
    >
      {isWeb && hovered ? (
        <View
          pointerEvents="none"
          style={[
            styles.hoverOverlay,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' },
          ]}
        />
      ) : null}
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
              { color: dayNumColor },
              isToday ? styles.dayNumToday : null,
            ]}
          >
            {date.getDate()}
          </Text>
        </View>
        <Text style={[styles.dayLabel, { color: titleColor }]} numberOfLines={3}>
          {dayInfo.dayTitle}
        </Text>
        {dayInfo.saintsPreview ? (
          <Text style={[styles.daySaints, { color: subColor }]} numberOfLines={2}>
            {dayInfo.saintsPreview}
          </Text>
        ) : null}
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
    fontSize: 8,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 10,
  },
  daySaints: {
    marginTop: 2,
    fontSize: 7,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 9,
    opacity: 0.92,
  },
});
