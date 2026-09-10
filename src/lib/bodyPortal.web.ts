import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

import { Platform } from 'react-native';

/**
 * Web only: render children into document.body so an open dropdown escapes any
 * ancestor overflow/transform clipping and paints above all page content.
 */
export function renderInBody(children: ReactNode): ReactNode {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return children;
  }
  return createPortal(children, document.body);
}