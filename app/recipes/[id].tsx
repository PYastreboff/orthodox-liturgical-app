import { useTheme } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { RecipeDetailView } from '../../src/components/RecipeDetailView';
import { SwipeBackMissingPage } from '../../src/components/SwipeBackMissingPage';
import { SwipeBackShell } from '../../src/components/SwipeBackShell';
import { useRecipeById } from '../../src/hooks/useFastingRecipes';
import { useScreenSafePadding } from '../../src/hooks/useScreenSafePadding';
import { useStackBack } from '../../src/hooks/useStackBack';
import { useAppTranslation } from '../../src/i18n/useAppTranslation';
import { useResolvedColorScheme } from '../../src/theme/useResolvedColorScheme';
import { colors } from '../../src/theme/tokens';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipeId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';
  const { recipe, status, reload } = useRecipeById(recipeId);
  const theme = useTheme();
  const { t } = useAppTranslation();
  const isDark = useResolvedColorScheme() === 'dark';
  const screenSafe = useScreenSafePadding();
  const muted = isDark ? '#a39e98' : colors.muted;
  const goBack = useStackBack('/recipes');

  if (status === 'loading') {
    return (
      <SwipeBackShell onBack={goBack}>
        <View
          style={[
            styles.centered,
            {
              backgroundColor: theme.colors.background,
              paddingTop: screenSafe.paddingTop + 40,
            },
          ]}
        >
          <ActivityIndicator size="small" color={colors.accentWine} />
          <Text style={[styles.body, { color: muted }]}>{t('recipes.loadingLibrary')}</Text>
        </View>
      </SwipeBackShell>
    );
  }

  if (status === 'offline') {
    return (
      <>
        <Head>
          <title>{t('recipes.offlineTitle')}</title>
        </Head>
        <SwipeBackMissingPage fallbackRoute="/recipes" backLabel={t('recipes.back')}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{t('recipes.offlineTitle')}</Text>
          <Text style={[styles.body, { color: muted }]}>{t('recipes.offlineBody')}</Text>
          <Pressable onPress={reload} style={styles.retry} accessibilityRole="button">
            <Text style={[styles.retryLabel, { color: theme.colors.text }]}>{t('recipes.retry')}</Text>
          </Pressable>
        </SwipeBackMissingPage>
      </>
    );
  }

  if (!recipe) {
    return (
      <>
        <Head>
          <title>{t('recipes.notFoundTitle')}</title>
        </Head>
        <SwipeBackMissingPage fallbackRoute="/recipes" backLabel={t('recipes.back')}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{t('recipes.notFoundTitle')}</Text>
          <Text style={[styles.body, { color: muted }]}>{t('recipes.notFoundBody')}</Text>
        </SwipeBackMissingPage>
      </>
    );
  }

  return <RecipeDetailView recipe={recipe} />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  retry: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  retryLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
