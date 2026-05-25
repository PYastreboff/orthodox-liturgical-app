import { useEffect, useState, type ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { isIosMobileWeb, layoutViewportHeightPx } from '../theme/webViewport';

type Props = {
  children: ReactNode;
  backgroundColor: string;
};

/**
 * On iOS, #root is a fixed shell at innerHeight px — this view must match that height exactly.
 */
export function WebShell({ children, backgroundColor }: Props) {
  const [shellHeight, setShellHeight] = useState(() =>
    Platform.OS === 'web' && isIosMobileWeb() ? layoutViewportHeightPx() : 0,
  );

  useEffect(() => {
    if (Platform.OS !== 'web' || !isIosMobileWeb()) return;

    const sync = () => setShellHeight(layoutViewportHeightPx());
    sync();

    window.addEventListener('resize', sync);
    window.addEventListener('orientationchange', sync);
    window.visualViewport?.addEventListener('resize', sync);
    window.visualViewport?.addEventListener('scroll', sync);

    return () => {
      window.removeEventListener('resize', sync);
      window.removeEventListener('orientationchange', sync);
      window.visualViewport?.removeEventListener('resize', sync);
      window.visualViewport?.removeEventListener('scroll', sync);
    };
  }, []);

  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  const iosShell = isIosMobileWeb() && shellHeight > 0;

  return (
    <View
      style={[
        styles.shell,
        { backgroundColor },
        iosShell ? { height: shellHeight, minHeight: shellHeight, maxHeight: shellHeight } : styles.shellFlex,
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
  shellFlex: {
    flex: 1,
    minHeight: 0,
  },
});
