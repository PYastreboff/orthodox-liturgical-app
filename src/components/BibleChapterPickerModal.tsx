import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import { useAppTranslation } from '../i18n/useAppTranslation';
import { bibleBookByNum } from '../lib/bible/bibleCanon';
import { colors } from '../theme/tokens';
import { SettingsSheetFrame } from './settings/SettingsSheetFrame';

const SELECTED_FG = '#fff';

type Props = {
  visible: boolean;
  bookNum: number;
  bookLabel: string;
  chapter: number;
  onSelect: (chapter: number) => void;
  onClose: () => void;
  isDark: boolean;
};

export function BibleChapterPickerModal({
  visible,
  bookNum,
  bookLabel,
  chapter,
  onSelect,
  onClose,
  isDark,
}: Props) {
  const { t } = useAppTranslation();
  const book = bibleBookByNum(bookNum);
  const surfaceBg = isDark ? '#2a2724' : '#ebe6de';
  const textColor = isDark ? '#e8e3dd' : '#2b2623';
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(43,38,35,0.12)';
  const handleColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(43,38,35,0.28)';
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const sheetHeight = Math.round(windowHeight * (windowWidth < 600 ? 0.55 : 0.5));

  const chapters = useMemo(
    () => Array.from({ length: book?.chapters ?? 0 }, (_, index) => index + 1),
    [book?.chapters],
  );

  if (!book) return null;

  return (
    <SettingsSheetFrame
      visible={visible}
      onClose={onClose}
      sheetHeight={sheetHeight}
      surfaceBg={surfaceBg}
      borderColor={borderColor}
      handleColor={handleColor}
    >
      <Text style={[styles.title, { color: textColor }]}>
        {t('bible.chooseChapter', { book: bookLabel || book?.name || '' })}
      </Text>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.grid}>
          {chapters.map((num) => {
            const selected = num === chapter;
            return (
              <Pressable
                key={num}
                style={({ pressed }) => [
                  styles.cell,
                  {
                    backgroundColor: selected
                      ? colors.accentWine
                      : pressed
                        ? 'rgba(139,46,60,0.14)'
                        : isDark
                          ? 'rgba(255,255,255,0.06)'
                          : 'rgba(43,38,35,0.06)',
                  },
                ]}
                onPress={() => {
                  onSelect(num);
                  onClose();
                }}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                {...hoverAccessibilityProps(String(num), { role: 'button' })}
              >
                <Text style={[styles.cellLabel, { color: selected ? SELECTED_FG : textColor }]}>
                  {num}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SettingsSheetFrame>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 12,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
  },
  cell: {
    width: 52,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellLabel: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
