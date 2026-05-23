import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { router } from 'expo-router';

import { CalendarColorLegend } from '../../src/components/CalendarColorLegend';
import { LiturgicalMonthGrid } from '../../src/components/LiturgicalMonthGrid';
import { useDayNavigation } from '../../src/state/DayNavigationContext';
import { usePreferences } from '../../src/state/PreferencesContext';
import { colors } from '../../src/theme/tokens';

export default function CalendarScreen() {
  const theme = useTheme();
  const { requestOpenDay } = useDayNavigation();
  const { primaryCalendar } = usePreferences();
  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });

  const onChangeMonth = useCallback((delta: -1 | 1) => {
    setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }, []);

  const onDayPress = useCallback(
    (date: Date) => {
      requestOpenDay(date);
      router.navigate('/(tabs)');
    },
    [requestOpenDay],
  );

  const subtitle = useMemo(
    () =>
      'Day numbers are civil (Gregorian). Cell labels and colours follow your liturgical calendar setting (Settings).',
    [],
  );

  const calendarBg = theme.dark ? colors.darkBg : '#e8e3d8';

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: calendarBg }]}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>Liturgical calendar</Text>
      <Text style={[styles.lede, { color: colors.muted }]}>{subtitle}</Text>
      <CalendarColorLegend textColor={theme.colors.text} />

      <LiturgicalMonthGrid
        visibleMonth={cursor}
        onChangeMonth={onChangeMonth}
        onDayPress={onDayPress}
        liturgicalCalendar={primaryCalendar}
      />
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
    marginBottom: 0,
  },
});
