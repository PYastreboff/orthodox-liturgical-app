export type FontScalePreference = 'small' | 'default' | 'large';

export const FONT_SCALE_MULTIPLIERS: Record<FontScalePreference, number> = {
  small: 0.92,
  default: 1,
  large: 1.15,
};

export function fontScaleMultiplier(preference: FontScalePreference): number {
  return FONT_SCALE_MULTIPLIERS[preference];
}

export function scaleFontSize(base: number, preference: FontScalePreference): number {
  return Math.round(base * fontScaleMultiplier(preference));
}

export function scaleLineHeight(
  base: number,
  preference: FontScalePreference,
): number {
  return Math.round(base * fontScaleMultiplier(preference));
}
