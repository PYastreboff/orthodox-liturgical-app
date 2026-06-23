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
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { TypikonGlyphIcon } from './TypikonGlyphIcon';
import { CalendarFastingFoodIcon, calendarFastingFoodIconColor } from './CalendarFastingFoodIcon';
import { CALENDAR_FASTING_ICON_GAP, CALENDAR_FASTING_ICON_SIZE } from './fastingAllowanceIcons';
import { usePhoneLayout } from '../hooks/usePhoneLayout';
import { calendarFastingIconLabel } from '../i18n/fastingLabels';
import { useOrthocalMonth, orthocalMonthLoadingStats } from '../hooks/useOrthocalMonth';
import { toDayIso } from '../lib/calendar/localDate';
import type { CalendarFastingFoodIcons } from '../i18n/fastingLabels';
import {
  calendarCellCommemorations,
  CALENDAR_CELL_MAX_COMMEMORATIONS,
  type CalendarDayInfo,
} from '../lib/liturgical/calendarDayInfo';
import {
  CALENDAR_CELL_WHITE,
  calendarCellHoverBackground,
  getCalendarCellStyle,
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
const CALENDAR_RED_TYPIKON_GLYPHS = new Set(['doxology', 'polyeleos', 'vigil', 'great_feast']);

function calendarTypikonColor(
  feastRank: FeastRankDisplay,
  surface: 'light' | 'muted' = 'light',
): string {
  if (CALENDAR_RED_TYPIKON_GLYPHS.has(feastRank.glyph)) return colors.feastBorder;
  return typikonIconColor(feastRank, surface);
}

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

function isAgendaDay(info: CalendarDayInfo, phoneLayout: boolean): boolean {
  if (
    info.feasts.length > 0 ||
    info.saints.length > 0 ||
    info.isFeastCell ||
    info.feastRank !== null
  ) {
    return true;
  }
  if (!phoneLayout) return false;
  if (info.isFastDay) return true;
  const icons = info.fastingFoodIcons;
  return icons.noEating || icons.noMeat || icons.fish || icons.wine || icons.oil;
}

function CalendarFastingIconsRow({
  icons,
  isFastDay,
  isDark,
  textColor,
  mutedColor,
}: {
  icons: CalendarFastingFoodIcons;
  isFastDay: boolean;
  isDark: boolean;
  textColor: string;
  mutedColor: string;
}) {
  const { t } = useAppTranslation();
  const showIcons =
    icons.noEating || icons.noMeat || icons.fish || icons.wine || icons.oil;
  if (!isFastDay) return null;

  const iconColor = (kind: 'fish' | 'wine' | 'oil' | 'noMeat' | 'noEating') =>
    calendarFastingFoodIconColor(kind, isDark && kind === 'noEating', textColor);

  return (
    <View style={styles.agendaFastingRow}>
      <Text style={[styles.agendaFastLabel, { color: mutedColor }]}>{t('fasting.summaryFast')}</Text>
      {showIcons ? (
        <>
          <Text style={[styles.agendaFastDash, { color: mutedColor }]} accessibilityElementsHidden>
            —
          </Text>
          <View style={styles.agendaFastingIcons}>
            {icons.noEating ? (
              <CalendarFastingFoodIcon kind="noEating" size={CALENDAR_FASTING_ICON_SIZE} color={iconColor('noEating')} />
            ) : null}
            {!icons.noEating && icons.noMeat ? (
              <CalendarFastingFoodIcon kind="noMeat" size={CALENDAR_FASTING_ICON_SIZE} color={iconColor('noMeat')} />
            ) : null}
            {!icons.noEating && !icons.noMeat && icons.fish ? (
              <CalendarFastingFoodIcon kind="fish" size={CALENDAR_FASTING_ICON_SIZE} color={iconColor('fish')} />
            ) : null}
            {!icons.noEating && !icons.noMeat && icons.wine ? (
              <CalendarFastingFoodIcon kind="wine" size={CALENDAR_FASTING_ICON_SIZE} color={iconColor('wine')} />
            ) : null}
            {!icons.noEating && !icons.noMeat && icons.oil ? (
              <CalendarFastingFoodIcon kind="oil" size={CALENDAR_FASTING_ICON_SIZE} color={iconColor('oil')} />
            ) : null}
          </View>
        </>
      ) : null}
    </View>
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
  t: (path: string, params?: Record<string, string | number>) => string,
  lang: import('../i18n/types').UiLanguage,
  intlLocale: string,
  orthocalPending = false,
): string {
  const rankLabel =
    feastRank && showTypikon ? feastRankAccessibilityLabel(feastRank, lang) : null;
  const fastingLabels = [
    dayInfo.fastingFoodIcons.noMeat ? t('fasting.levelMeatFast') : null,
    dayInfo.fastingFoodIcons.noEating ? t('fasting.levelNoEating') : null,
    dayInfo.fastingFoodIcons.fish ? calendarFastingIconLabel('fish', lang) : null,
    dayInfo.fastingFoodIcons.wine ? calendarFastingIconLabel('wine', lang) : null,
    dayInfo.fastingFoodIcons.oil ? calendarFastingIconLabel('oil', lang) : null,
  ].filter(Boolean);
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
    fastingLabels.length ? fastingLabels.join(', ') : null,
    orthocalPending ? t('calendar.dayLoading') : null,
    t('calendarHover.clickToOpen'),
  ]
    .filter(Boolean)
    .join(' · ');
}

function monthNavButtonElevation(isDark: boolean) {
  if (isDark) {
    return Platform.OS === 'web'
      ? ({ boxShadow: 'none' } as const)
      : { elevation: 0, shadowOpacity: 0 };
  }
  return Platform.OS === 'web'
    ? ({ boxShadow: '0 1px 3px rgba(30,26,22,0.08)' } as const)
    : {
        shadowColor: colors.ink,
        shadowOpacity: 0.08,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
      };
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
  const { dayByIso, dayInfoForDate, feastRankForDate, showTypikonForDate, loading } = useOrthocalMonth(
    visibleMonth,
    liturgicalCalendar,
  );
  const loadingBorderColor = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(30,26,22,0.32)';
  const mutedColor = isDark ? '#a39e98' : colors.muted;

  const title = new Intl.DateTimeFormat(intlLocale, {
    month: 'long',
    year: 'numeric',
  }).format(visibleMonth);

  const isCompact = width < CALENDAR_COMPACT_BREAKPOINT;
  const phoneLayout = usePhoneLayout();
  const cellTypography = resolveCalendarCellTypography(width, isCompact);
  const horizontalPad = isCompact ? 8 : 12;
  const gap = isCompact ? 3 : 5;
  const contentWidth = width - horizontalPad * 2;
  const cellWidth = (contentWidth - gap * 6) / 7;
  const cellHeight = cellTypography.cellHeight;
  const typikonSize = isCompact
    ? 12
    : width >= CALENDAR_FULL_WEEKDAY_MIN_WIDTH
      ? 22
      : width < 430
        ? 14
        : 20;
  const useFullWeekdayNames = !isCompact && width >= CALENDAR_FULL_WEEKDAY_MIN_WIDTH;
  const monthDates = useMemo(
    () => rows.flat().filter((d): d is Date => d !== null),
    [rows],
  );
  const loadingStats = useMemo(
    () => orthocalMonthLoadingStats(monthDates, dayByIso),
    [monthDates, dayByIso],
  );
  const monthNavButtonColors = useMemo(
    () => ({
      backgroundColor: isDark ? colors.darkSurface : colors.card,
      borderColor: theme.colors.border,
    }),
    [isDark, theme.colors.border],
  );
  const monthNavButtonShadow = useMemo(() => monthNavButtonElevation(isDark), [isDark]);

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
            monthNavButtonShadow,
            isCompact ? styles.navBtnCompact : null,
            monthNavButtonColors,
            { opacity: pressed ? 0.86 : 1 },
          ]}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t('today.prevDay')}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={isCompact ? 30 : 28}
            color={theme.colors.text}
            style={styles.navBtnIcon}
          />
        </Pressable>
        <View style={styles.monthTitleWrap}>
          <Text style={[styles.monthTitle, isCompact ? styles.monthTitleCompact : null, { color: theme.colors.text }]}>
            {title}
          </Text>
          {loading ? (
            <View style={styles.monthLoadingWrap}>
              <ActivityIndicator
                size="small"
                color={isDark ? colors.tabActiveDark : colors.accentWine}
                accessibilityLabel={t('calendar.loading')}
              />
              {loadingStats.pendingCount > 0 ? (
                <Text style={[styles.monthLoadingText, { color: mutedColor }]}>
                  {t('calendar.loadingProgress', {
                    loaded: loadingStats.loadedCount,
                    total: loadingStats.totalCount,
                  })}
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>
        <Pressable
          onPress={() => onChangeMonth(1)}
          style={({ pressed }) => [
            styles.navBtn,
            monthNavButtonShadow,
            isCompact ? styles.navBtnCompact : null,
            monthNavButtonColors,
            { opacity: pressed ? 0.86 : 1 },
          ]}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t('today.nextDay')}
        >
          <MaterialCommunityIcons
            name="chevron-right"
            size={isCompact ? 30 : 28}
            color={theme.colors.text}
            style={styles.navBtnIcon}
          />
        </Pressable>
      </View>

      {canGoToThisMonth && onGoToThisMonth ? (
        <Pressable
          style={({ pressed }) => [
            styles.thisMonthBtn,
            monthNavButtonColors,
            { opacity: pressed ? 0.85 : 1 },
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
                isCompact ? styles.weekHeaderCellCompact : null,
                !isCompact && !useFullWeekdayNames
                  ? { fontSize: cellTypography.weekHeaderSize }
                  : null,
                useFullWeekdayNames ? styles.weekHeaderCellFull : null,
                useFullWeekdayNames ? { fontSize: cellTypography.weekHeaderSize } : null,
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

        {loading && loadingStats.pendingCount > 0 ? (
          <View style={[styles.loadingKeyRow, { width: contentWidth }]}>
            <View
              style={[
                styles.loadingSwatch,
                { borderColor: loadingBorderColor, backgroundColor: CALENDAR_CELL_WHITE },
              ]}
            />
            <Text style={[styles.loadingKeyText, { color: mutedColor }]} numberOfLines={2}>
              {t('calendar.loadingHint')}
            </Text>
          </View>
        ) : null}

        <View>
          {rows.map((week, wi) => (
            <View key={wi} style={[styles.weekRow, { width: contentWidth, gap }]}>
              {week.map((date, di) => (
                <View
                  key={date ? toDayIso(date) : `empty-${wi}-${di}`}
                  style={[styles.cellSlot, { width: cellWidth, minHeight: cellHeight }]}
                >
                  {date ? (
                    <DayCell
                      date={date}
                      today={today}
                      typikonSize={typikonSize}
                      compact={isCompact}
                      phoneLayout={phoneLayout}
                      typography={cellTypography}
                      onPress={onDayPress}
                      dayInfo={dayInfoForDate(date)}
                      showTypikonForDate={showTypikonForDate}
                      orthocalPending={loading && !dayInfoForDate(date).orthocalLoaded}
                      loadingBorderColor={loadingBorderColor}
                    />
                  ) : null}
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>

      {(isCompact || phoneLayout) && onDayPress ? (
        <CalendarMonthAgenda
          dates={monthDates}
          today={today}
          dayInfoForDate={dayInfoForDate}
          showTypikonForDate={showTypikonForDate}
          onDayPress={onDayPress}
          phoneLayout={phoneLayout}
          monthLoading={loading}
          loadingBorderColor={loadingBorderColor}
          intlLocale={intlLocale}
          textColor={theme.colors.text}
          mutedColor={isDark ? '#a39e98' : colors.muted}
          cardBg={isDark ? colors.darkSurface : colors.card}
          borderColor={theme.colors.border}
          isDark={isDark}
        />
      ) : null}
    </View>
  );
}

/** Fixed height so every day in a week row aligns (compact uses CELL_HEIGHT_COMPACT). */
const CELL_HEIGHT_COMPACT = 52;
const CELL_BORDER_RADIUS = 10;

type CalendarCellTypography = {
  cellHeight: number;
  dayNumSize: number;
  dayLabelSize: number;
  dayLabelLineHeight: number;
  commFontSize: number;
  commLineHeight: number;
  commMarkerSize: number;
  commMoreSize: number;
  commRowGap: number;
  weekHeaderSize: number;
};

function resolveCalendarCellTypography(width: number, isCompact: boolean): CalendarCellTypography {
  if (isCompact) {
    return {
      cellHeight: CELL_HEIGHT_COMPACT,
      dayNumSize: 15,
      dayLabelSize: 7,
      dayLabelLineHeight: 9,
      commFontSize: 6.5,
      commLineHeight: 9.5,
      commMarkerSize: 8,
      commMoreSize: 6.5,
      commRowGap: 1,
      weekHeaderSize: 10,
    };
  }
  if (width >= CALENDAR_FULL_WEEKDAY_MIN_WIDTH) {
    return {
      cellHeight: 148,
      dayNumSize: 22,
      dayLabelSize: 10,
      dayLabelLineHeight: 13,
      commFontSize: 10,
      commLineHeight: 14,
      commMarkerSize: 11,
      commMoreSize: 9,
      commRowGap: 2,
      weekHeaderSize: 14,
    };
  }
  return {
    cellHeight: 132,
    dayNumSize: 19,
    dayLabelSize: 8.5,
    dayLabelLineHeight: 11,
    commFontSize: 8.5,
    commLineHeight: 12,
    commMarkerSize: 9,
    commMoreSize: 7.5,
    commRowGap: 1,
    weekHeaderSize: 12,
  };
}

function DayCell({
  date,
  today,
  typikonSize,
  compact,
  phoneLayout,
  typography,
  onPress,
  dayInfo,
  showTypikonForDate,
  orthocalPending = false,
  loadingBorderColor,
}: {
  date: Date;
  today: Date;
  typikonSize: number;
  compact: boolean;
  phoneLayout: boolean;
  typography: CalendarCellTypography;
  onPress?: (date: Date) => void;
  dayInfo: CalendarDayInfo;
  showTypikonForDate: (date: Date) => boolean;
  orthocalPending?: boolean;
  loadingBorderColor: string;
}) {
  const { t, lang } = useAppTranslation();
  const scheme = useColorScheme();
  const isWeb = Platform.OS === 'web';
  const [hovered, setHovered] = useState(false);
  const displayInfo = useMemo(
    () => localizeCalendarDayInfo(dayInfo, lang),
    [dayInfo, lang],
  );
  const isSunday = date.getDay() === 0;
  const cellStyle = getCalendarCellStyle(dayInfo.appearanceKey, {
    feastCell: dayInfo.isFeastCell,
    fastingCell: dayInfo.isFastDay,
    meatFastCell: dayInfo.fastingFoodIcons.noMeat,
  });
  const feastRank = dayInfo.feastRank;
  const showTypikon = showTypikonForDate(date);
  const isToday = isSameLocalDay(date, today);
  const hasFeastBorder = dayInfo.isFeastCell;
  const hasGreatFridayBorder = dayInfo.isGreatFridayBorder;
  const isDark = scheme === 'dark';
  const defaultBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
  const resolvedBorderWidth = orthocalPending
    ? 1.5
    : hasFeastBorder || hasGreatFridayBorder
      ? 3
      : isToday
        ? 2
        : StyleSheet.hairlineWidth;
  const resolvedBorderColor = orthocalPending
    ? loadingBorderColor
    : hasGreatFridayBorder
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
  const dayNumColor = isSunday || dayInfo.isFeastCell ? colors.feastBorder : cellStyle.foreground;
  const typikonOnMutedCell = dayInfo.isFastDay && !dayInfo.fastingFoodIcons.noMeat;
  const typikonColor = feastRank
    ? calendarTypikonColor(feastRank, typikonOnMutedCell ? 'muted' : 'light')
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
    orthocalPending,
  );
  const hoverBorderColor =
    isWeb && hovered && !orthocalPending
      ? hasGreatFridayBorder
        ? isDark
          ? colors.greatFridayHoverBorderDark
          : colors.greatFridayHoverBorder
        : hasFeastBorder
          ? isDark
            ? colors.feastHoverBorderDark
            : colors.feastHoverBorder
          : colors.accentGold
      : resolvedBorderColor;
  const cellBackgroundColor = calendarCellHoverBackground(
    cellStyle.backgroundColor,
    isWeb && hovered,
    isDark,
  );

  const { lines: commLines, hiddenCount: hiddenCommCount } = useMemo(
    () =>
      calendarCellCommemorations(
        displayInfo.dayTitle,
        displayInfo.feasts,
        displayInfo.saints,
        CALENDAR_CELL_MAX_COMMEMORATIONS,
      ),
    [displayInfo.dayTitle, displayInfo.feasts, displayInfo.saints],
  );
  const feastCount = displayInfo.feasts.length;
  const saintCount = displayInfo.saints.length;
  const markerCount = feastCount + saintCount;
  const fastingIcons = dayInfo.fastingFoodIcons;
  const fastingIconSize = compact ? 20 : CALENDAR_FASTING_ICON_SIZE;
  const showFastingIconsInCell =
    !phoneLayout &&
    (fastingIcons.noEating ||
      fastingIcons.noMeat ||
      fastingIcons.fish ||
      fastingIcons.wine ||
      fastingIcons.oil);

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
        orthocalPending ? styles.cellWrapPending : null,
        {
          opacity: pressed ? 0.92 : orthocalPending ? 0.82 : 1,
          backgroundColor: cellBackgroundColor,
          borderWidth: resolvedBorderWidth,
          borderColor: hoverBorderColor,
        },
      ]}
    >
      {orthocalPending ? (
        <View
          pointerEvents="none"
          style={styles.cellLoadingCorner}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <ActivityIndicator size="small" color={colors.accentWine} />
        </View>
      ) : null}
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
        {showFastingIconsInCell ? (
          <View
            style={[styles.fastingCorner, compact ? styles.fastingCornerCompact : null]}
          >
            {fastingIcons.noEating ? (
              <CalendarFastingFoodIcon kind="noEating" size={fastingIconSize} />
            ) : null}
            {!fastingIcons.noEating && fastingIcons.noMeat ? (
              <CalendarFastingFoodIcon kind="noMeat" size={fastingIconSize} />
            ) : null}
            {!fastingIcons.noEating && !fastingIcons.noMeat && fastingIcons.fish ? (
              <CalendarFastingFoodIcon kind="fish" size={fastingIconSize} />
            ) : null}
            {!fastingIcons.noEating && !fastingIcons.noMeat && fastingIcons.wine ? (
              <CalendarFastingFoodIcon kind="wine" size={fastingIconSize} />
            ) : null}
            {!fastingIcons.noEating && !fastingIcons.noMeat && fastingIcons.oil ? (
              <CalendarFastingFoodIcon kind="oil" size={fastingIconSize} />
            ) : null}
          </View>
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
              compact ? styles.dayNumCompact : { fontSize: typography.dayNumSize },
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
              style={[
                styles.dayLabel,
                {
                  color: titleColor,
                  fontSize: typography.dayLabelSize,
                  lineHeight: typography.dayLabelLineHeight,
                },
              ]}
            >
              {displayInfo.dayTitle}
            </Text>
            {commLines.length > 0 ? (
              <View style={[styles.commArea, { gap: typography.commRowGap }]}>
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
                        size={typography.commMarkerSize}
                        lineHeight={typography.commLineHeight}
                      />
                      <Text
                        style={[
                          isFeast ? styles.dayFeast : styles.daySaint,
                          {
                            color,
                            fontSize: typography.commFontSize,
                            lineHeight: typography.commLineHeight,
                          },
                        ]}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {line.name}
                      </Text>
                    </View>
                  );
                })}
                {hiddenCommCount > 0 ? (
                  <Text
                    style={[
                      styles.commMore,
                      {
                        color: subColor,
                        fontSize: typography.commMoreSize,
                        lineHeight: typography.commMoreSize + 2,
                      },
                    ]}
                  >
                    +{hiddenCommCount}
                  </Text>
                ) : null}
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
  phoneLayout,
  monthLoading,
  loadingBorderColor,
  intlLocale,
  textColor,
  mutedColor,
  cardBg,
  borderColor,
  isDark,
}: {
  dates: Date[];
  today: Date;
  dayInfoForDate: (date: Date) => CalendarDayInfo;
  showTypikonForDate: (date: Date) => boolean;
  onDayPress: (date: Date) => void;
  phoneLayout: boolean;
  monthLoading: boolean;
  loadingBorderColor: string;
  intlLocale: string;
  textColor: string;
  mutedColor: string;
  cardBg: string;
  borderColor: string;
  isDark: boolean;
}) {
  const { t, lang } = useAppTranslation();
  const agendaDates = dates.filter((date) => isAgendaDay(dayInfoForDate(date), phoneLayout));

  return (
    <View style={styles.agenda}>
      <Text style={[styles.agendaTitle, { color: textColor }]}>{t('calendar.agendaTitle')}</Text>
      <Text style={[styles.agendaHint, { color: mutedColor }]}>{t('calendar.tapHint')}</Text>
      {agendaDates.map((date) => {
        const info = localizeCalendarDayInfo(dayInfoForDate(date), lang);
        const feastRank = info.feastRank;
        const showTypikon = showTypikonForDate(date);
        const isToday = isSameLocalDay(date, today);
        const orthocalPending = monthLoading && !info.orthocalLoaded;
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
                borderColor: orthocalPending ? loadingBorderColor : borderColor,
                borderStyle: orthocalPending ? 'dashed' : 'solid',
                opacity: pressed ? 0.88 : orthocalPending ? 0.86 : 1,
              },
              isToday && !orthocalPending ? styles.agendaRowToday : null,
              isToday && orthocalPending ? styles.agendaRowTodayPending : null,
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
              orthocalPending,
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
              {orthocalPending ? (
                <View style={styles.agendaLoadingRow}>
                  <ActivityIndicator size="small" color={colors.accentWine} />
                  <Text style={[styles.agendaLoadingText, { color: mutedColor }]}>
                    {t('calendar.dayLoading')}
                  </Text>
                </View>
              ) : null}
              <Text
                style={[
                  styles.agendaDayTitle,
                  { color: info.isFeastTitleRed ? colors.feastBorder : textColor },
                ]}
              >
                {info.dayTitle}
              </Text>
              <CalendarFastingIconsRow
                icons={info.fastingFoodIcons}
                isFastDay={info.isFastDay}
                isDark={isDark}
                textColor={textColor}
                mutedColor={mutedColor}
              />
              {lines.slice(0, CALENDAR_CELL_MAX_COMMEMORATIONS).map((line, index) => {
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
              {lines.length > CALENDAR_CELL_MAX_COMMEMORATIONS ? (
                <Text style={[styles.agendaMore, { color: mutedColor }]}>
                  +{lines.length - CALENDAR_CELL_MAX_COMMEMORATIONS}
                </Text>
              ) : null}
            </View>
            {showTypikon && feastRank ? (
              <TypikonGlyphIcon
                glyph={feastRank.glyph}
                size={18}
                color={calendarTypikonColor(feastRank, 'light')}
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
    marginBottom: 10,
  },
  monthNavCompact: {
    marginBottom: 6,
  },
  monthTitleCompact: {
    fontSize: 17,
  },
  navBtnCompact: {
    minWidth: 54,
    minHeight: 54,
  },
  thisMonthBtn: {
    alignSelf: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
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
  monthTitleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  monthLoadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  monthLoadingText: {
    fontSize: 11,
    fontWeight: '600',
    flexShrink: 1,
  },
  loadingKeyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  loadingKeyText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  loadingSwatch: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    flexShrink: 0,
  },
  navBtn: {
    minWidth: 50,
    minHeight: 50,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnIcon: {
    marginLeft: -1,
  },
  gridArea: {
    position: 'relative',
    minHeight: 120,
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
    width: '100%',
    flex: 1,
    alignSelf: 'stretch',
    borderRadius: CELL_BORDER_RADIUS,
    overflow: 'hidden',
  },
  cellWrapWeb: {
    cursor: 'pointer',
    // RN Web: clip hover tint to rounded corners on the same layer as backgroundColor.
    overflow: 'hidden',
    borderRadius: CELL_BORDER_RADIUS,
  },
  cellWrapPending: {
    borderStyle: 'dashed',
  },
  cellLoadingCorner: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    zIndex: 2,
    transform: [{ scale: 0.72 }],
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
  agendaRowTodayPending: {
    borderWidth: 2,
    borderStyle: 'dashed',
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
  agendaLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  agendaLoadingText: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
  },
  agendaDayTitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 2,
    alignSelf: 'stretch',
    ...(Platform.OS === 'web' ? ({ wordBreak: 'break-word' } as const) : null),
  },
  agendaFastingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  agendaFastLabel: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  agendaFastDash: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  agendaFastingIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: CALENDAR_FASTING_ICON_GAP,
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
    overflow: 'hidden',
  },
  commMore: {
    fontSize: 6.5,
    fontWeight: '700',
    lineHeight: 8,
    textAlign: 'center',
    marginTop: 1,
    opacity: 0.85,
  },
  typikonCorner: {
    position: 'absolute',
    top: 2,
    left: 2,
    zIndex: 1,
  },
  fastingCorner: {
    position: 'absolute',
    top: 2,
    right: 2,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: CALENDAR_FASTING_ICON_GAP,
  },
  fastingCornerCompact: {
    top: 1,
    right: 1,
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
    fontWeight: '700',
    textAlign: 'center',
    alignSelf: 'stretch',
    width: '100%',
    ...(Platform.OS === 'web' ? ({ wordBreak: 'break-word' } as const) : null),
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
    fontWeight: '700',
    textAlign: 'left',
    letterSpacing: 0.1,
    ...(Platform.OS === 'web' ? ({ wordBreak: 'break-word' } as const) : null),
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
  },
  daySaint: {
    flex: 1,
    flexBasis: 0,
    flexShrink: 1,
    minWidth: 0,
    fontWeight: '500',
    textAlign: 'left',
    letterSpacing: 0.15,
    opacity: 0.95,
    ...(Platform.OS === 'web' ? ({ wordBreak: 'break-word' } as const) : null),
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
  },
});
