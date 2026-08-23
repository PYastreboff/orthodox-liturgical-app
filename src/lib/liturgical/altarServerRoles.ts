/**
 * Altar-server role outlines for Divine Liturgy — typical Russian Orthodox parish practice.
 *
 * Priest's liturgy: azbyka.ru «Обязанности алтарников за литургией» (ponomar / altar server duties).
 * Hierarchical liturgy: ierod. Konstantin (Ostrovsky), «Порядок архиерейских богослужений» (2002),
 *   deacon.ru — Moscow / Novodevichy practice; ipodiakon (subdeacon) positions at entrances.
 */

export type AltarLiturgyForm = 'priest' | 'hierarchical';

export type AltarRoleRow = {
  /** i18n key for the moment (e.g. small entrance) */
  momentKey: string;
  /** i18n keys for each assigned role / position */
  roleKeys: string[];
  /** optional i18n note */
  noteKey?: string;
};

export const ALTAR_LITURGY_FORMS: AltarLiturgyForm[] = ['priest', 'hierarchical'];

export const ALTAR_SERVER_ROLE_ROWS: Record<AltarLiturgyForm, AltarRoleRow[]> = {
  priest: [
    {
      momentKey: 'altarRoles.moment.proskomedia',
      roleKeys: ['altarRoles.priest.proskomediaCenser', 'altarRoles.priest.proskomediaPrep'],
    },
    {
      momentKey: 'altarRoles.moment.smallEntrance',
      roleKeys: [
        'altarRoles.priest.smallEntranceCandle',
        'altarRoles.priest.smallEntranceDoors',
      ],
      noteKey: 'altarRoles.priest.smallEntranceNote',
    },
    {
      momentKey: 'altarRoles.moment.epistle',
      roleKeys: ['altarRoles.priest.epistleCenser', 'altarRoles.priest.epistleReader'],
    },
    {
      momentKey: 'altarRoles.moment.gospel',
      roleKeys: ['altarRoles.priest.gospelCandle'],
      noteKey: 'altarRoles.priest.gospelNote',
    },
    {
      momentKey: 'altarRoles.moment.greatEntrance',
      roleKeys: [
        'altarRoles.priest.greatEntranceCandles',
        'altarRoles.priest.greatEntranceCross',
        'altarRoles.priest.greatEntranceFans',
        'altarRoles.priest.greatEntranceCenser',
      ],
      noteKey: 'altarRoles.priest.greatEntranceNote',
    },
    {
      momentKey: 'altarRoles.moment.consecration',
      roleKeys: [
        'altarRoles.priest.consecrationVeil',
        'altarRoles.priest.consecrationCenser',
        'altarRoles.priest.consecrationZeon',
      ],
    },
    {
      momentKey: 'altarRoles.moment.communion',
      roleKeys: ['altarRoles.priest.communionPlatter', 'altarRoles.priest.communionCenser'],
    },
  ],
  hierarchical: [
    {
      momentKey: 'altarRoles.moment.smallEntrance',
      roleKeys: [
        'altarRoles.hierarchical.smallCandle',
        'altarRoles.hierarchical.smallStaff',
        'altarRoles.hierarchical.smallDeaconCensers',
        'altarRoles.hierarchical.smallSubdeaconLights',
        'altarRoles.hierarchical.smallProtodeaconGospel',
      ],
      noteKey: 'altarRoles.hierarchical.smallEntranceNote',
    },
    {
      momentKey: 'altarRoles.moment.gospel',
      roleKeys: [
        'altarRoles.hierarchical.gospelSubdeaconIncense',
        'altarRoles.hierarchical.gospelOmophor',
      ],
    },
    {
      momentKey: 'altarRoles.moment.greatEntrance',
      roleKeys: [
        'altarRoles.hierarchical.greatCandle',
        'altarRoles.hierarchical.greatStaff',
        'altarRoles.hierarchical.greatDeaconCensers',
        'altarRoles.hierarchical.greatSubdeaconLights',
        'altarRoles.hierarchical.greatProtodeaconDiskos',
        'altarRoles.hierarchical.greatFirstPriestChalice',
      ],
      noteKey: 'altarRoles.hierarchical.greatEntranceNote',
    },
    {
      momentKey: 'altarRoles.moment.consecration',
      roleKeys: [
        'altarRoles.hierarchical.consecrationVeil',
        'altarRoles.hierarchical.consecrationSubdeaconIncense',
      ],
    },
    {
      momentKey: 'altarRoles.moment.communion',
      roleKeys: [
        'altarRoles.hierarchical.communionDrink',
        'altarRoles.hierarchical.communionPlatter',
      ],
    },
  ],
};

export const ALTAR_ROLE_SOURCE_KEYS = [
  'altarRoles.sourceAzbyka',
  'altarRoles.sourceOstrovsky',
] as const;
