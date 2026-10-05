/**
 * Liturgical design tokens — parchment, wine, gold with a modern surface system.
 */
export const colors = {
  parchment: '#f7f3ec',
  card: '#ffffff',
  ink: '#161412',
  muted: '#6b6560',
  border: '#e6ddd2',
  borderSubtle: 'rgba(30, 26, 22, 0.08)',
  accentWine: '#6b2d3c',
  accentWineSoft: 'rgba(107, 45, 60, 0.12)',
  /** Major feast outline on the month grid — brighter than accentWine. */
  feastBorder: '#d63a52',
  /** Calendar Sunday column header — light mode (readable on parchment). */
  feastTextSoft: '#872532',
  feastTextSoftDark: '#f0a8b2',
  /** Feast cell border on hover (darker than feastBorder). */
  feastHoverBorder: '#8f2435',
  feastHoverBorderDark: '#7a3540',
  /** Great and Holy Friday outline on the month grid. */
  greatFridayBorder: '#3d1218',
  /** Muted wine-brown — distinct but not bright red on dark cells. */
  greatFridayBorderDark: '#5a4846',
  /** Great Friday cell border on hover — deep wine, not gold. */
  greatFridayHoverBorder: '#5a1a24',
  greatFridayHoverBorderDark: '#4a3c3a',
  accentGold: '#a67c3d',
  accentGoldSoft: 'rgba(166, 124, 61, 0.14)',
  /** Calendar cell hover ring on dark mode — muted gold, darker than accentGold. */
  calendarHoverBorderDark: '#6e5c38',
  accentTheotokos: '#2f4a6f',
  /** Service-type colour code — St Basil Liturgy (darker green). */
  serviceGreen: '#2f5a34',
  serviceGreenSoft: 'rgba(47, 90, 52, 0.14)',
  serviceGreenDark: '#4e8a5a',
  /** Custom calendar events (namedays/feasts use accentWine). */
  personalEvent: '#2d2b5e',
  /** Soft periwinkle — readable on dark calendar cells (#181614–#2c2822). */
  personalEventDark: '#a4a2e6',
  /** Birthdays — same family as custom events, slightly lighter. */
  personalBirthday: '#45428a',
  personalBirthdayDark: '#b0ace8',
  /** Day of repose — personal memorial. */
  personalRepose: '#4a4858',
  personalReposeDark: '#c4c0d0',
  /** 40th-day memorial derived from a repose entry. */
  personalFortieth: '#5a5868',
  personalFortiethDark: '#d4d0de',
  /** Tab bar active — high contrast on parchment / dark surfaces */
  tabActiveLight: '#161412',
  tabActiveDark: '#e8c97a',

  darkBg: '#0c0b0a',
  darkSurface: '#181614',
  darkSurfaceElevated: '#211d19',
  darkInk: '#f4efe8',
  darkBorder: '#2c2620',
  darkBorderSubtle: 'rgba(255, 255, 255, 0.08)',
} as const;

export const radii = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  section: 32,
} as const;

export const typography = {
  eyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800' as const,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500' as const,
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700' as const,
  },
  headline: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800' as const,
    letterSpacing: -0.3,
  },
} as const;
