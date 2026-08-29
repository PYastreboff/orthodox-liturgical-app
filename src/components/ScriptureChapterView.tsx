import { Platform, StyleSheet, Text, View } from 'react-native';

import type { BibleChapterVerse } from '../lib/bible/scriptureTranslation';

const SCRIPTURE_SERIF = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'Georgia, "Times New Roman", serif',
});

type Props = {
  chapterTitle: string;
  verses: BibleChapterVerse[];
  textColor: string;
  verseNumberColor: string;
  headingType: { fontSize: number; lineHeight: number };
  bodyType: { fontSize: number; lineHeight: number };
  verseType: { fontSize: number; lineHeight: number };
};

export function ScriptureChapterView({
  chapterTitle,
  verses,
  textColor,
  verseNumberColor,
  headingType,
  bodyType,
  verseType,
}: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={[styles.heading, headingType, { color: textColor }]}>
        {chapterTitle}
      </Text>
      <Text style={[styles.passage, bodyType, { color: textColor, fontFamily: SCRIPTURE_SERIF }]}>
        {verses.map((line, index) => (
          <Text key={`${line.verse}-${index}`}>
            <Text style={[styles.verseNumber, verseType, { color: verseNumberColor }]}>
              {line.verse}{' '}
            </Text>
            <Text>
              {line.text.trim()}
              {index < verses.length - 1 ? ' ' : ''}
            </Text>
          </Text>
        ))}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  heading: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  passage: {
    textAlign: 'left',
  },
  verseNumber: {
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
