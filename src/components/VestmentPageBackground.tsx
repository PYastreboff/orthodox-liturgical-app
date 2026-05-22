import { useMemo, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import type { LiturgicalDayAppearance } from '../lib/calendar/dayAppearance';
import {
  PAGE_BACKGROUND_BLACK,
  vestmentPageGradient,
} from '../lib/liturgical/vestmentGradient';

type Props = {
  appearance: LiturgicalDayAppearance;
  gradientEnabled: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Black page base with an optional, very subtle vestment-colour gradient. */
export function VestmentPageBackground({
  appearance,
  gradientEnabled,
  children,
  style,
}: Props) {
  const gradient = useMemo(
    () => vestmentPageGradient(appearance, gradientEnabled),
    [appearance.key, gradientEnabled],
  );

  return (
    <View style={[styles.root, style]}>
      {gradient ? (
        <LinearGradient
          colors={[...gradient.colors]}
          locations={[...gradient.locations]}
          start={gradient.start}
          end={gradient.end}
          style={styles.gradientLayer}
          pointerEvents="none"
        />
      ) : null}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PAGE_BACKGROUND_BLACK,
  },
  gradientLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});
