import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/tokens';

const LEGEND = [
  { label: 'Non-fasting', swatch: '#ffffff', border: true },
  { label: 'Fasting', swatch: '#c4c1b8', border: false },
  { label: 'Feast', swatch: '#f2a0ad', feastOutline: true },
  { label: 'Today', swatch: '#ffffff', todayRing: true },
] as const;

type Props = {
  textColor: string;
};

export function CalendarColorLegend({ textColor }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
      {LEGEND.map((item) => (
        <View key={item.label} style={styles.item}>
          <View
            style={[
              styles.swatch,
              { backgroundColor: item.swatch },
              'border' in item && item.border ? styles.swatchBorder : null,
              'feastOutline' in item && item.feastOutline ? styles.swatchFeastOutline : null,
              'todayRing' in item && item.todayRing ? styles.swatchTodayRing : null,
            ]}
          />
          <Text style={[styles.label, { color: textColor }]}>{item.label}</Text>
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
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    rowGap: 8,
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
});
