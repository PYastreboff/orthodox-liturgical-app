import { useTheme } from '@react-navigation/native';
import Head from 'expo-router/head';
import { StyleSheet, View } from 'react-native';

import { AppScrollView } from '../src/components/AppScrollView';
import { EasterCookingLibrary } from '../src/components/EasterCookingLibrary';
import { StackScreenHeader } from '../src/components/StackScreenHeader';
import { SwipeBackShell } from '../src/components/SwipeBackShell';
import { useLayoutSafeAreaInsets } from '../src/hooks/useLayoutSafeAreaInsets';
import { useScreenSafePadding } from '../src/hooks/useScreenSafePadding';
import { useStackBack } from '../src/hooks/useStackBack';
import { useAppTranslation } from '../src/i18n/useAppTranslation';
import { useResolvedColorScheme } from '../src/theme/useResolvedColorScheme';
import { colors } from '../src/theme/tokens';

export default function EasterCookingScreen() {
  const theme = useTheme();
  const { t } = useAppTranslation();
  const isDark = useResolvedColorScheme() === 'dark';
  const screenSafe = useScreenSafePadding();
  const insets = useLayoutSafeAreaInsets();
  const muted = isDark ? '#a39e98' : colors.muted;
  const goBack = useStackBack('/(tabs)');

  return (
    <>
      <Head>
        <title>{t('easterCooking.browserTitle')}</title>
        <meta name="description" content={t('easterCooking.intro')} />
      </Head>
      <SwipeBackShell onBack={goBack}>
        <View style={[styles.page, { backgroundColor: theme.colors.background }]}>
          <StackScreenHeader
            title={t('easterCooking.pageTitle')}
            backLabel={t('easterCooking.back')}
            onBack={goBack}
          />
        <AppScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.content,
            {
              paddingLeft: screenSafe.paddingLeft,
              paddingRight: screenSafe.paddingRight,
              paddingBottom: insets.bottom + 28,
            },
          ]}
        >
          <EasterCookingLibrary
            textColor={theme.colors.text}
            mutedColor={muted}
            borderColor={theme.colors.border}
            isDark={isDark}
            contentBottom={8}
          />
        </AppScrollView>
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
