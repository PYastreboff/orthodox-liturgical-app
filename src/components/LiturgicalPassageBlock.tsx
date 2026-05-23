import { StyleSheet, Text, View } from 'react-native';

import { useFontScale } from '../hooks/useFontScale';
import type { LiturgicalTextCategory, LiturgicalTextItem } from '../lib/liturgical/liturgicalTexts';
import { noneForDayLabel } from '../lib/liturgical/liturgicalTexts';
import { useAppTranslation } from '../i18n/useAppTranslation';
import { LiturgicalReadingIcon } from './LiturgicalReadingIcon';

type Props = {
  item: LiturgicalTextItem;
  textColor: string;
  verseNumberColor: string;
};

export function LiturgicalPassageBlock({ item, textColor, verseNumberColor }: Props) {
  const { text } = useFontScale();
  const headerType = text(14, 20);
  const paragraphType = text(13, 19);
  const verseType = text(11, 13);
  const hasText = item.paragraphs.some((p) => p.some((line) => line.text.trim()));

  return (
    <View style={styles.block}>
      <Text style={[styles.header, headerType, { color: textColor }]}>
        {item.citation}
        {item.detail ? ` (${item.detail})` : item.source ? ` (${item.source})` : ''}
      </Text>
      {hasText ? (
        <View style={styles.passage}>
          {item.paragraphs.map((paragraph, pi) => (
            <Text
              key={pi}
              style={[
                styles.paragraph,
                paragraphType,
                { color: textColor },
                pi > 0 ? styles.paragraphGap : null,
              ]}
            >
              {paragraph.map((line, li) =>
                item.plainText || line.verse === 0 ? (
                  <Text key={li}>{line.text}</Text>
                ) : (
                  <Text key={`${line.verse}-${li}`}>
                    <Text style={[styles.verseNumber, verseType, { color: verseNumberColor }]}>
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
  const { text } = useFontScale();
  const headingType = text(16, 22);
  const placeholderType = text(14, 20);
  return (
    <View style={topGap ? styles.sectionGap : null}>
      <View style={styles.sectionHeadingRow}>
        <LiturgicalReadingIcon category={category} color={headingColor} size={22} />
        <Text style={[styles.sectionHeading, headingType, { color: headingColor }]}>
          {title}
        </Text>
      </View>
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
        <Text style={[styles.placeholder, placeholderType, { color: textColor }]}>
          {noneForDayLabel(lang)}
        </Text>
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
    fontWeight: '700',
  },
  block: {
    marginBottom: 20,
  },
  header: {
    fontWeight: '700',
    marginBottom: 4,
  },
  passage: {
    marginTop: 4,
  },
  paragraph: {},
  paragraphGap: {
    marginTop: 6,
  },
  verseNumber: {
    fontWeight: '600',
    transform: [{ translateY: -3 }],
  },
  placeholder: {
    fontStyle: 'italic',
    opacity: 0.75,
    marginBottom: 8,
  },
});
