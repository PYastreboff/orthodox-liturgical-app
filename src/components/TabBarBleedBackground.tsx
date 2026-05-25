import { Platform, StyleSheet, View } from 'react-native';

type Props = {
  color: string;
  /** Extra fill below the tab bar layout box. */
  bleedPx: number;
};

/**
 * Solid backdrop for the tab bar. Extends past the bottom edge on phone/web so RN does not
 * leave a 1px unpainted strip above Safari’s toolbar or the home indicator.
 */
export function TabBarBleedBackground({ color, bleedPx }: Props) {
  const extend = Math.max(bleedPx, Platform.OS === 'web' ? 4 : 2);

  return (
    <View
      style={[
        styles.fill,
        {
          backgroundColor: color,
          bottom: -extend,
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
