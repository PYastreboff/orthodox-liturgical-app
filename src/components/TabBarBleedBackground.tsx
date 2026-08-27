import { StyleSheet, View } from 'react-native';

type Props = {
  color: string;
  /** Extra fill below the tab icons (safe-area / seam pad). */
  bleedPx: number;
};

/**
 * Solid backdrop for the tab bar. Fills the bar box so padding / safe-area
 * regions never show the scene through a hairline gap.
 */
export function TabBarBleedBackground({ color, bleedPx }: Props) {
  return (
    <View
      style={[
        styles.fill,
        {
          backgroundColor: color,
          // Keep a little paint below the layout box when ancestors allow it.
          bottom: -Math.max(bleedPx, 2),
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
