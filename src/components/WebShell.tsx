import { useEffect, useState, type ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { isIosMobileWeb, layoutViewportHeightPx } from '../theme/webViewport';

type Props = {
  children: ReactNode;
  backgroundColor: string;
};

/**
 * RN Web uses visualViewport for Dimensions — shorter than the layout viewport on iOS Safari.
 * Force the React tree to fill window.innerHeight so we do not get html “letterbox” bands.
 */
export function WebShell({ children, backgroundColor }: Props) {
  const [layoutHeight, setLayoutHeight] = useState(() =>
    Platform.OS === 'web' ? layoutViewportHeightPx() : 0,
  );

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const sync = () => setLayoutHeight(layoutViewportHeightPx());
    sync();
    window.addEventListener('resize', sync);
    window.addEventListener('orientationchange', sync);
    window.visualViewport?.addEventListener('resize', sync);

    return () => {
      window.removeEventListener('resize', sync);
      window.removeEventListener('orientationchange', sync);
      window.visualViewport?.removeEventListener('resize', sync);
    };
  }, []);

  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  const shellStyle = [
    styles.shell,
    { backgroundColor },
    isIosMobileWeb() && layoutHeight > 0
      ? { minHeight: layoutHeight, height: layoutHeight }
      : null,
  ];

  return <View style={shellStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    width: '100%',
  },
});
