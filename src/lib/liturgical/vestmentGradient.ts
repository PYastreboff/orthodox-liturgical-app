import type { LiturgicalDayAppearance } from '../calendar/dayAppearance';
import { liturgicalVestmentColor } from './vestments';

/** Today page base — always solid black. */
export const PAGE_BACKGROUND_BLACK = '#000000';

export type VestmentPageGradient = {
  colors: readonly [string, string, string, string];
  locations: readonly [number, number, number, number];
  start: { x: number; y: number };
  end: { x: number; y: number };
};

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const raw = hex.replace('#', '').trim();
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw.length === 6
        ? raw
        : null;
  if (!full) return null;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function toHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${[clamp(r), clamp(g), clamp(b)]
    .map((n) => n.toString(16).padStart(2, '0'))
    .join('')}`;
}

/** Opaque mix of black + vestment hue (strength 0–1). RN gradients need opaque stops to read on black. */
function mixWithBlack(tint: { r: number; g: number; b: number }, strength: number): string {
  const t = Math.max(0, Math.min(1, strength));
  return toHex(tint.r * t, tint.g * t, tint.b * t);
}

function vestmentTintRgb(
  appearance: LiturgicalDayAppearance,
  liturgicalHex: string,
): { r: number; g: number; b: number } {
  if (
    liturgicalHex === '#f0ebe3' ||
    appearance.key === 'pascha' ||
    appearance.key === 'bright_week'
  ) {
    return { r: 176, g: 141, b: 87 };
  }
  return parseHex(liturgicalHex) ?? { r: 128, g: 128, b: 128 };
}

/**
 * Soft vestment tint over black (opaque stops — visible but not loud).
 * Returns null when the gradient should not be drawn.
 */
export function vestmentPageGradient(
  appearance: LiturgicalDayAppearance,
  enabled: boolean,
): VestmentPageGradient | null {
  if (!enabled) return null;

  const liturgical = liturgicalVestmentColor(appearance).pillBg;
  const tint = vestmentTintRgb(appearance, liturgical);

  return {
    colors: [
      PAGE_BACKGROUND_BLACK,
      mixWithBlack(tint, 0.1),
      mixWithBlack(tint, 0.2),
      mixWithBlack(tint, 0.08),
    ] as const,
    locations: [0, 0.38, 0.68, 1] as const,
    start: { x: 0.05, y: 0 },
    end: { x: 0.95, y: 1 },
  };
}
