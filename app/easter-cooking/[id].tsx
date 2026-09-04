import { useTheme } from "expo-router/react-navigation";
import { useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { StyleSheet, Text } from 'react-native';

import { RecipeDetailView } from '../../src/components/RecipeDetailView';
import { SwipeBackMissingPage } from '../../src/components/SwipeBackMissingPage';
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
  const { t } = useAppTranslation();
  const isDark = useResolvedColorScheme() === 'dark';
  const muted = isDark ? '#a39e98' : colors.muted;

  if (!food) {
    return (
      <>
        <Head>
          <title>{t('easterCooking.notFound')}</title>
        </Head>
        <SwipeBackMissingPage fallbackRoute="/easter-cooking" backLabel={t('easterCooking.back')}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{t('easterCooking.notFound')}</Text>
        </SwipeBackMissingPage>
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
      shareBasePath="/easter-cooking"
    />
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 24,
  },
});
