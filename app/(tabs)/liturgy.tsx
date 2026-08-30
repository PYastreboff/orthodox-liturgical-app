import { useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Head from 'expo-router/head';
import { useLocalSearchParams } from 'expo-router';

import { WorshipLiturgyBody } from '../../src/components/ChrysostomLiturgyBody';
import { DevotionalPageHeader } from '../../src/components/DevotionalPageHeader';
import { useFontScale } from '../../src/hooks/useFontScale';
import { useScreenSafePadding } from '../../src/hooks/useScreenSafePadding';
import { useTabBarBottomPadding } from '../../src/hooks/useTabBarBottomPadding';
import { useAppTranslation } from '../../src/i18n/useAppTranslation';
import { parseWorshipServiceId, type WorshipServiceId } from '../../src/lib/liturgical/worshipNavigation';
import { useVestmentAccent } from '../../src/state/VestmentAccentContext';
import { syncWebDocumentTheme } from '../../src/theme/syncWebDocumentTheme';
import { colors } from '../../src/theme/tokens';
import { useResolvedColorScheme } from '../../src/theme/useResolvedColorScheme';

export default function WorshipScreen() {
  const theme = useTheme();
  const isDark = useResolvedColorScheme() === 'dark';
  const { t } = useAppTranslation();
  const { text } = useFontScale();
  const screenSafe = useScreenSafePadding();
  const scrollBottomPadding = useTabBarBottomPadding();
  const vestmentAccent = useVestmentAccent();
  const params = useLocalSearchParams<{ service?: string }>();
  const [service, setService] = useState<WorshipServiceId>(() => parseWorshipServiceId(params.service));
  const muted = isDark ? '#a39e98' : colors.muted;
  const bodyType = text(14, 20);
  const hintType = text(13, 20);
  const pageBg = theme.dark ? colors.darkBg : colors.parchment;

  useEffect(() => {
    setService(parseWorshipServiceId(params.service));
  }, [params.service]);

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
        <title>{t('tabs.browserTitleWorship')}</title>
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
            icon={<MaterialCommunityIcons name="church" size={22} color={vestmentAccent.accent} />}
            accentSoft={vestmentAccent.accentSoft}
            title={t('tabs.worshipTitle')}
            subtitle={t('tabs.worshipSubtitle')}
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
          <WorshipLiturgyBody
            variant="tab"
            service={service}
            onServiceChange={setService}
            showServiceToggle
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
    paddingBottom: 12,
  },
  body: {
    flex: 1,
  },
});
