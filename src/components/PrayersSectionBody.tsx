import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import { useAppTranslation } from '../i18n/useAppTranslation';
import { useFontScale } from '../hooks/useFontScale';
import {
  PRAYER_IDS,
  prayerParagraphs,
  type PrayerId,
} from '../lib/prayers/prayers';

type Props = {
  enabledPrayers: readonly PrayerId[];
  textColor: string;
  mutedColor: string;
  borderColor: string;
  isDark: boolean;
  bodyType: { fontSize: number; lineHeight: number };
  hintType: { fontSize: number; lineHeight: number };
};

const PRAYER_SERIF = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'Georgia, "Times New Roman", serif',
});

/** Rubric / stage direction — not the prayer itself. */
function isRubricLine(paragraph: string): boolean {
  const trimmed = paragraph.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('(') && trimmed.endsWith(')')) return true;
  if (trimmed.endsWith(':')) return true;
  return false;
}

function PrayerRow({
  id,
  textColor,
  mutedColor,
  borderColor,
  isDark,
  bodyType,
  hintType,
}: {
  id: PrayerId;
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
  const paragraphs = prayerParagraphs(id, lang);
  const prayerType = text(14.5, 21);
  const rubricType = text(12.5, 18);
  const singleLine = paragraphs.length === 1 && !isRubricLine(paragraphs[0] ?? '');

  return (
    <View
      style={[
        styles.prayerCard,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.045)' : 'rgba(43,38,35,0.035)',
          borderColor,
        },
      ]}
    >
      <Pressable
        onPress={() => setExpanded((value) => !value)}
        style={styles.prayerHeader}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        {...hoverAccessibilityProps(t(`prayers.${id}.title`), { role: 'button' })}
      >
        <View style={styles.prayerHeaderText}>
          <Text style={[styles.prayerTitle, bodyType, { color: textColor }]}>
            {t(`prayers.${id}.title`)}
          </Text>
          {!expanded ? (
            <Text style={[styles.prayerSummary, hintType, { color: mutedColor }]} numberOfLines={2}>
              {t(`prayers.${id}.summary`)}
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
            styles.prayerBody,
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
                  rubric ? styles.rubric : styles.prayerParagraph,
                  rubric ? rubricType : prayerType,
                  {
                    color: rubric ? mutedColor : textColor,
                    fontFamily: rubric ? undefined : PRAYER_SERIF,
                  },
                  index === 0 ? null : rubric ? styles.rubricSpaced : styles.prayerParagraphSpaced,
                  singleLine ? styles.prayerCentered : null,
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

export function PrayersSectionBody({
  enabledPrayers,
  textColor,
  mutedColor,
  borderColor,
  isDark,
  bodyType,
  hintType,
}: Props) {
  const { t } = useAppTranslation();
  const ordered = PRAYER_IDS.filter((id) => enabledPrayers.includes(id));

  if (ordered.length === 0) {
    return (
      <Text style={[styles.empty, hintType, { color: mutedColor }]}>
        {t('prayers.emptyEnabled')}
      </Text>
    );
  }

  return (
    <View style={styles.list}>
      {ordered.map((id) => (
        <PrayerRow
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
      <Text style={[styles.footnote, hintType, { color: mutedColor }]}>
        {t('prayers.footnote')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  empty: {
    opacity: 0.9,
  },
  prayerCard: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  prayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  prayerHeaderText: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  prayerTitle: {
    fontWeight: '700',
    letterSpacing: 0.15,
  },
  prayerSummary: {
    opacity: 0.88,
  },
  prayerBody: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  prayerParagraph: {
    opacity: 0.96,
    letterSpacing: 0.12,
  },
  prayerParagraphSpaced: {
    marginTop: 9,
  },
  prayerCentered: {
    textAlign: 'center',
    paddingVertical: 4,
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
  footnote: {
    marginTop: 2,
    opacity: 0.8,
  },
});
