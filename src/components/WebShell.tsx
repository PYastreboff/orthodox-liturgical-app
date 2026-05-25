import type { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { isIosMobileWeb } from '../theme/webViewport';

type Props = {
  children: ReactNode;
  backgroundColor: string;
};

/** Fills the fixed #root shell on iOS (height: 100%); flex fill elsewhere. */
export function WebShell({ children, backgroundColor }: Props) {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  const ios = isIosMobileWeb();

  return (
    <View
      style={[
        styles.shell,
        { backgroundColor },
        ios ? styles.shellIos : styles.shellFlex,
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
  },
});
