import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { useState } from 'react';
import {
  Image,
  type ImageSourcePropType,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';

import { useFontScale } from '../hooks/useFontScale';
import { useLayoutSafeAreaInsets } from '../hooks/useLayoutSafeAreaInsets';
import { usePhoneLayout } from '../hooks/usePhoneLayout';
import { useScreenSafePadding } from '../hooks/useScreenSafePadding';
import { useAppTranslation } from '../i18n/useAppTranslation';
import {
  recipeIngredients,
  recipeNotes,
  recipeServingSize,
  recipeSteps,
  recipeSummary,
  recipeTips,
  recipeTitle,
  recipeTotalMinutes,
  type FastingRecipe,
} from '../lib/recipes/fastingRecipes';
import {
  recipeCategoryLabelKey,
  recipeDifficultyLabelKey,
} from '../lib/recipes/recipeLabels';
import { recipeImageSource } from '../lib/recipes/recipeImages';
import { useResolvedColorScheme } from '../theme/useResolvedColorScheme';
import { colors } from '../theme/tokens';

const TITLE_SERIF = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'Georgia, "Times New Roman", serif',
});

const CONTENT_MAX_WIDTH = 720;
const CONTENT_PAD = 20;

type Props = {
  recipe: FastingRecipe;
  /** Route when there is no back stack (default `/recipes`). */
  backFallbackRoute?: string;
  /** Override hero/list image resolution (default fasting recipe assets). */
  resolveImageSource?: (id: string) => ImageSourcePropType | null;
  /** Alternate image host when the primary URI fails to load. */
  resolveImageUriFallback?: (id: string) => string | null;
  /** Optional eyebrow above the title instead of the recipe category label. */
  eyebrowLabel?: string;
};

function StatChip({
  icon,
  label,
  mutedColor,
  isDark,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  mutedColor: string;
  isDark: boolean;
}) {
  return (
    <View
      style={[
        styles.statChip,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(107,45,60,0.07)',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(107,45,60,0.12)',
        },
      ]}
    >
      <Feather name={icon} size={14} color={isDark ? colors.tabActiveDark : colors.accentWine} />
      <Text style={[styles.statChipLabel, { color: mutedColor }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function RecipeDetailView({
  recipe,
  backFallbackRoute = '/recipes',
  resolveImageSource = recipeImageSource,
  resolveImageUriFallback,
  eyebrowLabel,
}: Props) {
  const theme = useTheme();
  const router = useRouter();
  const { t, lang } = useAppTranslation();
  const isDark = useResolvedColorScheme() === 'dark';
  const phone = usePhoneLayout();
  const screenSafe = useScreenSafePadding();
  const insets = useLayoutSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { text } = useFontScale();
  const [imageFailed, setImageFailed] = useState(false);
  const [useFallbackImage, setUseFallbackImage] = useState(false);

  const muted = isDark ? '#a39e98' : colors.muted;
  const textColor = theme.colors.text;
  const title = recipeTitle(recipe, lang);
  const summary = recipeSummary(recipe, lang);
  const ingredients = recipeIngredients(recipe, lang);
  const steps = recipeSteps(recipe, lang);
  const tips = recipeTips(recipe, lang);
  const notes = recipeNotes(recipe, lang);
  const servingSize = recipeServingSize(recipe, lang);
  const totalMinutes = recipeTotalMinutes(recipe);
  const imageSource = useFallbackImage
    ? (() => {
        const uri = resolveImageUriFallback?.(recipe.id) ?? null;
        return uri ? { uri } : null;
      })()
    : resolveImageSource(recipe.id);
  const heroHeight = phone
    ? Math.min(220, Math.round(width * 0.55))
    : Math.min(280, Math.round(width * 0.28));
  const contentPadLeft = Math.max(screenSafe.paddingLeft, CONTENT_PAD);
  const contentPadRight = Math.max(screenSafe.paddingRight, CONTENT_PAD);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(backFallbackRoute);
  };

  const contentColumnStyle = {
    maxWidth: phone ? undefined : CONTENT_MAX_WIDTH,
    width: '100%' as const,
    alignSelf: 'center' as const,
    paddingLeft: contentPadLeft,
    paddingRight: contentPadRight,
  };

  return (
    <>
      <Head>
        <title>{`${title} - OrthoDaily`}</title>
        <meta name="description" content={summary} />
      </Head>
      <View style={[styles.page, { backgroundColor: theme.colors.background }]}>
        <Pressable
          onPress={goBack}
          style={[
            styles.backFab,
            {
              top: screenSafe.paddingTop + 10,
              left: Math.max(screenSafe.paddingLeft, 14),
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={t('recipes.back')}
          hitSlop={8}
        >
          <Feather
            name="chevron-left"
            size={22}
            color="#fff"
            style={styles.backFabIcon}
          />
        </Pressable>
        <ScrollView
          bounces={false}
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 36 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.hero, { height: heroHeight }]}>
            {imageSource && !imageFailed ? (
              <Image
                source={imageSource}
                style={styles.heroImage}
                resizeMode="cover"
                accessibilityIgnoresInvertColors
                onError={() => {
                  if (!useFallbackImage && resolveImageUriFallback?.(recipe.id)) {
                    setUseFallbackImage(true);
                    return;
                  }
                  setImageFailed(true);
                }}
              />
            ) : (
              <View
                style={[
                  styles.heroImage,
                  {
                    backgroundColor: isDark ? '#2a1c1e' : '#e8d5d8',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                ]}
              >
                <Feather name="coffee" size={48} color={muted} />
              </View>
            )}
            <LinearGradient
              colors={
                isDark
                  ? ['rgba(18,16,14,0.55)', 'transparent', 'rgba(18,16,14,0.92)']
                  : ['rgba(30,26,22,0.35)', 'transparent', 'rgba(245,240,232,0.98)']
              }
              locations={[0, 0.4, 1]}
              style={styles.heroImage}
            />
            <View style={styles.heroTitleBlock}>
              <View style={contentColumnStyle}>
                <Text style={styles.heroEyebrow} numberOfLines={1}>
                  {eyebrowLabel ?? t(recipeCategoryLabelKey(recipe.category))}
                </Text>
                <Text
                  style={[
                    styles.heroTitle,
                    phone ? styles.heroTitlePhone : null,
                    { fontFamily: TITLE_SERIF },
                  ]}
                >
                  {title}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.sheet,
              contentColumnStyle,
              {
                backgroundColor: theme.colors.background,
                marginTop: -28,
              },
            ]}
          >
            <Text style={[styles.summary, text(16, 24), { color: textColor }]}>{summary}</Text>
            {notes ? (
              <Text style={[styles.notes, text(13, 19), { color: muted }]}>{notes}</Text>
            ) : null}

            <View style={styles.statsRow}>
              <StatChip
                icon="clock"
                label={t('recipes.totalTime', { n: totalMinutes })}
                mutedColor={textColor}
                isDark={isDark}
              />
              <StatChip
                icon="users"
                label={t('recipes.servings', { n: recipe.servings })}
                mutedColor={textColor}
                isDark={isDark}
              />
              <StatChip
                icon="trending-up"
                label={t(recipeDifficultyLabelKey(recipe.difficulty))}
                mutedColor={textColor}
                isDark={isDark}
              />
            </View>
            <Text style={[styles.timingDetail, text(13, 18), { color: muted }]}>
              {[
                recipe.prepMinutes > 0
                  ? t('recipes.prepOnly', { n: recipe.prepMinutes })
                  : null,
                recipe.cookMinutes > 0
                  ? t('recipes.cookOnly', { n: recipe.cookMinutes })
                  : null,
                t('recipes.yield', { servings: recipe.servings, size: servingSize }),
              ]
                .filter(Boolean)
                .join(' · ')}
            </Text>

            <Text style={[styles.sectionTitle, { color: textColor, fontFamily: TITLE_SERIF }]}>
              {t('recipes.ingredients')}
            </Text>
            <Text style={[styles.sectionHint, text(13, 18), { color: muted }]}>
              {t('recipes.makes', { servings: recipe.servings, size: servingSize })}
            </Text>
            <View
              style={[
                styles.panel,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(43,38,35,0.035)',
                  borderColor: isDark ? colors.darkBorder : colors.border,
                },
              ]}
            >
              {ingredients.map((line, index) => (
                <View
                  key={`${recipe.id}-ing-${index}`}
                  style={[
                    styles.ingredientRow,
                    index < ingredients.length - 1
                      ? {
                          borderBottomWidth: StyleSheet.hairlineWidth,
                          borderBottomColor: isDark
                            ? 'rgba(255,255,255,0.08)'
                            : 'rgba(43,38,35,0.08)',
                        }
                      : null,
                  ]}
                >
                  <View
                    style={[
                      styles.bullet,
                      { backgroundColor: isDark ? colors.tabActiveDark : colors.accentWine },
                    ]}
                  />
                  <Text style={[styles.ingredientText, text(15, 22), { color: textColor }]}>
                    {line}
                  </Text>
                </View>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { color: textColor, fontFamily: TITLE_SERIF }]}>
              {t('recipes.steps')}
            </Text>
            <View style={styles.stepsList}>
              {steps.map((line, index) => (
                <View key={`${recipe.id}-step-${index}`} style={styles.stepRow}>
                  <View
                    style={[
                      styles.stepBadge,
                      {
                        backgroundColor: isDark ? 'rgba(232,201,122,0.16)' : 'rgba(107,45,60,0.1)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepBadgeText,
                        { color: isDark ? colors.tabActiveDark : colors.accentWine },
                      ]}
                    >
                      {index + 1}
                    </Text>
                  </View>
                  <Text style={[styles.stepText, text(15, 23), { color: textColor }]}>{line}</Text>
                </View>
              ))}
            </View>

            {tips.length ? (
              <>
                <Text style={[styles.sectionTitle, { color: textColor, fontFamily: TITLE_SERIF }]}>
                  {t('recipes.tips')}
                </Text>
                <View style={styles.tipsList}>
                  {tips.map((line, index) => (
                    <View key={`${recipe.id}-tip-${index}`} style={styles.tipRow}>
                      <Text style={[styles.tipBullet, { color: muted }]}>•</Text>
                      <Text style={[styles.tipText, text(15, 22), { color: textColor }]}>{line}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : null}
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    width: '100%',
  },
  scroll: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    width: '100%',
    flexGrow: 1,
  },
  hero: {
    width: '100%',
    alignSelf: 'stretch',
    overflow: 'hidden',
    backgroundColor: '#2a1c1e',
    position: 'relative',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    ...(Platform.OS === 'web'
      ? ({
          objectFit: 'cover',
        } as object)
      : null),
  },
  backFab: {
    position: Platform.OS === 'web' ? ('fixed' as 'absolute') : 'absolute',
    zIndex: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(20,16,14,0.55)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  backFabIcon: {
    marginLeft: -2,
  },
  heroTitleBlock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 36,
    zIndex: 1,
  },
  heroEyebrow: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  heroTitlePhone: {
    fontSize: 24,
    lineHeight: 30,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 22,
  },
  summary: {
    fontWeight: '500',
    letterSpacing: 0.1,
    marginBottom: 8,
  },
  notes: {
    fontStyle: 'italic',
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statChipLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  timingDetail: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 8,
  },
  sectionHint: {
    marginBottom: 12,
  },
  panel: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: 22,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  bullet: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginTop: 7,
  },
  ingredientText: {
    flex: 1,
    minWidth: 0,
  },
  stepsList: {
    gap: 16,
    marginBottom: 22,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepBadgeText: {
    fontSize: 14,
    fontWeight: '800',
  },
  stepText: {
    flex: 1,
    minWidth: 0,
    paddingTop: 4,
  },
  tipsList: {
    gap: 12,
    marginBottom: 20,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  tipBullet: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },
  tipText: {
    flex: 1,
    minWidth: 0,
  },
});
