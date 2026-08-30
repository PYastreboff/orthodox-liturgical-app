import type { LiturgicalDayAppearance } from '../calendar/dayAppearance';
import { colors } from '../../theme/tokens';
import { liturgicalVestmentColor } from './vestments';

export type VestmentAccent = {
  /** Primary UI accent — fills, selected rows, tab backdrop tint. */
  accent: string;
  /** Icon and link colour on normal surfaces (readable when accent is a light fill). */
  icon: string;
  /** Soft tinted surface for icon badges. */
  accentSoft: string;
  /** Soft tinted surface for chips and subtle fills. */
  accentMuted: string;
  /** Foreground on solid accent (selected rows, buttons). */
  onAccent: string;
  /** Raw liturgical vestment pill colour. */
  pillBg: string;
};

const WHITE_PILL = '#f0ebe3';
const BLACK_PILL = '#121010';

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

function mixWithWhite(hex: string, amount: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  const t = Math.max(0, Math.min(1, amount));
  return toHex(
    rgb.r + (255 - rgb.r) * t,
    rgb.g + (255 - rgb.g) * t,
    rgb.b + (255 - rgb.b) * t,
  );
}

function toRgba(hex: string, alpha: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return `rgba(107,45,60,${alpha})`;
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
}

function onAccentFor(hex: string): string {
  const rgb = parseHex(hex);
  if (!rgb) return '#ffffff';
  const lum = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return lum > 0.58 ? colors.ink : '#ffffff';
}

function whiteVestmentAccent(pillBg: string, isDark: boolean): VestmentAccent {
  const accent = isDark ? WHITE_PILL : '#ffffff';
  const icon = isDark ? WHITE_PILL : colors.ink;
  return {
    accent,
    icon,
    accentSoft: isDark ? toRgba(WHITE_PILL, 0.18) : WHITE_PILL,
    accentMuted: isDark ? toRgba(WHITE_PILL, 0.09) : toRgba(WHITE_PILL, 0.55),
    onAccent: colors.ink,
    pillBg,
  };
}

function resolveAccentColor(pillBg: string, isDark: boolean): string {
  const normalized = pillBg.trim().toLowerCase();

  if (normalized === WHITE_PILL) {
    return isDark ? WHITE_PILL : '#ffffff';
  }

  if (normalized === BLACK_PILL) {
    return isDark ? '#c4b8aa' : colors.ink;
  }

  if (isDark) {
    return mixWithWhite(pillBg, 0.42);
  }

  return pillBg;
}

/** Map the day's vestment colour to UI accent tokens. */
export function vestmentAccentForAppearance(
  appearance: LiturgicalDayAppearance,
  isDark: boolean,
): VestmentAccent {
  const { pillBg } = liturgicalVestmentColor(appearance);
  if (pillBg.trim().toLowerCase() === WHITE_PILL) {
    return whiteVestmentAccent(pillBg, isDark);
  }

  const accent = resolveAccentColor(pillBg, isDark);

  return {
    accent,
    icon: accent,
    accentSoft: toRgba(accent, isDark ? 0.16 : 0.12),
    accentMuted: toRgba(accent, isDark ? 0.08 : 0.06),
    onAccent: onAccentFor(accent),
    pillBg,
  };
}

/** Standard wine/gold app accent (non-liturgical screens). */
export function staticAppAccent(isDark: boolean): VestmentAccent {
  const accent = isDark ? colors.tabActiveDark : colors.accentWine;
  return {
    accent,
    icon: accent,
    accentSoft: isDark ? 'rgba(232, 201, 122, 0.12)' : colors.accentWineSoft,
    accentMuted: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(107, 45, 60, 0.06)',
    onAccent: onAccentFor(accent),
    pillBg: colors.accentWine,
  };
}

/** Neutral fallback before appearance is available (gold weekday). */
export function defaultVestmentAccent(isDark: boolean): VestmentAccent {
  return vestmentAccentForAppearance(
    {
      key: 'weekday',
      gradient: ['#e8e4dd', '#bfb4a2'],
      foreground: colors.ink,
      subtitle: '',
      gregorianSubtitle: '',
      label: 'Weekday',
    },
    isDark,
  );
}
