import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import { useAppTranslation } from '../i18n/useAppTranslation';
import { useFontScale } from '../hooks/useFontScale';
import { useFastingRecipes } from '../hooks/useFastingRecipes';
import {
  RECIPE_MEAL_SLOTS,
  recipeMealSlot,
  recipeSummary,
  recipeTitle,
  recipeTotalMinutes,
  type FastingRecipe,
  type RecipeMealSlot,
} from '../lib/recipes/fastingRecipes';
import {
  recipeDifficultyLabelKey,
  recipeMealSlotLabelKey,
} from '../lib/recipes/recipeLabels';
import { recipeImageSource } from '../lib/recipes/recipeImages';
import { fuzzyNameScore } from '../lib/liturgical/fuzzySearch';
import { colors } from '../theme/tokens';

type MealFilter = 'all' | RecipeMealSlot;

type Props = {
  textColor: string;
  mutedColor: string;
  borderColor: string;
  isDark: boolean;
  contentBottom?: number;
};

function RecipeRow({
  recipe,
  textColor,
  mutedColor,
  borderColor,
  isDark,
}: {
  recipe: FastingRecipe;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  isDark: boolean;
}) {
  const { t, lang } = useAppTranslation();
  const { text } = useFontScale();
  const router = useRouter();
  const [imageFailed, setImageFailed] = useState(false);
  const title = recipeTitle(recipe, lang);
  const totalMinutes = recipeTotalMinutes(recipe);
  const imageSource = recipeImageSource(recipe.id);
  const titleType = text(16, 21);
  const metaType = text(13, 18);

  return (
    <Pressable
      onPress={() => router.push(`/recipes/${recipe.id}`)}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: isDark ? colors.darkSurface : colors.card,
          borderColor,
          opacity: pressed ? 0.94 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${t('recipes.minutes', { n: totalMinutes })}, ${t(recipeDifficultyLabelKey(recipe.difficulty))}`}
      {...hoverAccessibilityProps(title, { role: 'button' })}
    >
      {imageSource && !imageFailed ? (
        <Image
          source={imageSource}
          style={styles.thumb}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
          onError={() => setImageFailed(true)}
        />
      ) : (
        <View
          style={[
            styles.thumb,
            styles.thumbFallback,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(107,45,60,0.1)' },
          ]}
        >
          <Feather name="image" size={22} color={mutedColor} />
        </View>
      )}

      <View style={styles.rowBody}>
        <Text style={[styles.title, titleType, { color: textColor }]} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.metaRow}>
          <Feather name="clock" size={13} color={mutedColor} />
          <Text style={[styles.metaText, metaType, { color: mutedColor }]}>
            {t('recipes.minutes', { n: totalMinutes })}
          </Text>
          <Text style={[styles.metaDot, { color: mutedColor }]}>·</Text>
          <Text style={[styles.metaText, metaType, { color: mutedColor }]}>
            {t(recipeDifficultyLabelKey(recipe.difficulty))}
          </Text>
        </View>
      </View>

      <Feather name="chevron-right" size={18} color={mutedColor} style={styles.chevron} />
    </Pressable>
  );
}

export function RecipesLibrary({
  textColor,
  mutedColor,
  borderColor,
  isDark,
  contentBottom = 40,
}: Props) {
  const { t, lang } = useAppTranslation();
  const { text } = useFontScale();
  const bodyType = text(14, 20);
  const chipType = text(13, 18);
  const [query, setQuery] = useState('');
  const [meal, setMeal] = useState<MealFilter>('all');
  const library = useFastingRecipes();
  const recipes = library.recipes;

  const filtered = useMemo(() => {
    if (library.status !== 'ready') return [];
    const q = query.trim();
    const mealFiltered =
      meal === 'all'
        ? recipes
        : recipes.filter((recipe) => recipeMealSlot(recipe.category) === meal);

    if (q.length < 2) return mealFiltered;

    const scored = mealFiltered
      .map((recipe) => {
        const haystacks = [
          recipeTitle(recipe, lang),
          recipe.title.en,
          recipe.title.ru,
          recipe.title.el,
          recipeSummary(recipe, lang),
          recipe.summary.en,
        ];
        let score = 0;
        for (const hay of haystacks) {
          score = Math.max(score, fuzzyNameScore(hay, q));
        }
        return { recipe, score };
      })
      .filter((row) => row.score > 0)
      .sort((a, b) => b.score - a.score || a.recipe.title.en.localeCompare(b.recipe.title.en));

    return scored.map((row) => row.recipe);
  }, [lang, library.status, meal, query, recipes]);

  const chipSelectedBg = isDark ? colors.darkInk : colors.ink;
  const chipSelectedFg = isDark ? colors.darkBg : colors.parchment;
  const chipIdleBg = isDark ? 'rgba(255,255,255,0.04)' : colors.card;
  const searchBg = isDark ? 'rgba(255,255,255,0.05)' : colors.card;

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.searchWrap,
          {
            borderColor,
            backgroundColor: searchBg,
          },
        ]}
      >
        <Feather name="search" size={16} color={mutedColor} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('recipes.searchPlaceholder')}
          placeholderTextColor={mutedColor}
          style={[styles.searchInput, bodyType, { color: textColor }]}
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
          underlineColorAndroid="transparent"
          selectionColor={colors.accentWine}
          accessibilityLabel={t('recipes.searchPlaceholder')}
        />
        {query ? (
          <Pressable
            onPress={() => setQuery('')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('recipes.clearSearch')}
          >
            <Feather name="x" size={16} color={mutedColor} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipScroll}
        style={styles.chipScrollOuter}
      >
        {RECIPE_MEAL_SLOTS.map((key) => {
          const selected = meal === key;
          const label = t(recipeMealSlotLabelKey(key));
          return (
            <Pressable
              key={key}
              onPress={() => setMeal(selected ? 'all' : key)}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? chipSelectedBg : chipIdleBg,
                  borderColor: selected ? chipSelectedBg : borderColor,
                },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={label}
              {...hoverAccessibilityProps(label, { role: 'button' })}
            >
              <Text
                style={[
                  styles.chipLabel,
                  chipType,
                  { color: selected ? chipSelectedFg : textColor },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={[styles.list, { paddingBottom: contentBottom }]}>
        {library.status === 'loading' ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="small" color={colors.accentWine} />
            <Text style={[styles.emptyTitle, bodyType, { color: mutedColor }]}>
              {t('recipes.loadingLibrary')}
            </Text>
          </View>
        ) : library.status === 'offline' ? (
          <View style={styles.emptyState}>
            <View
              style={[
                styles.emptyIconWrap,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(43,38,35,0.06)',
                },
              ]}
            >
              <Feather name="wifi-off" size={28} color={mutedColor} />
            </View>
            <Text style={[styles.emptyTitle, bodyType, { color: textColor }]}>
              {t('recipes.offlineTitle')}
            </Text>
            <Text style={[styles.emptyHint, bodyType, { color: mutedColor }]}>
              {t('recipes.offlineBody')}
            </Text>
            <Pressable
              onPress={library.reload}
              style={[styles.retryBtn, { borderColor }]}
              accessibilityRole="button"
              accessibilityLabel={t('recipes.retry')}
              {...hoverAccessibilityProps(t('recipes.retry'), { role: 'button' })}
            >
              <Text style={[styles.retryLabel, { color: textColor }]}>{t('recipes.retry')}</Text>
            </Pressable>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <View
              style={[
                styles.emptyIconWrap,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(43,38,35,0.06)',
                },
              ]}
            >
              <Feather name="search" size={28} color={mutedColor} />
            </View>
            <Text style={[styles.emptyTitle, bodyType, { color: textColor }]}>
              {t('recipes.noResults')}
            </Text>
          </View>
        ) : (
          filtered.map((recipe) => (
            <RecipeRow
              key={recipe.id}
              recipe={recipe}
              textColor={textColor}
              mutedColor={mutedColor}
              borderColor={borderColor}
              isDark={isDark}
            />
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 14,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    padding: 0,
    margin: 0,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' as 'solid' } : null),
  },
  chipScrollOuter: {
    marginHorizontal: -2,
  },
  chipScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  chip: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  chipLabel: {
    fontWeight: '600',
  },
  list: {
    gap: 10,
    minHeight: 220,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    paddingHorizontal: 24,
    gap: 14,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    textAlign: 'center',
    fontWeight: '600',
    opacity: 0.9,
  },
  emptyHint: {
    textAlign: 'center',
    opacity: 0.85,
    maxWidth: 280,
  },
  retryBtn: {
    marginTop: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryLabel: {
    fontWeight: '600',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 10,
    paddingRight: 12,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: 'rgba(43,38,35,0.08)',
  },
  thumbFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
    gap: 6,
    paddingVertical: 2,
  },
  title: {
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexWrap: 'wrap',
  },
  metaText: {
    fontWeight: '500',
  },
  metaDot: {
    fontWeight: '600',
    opacity: 0.7,
  },
  chevron: {
    marginLeft: 2,
  },
});
