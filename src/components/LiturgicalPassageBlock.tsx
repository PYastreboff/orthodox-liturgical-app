import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { useFontScale } from '../hooks/useFontScale';
import { usePhoneLayout } from '../hooks/usePhoneLayout';
import type { LiturgicalTextCategory, LiturgicalTextItem } from '../lib/liturgical/liturgicalTexts';
import { noneForDayLabel } from '../lib/liturgical/liturgicalTexts';
import { useAppTranslation } from '../i18n/useAppTranslation';
import { LiturgicalReadingIcon } from './LiturgicalReadingIcon';

const SIDE_BY_SIDE_MIN_WIDTH = 560;

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

type SideBySideProps = {
  englishItem: LiturgicalTextItem;
  slavonicItem?: LiturgicalTextItem;
  slavonicLoading?: boolean;
  textColor: string;
  verseNumberColor: string;
  mutedColor: string;
};

export function LiturgicalPassageBlockSideBySide({
  englishItem,
  slavonicItem,
  slavonicLoading,
  textColor,
  verseNumberColor,
  mutedColor,
}: SideBySideProps) {
  const { t } = useAppTranslation();
  const { text } = useFontScale();
  const { width } = useWindowDimensions();
  const phoneLayout = usePhoneLayout();
  const headerType = text(14, 20);
  const labelType = text(11, 14);
  const hintType = text(12, 16);
  const horizontal = width >= SIDE_BY_SIDE_MIN_WIDTH;
  const centerTitles = horizontal && !phoneLayout;
  const slavonic = slavonicItem ?? englishItem;
  const titleStyle = centerTitles ? styles.columnTitleCentered : null;
  const labelStyle = centerTitles ? styles.columnLabelCentered : null;

  return (
    <View style={styles.block}>
      {!centerTitles ? (
        <Text style={[styles.header, headerType, { color: textColor }]}>
          {passageTitle(englishItem)}
        </Text>
      ) : null}
      <View style={horizontal ? styles.columnsRow : styles.columnsStack}>
        <View style={[styles.column, horizontal ? styles.columnFlex : null]}>
          {centerTitles ? (
            <Text style={[styles.columnTitle, headerType, { color: textColor }, titleStyle]}>
              {passageTitle(englishItem)}
            </Text>
          ) : (
            <Text style={[styles.columnLabel, labelType, { color: mutedColor }, labelStyle]}>
              {t('readings.langEnglish')}
            </Text>
          )}
          <PassageBody
            item={englishItem}
            textColor={textColor}
            verseNumberColor={verseNumberColor}
          />
        </View>
        <View
          style={[
            horizontal ? styles.columnDivider : styles.columnDividerStack,
            { backgroundColor: mutedColor },
          ]}
        />
        <View style={[styles.column, horizontal ? styles.columnFlex : null]}>
          {centerTitles ? (
            <Text style={[styles.columnTitle, headerType, { color: textColor }, titleStyle]}>
              {passageTitle(slavonic)}
            </Text>
          ) : (
            <Text style={[styles.columnLabel, labelType, { color: mutedColor }, labelStyle]}>
              {t('readings.langSlavonic')}
            </Text>
          )}
          {slavonicLoading && !slavonicItem ? (
            <Text
              style={[
                styles.loadingHint,
                hintType,
                { color: mutedColor },
                centerTitles ? styles.columnLabelCentered : null,
              ]}
            >
              {t('today.slavonicLoading')}
            </Text>
          ) : (
            <PassageBody
              item={slavonic}
              textColor={textColor}
              verseNumberColor={verseNumberColor}
            />
          )}
        </View>
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
  secondaryItems?: LiturgicalTextItem[];
  slavonicLoading?: boolean;
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
  secondaryItems,
  slavonicLoading,
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
              englishItem={item}
              slavonicItem={secondaryItems?.[index]}
              slavonicLoading={slavonicLoading}
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
    gap: 12,
    marginTop: 4,
  },
  columnsStack: {
    marginTop: 4,
    gap: 12,
  },
  column: {
    minWidth: 0,
  },
  columnFlex: {
    flex: 1,
  },
  columnLabel: {
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  columnLabelCentered: {
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  columnTitle: {
    fontWeight: '700',
    marginBottom: 8,
  },
  columnTitleCentered: {
    textAlign: 'center',
    alignSelf: 'stretch',
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
  columnDividerStack: {
    height: StyleSheet.hairlineWidth,
    opacity: 0.35,
  },
});
