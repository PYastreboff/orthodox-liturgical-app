import { useEffect, useMemo, type ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import type { LiturgicalDayAppearance } from '../lib/calendar/dayAppearance';
import {
  todayPageBackgroundColor,
  vestmentPageGradient,
} from '../lib/liturgical/vestmentGradient';
import { useDocumentScrollWeb } from '../hooks/useDocumentScrollWeb';
import { syncWebDocumentTheme } from '../theme/syncWebDocumentTheme';
import { useResolvedColorScheme } from '../theme/useResolvedColorScheme';

type Props = {
  appearance: LiturgicalDayAppearance;
  gradientEnabled: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Full-screen parchment / charcoal with optional vestment gradient (edge-to-edge). */
export function VestmentPageBackground({
  appearance,
  gradientEnabled,
  children,
  style,
}: Props) {
  const isDark = useResolvedColorScheme() === 'dark';
  const documentScroll = useDocumentScrollWeb();
  const backgroundColor = todayPageBackgroundColor(isDark);
  const gradient = useMemo(
    () => vestmentPageGradient(appearance, gradientEnabled, isDark),
    [appearance.key, appearance.label, gradientEnabled, isDark],
  );

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    syncWebDocumentTheme(isDark, backgroundColor);
    return () => syncWebDocumentTheme(isDark);
  }, [isDark, backgroundColor]);

  return (
    <View
      style={[
        styles.root,
        documentScroll ? styles.rootDocumentScroll : null,
        { backgroundColor },
        style,
      ]}
    >
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
      <View style={documentScroll ? styles.contentDocumentScroll : styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  rootDocumentScroll: {
    flex: 1,
    width: '100%',
    height: 'auto',
    minHeight: '100%',
  },
  gradientLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  contentDocumentScroll: {
    flex: 1,
    width: '100%',
    zIndex: 1,
  },
});
