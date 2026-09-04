import { colors } from '../../theme/tokens';
import type { ServiceKind } from './dayServices';

/**
 * A colour-code for a service pill. `fg` fits on the solid `bg` pill.
 */
export type ServiceTint = {
  kind: 'wine' | 'gold' | 'green' | 'neutral';
  fg: string;
  bg: string;
  border: string;
};

const WINE: ServiceTint = {
  kind: 'wine',
  fg: '#ffffff',
  bg: colors.accentWine,
  border: colors.accentWine,
};

const GOLD: ServiceTint = {
  kind: 'gold',
  fg: '#ffffff',
  bg: colors.accentGold,
  border: colors.accentGold,
};

const GREEN: ServiceTint = {
  kind: 'green',
  fg: '#ffffff',
  bg: colors.serviceGreen,
  border: colors.serviceGreen,
};

/** Colour-code a worship-screen service id (`chrysostom`, `basil`, `vespers`). */
export function worshipServiceTint(service: 'chrysostom' | 'basil' | 'vespers'): ServiceTint {
  switch (service) {
    case 'vespers':
      return WINE;
    case 'chrysostom':
      return GOLD;
    case 'basil':
      return GREEN;
  }
}

/** Colour-code a service by its kind (vespers = wine, Chrysostom = gold, Basil = green). */
export function serviceKindTint(kind: ServiceKind): ServiceTint {
  switch (kind) {
    case 'vespers':
    case 'great_vespers':
    case 'vigil':
      return WINE;
    case 'liturgy_chrysostom':
      return GOLD;
    case 'liturgy_basil':
      return GREEN;
    default:
      return { kind: 'neutral', fg: colors.ink, bg: colors.card, border: colors.borderSubtle };
  }
}