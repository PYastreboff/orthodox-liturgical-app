import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import { useAppTranslation } from '../i18n/useAppTranslation';
import { BIBLE_BOOKS, type BibleBook } from '../lib/bible/bibleCanon';
import { localizedBibleBookName } from '../lib/bible/bibleBookNames';
import type { BibleTextLang } from '../lib/bible/bibleTranslation';
import { colors } from '../theme/tokens';
import { SettingsSheetFrame } from './settings/SettingsSheetFrame';

const SELECTED_FG = '#fff';

type Props = {
  visible: boolean;
  bookNum: number;
  translation: BibleTextLang;
  onSelect: (bookNum: number) => void;
  onClose: () => void;
  isDark: boolean;
};

export function BibleBookPickerModal({
  visible,
  bookNum,
  translation,
  onSelect,
  onClose,
  isDark,
}: Props) {
  const { t } = useAppTranslation();
  const surfaceBg = isDark ? '#2a2724' : '#ebe6de';
  const textColor = isDark ? '#e8e3dd' : '#2b2623';
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(43,38,35,0.12)';
  const handleColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(43,38,35,0.28)';
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const sheetHeight = Math.round(windowHeight * (windowWidth < 600 ? 0.72 : 0.65));

  const sections = useMemo(
    () =>
      [
        { testament: 'ot' as const, titleKey: 'bible.oldTestament' },
        { testament: 'nt' as const, titleKey: 'bible.newTestament' },
      ].map((section) => ({
        ...section,
        books: BIBLE_BOOKS.filter((book) => book.testament === section.testament),
      })),
    [],
  );

  return (
    <SettingsSheetFrame
      visible={visible}
      onClose={onClose}
      sheetHeight={sheetHeight}
      surfaceBg={surfaceBg}
      borderColor={borderColor}
      handleColor={handleColor}
    >
      <Text style={[styles.title, { color: textColor }]}>{t('bible.chooseBook')}</Text>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {sections.map((section) => (
          <View key={section.testament}>
            <Text style={[styles.sectionHeading, { color: textColor }]}>{t(section.titleKey)}</Text>
            {section.books.map((book) => (
              <BookRow
                key={book.bookNum}
                book={book}
                label={localizedBibleBookName(book.bookNum, translation)}
                selected={book.bookNum === bookNum}
                textColor={textColor}
                onSelect={onSelect}
                onClose={onClose}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </SettingsSheetFrame>
  );
}

function BookRow({
  book,
  label,
  selected,
  textColor,
  onSelect,
  onClose,
}: {
  book: BibleBook;
  label: string;
  selected: boolean;
  textColor: string;
  onSelect: (bookNum: number) => void;
  onClose: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.option,
        {
          backgroundColor: selected
            ? colors.accentWine
            : pressed
              ? 'rgba(139,46,60,0.14)'
              : 'transparent',
        },
      ]}
      onPress={() => {
        onSelect(book.bookNum);
        onClose();
      }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      {...hoverAccessibilityProps(label, { role: 'button' })}
    >
      <Text
        style={[styles.optionLabel, { color: selected ? SELECTED_FG : textColor }]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {selected ? (
        <Feather name="check" size={18} color={SELECTED_FG} />
      ) : (
        <View style={styles.checkPlaceholder} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 16,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    opacity: 0.72,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 48,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 21,
  },
  checkPlaceholder: {
    width: 18,
  },
});
