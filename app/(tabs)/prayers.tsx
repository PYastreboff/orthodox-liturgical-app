import { useCallback, useRef } from 'react';
import { StyleSheet, View, type ScrollView } from 'react-native';
import { useFocusEffect, useTheme } from "expo-router/react-navigation";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Head from 'expo-router/head';
import { Platform } from 'react-native';

import { AppScrollView } from '../../src/components/AppScrollView';
import { DevotionalPageHeader } from '../../src/components/DevotionalPageHeader';
import { PrayersSectionBody } from '../../src/components/PrayersSectionBody';
import { useFontScale } from '../../src/hooks/useFontScale';
import { useScreenSafePadding } from '../../src/hooks/useScreenSafePadding';
import { useTabBarBottomPadding } from '../../src/hooks/useTabBarBottomPadding';
import { useTabBarScroll } from '../../src/hooks/useTabBarScroll';
import { useAppTranslation } from '../../src/i18n/useAppTranslation';
import { useVestmentAccent } from '../../src/state/VestmentAccentContext';
import { syncWebDocumentTheme } from '../../src/theme/syncWebDocumentTheme';
import { colors } from '../../src/theme/tokens';
import { useResolvedColorScheme } from '../../src/theme/useResolvedColorScheme';

export default function PrayersScreen() {
  const theme = useTheme();
  const isDark = useResolvedColorScheme() === 'dark';
  const { t } = useAppTranslation();
  const { text } = useFontScale();
  const screenSafe = useScreenSafePadding();
  const scrollBottomPadding = useTabBarBottomPadding();
  const vestmentAccent = useVestmentAccent();
  const muted = isDark ? '#a39e98' : colors.muted;
  const bodyType = text(14, 20);
  const hintType = text(13, 20);
  const pageBg = theme.dark ? colors.darkBg : colors.parchment;
  const scrollRef = useRef<ScrollView>(null);
  const onTabScroll = useTabBarScroll('prayers', scrollRef);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'web') return;
      syncWebDocumentTheme(isDark, pageBg);
      return () => syncWebDocumentTheme(isDark);
    }, [isDark, pageBg]),
  );

  const devotionalHeader = (
    <DevotionalPageHeader
      icon={<MaterialCommunityIcons name="hands-pray" size={22} color={vestmentAccent.accent} />}
      accentSoft={vestmentAccent.accentSoft}
      title={t('today.sectionPrayers')}
      subtitle={t('tabs.prayersSubtitle')}
      textColor={theme.colors.text}
      mutedColor={muted}
    />
  );

  return (
    <>
      <Head>
        <title>{t('tabs.browserTitlePrayers')}</title>
      </Head>
      <View style={[styles.page, { backgroundColor: pageBg }]}>
        <AppScrollView
          ref={scrollRef}
          onScroll={onTabScroll}
          scrollEventThrottle={16}
          contentContainerStyle={[
            {
              paddingTop: screenSafe.paddingTop + 16,
              paddingLeft: screenSafe.paddingLeft,
              paddingRight: screenSafe.paddingRight,
              paddingBottom: scrollBottomPadding,
            },
          ]}
        >
          <View style={styles.header}>{devotionalHeader}</View>
          <PrayersSectionBody
            variant="embedded"
            scrollRoute="prayers"
            textColor={theme.colors.text}
            mutedColor={muted}
            borderColor={theme.colors.border}
            isDark={isDark}
            bodyType={bodyType}
            hintType={hintType}
            scrollBottomPadding={scrollBottomPadding}
          />
        </AppScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  header: {
    paddingBottom: 16,
  },
});