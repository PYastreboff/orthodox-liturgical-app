import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import { useAppTranslation } from '../i18n/useAppTranslation';
import type { CommemorationEntry } from '../lib/liturgical/commemorations';
import { CollapsibleChevron } from './CollapsibleChevron';

type Props = {
  entry: CommemorationEntry;
  textColor: string;
  mutedColor: string;
  cardBg: string;
  borderColor: string;
};

function hasLifeAccount(entry: CommemorationEntry): boolean {
  return Boolean(entry.body?.trim());
}

export function CommemorationCard({ entry, textColor, mutedColor, cardBg, borderColor }: Props) {
  const { t } = useAppTranslation();
  const [expanded, setExpanded] = useState(false);
  const collapsible = hasLifeAccount(entry);

  const headerRow = (
    <View style={styles.headerRow}>
      <Text style={[styles.name, { color: textColor }]}>{entry.name}</Text>
      {collapsible ? <CollapsibleChevron expanded={expanded} color={mutedColor} size={16} /> : null}
    </View>
  );

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
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
            <Text style={[styles.storyTitle, { color: mutedColor }]}>{entry.storyTitle}</Text>
          ) : null}
          <Text style={[styles.body, { color: textColor }]}>{entry.body}</Text>
        </View>
      ) : null}
      {!collapsible ? (
        <View style={styles.bodyWrap}>
          <Text style={[styles.placeholder, { color: mutedColor }]}>
            {t('commemorations.noLife')}
          </Text>
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
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  bodyWrap: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 0,
  },
  storyTitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
  },
  placeholder: {
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
  },
});
