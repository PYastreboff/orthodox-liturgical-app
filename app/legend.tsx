import Head from 'expo-router/head';
import { Feather } from '@expo/vector-icons';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { LiturgicalLegendGuide } from '../src/components/LiturgicalLegendGuide';
import { StackScreenHeader } from '../src/components/StackScreenHeader';
import { SwipeBackShell } from '../src/components/SwipeBackShell';
import { useLayoutSafeAreaInsets } from '../src/hooks/useLayoutSafeAreaInsets';
import { usePhoneLayout } from '../src/hooks/usePhoneLayout';
import { useScreenSafePadding } from '../src/hooks/useScreenSafePadding';
import { useStackBack } from '../src/hooks/useStackBack';
import { useAppTranslation } from '../src/i18n/useAppTranslation';
import { useVestmentAccent } from '../src/state/VestmentAccentContext';
import { stackContentColumnStyle } from '../src/theme/stackContentColumn';
import { useResolvedColorScheme } from '../src/theme/useResolvedColorScheme';
import { colors } from '../src/theme/tokens';

export default function ColoursLegendScreen() {
  const theme = useTheme();
  const { t } = useAppTranslation();
  const isDark = useResolvedColorScheme() === 'dark';
  const screenSafe = useScreenSafePadding();
  const insets = useLayoutSafeAreaInsets();
  const phone = usePhoneLayout();
  const muted = isDark ? '#a39e98' : colors.muted;
  const vestmentAccent = useVestmentAccent();
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
            subtitle={t('legend.intro')}
            backLabel={t('legend.back')}
            onBack={goBack}
            icon={<Feather name="info" size={22} color={vestmentAccent.accent} />}
            accentSoft={vestmentAccent.accentSoft}
            mutedColor={muted}
          />
        <ScrollView
          contentContainerStyle={[
            styles.content,
            stackContentColumnStyle({
              paddingLeft: screenSafe.paddingLeft,
              paddingRight: screenSafe.paddingRight,
              phone,
            }),
            { paddingBottom: insets.bottom + 28 },
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
  },
});
