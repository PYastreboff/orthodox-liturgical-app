import { StyleSheet, Text, View } from 'react-native';

import { useAppTranslation } from '../i18n/useAppTranslation';
import { colors } from '../theme/tokens';

const LEGEND_KEYS = [
  { key: 'calendar.legendNonFasting', swatch: '#ffffff', border: true },
  { key: 'calendar.legendFasting', swatch: '#c4c1b8', border: false },
  { key: 'calendar.legendFeast', swatch: '#f2a0ad', feastOutline: true },
  { key: 'calendar.legendToday', swatch: '#ffffff', todayRing: true },
] as const;

type Props = {
  textColor: string;
  compact?: boolean;
};

export function CalendarColorLegend({ textColor, compact = false }: Props) {
  const { t } = useAppTranslation();

  return (
    <View style={[styles.wrap, compact ? styles.wrapCompact : null]}>
      <View style={[styles.row, compact ? styles.rowCompact : null]}>
        {LEGEND_KEYS.map((item) => (
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  wrapCompact: {
    paddingVertical: 6,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    rowGap: 8,
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
