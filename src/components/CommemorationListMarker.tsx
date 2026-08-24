import { Feather } from '@expo/vector-icons';
import { Platform, StyleSheet, Text, View } from 'react-native';

import type { PersonalDayKind } from '../lib/personalDays';

type Kind = 'feast' | 'saint';

type Props = {
  kind: Kind;
  color: string;
  /** Match the adjacent first line height. */
  lineHeight?: number;
  size?: number;
  /** Parish feast, nameday, or custom event — Feather icon instead of ›. */
  personalKind?: PersonalDayKind | null;
};

function personalIcon(kind: PersonalDayKind): keyof typeof Feather.glyphMap {
  if (kind === 'parish_feast') return 'home';
  if (kind === 'nameday') return 'user';
  return 'star';
}

/** › prefix for feast / saint lines; home / user / star for personal days. */
export function CommemorationListMarker({
  kind,
  color,
  lineHeight = 11,
  size = 10,
  personalKind,
}: Props) {
  return (
    <View style={[styles.box, { height: lineHeight, minWidth: size + 2 }]}>
      {personalKind ? (
        <Feather name={personalIcon(personalKind)} size={size} color={color} />
      ) : (
        <Text
          style={[
            styles.glyph,
            {
              color,
              fontSize: size,
              lineHeight,
              opacity: kind === 'saint' ? 0.82 : 1,
            },
          ]}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          ›
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexShrink: 0,
  },
  glyph: {
    fontWeight: '700',
    textAlign: 'center',
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
  },
});
