import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { StyleSheet, View } from 'react-native';

import { AppScrollView } from '../src/components/AppScrollView';
import { RecipesLibrary } from '../src/components/RecipesLibrary';
import { StackScreenHeader } from '../src/components/StackScreenHeader';
import { useLayoutSafeAreaInsets } from '../src/hooks/useLayoutSafeAreaInsets';
import { useScreenSafePadding } from '../src/hooks/useScreenSafePadding';
import { useAppTranslation } from '../src/i18n/useAppTranslation';
import { useResolvedColorScheme } from '../src/theme/useResolvedColorScheme';
import { colors } from '../src/theme/tokens';

export default function RecipesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useAppTranslation();
  const isDark = useResolvedColorScheme() === 'dark';
  const screenSafe = useScreenSafePadding();
  const insets = useLayoutSafeAreaInsets();
  const muted = isDark ? '#a39e98' : colors.muted;

  return (
    <>
      <Head>
        <title>{t('recipes.browserTitle')}</title>
        <meta name="description" content={t('recipes.pageIntro')} />
      </Head>
      <View style={[styles.page, { backgroundColor: theme.colors.background }]}>
        <StackScreenHeader
          title={t('recipes.pageTitle')}
          backLabel={t('recipes.back')}
          onBack={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
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
          <RecipesLibrary
            textColor={theme.colors.text}
            mutedColor={muted}
            borderColor={theme.colors.border}
            isDark={isDark}
            contentBottom={8}
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
  content: {
    paddingTop: 8,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
});
