import type { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { isIosMobileWeb, isIosSafariBrowser } from '../theme/webViewport';

type Props = {
  children: ReactNode;
  backgroundColor: string;
};

/** Fills the web shell; iPhone Safari browser scrolls the document like a normal site. */
export function WebShell({ children, backgroundColor }: Props) {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  const documentScroll = isIosSafariBrowser();
  const iosFixedShell = isIosMobileWeb() && !documentScroll;

  return (
    <View
      style={[
        styles.shell,
        { backgroundColor },
        documentScroll
          ? styles.shellDocumentScroll
          : iosFixedShell
            ? styles.shellIos
            : styles.shellFlex,
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
  shellDocumentScroll: {
    flexGrow: 0,
    flexShrink: 0,
    height: 'auto',
    minHeight: '100%',
    overflow: 'visible',
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
