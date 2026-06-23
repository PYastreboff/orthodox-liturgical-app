import { useCallback, useMemo, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import { router } from 'expo-router';
import Head from 'expo-router/head';

import { CalendarSearch } from '../../src/components/CalendarSearch';
import { LiturgicalMonthGrid } from '../../src/components/LiturgicalMonthGrid';
import { usePhoneLayout } from '../../src/hooks/usePhoneLayout';
import { useScreenSafePadding } from '../../src/hooks/useScreenSafePadding';
import { useTabBarBottomPadding } from '../../src/hooks/useTabBarBottomPadding';
import { useAppTranslation } from '../../src/i18n/useAppTranslation';
import { useDayNavigation } from '../../src/state/DayNavigationContext';
import { usePreferences } from '../../src/state/PreferencesContext';
import { syncWebDocumentTheme } from '../../src/theme/syncWebDocumentTheme';
import { SECTION_CARD_PADDING, SECTION_CARD_PADDING_PHONE } from '../../src/theme/layout';
import { colors } from '../../src/theme/tokens';
import { useResolvedColorScheme } from '../../src/theme/useResolvedColorScheme';

export default function CalendarScreen() {
  const theme = useTheme();
  const isDark = useResolvedColorScheme() === 'dark';
  const { t } = useAppTranslation();
  const { requestOpenDay } = useDayNavigation();
  const { primaryCalendar } = usePreferences();
  const thisMonth = useMemo(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  }, []);

  const screenSafe = useScreenSafePadding({ calendar: true });
  const scrollBottomPadding = useTabBarBottomPadding();
  const [cursor, setCursor] = useState(thisMonth);

  const setCursorMonth = useCallback((date: Date) => {
    setCursor(new Date(date.getFullYear(), date.getMonth(), 1));
  }, []);

  const canGoToThisMonth =
    cursor.getFullYear() !== thisMonth.getFullYear() || cursor.getMonth() !== thisMonth.getMonth();

  const onChangeMonth = useCallback(
    (delta: -1 | 1) => {
      setCursorMonth(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1));
    },
    [cursor, setCursorMonth],
  );

  const onGoToThisMonth = useCallback(() => {
    setCursorMonth(thisMonth);
  }, [setCursorMonth, thisMonth]);

  const onDayPress = useCallback(
    (date: Date) => {
      requestOpenDay(date);
      router.navigate('/(tabs)');
    },
    [requestOpenDay],
  );

  const onSearchSelectDate = useCallback(
    (date: Date) => {
      setCursorMonth(new Date(date.getFullYear(), date.getMonth(), 1));
      onDayPress(date);
    },
    [onDayPress, setCursorMonth],
  );

  const calendarBg = theme.dark ? colors.darkBg : '#e8e3d8';
  const phoneLayout = usePhoneLayout();
  const sectionInsetX = phoneLayout ? SECTION_CARD_PADDING_PHONE : SECTION_CARD_PADDING;

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'web') return;
      syncWebDocumentTheme(isDark, calendarBg);
      return () => syncWebDocumentTheme(isDark);
    }, [calendarBg, isDark]),
  );

  return (
    <>
      <Head>
        <title>{t('tabs.browserTitleCalendar')}</title>
      </Head>
      <View style={[styles.page, { backgroundColor: calendarBg }]}>
      <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingTop: screenSafe.paddingTop + 16,
          paddingLeft: screenSafe.paddingLeft,
          paddingRight: screenSafe.paddingRight,
          paddingBottom: scrollBottomPadding,
        },
      ]}
    >
      <View style={[styles.introSection, { paddingHorizontal: sectionInsetX }]}>
        <Text style={[styles.pageTitle, { color: theme.colors.text }]}>{t('calendar.title')}</Text>
        <CalendarSearch
          calendar={primaryCalendar}
          year={cursor.getFullYear()}
          textColor={theme.colors.text}
          mutedColor={theme.dark ? '#a39e98' : colors.muted}
          cardBg={theme.colors.card}
          borderColor={theme.colors.border}
          isDark={theme.dark}
          onSelectDate={onSearchSelectDate}
          padded={false}
        />
      </View>

      <LiturgicalMonthGrid
        visibleMonth={cursor}
        onChangeMonth={onChangeMonth}
        onGoToThisMonth={onGoToThisMonth}
        canGoToThisMonth={canGoToThisMonth}
        onDayPress={onDayPress}
        liturgicalCalendar={primaryCalendar}
      />
    </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  introSection: {
    width: '100%',
    gap: 18,
    marginBottom: 22,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    letterSpacing: 0.2,
  },
});
