import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import { useAppTranslation } from '../i18n/useAppTranslation';
import { useFontScale } from '../hooks/useFontScale';
import {
  CHRYSOSTOM_SECTION_IDS,
  chrysostomParagraphs,
  chrysostomSummaryKey,
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
  if (trimmed.endsWith(':')) return true;
  return false;
}

function LiturgySectionRow({
  id,
  textColor,
  mutedColor,
  borderColor,
  isDark,
  bodyType,
  hintType,
}: {
  id: ChrysostomSectionId;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  isDark: boolean;
  bodyType: { fontSize: number; lineHeight: number };
  hintType: { fontSize: number; lineHeight: number };
}) {
  const { t, lang } = useAppTranslation();
  const { text } = useFontScale();
  const [expanded, setExpanded] = useState(false);
  const paragraphs = chrysostomParagraphs(id, lang);
  const liturgyType = text(14.5, 21);
  const rubricType = text(12.5, 18);
  const title = t(chrysostomTitleKey(id));
  const summary = t(chrysostomSummaryKey(id));

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.045)' : 'rgba(43,38,35,0.035)',
          borderColor,
        },
      ]}
    >
      <Pressable
        onPress={() => setExpanded((value) => !value)}
        style={styles.header}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        {...hoverAccessibilityProps(title, { role: 'button' })}
      >
        <View style={styles.headerText}>
          <Text style={[styles.title, bodyType, { color: textColor }]}>{title}</Text>
          {!expanded ? (
            <Text style={[styles.summary, hintType, { color: mutedColor }]} numberOfLines={2}>
              {summary}
            </Text>
          ) : null}
        </View>
        <Feather
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={mutedColor}
        />
      </Pressable>
      {expanded ? (
        <View
          style={[
            styles.body,
            {
              borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(43,38,35,0.08)',
            },
          ]}
        >
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
      ) : null}
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

  return (
    <View style={styles.list}>
      <Text style={[styles.intro, hintType, { color: mutedColor }]}>{t('liturgy.chrysostom.intro')}</Text>
      {CHRYSOSTOM_SECTION_IDS.map((id) => (
        <LiturgySectionRow
          key={id}
          id={id}
          textColor={textColor}
          mutedColor={mutedColor}
          borderColor={borderColor}
          isDark={isDark}
          bodyType={bodyType}
          hintType={hintType}
        />
      ))}
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
  disclaimer: {
    opacity: 0.8,
    lineHeight: 18,
    marginTop: 2,
  },
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  title: {
    fontWeight: '700',
    letterSpacing: 0.15,
  },
  summary: {
    opacity: 0.88,
  },
  body: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
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
