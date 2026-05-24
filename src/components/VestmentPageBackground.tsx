import { useEffect, useMemo, type ReactNode } from 'react';
import {
  Platform,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useLayoutSafeAreaInsets } from '../hooks/useLayoutSafeAreaInsets';
import type { LiturgicalDayAppearance } from '../lib/calendar/dayAppearance';
import {
  todayPageBackgroundColor,
  vestmentPageGradient,
} from '../lib/liturgical/vestmentGradient';
import { syncWebDocumentTheme } from '../theme/syncWebDocumentTheme';
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
  const chromeColor =
    gradient && gradient.colors.length > 0 ? gradient.colors[0] : backgroundColor;

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    syncWebDocumentTheme(isDark, chromeColor);
    return () => syncWebDocumentTheme(isDark);
  }, [isDark, chromeColor]);

  return (
    <View
      style={[
        styles.root,
        { backgroundColor },
        bleedTop > 0 || bleedBottom > 0
          ? {
              marginTop: -bleedTop,
              marginBottom: -bleedBottom,
            }
          : null,
        style,
      ]}
    >
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
