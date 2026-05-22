import { StyleSheet, Text, View } from 'react-native';

type CalendarKind = 'julian' | 'gregorian';
type Variant = 'hero' | 'card' | 'compact';

type Props = {
  kind: CalendarKind;
  variant?: Variant;
  /** Badge alignment within its row (date cards use left). */
  align?: 'left' | 'center';
};

export function CalendarKindBadge({ kind, variant = 'card', align = 'center' }: Props) {
  const label = kind === 'julian' ? 'Julian' : 'Gregorian';
  const isJulian = kind === 'julian';

  return (
    <View
      style={[
        styles.badge,
        align === 'left' && styles.badgeLeft,
        variant === 'hero' && styles.badgeHero,
        variant === 'compact' && styles.badgeCompact,
        variant === 'card' && (isJulian ? styles.badgeJulian : styles.badgeGregorian),
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          variant === 'hero' && styles.badgeTextHero,
          variant === 'compact' && styles.badgeTextCompact,
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
});
