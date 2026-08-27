export const TODAY_COLLAPSIBLE_KEYS = [
  'date',
  'feasts',
  'saints',
  'fasting',
  'prayers',
  'vestments',
  'services',
  'choirGuide',
  'altarRoles',
  'readerGuide',
  'deaconGuide',
  'priestGuide',
  'readings',
] as const;

export type TodayCollapsibleKey = (typeof TODAY_COLLAPSIBLE_KEYS)[number];

export type TodayCollapsedState = Record<TodayCollapsibleKey, boolean>;

/** `true` = section is collapsed. */
export const DEFAULT_TODAY_COLLAPSED: TodayCollapsedState = {
  date: false,
  feasts: true,
  saints: true,
  fasting: false,
  prayers: true,
  vestments: false,
  services: false,
  choirGuide: true,
  altarRoles: true,
  readerGuide: true,
  deaconGuide: true,
  priestGuide: true,
  readings: true,
};

export function mergeTodayCollapsed(
  partial: Partial<TodayCollapsedState> | undefined,
): TodayCollapsedState {
  if (!partial) return { ...DEFAULT_TODAY_COLLAPSED };
  const next = { ...DEFAULT_TODAY_COLLAPSED };
  for (const key of TODAY_COLLAPSIBLE_KEYS) {
    if (typeof partial[key] === 'boolean') {
      next[key] = partial[key]!;
    }
  }
  return next;
}
