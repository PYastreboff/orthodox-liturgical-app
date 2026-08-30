import type { Href } from 'expo-router';

import type { ServiceKind } from './dayServices';

/** Worship tab follow-along texts. */
export type WorshipServiceId = 'chrysostom' | 'basil' | 'vespers';

const LITURGY_CHRYSOSTOM_KINDS = new Set<ServiceKind>([
  'liturgy_chrysostom',
  'liturgy_presanctified',
]);

const LITURGY_BASIL_KINDS = new Set<ServiceKind>(['liturgy_basil']);

const VESPERS_KINDS = new Set<ServiceKind>(['vespers', 'great_vespers', 'vigil']);

export function worshipServiceForKind(kind: ServiceKind): WorshipServiceId | null {
  if (VESPERS_KINDS.has(kind)) return 'vespers';
  if (LITURGY_BASIL_KINDS.has(kind)) return 'basil';
  if (LITURGY_CHRYSOSTOM_KINDS.has(kind)) return 'chrysostom';
  return null;
}

export function worshipTabHref(service: WorshipServiceId = 'chrysostom'): Href {
  return {
    pathname: '/(tabs)/liturgy',
    params: { service },
  };
}

export function worshipHrefForServiceKind(kind: ServiceKind): Href {
  return worshipTabHref(worshipServiceForKind(kind) ?? 'chrysostom');
}

export function parseWorshipServiceId(value: string | string[] | undefined): WorshipServiceId {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === 'vespers') return 'vespers';
  if (raw === 'basil') return 'basil';
  return 'chrysostom';
}

export type WorshipServicePageTitleKey =
  | 'liturgy.worship.pageTitleChrysostom'
  | 'liturgy.worship.pageTitleBasil'
  | 'liturgy.worship.pageTitleVespers';

export function worshipServicePageTitleKey(service: WorshipServiceId): WorshipServicePageTitleKey {
  if (service === 'basil') return 'liturgy.worship.pageTitleBasil';
  if (service === 'vespers') return 'liturgy.worship.pageTitleVespers';
  return 'liturgy.worship.pageTitleChrysostom';
}

export type WorshipServicePageSubtitleKey =
  | 'liturgy.chrysostom.pageSubtitle'
  | 'liturgy.basil.pageSubtitle'
  | 'liturgy.vespers.pageSubtitle';

export function worshipServicePageSubtitleKey(
  service: WorshipServiceId,
): WorshipServicePageSubtitleKey {
  if (service === 'basil') return 'liturgy.basil.pageSubtitle';
  if (service === 'vespers') return 'liturgy.vespers.pageSubtitle';
  return 'liturgy.chrysostom.pageSubtitle';
}
