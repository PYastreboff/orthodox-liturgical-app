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
  calendarCellHoverBackground,
  getCalendarCellStyle,
  isCalendarFastingAppearance,
} from '../lib/calendar/calendarCellStyle';
import type { PrimaryCalendar } from '../lib/calendar/dateDisplay';
import { feastRankAccessibilityLabel } from '../i18n/feastRank';
import { intlLocaleForLanguage } from '../i18n/locale';
import { localizeCalendarDayInfo } from '../i18n/orthocalContent';
import { useAppTranslation } from '../i18n/useAppTranslation';
import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import type { FeastRankDisplay } from '../lib/liturgical/typikonSymbols';
import { typikonIconColor } from '../lib/liturgical/typikonSymbols';
import { useResolvedColorScheme } from '../theme/useResolvedColorScheme';
import { CommemorationListMarker } from './CommemorationListMarker';
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

/** Match a Sunday for Intl weekday labels (index 0 = Sun … 6 = Sat). */
const WEEKDAY_SUNDAY_ANCHOR = new Date(2024, 0, 7);

const CALENDAR_FULL_WEEKDAY_MIN_WIDTH = 768;
const CALENDAR_COMPACT_BREAKPOINT = 600;

function fullWeekdayLabel(dowIndex: number, intlLocale: string): string {
  const date = new Date(WEEKDAY_SUNDAY_ANCHOR);
  date.setDate(WEEKDAY_SUNDAY_ANCHOR.getDate() + dowIndex);
  return new Intl.DateTimeFormat(intlLocale, { weekday: 'long' }).format(date);
}

function narrowWeekdayLabel(dowIndex: number, intlLocale: string): string {
  const date = new Date(WEEKDAY_SUNDAY_ANCHOR);
  date.setDate(WEEKDAY_SUNDAY_ANCHOR.getDate() + dowIndex);
  return new Intl.DateTimeFormat(intlLocale, { weekday: 'narrow' }).format(date);
}

function isAgendaDay(info: CalendarDayInfo): boolean {
  return (
    info.feasts.length > 0 ||
    info.saints.length > 0 ||
    info.isFeastCell ||
    info.feastRank !== null
  );
}

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
  const isDark = useResolvedColorScheme() === 'dark';
  const { t, lang } = useAppTranslation();
  const intlLocale = intlLocaleForLanguage(lang);
  const { width: windowWidth } = useWindowDimensions();
  const [layoutWidth, setLayoutWidth] = useState(0);
  const width = layoutWidth > 0 ? layoutWidth : windowWidth;
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

  const isCompact = width < CALENDAR_COMPACT_BREAKPOINT;
  const horizontalPad = isCompact ? 8 : 12;
  const gap = isCompact ? 3 : 5;
  const contentWidth = width - horizontalPad * 2;
  const cellWidth = (contentWidth - gap * 6) / 7;
  const cellHeight = isCompact ? CELL_HEIGHT_COMPACT : CELL_HEIGHT;
  const typikonSize = isCompact ? 12 : width < 430 ? 14 : 20;
  const useFullWeekdayNames = !isCompact && width >= CALENDAR_FULL_WEEKDAY_MIN_WIDTH;
  const monthDates = useMemo(
    () => rows.flat().filter((d): d is Date => d !== null),
    [rows],
  );

  return (
    <View
      style={[styles.outer, isCompact ? styles.outerCompact : null]}
      onLayout={(e) => {
        const next = Math.round(e.nativeEvent.layout.width);
        if (next > 0 && next !== layoutWidth) setLayoutWidth(next);
      }}
    >
      <View style={[styles.monthNav, isCompact ? styles.monthNavCompact : null]}>
        <Pressable
          onPress={() => onChangeMonth(-1)}
          style={({ pressed }) => [
            styles.navBtn,
            isCompact ? styles.navBtnCompact : null,
            { opacity: pressed ? 0.6 : 1 },
          ]}
          hitSlop={12}
          accessibilityLabel={t('today.prevDay')}
        >
          <Text style={[styles.navBtnText, isCompact ? styles.navBtnTextCompact : null, { color: theme.colors.text }]}>
            ‹
          </Text>
        </Pressable>
        <Text style={[styles.monthTitle, isCompact ? styles.monthTitleCompact : null, { color: theme.colors.text }]}>
          {title}
        </Text>
        <Pressable
          onPress={() => onChangeMonth(1)}
          style={({ pressed }) => [
            styles.navBtn,
            isCompact ? styles.navBtnCompact : null,
            { opacity: pressed ? 0.6 : 1 },
          ]}
          hitSlop={12}
          accessibilityLabel={t('today.nextDay')}
        >
          <Text style={[styles.navBtnText, isCompact ? styles.navBtnTextCompact : null, { color: theme.colors.text }]}>
            ›
          </Text>
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
          {WEEKDAY_KEYS.map((key, index) => (
            <Text
              key={key}
              style={[
                styles.weekHeaderCell,
                useFullWeekdayNames ? styles.weekHeaderCellFull : null,
                isCompact ? styles.weekHeaderCellCompact : null,
                key === 'weekdays.sun' ? styles.weekHeaderCellSunday : styles.weekHeaderCellMuted,
                {
                  width: cellWidth,
                  color:
                    key === 'weekdays.sun'
                      ? isDark
                        ? colors.feastTextSoftDark
                        : colors.accentWine
                      : theme.colors.text,
                },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit={useFullWeekdayNames}
              minimumFontScale={0.75}
            >
              {useFullWeekdayNames
                ? fullWeekdayLabel(index, intlLocale)
                : isCompact
                  ? narrowWeekdayLabel(index, intlLocale)
                  : t(key)}
            </Text>
          ))}
        </View>

        <View style={loading ? styles.gridLoading : null}>
          {rows.map((week, wi) => (
            <View key={wi} style={[styles.weekRow, { width: contentWidth, gap }]}>
              {week.map((date, di) => (
                <View key={di} style={[styles.cellSlot, { width: cellWidth, height: cellHeight }]}>
                  {date ? (
                    <DayCell
                      date={date}
                      today={today}
                      typikonSize={typikonSize}
                      compact={isCompact}
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

      {isCompact && onDayPress ? (
        <CalendarMonthAgenda
          dates={monthDates}
          today={today}
          dayInfoForDate={dayInfoForDate}
          showTypikonForDate={showTypikonForDate}
          onDayPress={onDayPress}
          intlLocale={intlLocale}
          textColor={theme.colors.text}
          mutedColor={isDark ? '#a39e98' : colors.muted}
          cardBg={isDark ? colors.darkSurface : colors.card}
          borderColor={theme.colors.border}
        />
      ) : null}
    </View>
  );
}

/** Fixed height so every day in a week row aligns. */
const CELL_HEIGHT = 120;
const CELL_HEIGHT_COMPACT = 52;
const CELL_BORDER_RADIUS = 10;
const COMM_FONT_SIZE = 7.5;
const COMM_LINE_HEIGHT = 11;
const COMM_MARKER_SIZE = 10;
const COMM_ROW_GAP = 2;
type CommLine = { kind: 'feast' | 'saint'; name: string };

function titleLinesForCell(commCount: number): number {
  return commCount >= 3 ? 1 : 2;
}

function DayCell({
  date,
  today,
  typikonSize,
  compact,
  onPress,
  dayInfo,
  showTypikonForDate,
}: {
  date: Date;
  today: Date;
  typikonSize: number;
  compact: boolean;
  onPress?: (date: Date) => void;
  dayInfo: CalendarDayInfo;
  showTypikonForDate: (date: Date) => boolean;
}) {
  const { t, lang } = useAppTranslation();
  const scheme = useColorScheme();
  const isWeb = Platform.OS === 'web';
  const [hovered, setHovered] = useState(false);
  const displayInfo = useMemo(
    () => localizeCalendarDayInfo(dayInfo, lang),
    [dayInfo, lang],
  );
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
    displayInfo,
    feastRank,
    showTypikon,
    isToday,
    t,
    lang,
    intlLocaleForLanguage(lang),
  );
  const hoverBorderColor =
    isWeb && hovered
      ? hasGreatFridayBorder
        ? isDark
          ? colors.greatFridayHoverBorderDark
          : colors.greatFridayHoverBorder
        : hasFeastBorder
          ? isDark
            ? colors.feastHoverBorderDark
            : colors.feastHoverBorder
          : colors.accentGold
      : borderColor;
  const cellBackgroundColor = calendarCellHoverBackground(
    cellStyle.backgroundColor,
    isWeb && hovered,
    isDark,
  );

  const commLines: CommLine[] = [
    ...displayInfo.feasts.map((name) => ({ kind: 'feast' as const, name })),
    ...displayInfo.saints.map((name) => ({ kind: 'saint' as const, name })),
  ];
  const dayTitleLines = titleLinesForCell(commLines.length);
  const feastCount = displayInfo.feasts.length;
  const saintCount = displayInfo.saints.length;
  const markerCount = feastCount + saintCount;

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
          backgroundColor: cellBackgroundColor,
          borderWidth,
          borderColor: hoverBorderColor,
        },
      ]}
    >
      <View style={[styles.cellBody, compact ? styles.cellBodyCompact : null]}>
        {showTypikon && feastRank ? (
          <HoverAccessible
            label={feastRankAccessibilityLabel(feastRank, lang)}
            hint={t('calendarHover.typikonRankHint')}
            style={[styles.typikonCorner, compact ? styles.typikonCornerCompact : null]}
          >
            <TypikonGlyphIcon glyph={feastRank.glyph} size={typikonSize} color={typikonColor} />
          </HoverAccessible>
        ) : null}
        <View style={[styles.dayNumWrap, compact ? styles.dayNumWrapCompact : null]}>
          {isToday ? (
            <View
              style={[
                styles.todayRing,
                compact ? styles.todayRingCompact : null,
                { borderColor: colors.accentGold },
              ]}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            />
          ) : null}
          <Text
            style={[
              styles.dayNum,
              compact ? styles.dayNumCompact : null,
              { color: dayNumColor },
              isToday ? styles.dayNumToday : null,
            ]}
          >
            {date.getDate()}
          </Text>
        </View>
        {compact ? (
          markerCount > 0 ? (
            <View style={styles.compactMarkers} accessibilityElementsHidden>
              {feastCount > 0 ? (
                <View style={[styles.compactDot, { backgroundColor: titleColor }]} />
              ) : null}
              {saintCount > 0 ? (
                <View style={[styles.compactDot, styles.compactDotSaint, { backgroundColor: subColor }]} />
              ) : null}
              {markerCount > 2 ? (
                <Text style={[styles.compactMore, { color: subColor }]}>+{markerCount - 2}</Text>
              ) : null}
            </View>
          ) : null
        ) : (
          <>
            <Text
              style={[styles.dayLabel, { color: titleColor }]}
              numberOfLines={dayTitleLines}
            >
              {displayInfo.dayTitle}
            </Text>
            {commLines.length > 0 ? (
              <View style={styles.commArea}>
                {commLines.map((line, index) => {
                  const isFeast = line.kind === 'feast';
                  const color = isFeast ? titleColor : subColor;
                  return (
                    <View
                      key={`${line.kind}-${index}-${line.name}`}
                      style={styles.commRow}
                    >
                      <CommemorationListMarker
                        kind={line.kind}
                        color={color}
                        size={COMM_MARKER_SIZE}
                        lineHeight={COMM_LINE_HEIGHT}
                      />
                      <Text style={[isFeast ? styles.dayFeast : styles.daySaint, { color }]}>
                        {line.name}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : null}
          </>
        )}
      </View>
    </Pressable>
  );
}

function CalendarMonthAgenda({
  dates,
  today,
  dayInfoForDate,
  showTypikonForDate,
  onDayPress,
  intlLocale,
  textColor,
  mutedColor,
  cardBg,
  borderColor,
}: {
  dates: Date[];
  today: Date;
  dayInfoForDate: (date: Date) => CalendarDayInfo;
  showTypikonForDate: (date: Date) => boolean;
  onDayPress: (date: Date) => void;
  intlLocale: string;
  textColor: string;
  mutedColor: string;
  cardBg: string;
  borderColor: string;
}) {
  const { t, lang } = useAppTranslation();
  const agendaDates = dates.filter((date) => isAgendaDay(dayInfoForDate(date)));

  return (
    <View style={styles.agenda}>
      <Text style={[styles.agendaTitle, { color: textColor }]}>{t('calendar.agendaTitle')}</Text>
      <Text style={[styles.agendaHint, { color: mutedColor }]}>{t('calendar.tapHint')}</Text>
      {agendaDates.map((date) => {
        const info = localizeCalendarDayInfo(dayInfoForDate(date), lang);
        const feastRank = info.feastRank;
        const showTypikon = showTypikonForDate(date);
        const isToday = isSameLocalDay(date, today);
        const weekday = new Intl.DateTimeFormat(intlLocale, { weekday: 'short' }).format(date);
        const lines = [
          ...info.feasts.map((name) => ({ kind: 'feast' as const, name })),
          ...info.saints.map((name) => ({ kind: 'saint' as const, name })),
        ];

        return (
          <Pressable
            key={date.toISOString()}
            onPress={() => onDayPress(date)}
            style={({ pressed }) => [
              styles.agendaRow,
              {
                backgroundColor: cardBg,
                borderColor,
                opacity: pressed ? 0.88 : 1,
              },
              isToday ? styles.agendaRowToday : null,
            ]}
            accessibilityRole="button"
            accessibilityLabel={calendarDayHoverLabel(
              date,
              info,
              feastRank,
              showTypikon,
              isToday,
              t,
              lang,
              intlLocale,
            )}
          >
            <View style={styles.agendaDateCol}>
              <Text
                style={[
                  styles.agendaDayNum,
                  { color: info.isFeastTitleRed ? colors.feastBorder : textColor },
                ]}
              >
                {date.getDate()}
              </Text>
              <Text style={[styles.agendaWeekday, { color: mutedColor }]}>{weekday}</Text>
            </View>
            <View style={styles.agendaBody}>
              <Text
                style={[
                  styles.agendaDayTitle,
                  { color: info.isFeastTitleRed ? colors.feastBorder : textColor },
                ]}
                numberOfLines={2}
              >
                {info.dayTitle}
              </Text>
              {lines.slice(0, 4).map((line, index) => {
                const lineColor = line.kind === 'feast' ? colors.feastBorder : mutedColor;
                return (
                  <View key={`${line.kind}-${index}`} style={styles.agendaCommRow}>
                    <CommemorationListMarker
                      kind={line.kind}
                      color={lineColor}
                      size={13}
                      lineHeight={16}
                    />
                    <Text
                      style={[styles.agendaLine, { color: lineColor }]}
                      numberOfLines={1}
                    >
                      {line.name}
                    </Text>
                  </View>
                );
              })}
              {lines.length > 4 ? (
                <Text style={[styles.agendaMore, { color: mutedColor }]}>
                  +{lines.length - 4}
                </Text>
              ) : null}
            </View>
            {showTypikon && feastRank ? (
              <TypikonGlyphIcon
                glyph={feastRank.glyph}
                size={18}
                color={typikonIconColor(feastRank, 'light')}
              />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  outerCompact: {
    paddingHorizontal: 4,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  monthNavCompact: {
    marginBottom: 6,
  },
  monthTitleCompact: {
    fontSize: 17,
  },
  navBtnCompact: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnTextCompact: {
    fontSize: 32,
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
    alignSelf: 'center',
  },
  weekHeaderCell: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  weekHeaderCellMuted: {
    opacity: 0.65,
  },
  weekHeaderCellSunday: {
    opacity: 1,
    fontWeight: '700',
  },
  weekHeaderCellCompact: {
    fontSize: 10,
    letterSpacing: 0,
  },
  weekHeaderCellFull: {
    fontSize: 12,
    letterSpacing: 0.1,
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 5,
    alignSelf: 'center',
  },
  cellSlot: {
    overflow: 'hidden',
    borderRadius: CELL_BORDER_RADIUS,
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
    // RN Web: clip hover tint to rounded corners on the same layer as backgroundColor.
    overflow: 'hidden',
    borderRadius: CELL_BORDER_RADIUS,
  },
  cellBody: {
    flex: 1,
    width: '100%',
    minHeight: 0,
    paddingHorizontal: 4,
    paddingTop: 6,
    paddingBottom: 6,
    justifyContent: 'flex-start',
    position: 'relative',
  },
  cellBodyCompact: {
    paddingTop: 3,
    paddingBottom: 3,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumWrapCompact: {
    marginBottom: 0,
  },
  dayNumCompact: {
    fontSize: 15,
    lineHeight: 17,
  },
  todayRingCompact: {
    top: -2,
    left: -5,
    right: -5,
    bottom: -2,
    borderWidth: 1.5,
  },
  typikonCornerCompact: {
    top: 1,
    left: 1,
  },
  compactMarkers: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    marginTop: 1,
    minHeight: 8,
  },
  compactDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  compactDotSaint: {
    opacity: 0.75,
  },
  compactMore: {
    fontSize: 7,
    fontWeight: '700',
    lineHeight: 8,
  },
  agenda: {
    marginTop: 16,
    gap: 8,
  },
  agendaTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  agendaHint: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  agendaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  agendaRowToday: {
    borderWidth: 2,
    borderColor: colors.accentGold,
  },
  agendaDateCol: {
    width: 36,
    alignItems: 'center',
    flexShrink: 0,
  },
  agendaDayNum: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 20,
  },
  agendaWeekday: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  agendaBody: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  agendaDayTitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 2,
  },
  agendaLine: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  agendaMore: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  commArea: {
    flex: 1,
    minHeight: 0,
    marginTop: 2,
    alignSelf: 'stretch',
    gap: COMM_ROW_GAP,
    overflow: 'hidden',
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
    lineHeight: 11,
  },
  commRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    minWidth: 0,
    paddingRight: 1,
    gap: 3,
  },
  agendaCommRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    minWidth: 0,
  },
  dayFeast: {
    flex: 1,
    flexBasis: 0,
    flexShrink: 1,
    minWidth: 0,
    fontSize: COMM_FONT_SIZE,
    fontWeight: '700',
    textAlign: 'left',
    lineHeight: COMM_LINE_HEIGHT,
    letterSpacing: 0.1,
    ...(Platform.OS === 'web' ? ({ wordBreak: 'break-word' } as const) : null),
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
  },
  daySaint: {
    flex: 1,
    flexBasis: 0,
    flexShrink: 1,
    minWidth: 0,
    fontSize: COMM_FONT_SIZE,
    fontWeight: '500',
    textAlign: 'left',
    lineHeight: COMM_LINE_HEIGHT,
    letterSpacing: 0.15,
    opacity: 0.95,
    ...(Platform.OS === 'web' ? ({ wordBreak: 'break-word' } as const) : null),
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
  },
});
