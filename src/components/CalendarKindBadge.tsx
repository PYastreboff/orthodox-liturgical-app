import { StyleSheet, Text, View } from 'react-native';

import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import { colors } from '../theme/tokens';

type CalendarKind = 'julian' | 'gregorian';
type Variant = 'hero' | 'card' | 'compact' | 'date';

type Props = {
  kind: CalendarKind;
  variant?: Variant;
  /** Badge alignment within its row (date cards use left). */
  align?: 'left' | 'center';
  isDark?: boolean;
};

export function CalendarKindBadge({
  kind,
  variant = 'card',
  align = 'center',
  isDark = false,
}: Props) {
  const label = kind === 'julian' ? 'Julian' : 'Gregorian';
  const isJulian = kind === 'julian';
  const a11yLabel =
    kind === 'julian' ? 'Julian church calendar date' : 'Gregorian civil calendar date';

  return (
    <View
      {...hoverAccessibilityProps(a11yLabel)}
      style={[
        styles.badge,
        align === 'left' && styles.badgeLeft,
        variant === 'hero' && styles.badgeHero,
        variant === 'compact' && styles.badgeCompact,
        variant === 'card' && (isJulian ? styles.badgeJulian : styles.badgeGregorian),
        variant === 'date' &&
          (isJulian
            ? isDark
              ? styles.badgeJulianDateDark
              : styles.badgeJulianDate
            : isDark
              ? styles.badgeGregorianDateDark
              : styles.badgeGregorianDate),
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          variant === 'hero' && styles.badgeTextHero,
          variant === 'compact' && styles.badgeTextCompact,
          variant === 'date' &&
            (isJulian
              ? isDark
                ? styles.badgeTextJulianDateDark
                : styles.badgeTextJulianDate
              : isDark
                ? styles.badgeTextGregorianDateDark
                : styles.badgeTextGregorianDate),
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginBottom: 4,
  },
  badgeLeft: {
    alignSelf: 'flex-start',
  },
  badgeHero: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    marginBottom: 3,
  },
  badgeCompact: {
    paddingVertical: 1,
    paddingHorizontal: 4,
    marginBottom: 2,
  },
  badgeJulian: {
    backgroundColor: 'rgba(47,74,111,0.15)',
  },
  badgeGregorian: {
    backgroundColor: 'rgba(107,45,60,0.12)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: '#4a4540',
  },
  badgeTextHero: {
    color: '#2b2623',
    fontSize: 9,
  },
  badgeTextCompact: {
    fontSize: 7,
    letterSpacing: 0.2,
  },
  badgeJulianDate: {
    backgroundColor: 'rgba(47, 74, 111, 0.12)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginBottom: 4,
    borderRadius: 4,
    borderWidth: 0,
  },
  badgeGregorianDate: {
    backgroundColor: 'rgba(107, 45, 60, 0.1)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginBottom: 4,
    borderRadius: 4,
    borderWidth: 0,
  },
  badgeJulianDateDark: {
    backgroundColor: 'rgba(143, 175, 220, 0.12)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginBottom: 4,
    borderRadius: 4,
    borderWidth: 0,
  },
  badgeGregorianDateDark: {
    backgroundColor: 'rgba(220, 150, 165, 0.12)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginBottom: 4,
    borderRadius: 4,
    borderWidth: 0,
  },
  badgeTextJulianDate: {
    fontSize: 10,
    letterSpacing: 0.4,
    color: colors.accentTheotokos,
  },
  badgeTextGregorianDate: {
    fontSize: 10,
    letterSpacing: 0.4,
    color: colors.accentWine,
  },
  badgeTextJulianDateDark: {
    fontSize: 10,
    letterSpacing: 0.4,
    color: '#9eb8e0',
  },
  badgeTextGregorianDateDark: {
    fontSize: 10,
    letterSpacing: 0.4,
    color: '#e0a8b4',
  },
});
