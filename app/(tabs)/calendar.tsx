import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { LiturgicalMonthGrid } from '../../src/components/LiturgicalMonthGrid';
import { colors } from '../../src/theme/tokens';

export default function CalendarScreen() {
  const theme = useTheme();
  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });

  const onChangeMonth = useCallback((delta: -1 | 1) => {
    setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }, []);

  const subtitle = useMemo(
    () =>
      'Each cell uses the Julian liturgical date for that civil day. Colours follow Pascha, major feasts, and fasts (approximate until your SQLite pack supplies ranks).',
    [],
  );

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>Liturgical calendar</Text>
      <Text style={[styles.lede, { color: colors.muted }]}>{subtitle}</Text>

      <LiturgicalMonthGrid visibleMonth={cursor} onChangeMonth={onChangeMonth} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  lede: {
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
});
