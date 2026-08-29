import { Feather } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useScreenSafePadding } from '../hooks/useScreenSafePadding';
import { cardElevation } from '../theme/cards';
import { useResolvedColorScheme } from '../theme/useResolvedColorScheme';
import { colors, radii } from '../theme/tokens';
import { DevotionalPageHeader } from './DevotionalPageHeader';

type Props = {
  title: string;
  subtitle?: string;
  backLabel: string;
  onBack: () => void;
  icon: ReactNode;
  accentSoft: string;
  mutedColor: string;
};

/** Back control plus devotional title block — shared by day sections, recipes, privacy, etc. */
export function StackScreenHeader({
  title,
  subtitle,
  backLabel,
  onBack,
  icon,
  accentSoft,
  mutedColor,
}: Props) {
  const theme = useTheme();
  const isDark = useResolvedColorScheme() === 'dark';
  const screenSafe = useScreenSafePadding();
  const backBorder = isDark ? colors.darkBorderSubtle : colors.borderSubtle;
  const backBg = isDark ? colors.darkSurfaceElevated : colors.card;

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingTop: screenSafe.paddingTop + 16,
          paddingLeft: screenSafe.paddingLeft,
          paddingRight: screenSafe.paddingRight,
        },
      ]}
    >
      <Pressable
        onPress={onBack}
        style={[
          styles.backBtn,
          cardElevation(isDark),
          { backgroundColor: backBg, borderColor: backBorder },
        ]}
        accessibilityRole="button"
        accessibilityLabel={backLabel}
      >
        <View style={styles.backIconSlot} pointerEvents="none">
          <Feather
            name="chevron-left"
            size={22}
            color={theme.colors.text}
            style={styles.backIcon}
          />
        </View>
      </Pressable>
      <DevotionalPageHeader
        icon={icon}
        accentSoft={accentSoft}
        title={title}
        subtitle={subtitle}
        textColor={theme.colors.text}
        mutedColor={mutedColor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
    paddingBottom: 16,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  backIconSlot: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    lineHeight: 22,
    textAlign: 'center',
    transform: [{ translateX: -1 }],
  },
});
