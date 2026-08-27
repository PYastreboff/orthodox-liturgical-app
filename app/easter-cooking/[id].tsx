import { Feather } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RecipeDetailView } from '../../src/components/RecipeDetailView';
import { useScreenSafePadding } from '../../src/hooks/useScreenSafePadding';
import { useAppTranslation } from '../../src/i18n/useAppTranslation';
import { easterFoodAsRecipe, easterFoodById } from '../../src/lib/easter/easterCooking';
import { easterFoodImageSource, easterFoodImageUriFallback } from '../../src/lib/easter/easterCookingImages';
import { useResolvedColorScheme } from '../../src/theme/useResolvedColorScheme';
import { colors } from '../../src/theme/tokens';

export default function EasterCookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const foodId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';
  const food = easterFoodById(foodId);
  const theme = useTheme();
  const router = useRouter();
  const { t } = useAppTranslation();
  const isDark = useResolvedColorScheme() === 'dark';
  const screenSafe = useScreenSafePadding();
  const muted = isDark ? '#a39e98' : colors.muted;

  if (!food) {
    return (
      <>
        <Head>
          <title>{t('easterCooking.notFound')}</title>
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
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/easter-cooking'))}
            style={styles.missingBack}
            accessibilityRole="button"
            accessibilityLabel={t('easterCooking.back')}
          >
            <Feather name="chevron-left" size={22} color={theme.colors.text} />
            <Text style={[styles.missingBackLabel, { color: theme.colors.text }]}>
              {t('easterCooking.back')}
            </Text>
          </Pressable>
          <Text style={[styles.missingTitle, { color: theme.colors.text }]}>
            {t('easterCooking.notFound')}
          </Text>
        </View>
      </>
    );
  }

  return (
    <RecipeDetailView
      recipe={easterFoodAsRecipe(food)}
      backFallbackRoute="/easter-cooking"
      resolveImageSource={(id) => easterFoodImageSource(id)}
      resolveImageUriFallback={(id) => easterFoodImageUriFallback(id)}
      eyebrowLabel={t('easterCooking.recipeEyebrow')}
    />
  );
}

const styles = StyleSheet.create({
  missing: {
    flex: 1,
    gap: 12,
  },
  missingBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  missingBackLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  missingTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 24,
  },
});
