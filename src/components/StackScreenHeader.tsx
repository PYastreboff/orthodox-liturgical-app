import { Feather } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { usePhoneLayout } from '../hooks/usePhoneLayout';
import { useScreenSafePadding } from '../hooks/useScreenSafePadding';
import { cardElevation } from '../theme/cards';
import { STACK_CONTENT_MAX_WIDTH } from '../theme/layout';
import { stackContentColumnStyle } from '../theme/stackContentColumn';
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
  contentMaxWidth?: number;
  /** When `back`, chevron back button sits in the hero row instead of the section icon. */
  iconPlacement?: 'hero' | 'back';
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
  contentMaxWidth = STACK_CONTENT_MAX_WIDTH,
  iconPlacement = 'hero',
}: Props) {
  const theme = useTheme();
  const isDark = useResolvedColorScheme() === 'dark';
  const phone = usePhoneLayout();
  const screenSafe = useScreenSafePadding();
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
      <View style={styles.backIconSlot} pointerEvents="none">
        <Feather name="chevron-left" size={22} color={theme.colors.text} style={styles.backIcon} />
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.wrap, styles.wrapStretch, { paddingTop: screenSafe.paddingTop + 16 }]}>
      <View
        style={stackContentColumnStyle({
          paddingLeft: screenSafe.paddingLeft,
          paddingRight: screenSafe.paddingRight,
          phone,
          maxWidth: contentMaxWidth,
        })}
      >
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: 16,
    width: '100%',
  },
  wrapStretch: {
    alignSelf: 'stretch',
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
