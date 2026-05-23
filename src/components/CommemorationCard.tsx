import { StyleSheet, Text, View } from 'react-native';

import type { CommemorationEntry } from '../lib/liturgical/commemorations';

type Props = {
  entry: CommemorationEntry;
  textColor: string;
  mutedColor: string;
  cardBg: string;
  borderColor: string;
};

export function CommemorationCard({ entry, textColor, mutedColor, cardBg, borderColor }: Props) {
  const kindLabel = entry.kind === 'feast' ? 'Feast' : 'Saint';

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.name, { color: textColor }]}>{entry.name}</Text>
        <Text style={[styles.kindPill, { color: mutedColor, borderColor }]}>{kindLabel}</Text>
      </View>
      {entry.storyTitle && entry.storyTitle !== entry.name ? (
        <Text style={[styles.storyTitle, { color: mutedColor }]}>{entry.storyTitle}</Text>
      ) : null}
      {entry.body ? (
        <Text style={[styles.body, { color: textColor }]}>{entry.body}</Text>
      ) : (
        <Text style={[styles.placeholder, { color: mutedColor }]}>
          No life account on orthocal.info for this commemoration.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 6,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  kindPill: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
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
