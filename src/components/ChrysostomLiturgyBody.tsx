import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTranslation } from '../i18n/useAppTranslation';
import { useFontScale } from '../hooks/useFontScale';
import { useChrysostomLiturgy } from '../hooks/useChrysostomLiturgy';
import {
  CHRYSOSTOM_SECTION_IDS,
  chrysostomParagraphs,
  chrysostomTitleKey,
  type ChrysostomSectionId,
} from '../lib/liturgy/chrysostomLiturgy';

type Props = {
  textColor: string;
  mutedColor: string;
  borderColor: string;
  isDark: boolean;
  bodyType: { fontSize: number; lineHeight: number };
  hintType: { fontSize: number; lineHeight: number };
};

const LITURGY_SERIF = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'Georgia, "Times New Roman", serif',
});

function isRubricLine(paragraph: string): boolean {
  const trimmed = paragraph.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('(') && trimmed.endsWith(')')) return true;
  if (/^(People|Deacon|Priest|Reader|Choir)(\s*\([^)]*\))?\s*:/i.test(trimmed)) return false;
  if (trimmed.endsWith(':')) return true;
  return false;
}

function LiturgySectionBlock({
  id,
  textColor,
  mutedColor,
  isDark,
  bodyType,
  isFirst,
}: {
  id: ChrysostomSectionId;
  textColor: string;
  mutedColor: string;
  isDark: boolean;
  bodyType: { fontSize: number; lineHeight: number };
  isFirst: boolean;
}) {
  const { t, lang } = useAppTranslation();
  const { text } = useFontScale();
  const paragraphs = chrysostomParagraphs(id, lang);
  const liturgyType = text(14.5, 21);
  const rubricType = text(12.5, 18);
  const title = t(chrysostomTitleKey(id));

  return (
    <View
      style={[
        styles.section,
        !isFirst
          ? {
              borderTopWidth: StyleSheet.hairlineWidth,
              borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(43,38,35,0.1)',
            }
          : null,
      ]}
    >
      <Text style={[styles.sectionTitle, bodyType, { color: textColor }]}>{title}</Text>
      {paragraphs.map((paragraph, index) => {
        const rubric = isRubricLine(paragraph);
        return (
          <Text
            key={`${id}-${index}`}
            style={[
              rubric ? styles.rubric : styles.paragraph,
              rubric ? rubricType : liturgyType,
              {
                color: rubric ? mutedColor : textColor,
                fontFamily: rubric ? undefined : LITURGY_SERIF,
              },
              index === 0 ? null : rubric ? styles.rubricSpaced : styles.paragraphSpaced,
            ]}
          >
            {paragraph}
          </Text>
        );
      })}
    </View>
  );
}

export function ChrysostomLiturgyBody({
  textColor,
  mutedColor,
  borderColor,
  isDark,
  bodyType,
  hintType,
}: Props) {
  const { t } = useAppTranslation();
  const liturgy = useChrysostomLiturgy();

  return (
    <View style={styles.list}>
      <Text style={[styles.intro, hintType, { color: mutedColor }]}>{t('liturgy.chrysostom.intro')}</Text>
      {liturgy.status === 'loading' ? (
        <View style={styles.centered}>
          <ActivityIndicator color={mutedColor} />
          <Text style={[hintType, { color: mutedColor, marginTop: 8 }]}>
            {t('liturgy.chrysostom.loading')}
          </Text>
        </View>
      ) : liturgy.status === 'offline' ? (
        <View style={styles.centered}>
          <Text style={[bodyType, { color: textColor }]}>{t('liturgy.chrysostom.offline')}</Text>
          <Pressable onPress={liturgy.reload} accessibilityRole="button">
            <Text style={[bodyType, styles.retry, { color: textColor }]}>{t('recipes.retry')}</Text>
          </Pressable>
        </View>
      ) : (
        <View
          style={[
            styles.panel,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.045)' : 'rgba(43,38,35,0.035)',
              borderColor,
            },
          ]}
        >
          {CHRYSOSTOM_SECTION_IDS.map((id, index) => (
            <LiturgySectionBlock
              key={id}
              id={id}
              textColor={textColor}
              mutedColor={mutedColor}
              isDark={isDark}
              bodyType={bodyType}
              isFirst={index === 0}
            />
          ))}
        </View>
      )}
      <Text style={[styles.disclaimer, hintType, { color: mutedColor }]}>
        {t('liturgy.chrysostom.disclaimer')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  intro: {
    opacity: 0.92,
    lineHeight: 20,
  },
  centered: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 4,
  },
  retry: {
    fontWeight: '600',
    marginTop: 8,
    textDecorationLine: 'underline',
  },
  disclaimer: {
    opacity: 0.8,
    lineHeight: 18,
    marginTop: 2,
  },
  panel: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  section: {
    paddingTop: 14,
  },
  sectionTitle: {
    fontWeight: '700',
    letterSpacing: 0.15,
    marginBottom: 10,
  },
  paragraph: {
    opacity: 0.96,
    letterSpacing: 0.12,
  },
  paragraphSpaced: {
    marginTop: 9,
  },
  rubric: {
    fontStyle: 'italic',
    fontWeight: '600',
    opacity: 0.9,
    letterSpacing: 0.2,
  },
  rubricSpaced: {
    marginTop: 12,
  },
});
