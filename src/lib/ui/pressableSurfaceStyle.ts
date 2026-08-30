import { colors } from '../../theme/tokens';

export type PressableSurfaceState = {
  selected: boolean;
  pressed: boolean;
  hovered: boolean;
};

const HOVER_LIGHT = 'rgba(30, 26, 22, 0.06)';
const PRESSED_LIGHT = 'rgba(30, 26, 22, 0.1)';
const HOVER_DARK = 'rgba(255,255,255,0.08)';
const PRESSED_DARK = 'rgba(255,255,255,0.12)';

/** Background for modal options, settings rows, and picker items on web hover/press. */
export function pressableSurfaceBackground(
  isDark: boolean,
  state: PressableSurfaceState,
  options?: {
    selectedColor?: string;
    baseColor?: string;
  },
): string {
  const selectedColor = options?.selectedColor ?? colors.accentWine;
  const base = options?.baseColor ?? 'transparent';

  if (state.selected) return selectedColor;
  if (state.pressed) return isDark ? PRESSED_DARK : PRESSED_LIGHT;
  if (state.hovered) return isDark ? HOVER_DARK : HOVER_LIGHT;
  return base;
}
