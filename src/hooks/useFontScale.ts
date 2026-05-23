import { useMemo } from 'react';

import { usePreferences } from '../state/PreferencesContext';
import {
  fontScaleMultiplier,
  scaleFontSize,
  scaleLineHeight,
  type FontScalePreference,
} from '../theme/fontScale';

export function useFontScale() {
  const { fontScale } = usePreferences();
  const multiplier = fontScaleMultiplier(fontScale);

  return useMemo(
    () => ({
      fontScale,
      multiplier,
      fs: (size: number) => scaleFontSize(size, fontScale),
      lh: (lineHeight: number) => scaleLineHeight(lineHeight, fontScale),
      /** Scale font size and line height together (base line height for that font size). */
      text: (fontSize: number, lineHeight: number) => ({
        fontSize: scaleFontSize(fontSize, fontScale),
        lineHeight: scaleLineHeight(lineHeight, fontScale),
      }),
    }),
    [fontScale, multiplier],
  );
}

export type { FontScalePreference };
