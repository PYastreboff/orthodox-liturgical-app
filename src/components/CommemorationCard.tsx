import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useFontScale } from '../hooks/useFontScale';
import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import { useAppTranslation } from '../i18n/useAppTranslation';
import type { CommemorationEntry } from '../lib/liturgical/commemorations';
import { colors } from '../theme/tokens';
import { CollapsibleChevron } from './CollapsibleChevron';

type Props = {
  entry: CommemorationEntry;
  textColor: string;
  mutedColor: string;
  cardBg: string;
  borderColor: string;
  /** Primary great feast on this day — red card matching Date & Liturgical Day. */
  isPrimaryGreatFeast?: boolean;
  isDark?: boolean;
};

function hasLifeAccount(entry: CommemorationEntry): boolean {
  return Boolean(entry.body?.trim());
}

export function CommemorationCard({
  entry,
  textColor,
  mutedColor,
  cardBg,
  borderColor,
  isPrimaryGreatFeast = false,
  isDark = false,
}: Props) {
  const { t } = useAppTranslation();
  const { text } = useFontScale();
  const [expanded, setExpanded] = useState(false);
  const collapsible = hasLifeAccount(entry);
  const nameColor = isPrimaryGreatFeast ? colors.feastBorder : textColor;
  const resolvedCardBg = isPrimaryGreatFeast
    ? isDark
      ? 'rgba(139,46,60,0.22)'
      : 'rgba(139,46,60,0.1)'
    : cardBg;
  const resolvedBorderColor = isPrimaryGreatFeast
    ? isDark
      ? colors.feastHoverBorderDark
      : colors.feastBorder
    : borderColor;
  const nameType = text(16, 22);
  const storyType = text(13, 18);
  const bodyType = text(14, 21);

  const headerRow = (
    <View style={styles.headerRow}>
      <Text style={[styles.name, nameType, { color: nameColor }]}>{entry.name}</Text>
      {collapsible ? <CollapsibleChevron expanded={expanded} color={mutedColor} size={16} /> : null}
    </View>
  );

  return (
    <View
      style={[
        styles.card,
        isPrimaryGreatFeast ? styles.cardGreatFeast : null,
        { backgroundColor: resolvedCardBg, borderColor: resolvedBorderColor },
      ]}
    >
      {collapsible ? (
        <Pressable
          onPress={() => setExpanded((prev) => !prev)}
          style={({ pressed }) => [styles.headerPressable, pressed && styles.headerPressed]}
          {...hoverAccessibilityProps(
            expanded ? t('commemorations.collapse', { name: entry.name }) : t('commemorations.expand', { name: entry.name }),
            { role: 'button' },
          )}
          accessibilityState={{ expanded }}
        >
          {headerRow}
        </Pressable>
      ) : (
        <View style={styles.headerPressable}>{headerRow}</View>
      )}
      {collapsible && expanded ? (
        <View style={styles.bodyWrap}>
          {entry.storyTitle && entry.storyTitle !== entry.name ? (
            <Text style={[styles.storyTitle, storyType, { color: mutedColor }]}>
              {entry.storyTitle}
            </Text>
          ) : null}
          <Text style={[styles.body, bodyType, { color: textColor }]}>{entry.body}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardGreatFeast: {
    borderWidth: 2,
  },
  headerPressable: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  headerPressed: {
    opacity: 0.88,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  name: {
    flex: 1,
    fontWeight: '700',
  },
  bodyWrap: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 0,
  },
  storyTitle: {
    marginBottom: 8,
    fontStyle: 'italic',
  },
  body: {},
});
