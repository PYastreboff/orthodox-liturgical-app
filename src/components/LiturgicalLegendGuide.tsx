import { StyleSheet, Text, View } from 'react-native';

import { CalendarFastingFoodIcon, calendarFastingFoodIconColor } from './CalendarFastingFoodIcon';
import { CALENDAR_FASTING_ICON_SIZE } from './fastingAllowanceIcons';
import { FastSummaryPill } from './FastSummaryPill';
import { usePhoneLayout } from '../hooks/usePhoneLayout';
import { useAppTranslation } from '../i18n/useAppTranslation';
import {
  FAST_PILL_LEGEND_KINDS,
  FAST_PILL_LEGEND_LABEL_KEY,
} from '../lib/liturgical/fastPillStyle';
import {
  CALENDAR_CELL_LEGEND,
  CALENDAR_ICON_LEGEND,
} from '../lib/liturgical/liturgicalLegend';
import { SECTION_CARD_PADDING, SECTION_CARD_PADDING_PHONE } from '../theme/layout';
import { colors } from '../theme/tokens';
import { useResolvedColorScheme } from '../theme/useResolvedColorScheme';

type Props = {
  textColor: string;
  mutedColor?: string;
  /** Settings card — horizontal padding matches other settings rows. */
  variant?: 'calendar' | 'settings';
  compact?: boolean;
};

const PILL_DESC_KEYS = {
  strict: 'settings.legendPillDesc.strict',
  wine_oil: 'settings.legendPillDesc.wineOil',
  fish: 'settings.legendPillDesc.fish',
  dairy: 'settings.legendPillDesc.dairy',
  total_abstinence: 'settings.legendPillDesc.totalAbstinence',
  no_fast: 'settings.legendPillDesc.noFast',
} as const;

export function LiturgicalLegendGuide({
  textColor,
  mutedColor,
  variant = 'calendar',
  compact = false,
}: Props) {
  const { t } = useAppTranslation();
  const isDark = useResolvedColorScheme() === 'dark';
  const phoneLayout = usePhoneLayout();
  const wrapPaddingX =
    variant === 'settings'
      ? phoneLayout
        ? SECTION_CARD_PADDING_PHONE
        : SECTION_CARD_PADDING
      : phoneLayout
        ? SECTION_CARD_PADDING_PHONE
        : SECTION_CARD_PADDING;
  const hintColor = mutedColor ?? textColor;

  return (
    <View
      style={[
        styles.wrap,
        { paddingHorizontal: wrapPaddingX },
        variant === 'settings' ? styles.wrapSettings : null,
        compact ? styles.wrapCompact : null,
      ]}
    >
      {variant === 'settings' ? (
        <>
          <Text style={[styles.subsectionTitle, { color: textColor }]}>
            {t('settings.legendPillsTitle')}
          </Text>
          <Text style={[styles.subsectionHint, { color: hintColor }]}>
            {t('settings.legendPillsHint')}
          </Text>
          <View style={styles.pillList}>
            {FAST_PILL_LEGEND_KINDS.map((kind) => (
              <View key={kind} style={[styles.pillRow, phoneLayout ? styles.pillRowPhone : null]}>
                <FastSummaryPill
                  label={t(FAST_PILL_LEGEND_LABEL_KEY[kind])}
                  kind={kind}
                  textStyle={styles.pillText}
                  style={styles.pill}
                />
                <Text style={[styles.pillDesc, { color: hintColor }]}>{t(PILL_DESC_KEYS[kind])}</Text>
              </View>
            ))}
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        </>
      ) : null}

      <Text
        style={[
          variant === 'settings' ? styles.subsectionTitle : styles.title,
          compact ? styles.titleCompact : null,
          { color: textColor },
        ]}
      >
        {t('calendar.legendTitle')}
      </Text>
      <View style={[styles.row, compact ? styles.rowCompact : null]}>
        {CALENDAR_CELL_LEGEND.map((item) => (
          <View key={item.key} style={styles.item}>
            <View
              style={[
                styles.swatch,
                { backgroundColor: item.swatch },
                'border' in item && item.border ? styles.swatchBorder : null,
                'feastOutline' in item && item.feastOutline ? styles.swatchFeastOutline : null,
                'todayRing' in item && item.todayRing ? styles.swatchTodayRing : null,
              ]}
            />
            <Text style={[styles.label, compact ? styles.labelCompact : null, { color: textColor }]}>
              {t(item.key)}
            </Text>
          </View>
        ))}
      </View>
      {variant === 'settings' ? (
        <Text style={[styles.fastingHint, compact ? styles.fastingHintCompact : null, { color: hintColor }]}>
          {t('calendar.legendFastingHint')}
        </Text>
      ) : null}
      <Text style={[styles.iconsTitle, compact ? styles.iconsTitleCompact : null, { color: textColor }]}>
        {t('calendar.legendIconsTitle')}
      </Text>
      <View style={[styles.row, compact ? styles.rowCompact : null]}>
        {CALENDAR_ICON_LEGEND.map((item) => (
          <View key={item.key} style={styles.item}>
            <CalendarFastingFoodIcon
              kind={item.kind}
              size={CALENDAR_FASTING_ICON_SIZE}
              color={calendarFastingFoodIconColor(item.kind, isDark, textColor)}
            />
            <Text style={[styles.label, compact ? styles.labelCompact : null, { color: textColor }]}>
              {t(item.key)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 10,
    alignItems: 'stretch',
    gap: 8,
  },
  wrapCompact: {
    marginBottom: 12,
    alignItems: 'center',
    gap: 8,
  },
  wrapSettings: {
    paddingVertical: 14,
    gap: 10,
  },
  subsectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  subsectionHint: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.92,
  },
  pillList: {
    gap: 12,
    width: '100%',
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  pillRowPhone: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 6,
  },
  pill: {
    minWidth: 108,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  pillText: {
    fontSize: 12,
    lineHeight: 16,
  },
  pillDesc: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
    marginVertical: 4,
    opacity: 0.65,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    alignSelf: 'flex-start',
    width: '100%',
  },
  titleCompact: {
    fontSize: 13,
  },
  fastingHint: {
    fontSize: 12,
    lineHeight: 17,
    opacity: 0.88,
    alignSelf: 'flex-start',
    width: '100%',
  },
  fastingHintCompact: {
    fontSize: 11,
    lineHeight: 15,
  },
  iconsTitle: {
    fontSize: 13,
    fontWeight: '600',
    alignSelf: 'flex-start',
    width: '100%',
    marginTop: 2,
  },
  iconsTitleCompact: {
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 14,
    rowGap: 8,
    width: '100%',
  },
  rowCompact: {
    gap: 10,
    rowGap: 6,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  swatchBorder: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  swatchFeastOutline: {
    borderWidth: 2,
    borderColor: colors.feastBorder,
  },
  swatchTodayRing: {
    borderWidth: 2,
    borderColor: colors.accentGold,
    borderRadius: 999,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
  labelCompact: {
    fontSize: 11,
  },
});
