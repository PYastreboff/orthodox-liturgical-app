import { StyleSheet, Text, View } from 'react-native';

import { CalendarFastingFoodIcon, calendarFastingFoodIconColor } from './CalendarFastingFoodIcon';
import { CALENDAR_FASTING_ICON_SIZE } from './fastingAllowanceIcons';
import { FastSummaryPill } from './FastSummaryPill';
import { TypikonGlyphIcon } from './TypikonGlyphIcon';
import { usePhoneLayout } from '../hooks/usePhoneLayout';
import { useAppTranslation } from '../i18n/useAppTranslation';
import { usePreferences } from '../state/PreferencesContext';
import {
  FAST_PILL_LEGEND_KINDS,
  FAST_PILL_LEGEND_LABEL_KEY,
} from '../lib/liturgical/fastPillStyle';
import {
  calendarCellLegend,
  CALENDAR_ICON_LEGEND,
  TYPIKON_LEGEND_ENTRIES,
} from '../lib/liturgical/liturgicalLegend';
import { FEAST_RANK_BY_LEVEL, typikonIconColor } from '../lib/liturgical/typikonSymbols';
import { serviceKindTint } from '../lib/liturgical/serviceColor';
import { SECTION_CARD_PADDING, SECTION_CARD_PADDING_PHONE } from '../theme/layout';
import { colors } from '../theme/tokens';
import { useResolvedColorScheme } from '../theme/useResolvedColorScheme';

type Props = {
  textColor: string;
  mutedColor?: string;
  /** Full-page layout (less inset padding than Settings card). */
  pageLayout?: boolean;
};

const PILL_DESC_KEYS = {
  strict: 'settings.legendPillDesc.strict',
  wine_oil: 'settings.legendPillDesc.wineOil',
  fish: 'settings.legendPillDesc.fish',
  dairy: 'settings.legendPillDesc.dairy',
  total_abstinence: 'settings.legendPillDesc.totalAbstinence',
  no_fast: 'settings.legendPillDesc.noFast',
} as const;

export function LiturgicalLegendGuide({ textColor, mutedColor, pageLayout = false }: Props) {
  const { t } = useAppTranslation();
  const { calendarColourMode } = usePreferences();
  const isDark = useResolvedColorScheme() === 'dark';
  const phoneLayout = usePhoneLayout();
  const wrapPaddingX = pageLayout
    ? 0
    : phoneLayout
      ? SECTION_CARD_PADDING_PHONE
      : SECTION_CARD_PADDING;
  const hintColor = mutedColor ?? textColor;
  const legendBorder = isDark ? colors.darkBorder : colors.border;
  const rowBg = isDark ? colors.darkSurface : colors.card;
  const cellLegend = calendarCellLegend(isDark, calendarColourMode);

  return (
    <View
      style={[
        styles.wrap,
        { paddingHorizontal: wrapPaddingX },
        pageLayout ? styles.wrapPage : null,
      ]}
    >
      <View style={styles.legendSection}>
        <Text style={[styles.legendSubsectionTitle, { color: textColor }]}>
          {t('settings.legendPillsTitle')}
        </Text>
        <View style={styles.pillTable}>
          {FAST_PILL_LEGEND_KINDS.map((kind) => (
            <View
              key={kind}
              style={[
                styles.pillRow,
                {
                  backgroundColor: pageLayout ? rowBg : 'transparent',
                  borderColor: pageLayout ? legendBorder : 'transparent',
                  borderWidth: pageLayout ? StyleSheet.hairlineWidth : 0,
                },
                phoneLayout ? styles.pillRowPhone : null,
              ]}
            >
              <View
                style={[
                  styles.pillLabelCell,
                  phoneLayout ? styles.pillLabelCellPhone : null,
                ]}
              >
                <FastSummaryPill
                  label={t(FAST_PILL_LEGEND_LABEL_KEY[kind])}
                  kind={kind}
                  textStyle={styles.pillText}
                  style={[styles.pillTablePill, phoneLayout ? styles.pillTablePillPhone : null]}
                />
              </View>
              <Text style={[styles.pillDesc, { color: hintColor }]}>
                {t(PILL_DESC_KEYS[kind])}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.legendSection}>
        <Text style={[styles.legendSubsectionTitle, { color: textColor }]}>
          {t('settings.legendServicesTitle')}
        </Text>
        <View
          style={[
            styles.symbolCard,
            pageLayout
              ? { backgroundColor: rowBg, borderColor: legendBorder }
              : styles.symbolCardPlain,
          ]}
        >
          {([['vespers', 'services.kind.vespers'], ['liturgy_chrysostom', 'services.kind.liturgyChrysostom'], ['liturgy_basil', 'services.kind.liturgyBasil']] as const).map(
            ([kind, labelKey]) => {
              const tint = serviceKindTint(kind);
              return (
                <View key={kind} style={styles.symbolItem}>
                  <View style={[styles.swatch, { backgroundColor: tint.bg }]} />
                  <Text style={[styles.label, { color: textColor }]}>{t(labelKey)}</Text>
                </View>
              );
            },
          )}
        </View>
      </View>

      <View style={styles.legendSection}>
        <Text style={[styles.legendSubsectionTitle, { color: textColor }]}>
          {t('calendar.legendTitle')}
        </Text>
        <View
          style={[
            styles.symbolCard,
            pageLayout
              ? { backgroundColor: rowBg, borderColor: legendBorder }
              : styles.symbolCardPlain,
          ]}
        >
          {cellLegend.map((item) => (
            <View key={item.key} style={styles.symbolItem}>
              <View
                style={[
                  styles.swatch,
                  { backgroundColor: item.swatch },
                  'border' in item && item.border
                    ? [styles.swatchBorder, { borderColor: legendBorder }]
                    : null,
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
        <View
          style={[
            styles.symbolCard,
            pageLayout
              ? { backgroundColor: rowBg, borderColor: legendBorder }
              : styles.symbolCardPlain,
          ]}
        >
          {CALENDAR_ICON_LEGEND.map((item) => (
            <View key={item.key} style={styles.symbolItem}>
              <CalendarFastingFoodIcon
                kind={item.kind}
                size={CALENDAR_FASTING_ICON_SIZE}
                color={
                  item.kind === 'noEating' && isDark
                    ? '#ffffff'
                    : calendarFastingFoodIconColor(item.kind, isDark, textColor)
                }
              />
              <Text style={[styles.label, { color: textColor }]}>{t(item.key)}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.legendSection}>
        <Text style={[styles.legendSubsectionTitle, { color: textColor }]}>
          {t('settings.legendTypikonTitle')}
        </Text>
        <View
          style={[
            styles.symbolCard,
            pageLayout
              ? { backgroundColor: rowBg, borderColor: legendBorder }
              : styles.symbolCardPlain,
          ]}
        >
          {TYPIKON_LEGEND_ENTRIES.map((entry) => {
            const rank = FEAST_RANK_BY_LEVEL[entry.level];
            return (
              <View key={entry.level} style={styles.symbolItem}>
                <TypikonGlyphIcon
                  glyph={rank.glyph}
                  size={CALENDAR_FASTING_ICON_SIZE}
                  color={typikonIconColor(rank, isDark ? 'dark' : 'light')}
                />
                <Text style={[styles.label, { color: textColor }]}>{t(entry.labelKey)}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 14,
    alignItems: 'stretch',
    gap: 22,
  },
  wrapPage: {
    paddingVertical: 4,
    gap: 20,
  },
  legendSection: {
    width: '100%',
    alignItems: 'flex-start',
    gap: 10,
  },
  legendSubsectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    letterSpacing: 0.1,
    textAlign: 'left',
    width: '100%',
  },
  legendHint: {
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'left',
    width: '100%',
    opacity: 0.85,
  },
  pillTable: {
    width: '100%',
    gap: 8,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    width: '100%',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  pillRowPhone: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },
  pillLabelCell: {
    width: 148,
    flexShrink: 0,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  pillLabelCellPhone: {
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
  pillDesc: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    minWidth: 0,
  },
  pillText: {
    fontSize: 12,
    lineHeight: 16,
  },
  symbolCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 12,
    rowGap: 10,
    width: '100%',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  symbolCardPlain: {
    borderWidth: 0,
    borderRadius: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  symbolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  swatchBorder: {
    borderWidth: StyleSheet.hairlineWidth,
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
    fontSize: 13,
    fontWeight: '500',
  },
});
