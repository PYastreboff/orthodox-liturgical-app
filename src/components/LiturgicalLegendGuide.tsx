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
};

const PILL_DESC_KEYS = {
  strict: 'settings.legendPillDesc.strict',
  wine_oil: 'settings.legendPillDesc.wineOil',
  fish: 'settings.legendPillDesc.fish',
  dairy: 'settings.legendPillDesc.dairy',
  total_abstinence: 'settings.legendPillDesc.totalAbstinence',
  no_fast: 'settings.legendPillDesc.noFast',
} as const;

export function LiturgicalLegendGuide({ textColor, mutedColor }: Props) {
  const { t } = useAppTranslation();
  const isDark = useResolvedColorScheme() === 'dark';
  const phoneLayout = usePhoneLayout();
  const wrapPaddingX = phoneLayout ? SECTION_CARD_PADDING_PHONE : SECTION_CARD_PADDING;
  const hintColor = mutedColor ?? textColor;

  return (
    <View style={[styles.wrap, { paddingHorizontal: wrapPaddingX }]}>
      <View style={styles.legendSection}>
        <Text style={[styles.legendSubsectionTitle, { color: textColor }]}>
          {t('settings.legendPillsTitle')}
        </Text>
        <Text style={[styles.legendSubsectionHint, { color: hintColor }]}>
          {t('settings.legendPillsHint')}
        </Text>
        <View style={styles.pillTableWrap}>
          <View style={styles.pillTable}>
            {FAST_PILL_LEGEND_KINDS.map((kind) => (
              <View key={kind} style={[styles.pillTableRow, phoneLayout ? styles.pillTableRowPhone : null]}>
                <View
                  style={[
                    styles.pillTableLabelCell,
                    phoneLayout ? styles.pillTableLabelCellPhone : null,
                  ]}
                >
                  <FastSummaryPill
                    label={t(FAST_PILL_LEGEND_LABEL_KEY[kind])}
                    kind={kind}
                    textStyle={styles.pillText}
                    style={[styles.pillTablePill, phoneLayout ? styles.pillTablePillPhone : null]}
                  />
                </View>
                <Text style={[styles.pillTableDesc, { color: hintColor }]}>
                  {t(PILL_DESC_KEYS[kind])}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.legendSection}>
        <Text style={[styles.legendSubsectionTitle, { color: textColor }]}>
          {t('calendar.legendTitle')}
        </Text>
        <Text style={[styles.legendSubsectionHint, { color: hintColor }]}>
          {t('calendar.legendFastingHint')}
        </Text>
        <View style={styles.swatchRow}>
          {CALENDAR_CELL_LEGEND.map((item) => (
            <View key={item.key} style={styles.swatchItem}>
              <View
                style={[
                  styles.swatch,
                  { backgroundColor: item.swatch },
                  'border' in item && item.border ? styles.swatchBorder : null,
                  'feastOutline' in item && item.feastOutline ? styles.swatchFeastOutline : null,
                  'todayRing' in item && item.todayRing ? styles.swatchTodayRing : null,
                ]}
              />
              <Text style={[styles.label, { color: textColor }]}>{t(item.key)}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.legendSection}>
        <Text style={[styles.legendSubsectionTitle, { color: textColor }]}>
          {t('calendar.legendIconsTitle')}
        </Text>
        <Text style={[styles.legendSubsectionHint, { color: hintColor }]}>
          {t('calendar.legendIconsHint')}
        </Text>
        <View style={styles.iconRow}>
          {CALENDAR_ICON_LEGEND.map((item) => (
            <View key={item.key} style={styles.iconItem}>
              <CalendarFastingFoodIcon
                kind={item.kind}
                size={CALENDAR_FASTING_ICON_SIZE}
                color={calendarFastingFoodIconColor(item.kind, isDark, textColor)}
              />
              <Text style={[styles.label, { color: textColor }]}>{t(item.key)}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 14,
    alignItems: 'stretch',
    gap: 10,
  },
  legendSection: {
    width: '100%',
    alignItems: 'flex-start',
    gap: 10,
  },
  legendSubsectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'left',
    width: '100%',
  },
  legendSubsectionHint: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.92,
    textAlign: 'left',
    width: '100%',
  },
  pillTableWrap: {
    width: '100%',
    alignItems: 'flex-start',
  },
  pillTable: {
    width: '100%',
    maxWidth: 640,
    gap: 10,
  },
  pillTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    width: '100%',
  },
  pillTableRowPhone: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 6,
  },
  pillTableLabelCell: {
    width: 148,
    flexShrink: 0,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  pillTableLabelCellPhone: {
    width: '100%',
    maxWidth: 220,
  },
  pillTablePill: {
    minWidth: 0,
    width: '100%',
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  pillTablePillPhone: {
    width: 'auto',
    minWidth: 110,
  },
  pillTableDesc: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    minWidth: 0,
  },
  pillText: {
    fontSize: 12,
    lineHeight: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
    marginVertical: 4,
    opacity: 0.65,
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 14,
    rowGap: 8,
    width: '100%',
  },
  swatchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 14,
    rowGap: 8,
    width: '100%',
  },
  iconItem: {
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
});
