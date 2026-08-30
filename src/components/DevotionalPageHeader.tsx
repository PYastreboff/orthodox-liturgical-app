import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { iconBadgeSurface } from '../theme/cards';
import { typography } from '../theme/tokens';

type Props = {
  icon?: ReactNode;
  /** Replaces the icon badge — e.g. inline back control on day section pages. */
  leading?: ReactNode;
  accentSoft: string;
  title: string;
  subtitle?: string;
  textColor: string;
  mutedColor: string;
};

/** Tab-screen hero for Prayers and Liturgy — icon badge plus title block. */
export function DevotionalPageHeader({
  icon,
  leading,
  accentSoft,
  title,
  subtitle,
  textColor,
  mutedColor,
}: Props) {
  const leadingNode = leading ?? (icon ? (
    <View style={[styles.iconBadge, iconBadgeSurface(accentSoft)]}>{icon}</View>
  ) : null);

  return (
    <View style={[styles.wrap, leadingNode ? null : styles.wrapNoIcon]}>
      {leadingNode ? <View style={styles.leadingSlot}>{leadingNode}</View> : null}
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
    flex: 1,
    minWidth: 0,
  },
  wrapNoIcon: {
    gap: 0,
  },
  iconBadge: {
    marginTop: 2,
  },
  leadingSlot: {
    marginTop: 2,
    flexShrink: 0,
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
