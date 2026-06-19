/**
 * Russian Orthodox cross geometry (viewBox 0 0 100 100).
 * Shared by in-app SVG and `scripts/generate-brand-assets.mjs`.
 */
export const ORTHODOX_CROSS_VIEW = 100;

/** Bar thickness in viewBox units — tuned for legibility from favicon to splash. */
export const ORTHODOX_CROSS_BARS = {
  vertical: { cx: 50, top: 4, bottom: 96, width: 10 },
  /** Main crossbar — upper third, arms extend wide. */
  main: { cy: 33, left: 11, right: 89, height: 10.5 },
  /** Titulus / inscription bar — short, above the main bar. */
  top: { cy: 13, left: 39, right: 61, height: 7.5 },
  /** Slanted footrest — left end higher (good thief), right end lower. */
  footrest: { cx: 50, cy: 78, width: 32, height: 7, angleDeg: 18 },
} as const;

export function orthodoxCrossCornerRadius(size: number): number {
  return Math.max(0.6, size * 0.028);
}
