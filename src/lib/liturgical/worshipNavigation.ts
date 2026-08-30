import type { Href } from 'expo-router';

import type { ServiceKind } from './dayServices';

/** Worship tab follow-along texts. */
export type WorshipServiceId = 'chrysostom' | 'vespers';

const LITURGY_KINDS = new Set<ServiceKind>([
  'liturgy_chrysostom',
  'liturgy_basil',
  'liturgy_presanctified',
]);

const VESPERS_KINDS = new Set<ServiceKind>(['vespers', 'great_vespers', 'vigil']);

export function worshipServiceForKind(kind: ServiceKind): WorshipServiceId | null {
  if (VESPERS_KINDS.has(kind)) return 'vespers';
  if (LITURGY_KINDS.has(kind)) return 'chrysostom';
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
  return raw === 'vespers' ? 'vespers' : 'chrysostom';
}
