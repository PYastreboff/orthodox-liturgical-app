import type { LiturgicalDayAppearance } from '../calendar/dayAppearance';
import { colors } from '../../theme/tokens';
import { liturgicalVestmentColor } from './vestments';

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
  '#121010': { gradient: ['#2a2826', '#0a0a0a'], foreground: '#f2ebe2' },
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

/** Today tab page base — parchment in light mode, charcoal in dark mode. */
export function todayPageBackgroundColor(isDark: boolean): string {
  return isDark ? colors.darkBg : colors.parchment;
}

function mixColors(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
  t: number,
): string {
  const u = Math.max(0, Math.min(1, t));
  return toHex(a.r + (b.r - a.r) * u, a.g + (b.g - a.g) * u, a.b + (b.b - a.b) * u);
}

/** Light mode: vestment hue as a soft tint on parchment. */
function lightModeVestmentGradientStops(pillBg: string): readonly [string, string, string, string] {
  const base = parseHex(colors.parchment) ?? { r: 245, g: 240, b: 232 };
  const baseLight = parseHex(colors.card) ?? { r: 255, g: 252, b: 247 };
  const tint = parseHex(pillBg) ?? { r: 128, g: 128, b: 128 };
  return [
    mixColors(base, baseLight, 0.4),
    mixColors(baseLight, tint, 0.1),
    mixColors(baseLight, tint, 0.22),
    mixColors(baseLight, tint, 0.14),
  ] as const;
}

/** Dark mode: very subtle vestment hint on charcoal. */
function darkModeVestmentGradientStops(pillBg: string): readonly [string, string, string, string] {
  const base = parseHex(colors.darkBg) ?? { r: 18, g: 16, b: 14 };
  const baseLight = parseHex(colors.darkSurface) ?? { r: 28, g: 24, b: 20 };
  const tint = parseHex(pillBg) ?? { r: 128, g: 128, b: 128 };
  return [
    mixColors(base, baseLight, 0.18),
    mixColors(baseLight, tint, 0.03),
    mixColors(baseLight, tint, 0.08),
    mixColors(baseLight, tint, 0.04),
  ] as const;
}

const HERO_GRADIENT_BY_APPEARANCE_KEY: Partial<Record<string, VestmentHeroStyle>> = {
  great_friday: { gradient: ['#2a2826', '#0a0a0a'], foreground: '#f2ebe2' },
  holy_saturday: { gradient: ['#121010', '#f0ebe3'], foreground: '#1e1a16' },
};

const PAGE_GRADIENT_LAYOUT = {
  locations: [0, 0.38, 0.68, 1] as const,
  start: { x: 0.05, y: 0 },
  end: { x: 0.95, y: 1 },
};

/** DayHero card gradient — same vestment hue as pills / page glow. */
export function vestmentHeroGradient(appearance: LiturgicalDayAppearance): VestmentHeroStyle {
  const byKey = HERO_GRADIENT_BY_APPEARANCE_KEY[appearance.key];
  if (byKey) return byKey;

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

function lightModePageGradient(appearance: LiturgicalDayAppearance): VestmentPageGradient {
  if (appearance.key === 'great_friday') {
    return {
      colors: lightModeVestmentGradientStops('#121010'),
      ...PAGE_GRADIENT_LAYOUT,
    };
  }

  if (appearance.key === 'holy_saturday') {
    return {
      colors: lightModeVestmentGradientStops('#f0ebe3'),
      locations: [0, 0.35, 0.65, 1] as const,
      start: PAGE_GRADIENT_LAYOUT.start,
      end: PAGE_GRADIENT_LAYOUT.end,
    };
  }

  const { pillBg } = liturgicalVestmentColor(appearance);
  return {
    colors: lightModeVestmentGradientStops(pillBg),
    ...PAGE_GRADIENT_LAYOUT,
  };
}

function darkModePageGradient(appearance: LiturgicalDayAppearance): VestmentPageGradient {
  if (appearance.key === 'great_friday') {
    return {
      colors: darkModeVestmentGradientStops('#121010'),
      ...PAGE_GRADIENT_LAYOUT,
    };
  }

  if (appearance.key === 'holy_saturday') {
    return {
      colors: darkModeVestmentGradientStops('#f0ebe3'),
      locations: [0, 0.35, 0.65, 1] as const,
      start: PAGE_GRADIENT_LAYOUT.start,
      end: PAGE_GRADIENT_LAYOUT.end,
    };
  }

  const { pillBg } = liturgicalVestmentColor(appearance);
  return {
    colors: darkModeVestmentGradientStops(pillBg),
    ...PAGE_GRADIENT_LAYOUT,
  };
}

/**
 * Vestment-colour page tint on parchment (light) or charcoal (dark).
 */
export function vestmentPageGradient(
  appearance: LiturgicalDayAppearance,
  enabled: boolean,
  isDark: boolean,
): VestmentPageGradient | null {
  if (!enabled) return null;
  return isDark ? darkModePageGradient(appearance) : lightModePageGradient(appearance);
}
