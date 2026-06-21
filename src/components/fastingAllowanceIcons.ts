/** Shared size for fish / wine / oil allowance glyphs (hero, lists). */
export const FASTING_ALLOWANCE_ICON_SIZE = 16;

/** Calendar cells, month agenda, and icon legend. */
export const CALENDAR_FASTING_ICON_SIZE = 20;

/** MCI fruit-grapes fills more of its em square than fish / oil-drop glyphs. */
export const FASTING_WINE_ICON_VISUAL_SCALE = 0.82;

/** Teardrop SVG has more padding in its viewBox than MCI fish / grape glyphs. */
export const FASTING_OIL_ICON_VISUAL_SCALE = 1.2;

export const FASTING_FISH_COLOR = '#3d6878';
export const FASTING_WINE_COLOR = '#6b3d52';
export const FASTING_OIL_COLOR = '#b08d57';
export const FASTING_NO_EATING_COLOR = '#1a1412';

export type FastingAllowanceKind = 'fish' | 'wine' | 'oil';

export function fastingAllowanceColor(kind: FastingAllowanceKind): string {
  if (kind === 'fish') return FASTING_FISH_COLOR;
  if (kind === 'wine') return FASTING_WINE_COLOR;
  return FASTING_OIL_COLOR;
}

/** noEating cross — light on dark legend backgrounds. */
export function fastingNoEatingColor(onDarkBackground: boolean, foregroundColor: string): string {
  return onDarkBackground ? foregroundColor : FASTING_NO_EATING_COLOR;
}
