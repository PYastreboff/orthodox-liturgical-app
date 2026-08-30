import { useCallback } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Head from 'expo-router/head';

import { DevotionalPageHeader } from '../../src/components/DevotionalPageHeader';
import { PrayersSectionBody } from '../../src/components/PrayersSectionBody';
import { useFontScale } from '../../src/hooks/useFontScale';
import { useScreenSafePadding } from '../../src/hooks/useScreenSafePadding';
import { useTabBarBottomPadding } from '../../src/hooks/useTabBarBottomPadding';
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

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'web') return;
      syncWebDocumentTheme(isDark, pageBg);
      return () => syncWebDocumentTheme(isDark);
    }, [isDark, pageBg]),
  );

  return (
    <>
      <Head>
        <title>{t('tabs.browserTitlePrayers')}</title>
      </Head>
      <View style={[styles.page, { backgroundColor: pageBg }]}>
        <View
          style={[
            styles.header,
            {
              paddingTop: screenSafe.paddingTop + 16,
              paddingLeft: screenSafe.paddingLeft,
              paddingRight: screenSafe.paddingRight,
            },
          ]}
        >
          <DevotionalPageHeader
            icon={<MaterialCommunityIcons name="hands-pray" size={22} color={vestmentAccent.accent} />}
            accentSoft={vestmentAccent.accentSoft}
            title={t('today.sectionPrayers')}
            subtitle={t('tabs.prayersSubtitle')}
            textColor={theme.colors.text}
            mutedColor={muted}
          />
        </View>
        <View
          style={[
            styles.body,
            {
              paddingLeft: screenSafe.paddingLeft,
              paddingRight: screenSafe.paddingRight,
            },
          ]}
        >
          <PrayersSectionBody
            variant="tab"
            textColor={theme.colors.text}
            mutedColor={muted}
            borderColor={theme.colors.border}
            isDark={isDark}
            bodyType={bodyType}
            hintType={hintType}
            scrollBottomPadding={scrollBottomPadding}
          />
        </View>
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
  body: {
    flex: 1,
  },
});
