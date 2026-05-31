import { StyleSheet, Text, View } from 'react-native';

import type { UiLanguage } from '../../i18n/types';

/** First two letters of each alphabet — Latin, Cyrillic, Greek. */
const GLYPHS: Record<UiLanguage, string> = {
  en: 'Ab',
  ru: 'Аб',
  el: 'Αβ',
};

export const LANGUAGE_GLYPH_ICON_SIZE = 22;

type Props = {
  lang: UiLanguage;
  color: string;
};

export function LanguageGlyphIcon({ lang, color }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={[styles.glyph, { color }]} accessibilityElementsHidden importantForAccessibility="no">
        {GLYPHS[lang]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: LANGUAGE_GLYPH_ICON_SIZE,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: -0.4,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
