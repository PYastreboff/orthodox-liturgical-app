import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { iconBadgeSurface } from '../theme/cards';
import { typography } from '../theme/tokens';

type Props = {
  icon: ReactNode;
  accentSoft: string;
  title: string;
  subtitle?: string;
  textColor: string;
  mutedColor: string;
};

/** Tab-screen hero for Prayers and Liturgy — icon badge plus title block. */
export function DevotionalPageHeader({
  icon,
  accentSoft,
  title,
  subtitle,
  textColor,
  mutedColor,
}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.iconBadge, iconBadgeSurface(accentSoft)]}>{icon}</View>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: mutedColor }]}>{subtitle}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  iconBadge: {
    marginTop: 2,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  title: {
    ...typography.headline,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
});
