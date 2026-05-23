import { StyleSheet, Text, View } from 'react-native';

import type { LiturgicalTextCategory, LiturgicalTextItem } from '../lib/liturgical/liturgicalTexts';
import { noneForDayLabel } from '../lib/liturgical/liturgicalTexts';
import { useAppTranslation } from '../i18n/useAppTranslation';
import { LiturgicalReadingIcon } from './LiturgicalReadingIcon';

type Props = {
  item: LiturgicalTextItem;
  category: LiturgicalTextCategory;
  textColor: string;
  verseNumberColor: string;
};

export function LiturgicalPassageBlock({ item, category, textColor, verseNumberColor }: Props) {
  const hasText = item.paragraphs.some((p) => p.some((line) => line.text.trim()));

  return (
    <View style={styles.block}>
      <View style={styles.headerRow}>
        <LiturgicalReadingIcon category={category} color={textColor} size={18} />
        <Text style={[styles.header, { color: textColor }]}>
          {item.citation}
          {item.detail ? ` (${item.detail})` : item.source ? ` (${item.source})` : ''}
        </Text>
      </View>
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
  category: LiturgicalTextCategory;
  title: string;
  items: LiturgicalTextItem[];
  textColor: string;
  verseNumberColor: string;
  headingColor: string;
  topGap?: boolean;
};

export function LiturgicalTextSectionBlock({
  category,
  title,
  items,
  textColor,
  verseNumberColor,
  headingColor,
  topGap,
}: SectionProps) {
  const { lang } = useAppTranslation();
  return (
    <View style={topGap ? styles.sectionGap : null}>
      <View style={styles.sectionHeadingRow}>
        <LiturgicalReadingIcon category={category} color={headingColor} size={22} />
        <Text style={[styles.sectionHeading, { color: headingColor }]}>{title}</Text>
      </View>
      {items.length > 0 ? (
        items.map((item, index) => (
          <LiturgicalPassageBlock
            key={`${item.citation}-${item.source ?? ''}-${index}`}
            item={item}
            category={category}
            textColor={textColor}
            verseNumberColor={verseNumberColor}
          />
        ))
      ) : (
        <Text style={[styles.placeholder, { color: textColor }]}>{noneForDayLabel(lang)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionGap: {
    marginTop: 14,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  sectionHeading: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  block: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 4,
  },
  header: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
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
