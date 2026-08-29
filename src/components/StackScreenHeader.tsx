import { Feather } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useScreenSafePadding } from '../hooks/useScreenSafePadding';
import { cardElevation } from '../theme/cards';
import { useResolvedColorScheme } from '../theme/useResolvedColorScheme';
import { colors, radii } from '../theme/tokens';

type Props = {
  title: string;
  backLabel: string;
  onBack: () => void;
};

/** Circular back + centered title — shared by recipes, privacy, legend, etc. */
export function StackScreenHeader({ title, backLabel, onBack }: Props) {
  const theme = useTheme();
  const isDark = useResolvedColorScheme() === 'dark';
  const screenSafe = useScreenSafePadding();
  const backBorder = isDark ? colors.darkBorderSubtle : colors.borderSubtle;
  const backBg = isDark ? colors.darkSurfaceElevated : colors.card;

  return (
    <View
      style={[
        styles.topBar,
        {
          paddingTop: screenSafe.paddingTop + 10,
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
        <Feather name="chevron-left" size={22} color={theme.colors.text} />
      </Pressable>
      <Text
        pointerEvents="none"
        style={[styles.topTitle, { color: theme.colors.text }]}
        numberOfLines={1}
      >
        {title}
      </Text>
      <View style={styles.topSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    position: 'relative',
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  topTitle: {
    position: 'absolute',
    left: 58,
    right: 58,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  topSpacer: {
    width: 40,
    height: 40,
  },
});
