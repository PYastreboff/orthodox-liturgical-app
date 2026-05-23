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

export type VestmentHeroStyle = {
  gradient: readonly [string, string];
  foreground: string;
};

/** Two-stop hero gradients keyed by vestment pill colour (matches Vestments section). */
const HERO_GRADIENT_BY_PILL_BG: Record<string, VestmentHeroStyle> = {
  '#b08d57': { gradient: ['#f7f1e4', '#d9c49a'], foreground: '#1e1a16' },
  '#f0ebe3': { gradient: ['#fffdf6', '#f2d58c'], foreground: '#1e1a16' },
  '#2f4a6f': { gradient: ['#4a6a94', '#1a2a40'], foreground: '#ffffff' },
  '#8b2e3c': { gradient: ['#b84a58', '#4a1520'], foreground: '#ffffff' },
  '#2d5a3e': { gradient: ['#4a8a62', '#1a3024'], foreground: '#ffffff' },
  '#1f2433': { gradient: ['#3a4558', '#0f141f'], foreground: '#e8eef8' },
  '#5c3d6e': { gradient: ['#7a5a8c', '#2a1838'], foreground: '#f7eef8' },
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

/** Same swatch as Today → Vestments pills; subtle tint on black. */
function gradientStrengthsForSwatch(pillBg: string): { mid: number; peak: number; tail: number } {
  switch (pillBg) {
    case '#f0ebe3':
      return { mid: 0.09, peak: 0.16, tail: 0.07 };
    case '#1f2433':
      return { mid: 0.07, peak: 0.12, tail: 0.06 };
    case '#b08d57':
      return { mid: 0.08, peak: 0.15, tail: 0.07 };
    case '#2f4a6f':
    case '#5c3d6e':
    case '#8b2e3c':
    case '#2d5a3e':
      return { mid: 0.08, peak: 0.14, tail: 0.06 };
    default:
      return { mid: 0.08, peak: 0.15, tail: 0.07 };
  }
}

/** DayHero card gradient — same vestment hue as pills / page glow. */
export function vestmentHeroGradient(appearance: LiturgicalDayAppearance): VestmentHeroStyle {
  const { pillBg, pillText } = liturgicalVestmentColor(appearance);
  const preset = HERO_GRADIENT_BY_PILL_BG[pillBg];
  if (preset) return preset;

  const tint = parseHex(pillBg) ?? { r: 128, g: 128, b: 128 };
  const light = toHex(
    tint.r + (255 - tint.r) * 0.55,
    tint.g + (255 - tint.g) * 0.55,
    tint.b + (255 - tint.b) * 0.55,
  );
  const dark = toHex(tint.r * 0.55, tint.g * 0.55, tint.b * 0.55);
  return { gradient: [light, dark], foreground: pillText };
}

/**
 * Vestment-colour tint over black (opaque stops). Uses {@link liturgicalVestmentColor}
 * so the glow always matches the Vestments section for that day.
 */
export function vestmentPageGradient(
  appearance: LiturgicalDayAppearance,
  enabled: boolean,
): VestmentPageGradient | null {
  if (!enabled) return null;

  const { pillBg } = liturgicalVestmentColor(appearance);
  const tint = parseHex(pillBg) ?? { r: 128, g: 128, b: 128 };
  const { mid, peak, tail } = gradientStrengthsForSwatch(pillBg);

  return {
    colors: [
      PAGE_BACKGROUND_BLACK,
      mixWithBlack(tint, mid),
      mixWithBlack(tint, peak),
      mixWithBlack(tint, tail),
    ] as const,
    locations: [0, 0.38, 0.68, 1] as const,
    start: { x: 0.05, y: 0 },
    end: { x: 0.95, y: 1 },
  };
}
