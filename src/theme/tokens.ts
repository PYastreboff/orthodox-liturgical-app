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
  feastHoverBorderDark: '#a33245',
  /** Great and Holy Friday outline on the month grid. */
  greatFridayBorder: '#3d1218',
  greatFridayBorderDark: '#6b2832',
  /** Great Friday cell border on hover — deep wine, not gold. */
  greatFridayHoverBorder: '#5a1a24',
  greatFridayHoverBorderDark: '#8f3d4a',
  accentGold: '#b08d57',
  accentTheotokos: '#2f4a6f',
  /** Tab bar active — high contrast on parchment / dark surfaces */
  tabActiveLight: '#1e1a16',
  tabActiveDark: '#e8c97a',

  darkBg: '#12100e',
  darkSurface: '#1c1814',
  darkInk: '#f2ebe2',
  darkBorder: '#2e2822',
} as const;
