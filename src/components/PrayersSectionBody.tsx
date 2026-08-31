import { useCallback, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { AppScrollView } from './AppScrollView';
import { JesusPrayerRopeLink } from './JesusPrayerRopeLink';
import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import { useAppTranslation } from '../i18n/useAppTranslation';
import { useFontScale } from '../hooks/useFontScale';
import {
  PRAYER_ICONS,
  PRAYER_IDS,
  prayerParagraphs,
  prayerTitleKey,
  type PrayerId,
} from '../lib/prayers/prayers';
import { surfaceCard } from '../theme/cards';
import { radii } from '../theme/tokens';

type Props = {
  textColor: string;
  mutedColor: string;
  borderColor: string;
  isDark: boolean;
  bodyType: { fontSize: number; lineHeight: number };
  hintType: { fontSize: number; lineHeight: number };
  variant?: 'tab' | 'embedded';
  scrollBottomPadding?: number;
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
  expanded,
  onToggle,
  textColor,
  mutedColor,
  isDark,
  bodyType,
  hintType,
  isLast,
}: {
  id: PrayerId;
  expanded: boolean;
  onToggle: () => void;
  textColor: string;
  mutedColor: string;
  isDark: boolean;
  bodyType: { fontSize: number; lineHeight: number };
  hintType: { fontSize: number; lineHeight: number };
  isLast: boolean;
}) {
  const { t, lang } = useAppTranslation();
  const { text } = useFontScale();
  const paragraphs = prayerParagraphs(id, lang);
  const prayerType = text(14.5, 21);
  const rubricType = text(12.5, 18);
  const singleLine = paragraphs.length === 1 && !isRubricLine(paragraphs[0] ?? '');
  const title = t(prayerTitleKey(id));
  const rowDivider = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(43,38,35,0.06)';

  return (
    <View>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [styles.row, { opacity: pressed ? 0.78 : 1 }]}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        {...hoverAccessibilityProps(title, { role: 'button' })}
      >
        <MaterialCommunityIcons
          name={PRAYER_ICONS[id]}
          size={22}
          color={mutedColor}
          style={styles.leftIcon}
        />
        <View style={styles.rowCopy}>
          <Text style={[styles.rowTitle, bodyType, { color: textColor }]}>{title}</Text>
          {!expanded ? (
            <Text style={[styles.rowSummary, hintType, { color: mutedColor }]} numberOfLines={2}>
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
            styles.rowBody,
            {
              borderTopColor: rowDivider,
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
      {!isLast ? <View style={[styles.divider, { backgroundColor: rowDivider }]} /> : null}
    </View>
  );
}

export function PrayersSectionBody({
  textColor,
  mutedColor,
  borderColor,
  isDark,
  bodyType,
  hintType,
  variant = 'embedded',
  scrollBottomPadding = 24,
}: Props) {
  const [expandedId, setExpandedId] = useState<PrayerId | null>(null);

  const togglePrayer = useCallback((id: PrayerId) => {
    setExpandedId((current) => (current === id ? null : id));
  }, []);

  const content = (
    <>
      <View style={[styles.prayerCard, surfaceCard(isDark, { radius: radii.lg })]}>
        {PRAYER_IDS.map((id, index) => (
          <PrayerRow
            key={id}
            id={id}
            expanded={expandedId === id}
            onToggle={() => togglePrayer(id)}
            textColor={textColor}
            mutedColor={mutedColor}
            isDark={isDark}
            bodyType={bodyType}
            hintType={hintType}
            isLast={index === PRAYER_IDS.length - 1}
          />
        ))}
      </View>
      <JesusPrayerRopeLink
        textColor={textColor}
        mutedColor={mutedColor}
        borderColor={borderColor}
        isDark={isDark}
      />
    </>
  );

  if (variant === 'tab') {
    return (
      <View style={styles.root}>
        <AppScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollBottomPadding }]}
        >
          {content}
        </AppScrollView>
      </View>
    );
  }

  return <View style={styles.embeddedRoot}>{content}</View>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  embeddedRoot: {
    gap: 16,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: 16,
    paddingTop: 4,
  },
  prayerCard: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 56,
  },
  leftIcon: {
    marginRight: 2,
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  rowTitle: {
    fontWeight: '700',
    letterSpacing: 0.15,
  },
  rowSummary: {
    opacity: 0.88,
  },
  rowBody: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
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
});