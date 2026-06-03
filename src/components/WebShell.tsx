import type { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { isIosMobileWeb, isIosSafariBrowser } from '../theme/webViewport';

type Props = {
  children: ReactNode;
  backgroundColor: string;
};

/** Fills the web shell; iOS Safari browser uses natural 100dvh like a normal site. */
export function WebShell({ children, backgroundColor }: Props) {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  const iosFixedShell = isIosMobileWeb() && !isIosSafariBrowser();

  return (
    <View
      style={[
        styles.shell,
        { backgroundColor },
        iosFixedShell ? styles.shellIos : styles.shellFlex,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: '100%',
    overflow: 'hidden',
  },
  shellIos: {
    flex: 1,
    height: '100%',
    minHeight: '100%',
    maxHeight: '100%',
  },
  shellFlex: {
    flex: 1,
    minHeight: 0,
    overflow: 'visible',
  },
});
