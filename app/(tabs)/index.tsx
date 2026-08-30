import { StyleSheet, Text, View, type LayoutChangeEvent, type ScrollView } from 'react-native';
import { useCallback, useRef, useState } from 'react';
import { useFocusEffect, useTheme } from '@react-navigation/native';

import { AppScrollView } from '../../src/components/AppScrollView';
import { DayHero } from '../../src/components/DayHero';
import { TodayDailyFocus } from '../../src/components/TodayDailyFocus';
import { TodaySkeleton } from '../../src/components/TodaySkeleton';
import { TodaySectionTiles } from '../../src/components/TodaySectionTiles';
import { LiturgicalMonthGrid } from '../../src/components/LiturgicalMonthGrid';
import { VestmentPageBackground } from '../../src/components/VestmentPageBackground';
import { usePhoneLayout } from '../../src/hooks/usePhoneLayout';
import { useScreenSafePadding } from '../../src/hooks/useScreenSafePadding';
import { useTabBarBottomPadding } from '../../src/hooks/useTabBarBottomPadding';
import { useTodayDayModel } from '../../src/hooks/useTodayDayModel';
import { startOfLocalDay } from '../../src/lib/calendar/localDate';
import { firstGospelExcerpt } from '../../src/lib/liturgical/hymnExcerpt';
import { useDayNavigation } from '../../src/state/DayNavigationContext';
import { colors } from '../../src/theme/tokens';

export default function TodayScreen() {
  const theme = useTheme();
  const model = useTodayDayModel();
  const { consumePendingDay } = useDayNavigation();
  const screenSafe = useScreenSafePadding();
  const scrollBottomPadding = useTabBarBottomPadding();
  const phone = usePhoneLayout();
  const scrollRef = useRef<ScrollView>(null);
  const [viewportHeight, setViewportHeight] = useState(0);

  const paddingTop = screenSafe.paddingTop + (phone ? 20 : 28);

  useFocusEffect(
    useCallback(() => {
      const day = consumePendingDay();
      if (!day) return;
      model.setSelectedDate(day);
      const id = requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
      });
      return () => cancelAnimationFrame(id);
    }, [consumePendingDay, model.setSelectedDate]),
  );

  const onScrollLayout = useCallback((event: LayoutChangeEvent) => {
    setViewportHeight(event.nativeEvent.layout.height);
  }, []);

  const aboveFoldMinHeight =
    phone && viewportHeight > paddingTop ? viewportHeight - paddingTop : undefined;

  return (
    <VestmentPageBackground
      appearance={model.appearance}
      gradientEnabled={model.showVestmentGradient}
    >
      <AppScrollView
        ref={scrollRef}
        style={styles.scroll}
        onLayout={onScrollLayout}
        contentContainerStyle={[
          styles.container,
          {
            paddingTop,
            paddingLeft: screenSafe.paddingLeft,
            paddingRight: screenSafe.paddingRight,
            paddingBottom: scrollBottomPadding,
          },
        ]}
      >
        <View style={aboveFoldMinHeight ? { minHeight: aboveFoldMinHeight } : null}>
          <DayHero
            appearance={model.appearance}
            dayTitle={model.dashboard.dayTitle}
            dateLabel={model.gregorianDateLabel}
            julianDateLabel={model.julianDateLabel}
            toneLabel={model.dashboard.toneLabel}
            feastRank={model.dashboard.feastRank}
            heroFastChip={model.dashboard.heroFastChip}
            showFeastRankChip={model.dashboard.showHeroFeastRankChip}
            isMajorFeastDay={model.dashboard.isMajorFeastDay}
            orthocalFeastLevel={model.liturgicalDay?.feast_level}
            servingRole={model.servingRole}
            onServingRoleChange={model.setServingRole}
            canGoToToday={model.canGoToToday}
            onPrevious={() => model.setSelectedDate(model.addDays(model.selectedDate, -1))}
            onNext={() => model.setSelectedDate(model.addDays(model.selectedDate, 1))}
            onToday={() => model.setSelectedDate(model.today)}
            onShare={model.handleShareDay}
          />
          {model.waitingForDay ? <TodaySkeleton isDark={model.isDark} /> : null}
          {model.error ? (
            <Text style={[styles.statusLine, model.type.status, styles.statusError]}>
              {model.t('today.offline', { error: model.error })}
            </Text>
          ) : null}

          {!model.waitingForDay ? (
            <TodayDailyFocus
              gospel={firstGospelExcerpt(model.gospelPreviewSections)}
              textColor={theme.colors.text}
              isDark={model.isDark}
            />
          ) : null}

          <TodaySectionTiles
            servingRole={model.servingRole}
            textColor={theme.colors.text}
            borderColor={theme.colors.border}
            isDark={model.isDark}
          />
        </View>

        <View style={[styles.homeCalendar, phone ? styles.homeCalendarPhone : styles.homeCalendarWeb]}>
          <LiturgicalMonthGrid
            visibleMonth={model.calendarMonth}
            onChangeMonth={model.onCalendarChangeMonth}
            onGoToThisMonth={() => model.setCalendarMonthCursor(model.thisMonth)}
            canGoToThisMonth={model.canGoToThisMonth}
            onDayPress={(date) => {
              model.setSelectedDate(startOfLocalDay(date));
              requestAnimationFrame(() => {
                scrollRef.current?.scrollTo({ y: 0, animated: true });
              });
            }}
            liturgicalCalendar={model.primaryCalendar}
          />
        </View>
      </AppScrollView>
    </VestmentPageBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flexGrow: 1,
  },
  homeCalendar: {
    marginBottom: 8,
  },
  homeCalendarPhone: {
    marginTop: 12,
  },
  homeCalendarWeb: {
    marginTop: 32,
  },
  statusLine: {
    textAlign: 'center',
    marginBottom: 10,
    marginTop: -6,
  },
  statusError: {
    color: colors.accentWine,
  },
});
