import { useRouter, type Href } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import { useAppTranslation } from '../i18n/useAppTranslation';
import { useFontScale } from '../hooks/useFontScale';
import type { ReadingExcerpt } from '../lib/liturgical/hymnExcerpt';
import { usePreferences } from '../state/PreferencesContext';
import { useLiturgicalVestmentAccent } from '../state/VestmentAccentContext';
import { cardElevation, chipSurface, iconBadgeSurface, surfaceCard } from '../theme/cards';
import { radii, typography } from '../theme/tokens';
import { colors } from '../theme/tokens';
import { SectionIcon } from './SectionIcon';

type Props = {
  gospel: ReadingExcerpt | null;
  fastLabel: string;
  toneLabel: string;
  saintName: string | null;
  feastName: string | null;
  textColor: string;
  borderColor: string;
  isDark: boolean;
  loading?: boolean;
};

const SCRIPTURE_SERIF = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'Georgia, "Times New Roman", serif',
});

export function TodayDailyFocus({
  gospel,
  fastLabel,
  toneLabel,
  saintName,
  feastName,
  textColor,
  borderColor,
  isDark,
  loading = false,
}: Props) {
  const { t } = useAppTranslation();
  const { text } = useFontScale();
  const router = useRouter();
  const { setReadingsCategoryFilter } = usePreferences();
  const vestmentAccent = useLiturgicalVestmentAccent();
  const muted = isDark ? '#9a948d' : colors.muted;
  const accent = vestmentAccent.accent;
  const commemoration = feastName ?? saintName;
  const hasContent = loading || gospel || commemoration;

  if (!hasContent) {
    return null;
  }

  const openGospel = () => {
    setReadingsCategoryFilter('gospel');
    router.push('/day/readings' as Href);
  };

  return (
    <Pressable
      onPress={openGospel}
      style={({ pressed }) => [
        styles.shell,
        surfaceCard(isDark, { radius: radii.xxl, elevated: true }),
        {
          opacity: pressed ? 0.97 : 1,
          transform: [{ scale: pressed ? 0.992 : 1 }],
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={t('today.dailyFocusA11y')}
      accessibilityHint={t('today.dailyFocusHint')}
      {...hoverAccessibilityProps(t('today.dailyFocusA11y'), { role: 'button' })}
    >
      <View style={styles.card}>
        <View style={styles.body}>
          <View style={styles.headerRow}>
            <View style={iconBadgeSurface(vestmentAccent.accentSoft)}>
              <SectionIcon name="daily-gospel" color={accent} size={20} />
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.eyebrow, text(typography.eyebrow.fontSize, typography.eyebrow.lineHeight), { color: accent }]}>
                {t('today.dailyFocusEyebrow')}
              </Text>
              {!loading && gospel?.citation ? (
                <Text style={[styles.citation, text(14, 18), { color: textColor }]} numberOfLines={1}>
                  {gospel.citation}
                </Text>
              ) : null}
            </View>
            <View style={[styles.arrowBadge, { backgroundColor: vestmentAccent.accentMuted }]}>
              <Feather name="arrow-up-right" size={16} color={muted} />
            </View>
          </View>

          {loading ? (
            <Text style={[styles.loadingLine, text(15, 22), { color: muted }]}>
              {t('today.dailyFocusLoading')}
            </Text>
          ) : gospel ? (
            <Text
              style={[styles.passage, text(16, 26), { color: textColor }]}
              numberOfLines={6}
            >
              {gospel.excerpt}
            </Text>
          ) : (
            <Text style={[styles.emptyPassage, text(15, 22), { color: muted }]}>
              {t('today.dailyFocusNoGospel')}
            </Text>
          )}

          {!loading && gospel?.label ? (
            <Text style={[styles.gospelLabel, text(12, 16), { color: muted }]} numberOfLines={1}>
              {gospel.label}
            </Text>
          ) : null}

          <View style={styles.footer}>
            <View style={styles.chipRow}>
              <Chip label={fastLabel} textColor={textColor} accentMuted={vestmentAccent.accentMuted} isDark={isDark} text={text} />
              {toneLabel ? (
                <Chip label={toneLabel} textColor={textColor} accentMuted={vestmentAccent.accentMuted} isDark={isDark} text={text} />
              ) : null}
              {commemoration ? (
                <Chip
                  label={commemoration}
                  textColor={textColor}
                  accentMuted={vestmentAccent.accentMuted}
                  isDark={isDark}
                  text={text}
                  wide
                />
              ) : null}
            </View>
            <Text style={[styles.readMore, text(13, 18), { color: accent }]}>
              {t('today.dailyFocusReadMore')}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function Chip({
  label,
  textColor,
  accentMuted,
  isDark,
  text,
  wide = false,
}: {
  label: string;
  textColor: string;
  accentMuted: string;
  isDark: boolean;
  text: (size: number, lineHeight: number) => { fontSize: number; lineHeight: number };
  wide?: boolean;
}) {
  return (
    <View style={[chipSurface(accentMuted, isDark), wide ? styles.chipWide : null]}>
      <Text style={[styles.chipText, text(11, 14), { color: textColor }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    marginTop: 18,
    marginBottom: 8,
  },
  card: {
    position: 'relative',
  },
  body: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  arrowBadge: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontWeight: typography.eyebrow.fontWeight,
    textTransform: typography.eyebrow.textTransform,
    letterSpacing: typography.eyebrow.letterSpacing,
  },
  citation: {
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  loadingLine: {
    fontStyle: 'italic',
  },
  passage: {
    fontFamily: SCRIPTURE_SERIF,
    letterSpacing: 0.12,
  },
  emptyPassage: {
    fontStyle: 'italic',
  },
  gospelLabel: {
    marginTop: -8,
    fontStyle: 'italic',
  },
  footer: {
    gap: 12,
    marginTop: 2,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipWide: {
    maxWidth: '100%',
    flexShrink: 1,
  },
  chipText: {
    fontWeight: '600',
  },
  readMore: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
