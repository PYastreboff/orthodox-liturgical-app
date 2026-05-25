import type { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

type Props = {
  children: ReactNode;
  backgroundColor: string;
};

/**
 * Fills #root (min-height: 100dvh in WEB_ROOT_CSS). RN Web Dimensions are patched on iOS Safari.
 */
export function WebShell({ children, backgroundColor }: Props) {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return <View style={[styles.shell, { backgroundColor }]}>{children}</View>;
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    width: '100%',
    minHeight: 0,
  },
});
