import { useMemo, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useLayoutSafeAreaInsets } from '../hooks/useLayoutSafeAreaInsets';
import type { LiturgicalDayAppearance } from '../lib/calendar/dayAppearance';
import {
  todayPageBackgroundColor,
  vestmentPageGradient,
} from '../lib/liturgical/vestmentGradient';
import { useResolvedColorScheme } from '../theme/useResolvedColorScheme';

type Props = {
  appearance: LiturgicalDayAppearance;
  gradientEnabled: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Parchment (light) or charcoal (dark) base with an optional vestment-colour gradient. */
export function VestmentPageBackground({
  appearance,
  gradientEnabled,
  children,
  style,
}: Props) {
  const isDark = useResolvedColorScheme() === 'dark';
  const backgroundColor = todayPageBackgroundColor(isDark);
  const insets = useLayoutSafeAreaInsets();
  const gradient = useMemo(
    () => vestmentPageGradient(appearance, gradientEnabled, isDark),
    [appearance.key, appearance.label, gradientEnabled, isDark],
  );

  const bleedTop = insets.top;
  const bleedBottom = insets.bottom;

  return (
    <View style={[styles.root, { backgroundColor }, style]}>
      {gradient ? (
        <LinearGradient
          colors={[...gradient.colors]}
          locations={[...gradient.locations]}
          start={gradient.start}
          end={gradient.end}
          style={[
            styles.gradientLayer,
            {
              top: -bleedTop,
              bottom: -bleedBottom,
            },
          ]}
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
  },
  gradientLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 0,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});
