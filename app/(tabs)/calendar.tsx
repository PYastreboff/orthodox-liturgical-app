import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { router } from 'expo-router';
import Head from 'expo-router/head';

import { CalendarColorLegend } from '../../src/components/CalendarColorLegend';
import { LiturgicalMonthGrid } from '../../src/components/LiturgicalMonthGrid';
import { useAppTranslation } from '../../src/i18n/useAppTranslation';
import { useDayNavigation } from '../../src/state/DayNavigationContext';
import { usePreferences } from '../../src/state/PreferencesContext';
import { colors } from '../../src/theme/tokens';

const CALENDAR_COMPACT_BREAKPOINT = 600;

export default function CalendarScreen() {
  const theme = useTheme();
  const { t } = useAppTranslation();
  const { requestOpenDay } = useDayNavigation();
  const { primaryCalendar } = usePreferences();
  const thisMonth = useMemo(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  }, []);

  const [cursor, setCursor] = useState(thisMonth);

  const canGoToThisMonth =
    cursor.getFullYear() !== thisMonth.getFullYear() || cursor.getMonth() !== thisMonth.getMonth();

  const onChangeMonth = useCallback((delta: -1 | 1) => {
    setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }, []);

  const onGoToThisMonth = useCallback(() => {
    setCursor(thisMonth);
  }, [thisMonth]);

  const onDayPress = useCallback(
    (date: Date) => {
      requestOpenDay(date);
      router.navigate('/(tabs)');
    },
    [requestOpenDay],
  );

  const calendarBg = theme.dark ? colors.darkBg : '#e8e3d8';
  const { width } = useWindowDimensions();
  const isCompact = width < CALENDAR_COMPACT_BREAKPOINT;

  return (
    <>
      <Head>
        <title>{t('tabs.browserTitleCalendar')}</title>
      </Head>
      <ScrollView
      style={[styles.scroll, { backgroundColor: calendarBg }]}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>{t('calendar.title')}</Text>
      <Text style={[styles.lede, isCompact ? styles.ledeCompact : null, { color: colors.muted }]}>
        {t(isCompact ? 'calendar.subtitleShort' : 'calendar.subtitle')}
      </Text>
      <CalendarColorLegend textColor={theme.colors.text} compact={isCompact} />

      <LiturgicalMonthGrid
        visibleMonth={cursor}
        onChangeMonth={onChangeMonth}
        onGoToThisMonth={onGoToThisMonth}
        canGoToThisMonth={canGoToThisMonth}
        onDayPress={onDayPress}
        liturgicalCalendar={primaryCalendar}
      />
    </ScrollView>
    </>
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
  ledeCompact: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
});
