import { Feather } from '@expo/vector-icons';
import { useTheme } from "expo-router/react-navigation";
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

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
  /** When `back`, chevron back button sits in the hero row instead of the section icon. */
  iconPlacement?: 'hero' | 'back';
};

/**
 * Back control plus devotional title block — shared by day sections, recipes, privacy etc.
 * Sits INSIDE a scroll view's content (like the Prayers tab header): gutters, max-width
 * and top safe-area padding come from the surrounding scroll content container.
 */
export function StackScreenHeader({
  title,
  subtitle,
  backLabel,
  onBack,
  icon,
  accentSoft,
  mutedColor,
  iconPlacement = 'hero',
}: Props) {
  const theme = useTheme();
  const isDark = useResolvedColorScheme() === 'dark';
  const backBorder = isDark ? colors.darkBorderSubtle : colors.borderSubtle;
  const backBg = isDark ? colors.darkSurfaceElevated : colors.card;
  const iconInBack = iconPlacement === 'back';

  const backButton = (
    <Pressable
      onPress={onBack}
      style={[
        styles.backBtn,
        iconInBack ? styles.backBtnInline : null,
        cardElevation(isDark),
        { backgroundColor: backBg, borderColor: backBorder },
      ]}
      accessibilityRole="button"
      accessibilityLabel={backLabel}
    >
      <View style={[styles.backIconSlot, { pointerEvents: 'none' }]}>
        <Feather name="chevron-left" size={22} color={theme.colors.text} style={styles.backIcon} />
      </View>
    </Pressable>
  );

  return (
    <View style={styles.wrap}>
      {iconInBack ? (
        <DevotionalPageHeader
          leading={backButton}
          accentSoft={accentSoft}
          title={title}
          subtitle={subtitle}
          textColor={theme.colors.text}
          mutedColor={mutedColor}
        />
      ) : (
        <>
          {backButton}
          <DevotionalPageHeader
            icon={icon}
            accentSoft={accentSoft}
            title={title}
            subtitle={subtitle}
            textColor={theme.colors.text}
            mutedColor={mutedColor}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: 16,
    width: '100%',
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  backBtnInline: {
    marginBottom: 0,
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
