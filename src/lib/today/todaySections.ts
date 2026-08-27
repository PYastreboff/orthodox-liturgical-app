import type { SectionIconName } from '../../components/SectionIcon';
import type { ClergyRole } from '../../types/liturgical';

/** Day detail screens opened from the Today tile grid. */
export const TODAY_SECTION_IDS = [
  'date',
  'fasting',
  'prayers',
  'liturgy',
  'vestments',
  'services',
  'choirGuide',
  'altarRoles',
  'readerGuide',
  'deaconGuide',
  'priestGuide',
  'readings',
  'feasts',
  'saints',
] as const;

export type TodaySectionId = (typeof TODAY_SECTION_IDS)[number];

export type TodayTileId = TodaySectionId;

export type TodayTileDef = {
  id: TodayTileId;
  icon: SectionIconName;
  /** Short label for the home grid. */
  titleKey: string;
  href: string;
};

const ROLE_GUIDE_BY_SERVING: Partial<Record<ClergyRole, TodaySectionId>> = {
  chorister: 'choirGuide',
  altar_server: 'altarRoles',
  reader: 'readerGuide',
  deacon: 'deaconGuide',
  priest: 'priestGuide',
  bishop: 'priestGuide',
};

const BASE_TILES: readonly TodayTileDef[] = [
  { id: 'date', icon: 'date', titleKey: 'today.tileDate', href: '/day/date' },
  { id: 'fasting', icon: 'fasting', titleKey: 'today.tileFasting', href: '/day/fasting' },
  { id: 'prayers', icon: 'prayers', titleKey: 'today.tilePrayers', href: '/day/prayers' },
  { id: 'liturgy', icon: 'liturgy', titleKey: 'today.tileLiturgy', href: '/day/liturgy' },
  { id: 'readings', icon: 'readings', titleKey: 'today.tileReadings', href: '/day/readings' },
  { id: 'feasts', icon: 'feasts', titleKey: 'today.tileFeasts', href: '/day/feasts' },
  { id: 'saints', icon: 'saints', titleKey: 'today.tileSaints', href: '/day/saints' },
  { id: 'services', icon: 'services', titleKey: 'today.tileServices', href: '/day/services' },
];

export function isTodaySectionId(value: string): value is TodaySectionId {
  return (TODAY_SECTION_IDS as readonly string[]).includes(value);
}

export function todaySectionTitleKey(section: TodaySectionId, servingRole: ClergyRole): string {
  if (section === 'vestments') {
    return servingRole === 'layperson' || servingRole === 'chorister'
      ? 'today.churchDressPageTitle'
      : 'today.vestmentsPageTitle';
  }
  switch (section) {
    case 'date':
      return 'today.sectionDate';
    case 'fasting':
      return 'today.sectionFasting';
    case 'prayers':
      return 'today.sectionPrayers';
    case 'liturgy':
      return 'today.sectionLiturgy';
    case 'services':
      return 'today.sectionServices';
    case 'choirGuide':
      return 'today.sectionChoirGuide';
    case 'altarRoles':
      return 'today.sectionAltarRoles';
    case 'readerGuide':
      return 'today.sectionReaderGuide';
    case 'deaconGuide':
      return 'today.sectionDeaconGuide';
    case 'priestGuide':
      return 'today.sectionPriestGuide';
    case 'readings':
      return 'today.sectionReadings';
    case 'feasts':
      return 'today.sectionFeasts';
    case 'saints':
      return 'today.sectionSaints';
    default:
      return 'today.sectionDate';
  }
}

export function todaySectionIcon(section: TodaySectionId, servingRole: ClergyRole): SectionIconName {
  if (section === 'vestments') {
    return servingRole === 'layperson' || servingRole === 'chorister'
      ? 'church-clothing'
      : 'vestments';
  }
  switch (section) {
    case 'date':
      return 'date';
    case 'fasting':
      return 'fasting';
    case 'prayers':
      return 'prayers';
    case 'liturgy':
      return 'liturgy';
    case 'services':
      return 'services';
    case 'choirGuide':
      return 'choir-guide';
    case 'altarRoles':
      return 'altar-roles';
    case 'readerGuide':
      return 'reader-guide';
    case 'deaconGuide':
      return 'deacon-guide';
    case 'priestGuide':
      return 'priest-guide';
    case 'readings':
      return 'readings';
    case 'feasts':
      return 'feasts';
    case 'saints':
      return 'saints';
    default:
      return 'date';
  }
}

export function isSectionVisibleForRole(section: TodaySectionId, servingRole: ClergyRole): boolean {
  switch (section) {
    case 'choirGuide':
      return servingRole === 'chorister';
    case 'altarRoles':
      return servingRole === 'altar_server';
    case 'readerGuide':
      return servingRole === 'reader';
    case 'deaconGuide':
      return servingRole === 'deacon';
    case 'priestGuide':
      return servingRole === 'priest' || servingRole === 'bishop';
    default:
      return true;
  }
}

function tileTitleKeyForVestments(servingRole: ClergyRole): string {
  return servingRole === 'layperson' || servingRole === 'chorister'
    ? 'today.tileChurchDress'
    : 'today.tileVestments';
}

function tileTitleKeyForGuide(section: TodaySectionId): string {
  switch (section) {
    case 'choirGuide':
      return 'today.tileChoirGuide';
    case 'altarRoles':
      return 'today.tileAltarRoles';
    case 'readerGuide':
      return 'today.tileReaderGuide';
    case 'deaconGuide':
      return 'today.tileDeaconGuide';
    case 'priestGuide':
      return 'today.tilePriestGuide';
    default:
      return todaySectionTitleKey(section, 'layperson');
  }
}

/** Home tile grid — vestments + optional role guide after core tiles. */
export function todayHomeTiles(servingRole: ClergyRole): TodayTileDef[] {
  const vestments: TodayTileDef = {
    id: 'vestments',
    icon: todaySectionIcon('vestments', servingRole),
    titleKey: tileTitleKeyForVestments(servingRole),
    href: '/day/vestments',
  };

  const tiles: TodayTileDef[] = [...BASE_TILES, vestments];

  const guideId = ROLE_GUIDE_BY_SERVING[servingRole];
  if (guideId) {
    tiles.push({
      id: guideId,
      icon: todaySectionIcon(guideId, servingRole),
      titleKey: tileTitleKeyForGuide(guideId),
      href: `/day/${guideId}`,
    });
  }

  return tiles;
}
