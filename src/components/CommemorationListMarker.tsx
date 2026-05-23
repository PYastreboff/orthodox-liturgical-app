import { Platform, StyleSheet, Text, View } from 'react-native';

type Kind = 'feast' | 'saint';

type Props = {
  kind: Kind;
  color: string;
  /** Match the adjacent first line height. */
  lineHeight?: number;
  size?: number;
};

/** › prefix for feast / saint lines on the calendar month grid. */
export function CommemorationListMarker({
  kind,
  color,
  lineHeight = 11,
  size = 10,
}: Props) {
  return (
    <View style={[styles.box, { height: lineHeight, minWidth: size + 2 }]}>
      <Text
        style={[
          styles.glyph,
          {
            color,
            fontSize: size,
            lineHeight,
            opacity: kind === 'saint' ? 0.82 : 1,
          },
        ]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        ›
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    flexShrink: 0,
  },
  glyph: {
    fontWeight: '700',
    textAlign: 'center',
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
  },
});
