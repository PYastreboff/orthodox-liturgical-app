/**
 * Design tokens — Apple system grouped surfaces and labels, with the liturgical wine as
 * the app tint. Calendar / vestment colours stay liturgical; everything structural follows
 * the iOS semantic palette so light and dark adapt the way system apps do.
 */
export const colors = {
  /** systemGroupedBackground (light). Name kept for existing call sites. */
  parchment: '#f2f2f7',
  /** secondarySystemGroupedBackground (light). */
  card: '#ffffff',
  /** label */
  ink: '#000000',
  /** secondaryLabel, opaque so it composites the same on every surface. */
  muted: '#6e6e73',
  /** secondaryLabel (dark). */
  mutedDark: '#98989f',
  /** tertiaryLabel */
  tertiary: '#aeaeb2',
  tertiaryDark: '#636366',
  /** opaqueSeparator */
  border: '#c6c6c8',
  /** separator — hairline rules inside grouped content. */
  borderSubtle: 'rgba(60, 60, 67, 0.18)',
  /** tertiarySystemFill — search fields, idle chips, icon buttons. */
  fill: 'rgba(118, 118, 128, 0.12)',
  fillDark: 'rgba(118, 118, 128, 0.24)',
  /** Pressed-row highlight (systemGray4-ish at low alpha). */
  highlight: 'rgba(0, 0, 0, 0.06)',
  highlightDark: 'rgba(255, 255, 255, 0.08)',
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
  /** Tab bar active — high contrast on grouped / dark surfaces */
  tabActiveLight: '#000000',
  tabActiveDark: '#e8c97a',

  /** systemGroupedBackground (dark) — true black, as on OLED iPhones. */
  darkBg: '#000000',
  /** secondarySystemGroupedBackground (dark) */
  darkSurface: '#1c1c1e',
  /** tertiarySystemGroupedBackground (dark) */
  darkSurfaceElevated: '#2c2c2e',
  darkInk: '#ffffff',
  darkBorder: '#38383a',
  darkBorderSubtle: 'rgba(84, 84, 88, 0.5)',
} as const;

/** Continuous-curve corner radii (pair with `borderCurve: 'continuous'` on iOS). */
export const radii = {
  xs: 8,
  sm: 10,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 26,
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

/**
 * iOS text styles (Large Title … Caption 2). The system font applies its own optical
 * tracking on Apple platforms, so letterSpacing stays 0 here; web tightens large titles
 * where they are rendered (see `largeTitleTracking`).
 */
export const typography = {
  /** Section header — sentence case, semibold, like grouped headers in iOS system apps. */
  eyebrow: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600' as const,
    letterSpacing: 0,
    textTransform: 'none' as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
  },
  footnote: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
  },
  subheadline: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  body: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '400' as const,
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600' as const,
  },
  title2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700' as const,
  },
  headline: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '700' as const,
    letterSpacing: 0,
  },
} as const;
