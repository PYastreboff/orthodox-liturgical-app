import type { FastSummaryKind } from '../../i18n/fastingLabels';

export type FastPillStyle = {
  backgroundColor: string;
  color: string;
};

const FAST_PILL_STYLES: Record<FastSummaryKind, FastPillStyle> = {
  no_fast: {
    backgroundColor: '#4a7c59',
    color: '#ffffff',
  },
  strict: {
    backgroundColor: '#5c3b2e',
    color: '#ffffff',
  },
  wine_oil: {
    backgroundColor: '#9c5c2e',
    color: '#ffffff',
  },
  fish: {
    backgroundColor: '#3d6878',
    color: '#ffffff',
  },
  dairy: {
    backgroundColor: '#8b7355',
    color: '#ffffff',
  },
  total_abstinence: {
    backgroundColor: '#1a1412',
    color: '#ffffff',
  },
};

export function fastPillStyleForKind(kind: FastSummaryKind): FastPillStyle {
  return FAST_PILL_STYLES[kind];
}

/** Fasting pill kinds shown in Settings and documentation (order matters). */
export const FAST_PILL_LEGEND_KINDS = [
  'strict',
  'wine_oil',
  'fish',
  'dairy',
  'total_abstinence',
  'no_fast',
] as const satisfies readonly FastSummaryKind[];

export const FAST_PILL_LEGEND_LABEL_KEY: Record<
  (typeof FAST_PILL_LEGEND_KINDS)[number],
  `fasting.${string}`
> = {
  strict: 'fasting.levelStrict',
  wine_oil: 'fasting.levelWineOil',
  fish: 'fasting.levelFish',
  dairy: 'fasting.levelDairy',
  total_abstinence: 'fasting.levelNoEating',
  no_fast: 'fasting.summaryNoFast',
};
