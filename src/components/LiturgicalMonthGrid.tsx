import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import {
  getCalendarCellStyle,
  isCalendarFastingAppearance,
} from '../lib/calendar/calendarCellStyle';
import type { PrimaryCalendar } from '../lib/calendar/dateDisplay';
import { feastRankAccessibilityLabel } from '../i18n/feastRank';
import { intlLocaleForLanguage } from '../i18n/locale';
import { useAppTranslation } from '../i18n/useAppTranslation';
import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import type { FeastRankDisplay } from '../lib/liturgical/typikonSymbols';
import { typikonIconColor } from '../lib/liturgical/typikonSymbols';
import { HoverAccessible } from './HoverAccessible';
import { colors } from '../theme/tokens';

const WEEKDAY_KEYS = [
  'weekdays.sun',
  'weekdays.mon',
  'weekdays.tue',
  'weekdays.wed',
  'weekdays.thu',
  'weekdays.fri',
  'weekdays.sat',
] as const;

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
  t: (path: string) => string,
  lang: import('../i18n/types').UiLanguage,
  intlLocale: string,
): string {
  const rankLabel =
    feastRank && showTypikon ? feastRankAccessibilityLabel(feastRank, lang) : null;
  return [
    new Intl.DateTimeFormat(intlLocale, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }).format(date),
    isToday ? t('calendarHover.today') : null,
    dayInfo.dayTitle,
    dayInfo.feasts.length ? dayInfo.feasts.join(' · ') : null,
    dayInfo.saints.length ? dayInfo.saints.join(' · ') : null,
    rankLabel,
    t('calendarHover.clickToOpen'),
  ]
    .filter(Boolean)
    .join(' · ');
}

type Props = {
  visibleMonth: Date;
  onChangeMonth: (delta: -1 | 1) => void;
  onGoToThisMonth?: () => void;
  canGoToThisMonth?: boolean;
  onDayPress?: (date: Date) => void;
  liturgicalCalendar: PrimaryCalendar;
};

export function LiturgicalMonthGrid({
  visibleMonth,
  onChangeMonth,
  onGoToThisMonth,
  canGoToThisMonth = false,
  onDayPress,
  liturgicalCalendar,
}: Props) {
  const theme = useTheme();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { t, lang } = useAppTranslation();
  const intlLocale = intlLocaleForLanguage(lang);
  const { width } = useWindowDimensions();
  const today = useMemo(() => new Date(), []);
  const rows = useMemo(() => buildMonthCells(visibleMonth), [visibleMonth]);
  const { dayInfoForDate, feastRankForDate, showTypikonForDate, loading } = useOrthocalMonth(
    visibleMonth,
    liturgicalCalendar,
  );

  const title = new Intl.DateTimeFormat(intlLocale, {
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

      {canGoToThisMonth && onGoToThisMonth ? (
        <Pressable
          style={({ pressed }) => [
            styles.thisMonthBtn,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(30,26,22,0.08)',
              opacity: pressed ? 0.85 : 1,
            },
          ]}
          onPress={onGoToThisMonth}
          accessibilityRole="button"
          accessibilityLabel={t('calendar.goToThisMonth')}
        >
          <Text style={[styles.thisMonthBtnText, { color: theme.colors.text }]}>
            {t('calendar.goToThisMonth')}
          </Text>
        </Pressable>
      ) : null}

      <View style={styles.gridArea}>
        <View style={[styles.weekHeaderRow, { width: contentWidth, gap }]}>
          {WEEKDAY_KEYS.map((key) => (
            <Text
              key={key}
              style={[
                styles.weekHeaderCell,
                { width: cellWidth, color: theme.colors.text },
              ]}
            >
              {t(key)}
            </Text>
          ))}
        </View>

        <View style={loading ? styles.gridLoading : null}>
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

        {loading ? (
          <View
            style={[
              styles.loadingOverlay,
              {
                backgroundColor: isDark ? 'rgba(18,16,14,0.72)' : 'rgba(232,227,216,0.82)',
              },
            ]}
            accessibilityLiveRegion="polite"
            accessibilityLabel={t('calendar.loading')}
          >
            <ActivityIndicator size="small" color={colors.accentWine} />
            <Text style={[styles.loadingText, { color: isDark ? colors.darkInk : colors.ink }]}>
              {t('calendar.loading')}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

/** Fixed height so every day in a week row aligns on phone. */
const CELL_HEIGHT = 120;
const MAX_CELL_FEASTS = 2;
const MAX_CELL_SAINTS = 3;
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
  const { t, lang } = useAppTranslation();
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
  const hasGreatFridayBorder = dayInfo.isGreatFridayBorder;
  const isDark = scheme === 'dark';
  const defaultBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
  const borderWidth =
    hasFeastBorder || hasGreatFridayBorder ? 3 : isToday ? 2 : StyleSheet.hairlineWidth;
  const borderColor = hasGreatFridayBorder
    ? isDark
      ? colors.greatFridayBorderDark
      : colors.greatFridayBorder
    : hasFeastBorder
      ? colors.feastBorder
      : isToday
        ? colors.accentGold
        : defaultBorder;
  const titleColor = dayInfo.isFeastTitleRed ? colors.feastBorder : cellStyle.foreground;
  const subColor = dayInfo.isFeastTitleRed ? colors.feastBorder : cellStyle.foreground;
  const dayNumColor = dayInfo.isFeastCell ? colors.feastBorder : cellStyle.foreground;
  const typikonOnMutedCell = isCalendarFastingAppearance(dayInfo.appearanceKey);
  const typikonColor = feastRank
    ? typikonIconColor(feastRank, typikonOnMutedCell ? 'muted' : 'light')
    : cellStyle.foreground;
  const hoverLabel = calendarDayHoverLabel(
    date,
    dayInfo,
    feastRank,
    showTypikon,
    isToday,
    t,
    lang,
    intlLocaleForLanguage(lang),
  );
  const hoverBorderColor =
    isWeb && hovered
      ? hasFeastBorder
        ? isDark
          ? colors.feastHoverBorderDark
          : colors.feastHoverBorder
        : colors.accentGold
      : borderColor;

  return (
    <Pressable
      onPress={() => onPress?.(date)}
      onHoverIn={isWeb ? () => setHovered(true) : undefined}
      onHoverOut={isWeb ? () => setHovered(false) : undefined}
      {...hoverAccessibilityProps(hoverLabel, {
        hint: t('a11y.openDay'),
        role: 'button',
      })}
      style={({ pressed }) => [
        styles.cellWrap,
        isWeb ? styles.cellWrapWeb : null,
        {
          opacity: pressed ? 0.92 : 1,
          backgroundColor: cellStyle.backgroundColor,
          borderWidth,
          borderColor: hoverBorderColor,
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
            label={feastRankAccessibilityLabel(feastRank, lang)}
            hint={t('calendarHover.typikonRankHint')}
            style={styles.typikonCorner}
          >
            <TypikonGlyphIcon glyph={feastRank.glyph} size={typikonSize} color={typikonColor} />
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
        <Text style={[styles.dayLabel, { color: titleColor }]} numberOfLines={2}>
          {dayInfo.dayTitle}
        </Text>
        {dayInfo.feasts.length > 0 ? (
          <View style={styles.commList}>
            {dayInfo.feasts.slice(0, MAX_CELL_FEASTS).map((name, index) => (
              <View key={`f-${index}-${name}`} style={styles.commRow}>
                <View
                  style={[styles.feastBullet, { backgroundColor: titleColor }]}
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                />
                <Text
                  style={[styles.dayFeast, { color: titleColor }]}
                  numberOfLines={1}
                >
                  {name}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
        {dayInfo.saints.length > 0 ? (
          <View style={styles.commList}>
            {dayInfo.saints.slice(0, MAX_CELL_SAINTS).map((name, index) => (
              <View key={`s-${index}-${name}`} style={styles.commRow}>
                <View
                  style={[styles.saintBullet, { backgroundColor: subColor }]}
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                />
                <Text
                  style={[styles.daySaint, { color: subColor }]}
                  numberOfLines={1}
                >
                  {name}
                </Text>
              </View>
            ))}
          </View>
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
    marginBottom: 8,
  },
  thisMonthBtn: {
    alignSelf: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  thisMonthBtnText: {
    fontSize: 13,
    fontWeight: '600',
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
  gridArea: {
    position: 'relative',
    minHeight: 120,
  },
  gridLoading: {
    opacity: 0.45,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
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
  cellWrapWeb: {
    cursor: 'pointer',
  },
  cellHoveredLight: {
    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.14)',
  },
  cellHoveredDark: {
    boxShadow: '0 3px 12px rgba(0, 0, 0, 0.45)',
  },
  hoverOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CELL_BORDER_RADIUS,
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
  commList: {
    marginTop: 2,
    alignSelf: 'stretch',
    gap: 1,
  },
  commRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    paddingRight: 1,
    gap: 4,
  },
  feastBullet: {
    width: 3,
    height: 3,
    borderRadius: 2,
    marginTop: 3,
    opacity: 0.9,
    flexShrink: 0,
  },
  saintBullet: {
    width: 3,
    height: 3,
    borderRadius: 2,
    marginTop: 3,
    opacity: 0.75,
    flexShrink: 0,
  },
  dayFeast: {
    flex: 1,
    fontSize: 7.5,
    fontWeight: '700',
    textAlign: 'left',
    lineHeight: 10,
    letterSpacing: 0.1,
  },
  daySaint: {
    flex: 1,
    fontSize: 7.5,
    fontWeight: '500',
    textAlign: 'left',
    lineHeight: 10,
    letterSpacing: 0.15,
    opacity: 0.95,
  },
});
