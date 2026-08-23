import type { ComponentProps } from 'react';
import type { MaterialCommunityIcons } from '@expo/vector-icons';

import type { ClergyRole } from '../../types/liturgical';

export const SERVING_ROLE_IDS: ClergyRole[] = [
  'layperson',
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
  reader: 'book-open-page-variant-outline',
  altar_server: 'candle',
  deacon: 'account-tie-outline',
  priest: 'cross',
  bishop: 'crown-outline',
};

export const SERVING_ROLE_LABEL_KEYS: Record<ClergyRole, string> = {
  layperson: 'today.roleLayperson',
  reader: 'today.roleReader',
  altar_server: 'today.roleAltarServer',
  deacon: 'today.roleDeacon',
  priest: 'today.rolePriest',
  bishop: 'today.roleBishop',
};
