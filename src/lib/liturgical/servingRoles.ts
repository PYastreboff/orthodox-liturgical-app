import type { ComponentProps } from 'react';
import type { MaterialCommunityIcons } from '@expo/vector-icons';

import type { ClergyRole } from '../../types/liturgical';

/** Display order: lay → choir → altar → ordained ranks. */
export const SERVING_ROLE_IDS: ClergyRole[] = [
  'layperson',
  'chorister',
  'altar_server',
  'reader',
  'deacon',
  'priest',
  'bishop',
];

export const SERVING_ROLE_ICON_NAMES: Record<
  ClergyRole,
  ComponentProps<typeof MaterialCommunityIcons>['name']
> = {
  layperson: 'account-outline',
  chorister: 'music-note-outline',
  altar_server: 'candle',
  reader: 'book-open-page-variant-outline',
  deacon: 'account-tie-outline',
  priest: 'cross',
  bishop: 'crown-outline',
};

export const SERVING_ROLE_LABEL_KEYS: Record<ClergyRole, string> = {
  layperson: 'today.roleLayperson',
  chorister: 'today.roleChorister',
  altar_server: 'today.roleAltarServer',
  reader: 'today.roleReader',
  deacon: 'today.roleDeacon',
  priest: 'today.rolePriest',
  bishop: 'today.roleBishop',
};
