import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewProps } from 'react-native';

import { colors } from '../../theme/tokens';

type Props = ViewProps & {
  title: string;
  description?: string;
  children: ReactNode;
  isDark: boolean;
};

export function SettingsSection({ title, description, children, isDark, style, ...rest }: Props) {
  const cardBg = isDark ? colors.darkSurface : colors.card;
  const border = isDark ? colors.darkBorder : colors.border;
  const titleColor = isDark ? colors.darkInk : colors.ink;
  const descColor = isDark ? '#a39e98' : colors.muted;

  return (
    <View style={[styles.wrap, style]} {...rest}>
      <Text style={[styles.heading, { color: titleColor }]}>{title}</Text>
      {description ? (
        <Text style={[styles.description, { color: descColor }]}>{description}</Text>
      ) : null}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 22,
  },
  heading: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
});
