/**
 * Icon-inspired palette: parchment, wine, gold — minimal chrome for church use.
 */
export const colors = {
  parchment: '#f5f0e8',
  card: '#fffcf7',
  ink: '#1e1a16',
  muted: '#6f6a64',
  border: '#e2d8ca',
  accentWine: '#6b2d3c',
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
  accentGold: '#b08d57',
  /** Calendar cell hover ring on dark mode — muted gold, darker than accentGold. */
  calendarHoverBorderDark: '#6e5c38',
  accentTheotokos: '#2f4a6f',
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
  tabActiveLight: '#1e1a16',
  tabActiveDark: '#e8c97a',

  darkBg: '#12100e',
  darkSurface: '#1c1814',
  darkInk: '#f2ebe2',
  darkBorder: '#2e2822',
} as const;
