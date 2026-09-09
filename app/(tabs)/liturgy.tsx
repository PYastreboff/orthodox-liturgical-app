import { useCallback, useEffect, useRef, useState, type ComponentProps } from 'react';
import { StyleSheet, View, type ScrollView } from 'react-native';
import { useFocusEffect, useTheme } from "expo-router/react-navigation";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Head from 'expo-router/head';
import { useLocalSearchParams } from 'expo-router';
import { Platform } from 'react-native';

import { AppScrollView } from '../../src/components/AppScrollView';
import { WorshipLiturgyBody } from '../../src/components/WorshipLiturgyBody';
import { DevotionalPageHeader } from '../../src/components/DevotionalPageHeader';
import { useFontScale } from '../../src/hooks/useFontScale';
import { useScreenSafePadding } from '../../src/hooks/useScreenSafePadding';
import { useTabBarBottomPadding } from '../../src/hooks/useTabBarBottomPadding';
import { useTabBarScroll } from '../../src/hooks/useTabBarScroll';
import { useAppTranslation } from '../../src/i18n/useAppTranslation';
import { parseWorshipServiceId, worshipServicePageSubtitleKey, worshipServicePageTitleKey, type WorshipServiceId } from '../../src/lib/liturgical/worshipNavigation';
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
  const scrollRef = useRef<ScrollView>(null);
  const onTabScroll = useTabBarScroll('liturgy', scrollRef);

  const pageTitle = t(worshipServicePageTitleKey(service));
  const pageSubtitle = t(worshipServicePageSubtitleKey(service));

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

  const devotionalHeader = (
    <DevotionalPageHeader
      icon={<MaterialCommunityIcons name="church" size={22} color={vestmentAccent.accent} />}
      accentSoft={vestmentAccent.accentSoft}
      title={pageTitle}
      subtitle={pageSubtitle}
      textColor={theme.colors.text}
      mutedColor={muted}
    />
  );

  const liturgyBodyProps: ComponentProps<typeof WorshipLiturgyBody> = {
    variant: 'embedded',
    scrollRef,
    header: devotionalHeader,
    scrollRoute: 'liturgy',
    service,
    onServiceChange: setService,
    showServiceToggle: true,
    textColor: theme.colors.text as string,
    mutedColor: muted,
    borderColor: theme.colors.border as string,
    isDark,
    bodyType,
    hintType,
    scrollBottomPadding,
  };

  return (
    <>
      <Head>
        <title>
          {t('app.name')} - {pageTitle}
        </title>
      </Head>
      <View style={[styles.page, { backgroundColor: pageBg }]}>
        {Platform.OS === 'web' ? (
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
            <WorshipLiturgyBody {...liturgyBodyProps} />
          </AppScrollView>
        ) : (
          <WorshipLiturgyBody
            {...liturgyBodyProps}
            scrollContentHorizontalPadding={screenSafe.paddingLeft}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
});