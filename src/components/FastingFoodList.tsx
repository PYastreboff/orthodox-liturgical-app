import { StyleSheet, Text, View } from 'react-native';

import type { FastingFoodItem } from '../i18n/fastingLabels';
import { FastingFoodIcon } from './FastingFoodIcon';

type Props = {
  heading: string;
  items: FastingFoodItem[];
  textColor: string;
  iconColor: string;
  bodyType: { fontSize: number; lineHeight: number };
};

export function FastingFoodList({ heading, items, textColor, iconColor, bodyType }: Props) {
  if (items.length === 0) return null;
  return (
    <View style={styles.block}>
      <Text style={[styles.heading, bodyType, { color: textColor }]}>{heading}</Text>
      {items.map((item) => (
        <View key={`${heading}-${item.kind}`} style={styles.row} accessibilityLabel={item.label}>
          <FastingFoodIcon kind={item.kind} color={iconColor} />
          <Text style={[styles.label, bodyType, { color: textColor }]}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    marginTop: 8,
    gap: 6,
  },
  heading: {
    fontWeight: '700',
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 2,
  },
  label: {
    flex: 1,
    opacity: 0.92,
  },
});
