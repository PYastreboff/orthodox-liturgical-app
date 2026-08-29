import Head from 'expo-router/head';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { LiturgicalLegendGuide } from '../src/components/LiturgicalLegendGuide';
import { StackScreenHeader } from '../src/components/StackScreenHeader';
import { SwipeBackShell } from '../src/components/SwipeBackShell';
import { useLayoutSafeAreaInsets } from '../src/hooks/useLayoutSafeAreaInsets';
import { useScreenSafePadding } from '../src/hooks/useScreenSafePadding';
import { useStackBack } from '../src/hooks/useStackBack';
import { useAppTranslation } from '../src/i18n/useAppTranslation';
import { useResolvedColorScheme } from '../src/theme/useResolvedColorScheme';
import { colors } from '../src/theme/tokens';

export default function ColoursLegendScreen() {
  const theme = useTheme();
  const { t } = useAppTranslation();
  const isDark = useResolvedColorScheme() === 'dark';
  const screenSafe = useScreenSafePadding();
  const insets = useLayoutSafeAreaInsets();
  const muted = isDark ? '#a39e98' : colors.muted;
  const goBack = useStackBack('/settings');

  return (
    <>
      <Head>
        <title>{t('legend.browserTitle')}</title>
        <meta name="description" content={t('legend.intro')} />
      </Head>
      <SwipeBackShell onBack={goBack}>
        <View style={[styles.page, { backgroundColor: theme.colors.background }]}>
          <StackScreenHeader
            title={t('legend.title')}
            backLabel={t('legend.back')}
            onBack={goBack}
          />
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingLeft: screenSafe.paddingLeft,
              paddingRight: screenSafe.paddingRight,
              paddingBottom: insets.bottom + 28,
            },
          ]}
        >
          <LiturgicalLegendGuide
            textColor={theme.colors.text}
            mutedColor={muted}
            pageLayout
          />
        </ScrollView>
        </View>
      </SwipeBackShell>
    </>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  content: {
    paddingTop: 8,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
});
