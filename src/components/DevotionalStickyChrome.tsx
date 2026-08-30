import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';

import { colors } from '../theme/tokens';

type Props = {
  isDark: boolean;
  children: ReactNode;
};

/** Frosted strip pinned under the page header for toolbars and section pickers. */
export function DevotionalStickyChrome({ isDark, children }: Props) {
  const backgroundColor = isDark ? 'rgba(24, 22, 20, 0.94)' : 'rgba(247, 243, 236, 0.94)';
  const borderColor = isDark ? colors.darkBorderSubtle : colors.borderSubtle;

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor,
          borderBottomColor: borderColor,
        },
        Platform.OS === 'web'
          ? ({
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            } as ViewStyle)
          : null,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
