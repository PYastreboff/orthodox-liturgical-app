import { StyleSheet, Text, View } from 'react-native';

import type { LiturgicalTextItem } from '../lib/liturgical/liturgicalTexts';
import { NONE_FOR_DAY } from '../lib/liturgical/liturgicalTexts';

type Props = {
  item: LiturgicalTextItem;
  textColor: string;
  verseNumberColor: string;
};

export function LiturgicalPassageBlock({ item, textColor, verseNumberColor }: Props) {
  const hasText = item.paragraphs.some((p) => p.some((line) => line.text.trim()));

  return (
    <View style={styles.block}>
      <Text style={[styles.header, { color: textColor }]}>
        {item.citation}
        {item.detail ? ` (${item.detail})` : item.source ? ` (${item.source})` : ''}
      </Text>
      {hasText ? (
        <View style={styles.passage}>
          {item.paragraphs.map((paragraph, pi) => (
            <Text
              key={pi}
              style={[styles.paragraph, { color: textColor }, pi > 0 ? styles.paragraphGap : null]}
            >
              {paragraph.map((line, li) =>
                item.plainText || line.verse === 0 ? (
                  <Text key={li}>{line.text}</Text>
                ) : (
                  <Text key={`${line.verse}-${li}`}>
                    <Text style={[styles.verseNumber, { color: verseNumberColor }]}>
                      {line.verse}{' '}
                    </Text>
                    <Text>
                      {line.text}
                      {li < paragraph.length - 1 ? ' ' : ''}
                    </Text>
                  </Text>
                ),
              )}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

type SectionProps = {
  title: string;
  items: LiturgicalTextItem[];
  textColor: string;
  verseNumberColor: string;
  headingColor: string;
  topGap?: boolean;
};

export function LiturgicalTextSectionBlock({
  title,
  items,
  textColor,
  verseNumberColor,
  headingColor,
  topGap,
}: SectionProps) {
  return (
    <View style={topGap ? styles.sectionGap : null}>
      <Text style={[styles.sectionHeading, { color: headingColor }]}>{title}</Text>
      {items.length > 0 ? (
        items.map((item, index) => (
          <LiturgicalPassageBlock
            key={`${item.citation}-${item.source ?? ''}-${index}`}
            item={item}
            textColor={textColor}
            verseNumberColor={verseNumberColor}
          />
        ))
      ) : (
        <Text style={[styles.placeholder, { color: textColor }]}>{NONE_FOR_DAY}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionGap: {
    marginTop: 14,
  },
  sectionHeading: {
    marginTop: 4,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '700',
  },
  block: {
    marginBottom: 20,
  },
  header: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 4,
  },
  passage: {
    marginTop: 4,
  },
  paragraph: {
    fontSize: 13,
    lineHeight: 19,
  },
  paragraphGap: {
    marginTop: 6,
  },
  verseNumber: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 13,
    transform: [{ translateY: -3 }],
  },
  placeholder: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    opacity: 0.75,
    marginBottom: 8,
  },
});
