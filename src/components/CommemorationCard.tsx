import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import { useAppTranslation } from '../i18n/useAppTranslation';
import { useFontScale } from '../hooks/useFontScale';
import type { CommemorationEntry } from '../lib/liturgical/commemorations';
import { colors, radii } from '../theme/tokens';

type Props = {
  entry: CommemorationEntry;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  isDark: boolean;
  bodyType: { fontSize: number; lineHeight: number };
  hintType: { fontSize: number; lineHeight: number };
  /** Primary great feast on this day — red styling matching Date & Liturgical Day. */
  isPrimaryGreatFeast?: boolean;
};

function hasLifeAccount(entry: CommemorationEntry): boolean {
  return Boolean(entry.body?.trim());
}

function collapsedSummary(entry: CommemorationEntry): string | null {
  const story = entry.storyTitle?.trim();
  if (story && story !== entry.name.trim()) return story;
  const body = entry.body?.trim();
  if (!body) return null;
  const firstLine = body.split(/\n+/)[0]?.trim() ?? '';
  return firstLine || null;
}

export function CommemorationCard({
  entry,
  textColor,
  mutedColor,
  borderColor,
  isDark,
  hintType,
  isPrimaryGreatFeast = false,
}: Props) {
  const { t } = useAppTranslation();
  const { text } = useFontScale();
  const [expanded, setExpanded] = useState(false);
  const collapsible = hasLifeAccount(entry);
  const summary = collapsedSummary(entry);
  const nameColor = isPrimaryGreatFeast ? colors.feastBorder : textColor;
  const cardBg = isPrimaryGreatFeast
    ? isDark
      ? 'rgba(139,46,60,0.22)'
      : 'rgba(139,46,60,0.1)'
    : isDark
      ? 'rgba(255,255,255,0.045)'
      : 'rgba(43,38,35,0.035)';
  const cardBorder = isPrimaryGreatFeast
    ? isDark
      ? colors.feastHoverBorderDark
      : colors.feastBorder
    : borderColor;
  const titleType = text(17, 24);
  const storyType = text(13, 18);
  const lifeType = text(14, 21);
  const entryIconColor = isPrimaryGreatFeast ? colors.feastBorder : mutedColor;
  const entryIconName =
    entry.kind === 'feast' ? 'star-four-points-outline' : 'account-outline';

  const header = (
    <>
      <MaterialCommunityIcons name={entryIconName} size={22} color={entryIconColor} />
      <View style={styles.headerText}>
        <Text style={[styles.title, titleType, { color: nameColor }]}>{entry.name}</Text>
        {!expanded && summary ? (
          <Text style={[styles.summary, hintType, { color: mutedColor }]} numberOfLines={2}>
            {summary}
          </Text>
        ) : null}
      </View>
      {collapsible ? (
        <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={mutedColor} />
      ) : null}
    </>
  );

  return (
    <View
      style={[
        styles.card,
        isPrimaryGreatFeast ? styles.cardGreatFeast : null,
        { backgroundColor: cardBg, borderColor: cardBorder },
      ]}
    >
      {collapsible ? (
        <Pressable
          onPress={() => setExpanded((prev) => !prev)}
          style={styles.header}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          {...hoverAccessibilityProps(
            expanded
              ? t('commemorations.collapse', { name: entry.name })
              : t('commemorations.expand', { name: entry.name }),
            { role: 'button' },
          )}
        >
          {header}
        </Pressable>
      ) : (
        <View style={styles.header}>{header}</View>
      )}
      {collapsible && expanded ? (
        <View
          style={[
            styles.body,
            {
              borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(43,38,35,0.08)',
            },
          ]}
        >
          {entry.storyTitle && entry.storyTitle !== entry.name ? (
            <Text style={[styles.storyTitle, storyType, { color: mutedColor }]}>
              {entry.storyTitle}
            </Text>
          ) : null}
          <Text style={[styles.life, lifeType, { color: textColor }]}>{entry.body}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  cardGreatFeast: {
    borderWidth: 2,
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
  storyTitle: {
    marginBottom: 8,
    fontStyle: 'italic',
  },
  life: {
    opacity: 0.96,
  },
});
