import { useRouter, type Href } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import { useAppTranslation } from '../i18n/useAppTranslation';
import { useFontScale } from '../hooks/useFontScale';
import type { ReadingExcerpt } from '../lib/liturgical/hymnExcerpt';
import { usePreferences } from '../state/PreferencesContext';
import { cardElevation } from '../theme/cards';
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
  const cardBg = isDark ? colors.darkSurface : colors.card;
  const muted = isDark ? '#a39e98' : colors.muted;
  const accent = isDark ? colors.tabActiveDark : colors.accentWine;
  const accentSoft = isDark ? 'rgba(232,201,122,0.14)' : 'rgba(107,45,60,0.1)';
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
        cardElevation(isDark),
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
      <View
        style={[
          styles.card,
          {
            backgroundColor: cardBg,
            borderColor: isDark ? colors.darkBorder : borderColor,
          },
        ]}
      >
        <View style={styles.body}>
          <View style={styles.headerRow}>
            <View style={[styles.iconBadge, { backgroundColor: accentSoft }]}>
              <SectionIcon name="daily-gospel" color={accent} size={18} />
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.eyebrow, text(11, 14), { color: accent }]}>
                {t('today.dailyFocusEyebrow')}
              </Text>
              {!loading && gospel?.citation ? (
                <Text style={[styles.citation, text(13, 17), { color: textColor }]} numberOfLines={1}>
                  {gospel.citation}
                </Text>
              ) : null}
            </View>
            <Feather name="arrow-up-right" size={18} color={muted} />
          </View>

          {loading ? (
            <Text style={[styles.loadingLine, text(15, 22), { color: muted }]}>
              {t('today.dailyFocusLoading')}
            </Text>
          ) : gospel ? (
            <Text
              style={[styles.passage, text(16, 25), { color: textColor }]}
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
              <Chip label={fastLabel} textColor={textColor} isDark={isDark} text={text} />
              {toneLabel ? (
                <Chip label={toneLabel} textColor={textColor} isDark={isDark} text={text} />
              ) : null}
              {commemoration ? (
                <Chip
                  label={commemoration}
                  textColor={textColor}
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
  isDark,
  text,
  wide = false,
}: {
  label: string;
  textColor: string;
  isDark: boolean;
  text: (size: number, lineHeight: number) => { fontSize: number; lineHeight: number };
  wide?: boolean;
}) {
  return (
    <View
      style={[
        styles.chip,
        wide ? styles.chipWide : null,
        { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(107,45,60,0.07)' },
      ]}
    >
      <Text style={[styles.chipText, text(11, 14), { color: textColor }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    marginTop: 16,
    marginBottom: 6,
  },
  card: {
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  body: {
    paddingVertical: 18,
    paddingHorizontal: 18,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  eyebrow: {
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  citation: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  loadingLine: {
    fontStyle: 'italic',
  },
  passage: {
    fontFamily: SCRIPTURE_SERIF,
    letterSpacing: 0.15,
  },
  emptyPassage: {
    fontStyle: 'italic',
  },
  gospelLabel: {
    marginTop: -6,
    fontStyle: 'italic',
  },
  footer: {
    gap: 10,
    marginTop: 2,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    maxWidth: '48%',
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
    letterSpacing: 0.2,
  },
});
