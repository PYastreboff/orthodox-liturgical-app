import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAppTranslation } from '../i18n/useAppTranslation';
import { useFontScale } from '../hooks/useFontScale';
import { useFastingRecipes } from '../hooks/useFastingRecipes';
import { recipeTitle, recipeTotalMinutes } from '../lib/recipes/fastingRecipes';
import { recipeDifficultyLabelKey } from '../lib/recipes/recipeLabels';

type Props = {
  textColor: string;
  mutedColor: string;
  borderColor: string;
  isDark: boolean;
  bodyType: { fontSize: number; lineHeight: number };
  hintType: { fontSize: number; lineHeight: number };
};

export function FastingRecipesPreview({
  textColor,
  mutedColor,
  borderColor,
  isDark,
  bodyType,
  hintType,
}: Props) {
  const { t, lang } = useAppTranslation();
  const { text } = useFontScale();
  const router = useRouter();
  const library = useFastingRecipes();
  const metaType = text(13, 18);

  if (library.status === 'loading') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={mutedColor} />
      </View>
    );
  }

  if (library.status === 'offline' || library.recipes.length === 0) {
    return null;
  }

  return (
    <View style={styles.stack}>
      <Text style={[hintType, { color: mutedColor, marginBottom: 4 }]}>
        {t('recipes.nonFastDayHint')}
      </Text>
      {library.recipes.map((recipe) => {
        const title = recipeTitle(recipe, lang);
        const minutes = recipeTotalMinutes(recipe);
        return (
          <Pressable
            key={recipe.id}
            onPress={() => router.push(`/recipes/${recipe.id}`)}
            style={({ pressed }) => [
              styles.row,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(43,38,35,0.04)',
                borderColor,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={title}
          >
            <View style={styles.rowBody}>
              <Text style={[bodyType, { color: textColor, fontWeight: '600' }]} numberOfLines={2}>
                {title}
              </Text>
              <Text style={[metaType, { color: mutedColor }]}>
                {t('recipes.minutes', { n: minutes })} · {t(recipeDifficultyLabelKey(recipe.difficulty))}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={mutedColor} />
          </Pressable>
        );
      })}
      <Pressable
        onPress={() => router.push('/recipes')}
        style={({ pressed }) => [styles.viewAll, { opacity: pressed ? 0.85 : 1 }]}
        accessibilityRole="button"
      >
        <Text style={[bodyType, { color: textColor, fontWeight: '600' }]}>
          {t('recipes.openFromFasting')}
        </Text>
        <Feather name="arrow-right" size={16} color={mutedColor} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 8,
  },
  loading: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 6,
  },
});
