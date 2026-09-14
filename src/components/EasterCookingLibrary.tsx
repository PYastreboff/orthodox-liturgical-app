import { useMemo, useState, type ReactNode } from 'react';
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View, type ColorValue, type StyleProp, type ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import { useAppTranslation } from '../i18n/useAppTranslation';
import { useFontScale } from '../hooks/useFontScale';
import {
  EASTER_FOODS,
  easterFoodSummary,
  easterFoodTitle,
  easterFoodTotalMinutes,
  type EasterFood,
} from '../lib/easter/easterCooking';
import {
  easterFoodImageSource,
  easterFoodImageUriFallback,
  easterFoodThumbSource,
} from '../lib/easter/easterCookingImages';
import { fuzzyNameScore } from '../lib/liturgical/fuzzySearch';
import { recipeDifficultyLabelKey } from '../lib/recipes/recipeLabels';
import { colors } from '../theme/tokens';

type Props = {
  textColor: ColorValue;
  mutedColor: ColorValue;
  borderColor: ColorValue;
  isDark: boolean;
  contentBottom?: number;
  header?: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

function EasterFoodRow({
  food,
  textColor,
  mutedColor,
  borderColor,
  isDark,
}: {
  food: EasterFood;
  textColor: ColorValue;
  mutedColor: ColorValue;
  borderColor: ColorValue;
  isDark: boolean;
}) {
  const { t, lang } = useAppTranslation();
  const { text } = useFontScale();
  const router = useRouter();
  const [imageFailed, setImageFailed] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);
  const [useFallbackImage, setUseFallbackImage] = useState(false);
  const title = easterFoodTitle(food, lang);
  const totalMinutes = easterFoodTotalMinutes(food);
  const thumbSource = easterFoodThumbSource(food.id);
  const fullSource = useFallbackImage
    ? (() => {
        const uri = easterFoodImageUriFallback(food.id);
        return uri ? { uri } : null;
      })()
    : easterFoodImageSource(food.id);
  const imageSource = thumbFailed ? fullSource : thumbSource;
  const titleType = text(16, 21);
  const metaType = text(13, 18);

  return (
    <Pressable
      onPress={() => router.push(`/easter-cooking/${food.id}`)}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: isDark ? colors.darkSurface : colors.card,
          borderColor,
          opacity: pressed ? 0.94 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${t('recipes.minutes', { n: totalMinutes })}, ${t(recipeDifficultyLabelKey(food.difficulty))}`}
      {...hoverAccessibilityProps(title, { role: 'button' })}
    >
      {imageSource && !imageFailed ? (
        <Image
          source={imageSource}
          style={styles.thumb}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
          onError={() => {
            if (!thumbFailed && easterFoodThumbSource(food.id)) {
              setThumbFailed(true);
              return;
            }
            if (!useFallbackImage && easterFoodImageUriFallback(food.id)) {
              setUseFallbackImage(true);
              return;
            }
            setImageFailed(true);
          }}
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
            {t(recipeDifficultyLabelKey(food.difficulty))}
          </Text>
        </View>
      </View>

      <Feather name="chevron-right" size={18} color={mutedColor} style={styles.chevron} />
    </Pressable>
  );
}

export function EasterCookingLibrary({
  textColor,
  mutedColor,
  borderColor,
  isDark,
  contentBottom = 40,
  header,
  style,
  contentContainerStyle,
}: Props) {
  const { t, lang } = useAppTranslation();
  const { text } = useFontScale();
  const bodyType = text(14, 20);
  const [query, setQuery] = useState('');
  const searchBg = isDark ? 'rgba(255,255,255,0.05)' : colors.card;
  const rowCount = EASTER_FOODS.length;

  const filtered = useMemo(() => {
    const q = query.trim();
    if (q.length < 2) return [...EASTER_FOODS];

    const scored = EASTER_FOODS.map((food) => {
      const haystacks = [
        easterFoodTitle(food, lang),
        food.title.en,
        food.title.ru,
        food.title.el,
        easterFoodSummary(food, lang),
        food.summary.en,
        food.meaning[lang] ?? food.meaning.en,
      ];
      let score = 0;
      for (const hay of haystacks) {
        score = Math.max(score, fuzzyNameScore(hay, q));
      }
      return { food, score };
    })
      .filter((row) => row.score > 0)
      .sort((a, b) => b.score - a.score || a.food.title.en.localeCompare(b.food.title.en));

    return scored.map((row) => row.food);
  }, [lang, query]);

  const renderHeader = () => (
    <View style={styles.headerBlock}>
      {header}
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
    </View>
  );

  const renderEmpty = () => (
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
  );

  return (
    <FlatList
      data={filtered}
      keyExtractor={(food) => food.id}
      renderItem={({ item }) => (
        <EasterFoodRow
          food={item}
          textColor={textColor}
          mutedColor={mutedColor}
          borderColor={borderColor}
          isDark={isDark}
        />
      )}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmpty}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      contentContainerStyle={[styles.listContent, { paddingBottom: contentBottom }, contentContainerStyle]}
      style={style}
      contentInsetAdjustmentBehavior="never"
      keyboardShouldPersistTaps="handled"
      windowSize={7}
      maxToRenderPerBatch={12}
      initialNumToRender={12}
      removeClippedSubviews={Platform.OS !== 'web' && rowCount > 12}
      accessibilityLabel={t('easterCooking.pageTitle')}
    />
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    gap: 14,
    paddingBottom: 14,
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
  listContent: {
    flexGrow: 1,
    minHeight: 220,
  },
  separator: {
    height: 10,
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
