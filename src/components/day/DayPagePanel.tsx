import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/tokens';

type Props = {
  title?: string;
  children: ReactNode;
  textColor: string;
  borderColor: string;
  isDark: boolean;
  /** Tighter top margin when first on the page. */
  first?: boolean;
};

/** Rounded content panel used on day section pages. */
export function DayPagePanel({
  title,
  children,
  textColor,
  borderColor,
  isDark,
  first = false,
}: Props) {
  return (
    <View
      style={[
        styles.panel,
        first ? styles.panelFirst : null,
        {
          backgroundColor: isDark ? colors.darkSurface : colors.card,
          borderColor,
        },
      ]}
    >
      {title ? (
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 4,
  },
  panelFirst: {
    marginTop: 0,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    opacity: 0.72,
    marginBottom: 10,
  },
});
