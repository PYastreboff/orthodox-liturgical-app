import { StyleSheet, Text, type TextStyle, type ViewStyle } from 'react-native';

import type { FastSummaryKind } from '../i18n/fastingLabels';
import { fastPillStyleForKind } from '../lib/liturgical/fastPillStyle';

type Props = {
  label: string;
  kind: FastSummaryKind;
  textStyle?: TextStyle;
  style?: ViewStyle;
};

export function FastSummaryPill({ label, kind, textStyle, style }: Props) {
  const pill = fastPillStyleForKind(kind);

  return (
    <Text
      style={[
        styles.pill,
        { backgroundColor: pill.backgroundColor, color: pill.color },
        textStyle,
        style,
      ]}
    >
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  pill: {
    fontWeight: '700',
    borderRadius: 999,
    overflow: 'hidden',
    alignSelf: 'center',
    minWidth: 76,
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
});
