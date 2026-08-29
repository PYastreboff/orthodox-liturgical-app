import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { Feather } from '@expo/vector-icons';

import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import { useAppTranslation } from '../i18n/useAppTranslation';
import { useBibleChapter } from '../hooks/useBibleChapter';
import { useFontScale } from '../hooks/useFontScale';
import { usePhoneLayout } from '../hooks/usePhoneLayout';
import { BibleBookPickerModal } from './BibleBookPickerModal';
import { BibleChapterPickerModal } from './BibleChapterPickerModal';
import { BibleTranslationToggle } from './BibleTranslationToggle';
import { ScriptureChapterView } from './ScriptureChapterView';

type Props = {
  textColor: string;
  mutedColor: string;
  borderColor: string;
  isDark: boolean;
  bodyType: { fontSize: number; lineHeight: number };
  hintType: { fontSize: number; lineHeight: number };
};

export function BibleSectionBody({
  textColor,
  mutedColor,
  borderColor,
  isDark,
  bodyType,
  hintType,
}: Props) {
  const { t } = useAppTranslation();
  const { text } = useFontScale();
  const phone = usePhoneLayout();
  const headingType = text(16, 22);
  const verseType = text(11, 13);
  const labelType = text(13, 18);
  const [bookPickerOpen, setBookPickerOpen] = useState(false);
  const [chapterPickerOpen, setChapterPickerOpen] = useState(false);

  const bible = useBibleChapter();
  const verseNumberColor = isDark ? '#c4a882' : '#8b7355';

  return (
    <View style={styles.cardBody}>
      <View style={[styles.toolbar, phone ? styles.toolbarPhone : null]}>
        <BibleTranslationToggle
          value={bible.translation}
          onChange={bible.setTranslation}
          isDark={isDark}
        />
      </View>

      <View style={[styles.navRow, { borderColor }]}>
        <Pressable
          style={({ pressed }) => [styles.bookButton, pressed ? styles.pressed : null]}
          onPress={() => setBookPickerOpen(true)}
          accessibilityRole="button"
          {...hoverAccessibilityProps(t('bible.chooseBook'), { role: 'button' })}
        >
          <Feather name="book" size={16} color={textColor} />
          <Text style={[styles.bookLabel, labelType, { color: textColor }]} numberOfLines={1}>
            {bible.bookName}
          </Text>
          <Feather name="chevron-down" size={16} color={mutedColor} />
        </Pressable>

        <View style={styles.chapterNav}>
          <Pressable
            style={({ pressed }) => [
              styles.navButton,
              { borderColor },
              !bible.canGoPrev ? styles.navButtonDisabled : null,
              pressed && bible.canGoPrev ? styles.pressed : null,
            ]}
            onPress={bible.goPrev}
            disabled={!bible.canGoPrev}
            accessibilityRole="button"
            accessibilityLabel={t('bible.prevChapter')}
            {...hoverAccessibilityProps(t('bible.prevChapter'), { role: 'button' })}
          >
            <Feather
              name="chevron-left"
              size={20}
              color={bible.canGoPrev ? textColor : mutedColor}
            />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.chapterButton,
              { borderColor },
              pressed ? styles.pressed : null,
            ]}
            onPress={() => setChapterPickerOpen(true)}
            accessibilityRole="button"
            {...hoverAccessibilityProps(t('bible.chooseChapterShort'), { role: 'button' })}
          >
            <Text style={[styles.chapterLabel, labelType, { color: textColor }]}>
              {t('bible.chapterLabel', { n: bible.chapter })}
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.navButton,
              { borderColor },
              !bible.canGoNext ? styles.navButtonDisabled : null,
              pressed && bible.canGoNext ? styles.pressed : null,
            ]}
            onPress={bible.goNext}
            disabled={!bible.canGoNext}
            accessibilityRole="button"
            accessibilityLabel={t('bible.nextChapter')}
            {...hoverAccessibilityProps(t('bible.nextChapter'), { role: 'button' })}
          >
            <Feather
              name="chevron-right"
              size={20}
              color={bible.canGoNext ? textColor : mutedColor}
            />
          </Pressable>
        </View>
      </View>

      {bible.loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={mutedColor} />
          <Text style={[styles.hint, hintType, { color: mutedColor }]}>{t('bible.loading')}</Text>
        </View>
      ) : bible.error ? (
        <Text style={[styles.hint, hintType, { color: mutedColor }]}>{t('bible.unavailable')}</Text>
      ) : (
        <ScriptureChapterView
          chapterTitle={bible.chapterTitle}
          verses={bible.verses}
          textColor={textColor}
          verseNumberColor={verseNumberColor}
          headingType={headingType}
          bodyType={bodyType}
          verseType={verseType}
        />
      )}

      <BibleBookPickerModal
        visible={bookPickerOpen}
        bookNum={bible.bookNum}
        translation={bible.translation}
        onSelect={bible.setBook}
        onClose={() => setBookPickerOpen(false)}
        isDark={isDark}
      />
      <BibleChapterPickerModal
        visible={chapterPickerOpen}
        bookNum={bible.bookNum}
        bookLabel={bible.bookName}
        chapter={bible.chapter}
        onSelect={bible.setChapter}
        onClose={() => setChapterPickerOpen(false)}
        isDark={isDark}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cardBody: {
    gap: 16,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  toolbarPhone: {
    justifyContent: 'flex-start',
  },
  navRow: {
    gap: 10,
    paddingBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  bookLabel: {
    flex: 1,
    fontWeight: '700',
  },
  chapterNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.45,
  },
  chapterButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  chapterLabel: {
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  loadingWrap: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 24,
  },
  hint: {
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
