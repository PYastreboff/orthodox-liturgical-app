import { StyleSheet, Text, View } from 'react-native';

import { useFontScale } from '../hooks/useFontScale';
import type { LiturgicalTextCategory, LiturgicalTextItem } from '../lib/liturgical/liturgicalTexts';
import { noneForDayLabel } from '../lib/liturgical/liturgicalTexts';
import type { ReadingsSingleLanguage } from '../lib/readings/textLanguage';
import { useAppTranslation } from '../i18n/useAppTranslation';
import { LiturgicalReadingIcon } from './LiturgicalReadingIcon';

function passageTitle(item: LiturgicalTextItem): string {
  const suffix = item.detail ? ` (${item.detail})` : item.source ? ` (${item.source})` : '';
  return `${item.citation}${suffix}`;
}

type PassageBodyProps = {
  item: LiturgicalTextItem;
  textColor: string;
  verseNumberColor: string;
};

function PassageBody({ item, textColor, verseNumberColor }: PassageBodyProps) {
  const { text } = useFontScale();
  const paragraphType = text(13, 19);
  const verseType = text(11, 13);
  const hasText = item.paragraphs.some((p) => p.some((line) => line.text.trim()));

  if (!hasText) return null;

  return (
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
              <Text key={li}>
                {line.text}
                {li < paragraph.length - 1 ? ' ' : ''}
              </Text>
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
  );
}

type Props = {
  item: LiturgicalTextItem;
  textColor: string;
  verseNumberColor: string;
};

export function LiturgicalPassageBlock({ item, textColor, verseNumberColor }: Props) {
  const { text } = useFontScale();
  const headerType = text(14, 20);

  return (
    <View style={styles.block}>
      <Text style={[styles.header, headerType, { color: textColor }]}>
        {passageTitle(item)}
      </Text>
      <PassageBody item={item} textColor={textColor} verseNumberColor={verseNumberColor} />
    </View>
  );
}

function readingsLoadingKey(lang: ReadingsSingleLanguage): string {
  if (lang === 'chu') return 'today.slavonicLoading';
  if (lang === 'el') return 'readings.greekLoading';
  return '';
}

type CompareColumnProps = {
  lang: ReadingsSingleLanguage | null;
  item?: LiturgicalTextItem;
  loading?: boolean;
  textColor: string;
  verseNumberColor: string;
  mutedColor: string;
  hintType: { fontSize: number; lineHeight: number };
  loadingLabel: string;
};

function CompareColumn({
  lang,
  item,
  loading,
  textColor,
  verseNumberColor,
  mutedColor,
  hintType,
  loadingLabel,
}: CompareColumnProps) {
  return (
    <View style={[styles.column, styles.columnFlex]}>
      {lang && loading && !item ? (
        <Text style={[styles.loadingHint, hintType, { color: mutedColor }]}>{loadingLabel}</Text>
      ) : lang && item ? (
        <PassageBody item={item} textColor={textColor} verseNumberColor={verseNumberColor} />
      ) : null}
    </View>
  );
}

type SideBySideProps = {
  leftItem?: LiturgicalTextItem;
  rightItem?: LiturgicalTextItem;
  leftLang: ReadingsSingleLanguage | null;
  rightLang: ReadingsSingleLanguage | null;
  leftLoading?: boolean;
  rightLoading?: boolean;
  textColor: string;
  verseNumberColor: string;
  mutedColor: string;
};

export function LiturgicalPassageBlockSideBySide({
  leftItem,
  rightItem,
  leftLang,
  rightLang,
  leftLoading,
  rightLoading,
  textColor,
  verseNumberColor,
  mutedColor,
}: SideBySideProps) {
  const { t } = useAppTranslation();
  const { text } = useFontScale();
  const headerType = text(14, 20);
  const hintType = text(12, 16);
  const headingItem = leftItem ?? rightItem;
  const leftLoadingLabel = leftLang ? t(readingsLoadingKey(leftLang)) : '';
  const rightLoadingLabel = rightLang ? t(readingsLoadingKey(rightLang)) : '';

  return (
    <View style={styles.block}>
      {headingItem ? (
        <Text style={[styles.header, headerType, { color: textColor }]}>
          {passageTitle(headingItem)}
        </Text>
      ) : null}
      <View style={styles.columnsRow}>
        <CompareColumn
          lang={leftLang}
          item={leftItem}
          loading={leftLoading}
          textColor={textColor}
          verseNumberColor={verseNumberColor}
          mutedColor={mutedColor}
          hintType={hintType}
          loadingLabel={leftLoadingLabel}
        />
        <View style={[styles.columnDivider, { backgroundColor: mutedColor }]} />
        <CompareColumn
          lang={rightLang}
          item={rightItem}
          loading={rightLoading}
          textColor={textColor}
          verseNumberColor={verseNumberColor}
          mutedColor={mutedColor}
          hintType={hintType}
          loadingLabel={rightLoadingLabel}
        />
      </View>
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
  sideBySide?: boolean;
  rightItems?: LiturgicalTextItem[];
  leftLang?: ReadingsSingleLanguage | null;
  rightLang?: ReadingsSingleLanguage | null;
  leftLoading?: boolean;
  rightLoading?: boolean;
  mutedColor?: string;
};

export function LiturgicalTextSectionBlock({
  category,
  title,
  items,
  textColor,
  verseNumberColor,
  headingColor,
  topGap,
  sideBySide,
  rightItems,
  leftLang = null,
  rightLang = null,
  leftLoading,
  rightLoading,
  mutedColor,
}: SectionProps) {
  const { lang } = useAppTranslation();
  const { text } = useFontScale();
  const headingType = text(16, 22);
  const placeholderType = text(14, 20);
  const resolvedMuted = mutedColor ?? textColor;

  return (
    <View style={topGap ? styles.sectionGap : null}>
      <View style={styles.sectionHeadingRow}>
        <LiturgicalReadingIcon category={category} color={headingColor} size={22} />
        <Text style={[styles.sectionHeading, headingType, { color: headingColor }]}>
          {title}
        </Text>
      </View>
      {items.length > 0 ? (
        items.map((item, index) =>
          sideBySide ? (
            <LiturgicalPassageBlockSideBySide
              key={`${item.citation}-${item.source ?? ''}-${index}`}
              leftItem={leftLang ? items[index] : undefined}
              rightItem={rightLang ? rightItems?.[index] : undefined}
              leftLang={leftLang}
              rightLang={rightLang}
              leftLoading={leftLoading}
              rightLoading={rightLoading}
              textColor={textColor}
              verseNumberColor={verseNumberColor}
              mutedColor={resolvedMuted}
            />
          ) : (
            <LiturgicalPassageBlock
              key={`${item.citation}-${item.source ?? ''}-${index}`}
              item={item}
              textColor={textColor}
              verseNumberColor={verseNumberColor}
            />
          ),
        )
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
  columnsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 4,
  },
  column: {
    minWidth: 0,
  },
  columnFlex: {
    flex: 1,
  },
  loadingHint: {
    fontStyle: 'italic',
    marginTop: 4,
  },
  columnDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    opacity: 0.35,
  },
});
