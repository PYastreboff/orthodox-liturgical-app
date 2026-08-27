import { Feather } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { RecipeDetailView } from '../../src/components/RecipeDetailView';
import { useRecipeById } from '../../src/hooks/useFastingRecipes';
import { useScreenSafePadding } from '../../src/hooks/useScreenSafePadding';
import { useAppTranslation } from '../../src/i18n/useAppTranslation';
import { useResolvedColorScheme } from '../../src/theme/useResolvedColorScheme';
import { colors } from '../../src/theme/tokens';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipeId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';
  const { recipe, status, reload } = useRecipeById(recipeId);
  const theme = useTheme();
  const router = useRouter();
  const { t } = useAppTranslation();
  const isDark = useResolvedColorScheme() === 'dark';
  const screenSafe = useScreenSafePadding();
  const muted = isDark ? '#a39e98' : colors.muted;

  if (status === 'loading') {
    return (
      <View
        style={[
          styles.missing,
          styles.centered,
          {
            backgroundColor: theme.colors.background,
            paddingTop: screenSafe.paddingTop + 40,
          },
        ]}
      >
        <ActivityIndicator size="small" color={colors.accentWine} />
        <Text style={[styles.missingBody, { color: muted }]}>{t('recipes.loadingLibrary')}</Text>
      </View>
    );
  }

  if (status === 'offline') {
    return (
      <>
        <Head>
          <title>{t('recipes.offlineTitle')}</title>
        </Head>
        <View
          style={[
            styles.missing,
            {
              backgroundColor: theme.colors.background,
              paddingTop: screenSafe.paddingTop + 12,
              paddingLeft: screenSafe.paddingLeft + 16,
              paddingRight: screenSafe.paddingRight + 16,
            },
          ]}
        >
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/recipes'))}
            style={styles.missingBack}
            accessibilityRole="button"
            accessibilityLabel={t('recipes.back')}
          >
            <Feather name="chevron-left" size={22} color={theme.colors.text} />
            <Text style={[styles.missingBackLabel, { color: theme.colors.text }]}>
              {t('recipes.back')}
            </Text>
          </Pressable>
          <Text style={[styles.missingTitle, { color: theme.colors.text }]}>
            {t('recipes.offlineTitle')}
          </Text>
          <Text style={[styles.missingBody, { color: muted }]}>{t('recipes.offlineBody')}</Text>
          <Pressable onPress={reload} style={styles.retry} accessibilityRole="button">
            <Text style={[styles.retryLabel, { color: theme.colors.text }]}>{t('recipes.retry')}</Text>
          </Pressable>
        </View>
      </>
    );
  }

  if (!recipe) {
    return (
      <>
        <Head>
          <title>{t('recipes.notFoundTitle')}</title>
        </Head>
        <View
          style={[
            styles.missing,
            {
              backgroundColor: theme.colors.background,
              paddingTop: screenSafe.paddingTop + 12,
              paddingLeft: screenSafe.paddingLeft + 16,
              paddingRight: screenSafe.paddingRight + 16,
            },
          ]}
        >
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/recipes'))}
            style={styles.missingBack}
            accessibilityRole="button"
            accessibilityLabel={t('recipes.back')}
          >
            <Feather name="chevron-left" size={22} color={theme.colors.text} />
            <Text style={[styles.missingBackLabel, { color: theme.colors.text }]}>
              {t('recipes.back')}
            </Text>
          </Pressable>
          <Text style={[styles.missingTitle, { color: theme.colors.text }]}>
            {t('recipes.notFoundTitle')}
          </Text>
          <Text style={[styles.missingBody, { color: muted }]}>{t('recipes.notFoundBody')}</Text>
        </View>
      </>
    );
  }

  return <RecipeDetailView recipe={recipe} />;
}

const styles = StyleSheet.create({
  missing: {
    flex: 1,
    gap: 8,
  },
  centered: {
    alignItems: 'center',
    gap: 12,
  },
  missingBack: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 2,
    marginBottom: 20,
  },
  missingBackLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  missingTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  missingBody: {
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
