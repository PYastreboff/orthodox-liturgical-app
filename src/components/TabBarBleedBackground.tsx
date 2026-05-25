import { StyleSheet, View } from 'react-native';

type Props = {
  color: string;
  /** Extra fill below the tab bar to hide sub-pixel seams (iOS Safari / phone). */
  bleedPx: number;
};

/** Solid tab bar backdrop that extends slightly past the layout box. */
export function TabBarBleedBackground({ color, bleedPx }: Props) {
  return (
    <View
      style={[
        styles.fill,
        {
          backgroundColor: color,
          bottom: bleedPx > 0 ? -bleedPx : 0,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFillObject,
    top: 0,
    left: 0,
    right: 0,
  },
});
