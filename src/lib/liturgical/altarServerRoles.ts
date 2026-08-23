/**
 * Altar-server role outlines — typical Russian Orthodox parish practice.
 *
 * Priest / Presanctified / Great Friday: azbyka.ru ponomar duties (+ Lenten adaptations).
 * Hierarchical: ierod. Konstantin (Ostrovsky), «Порядок архиерейских богослужений» (2002).
 */

export type AltarLiturgyForm = 'priest' | 'hierarchical' | 'presanctified' | 'great_friday';

export type AltarRoleRow = {
  momentKey: string;
  roleKeys: string[];
  noteKey?: string;
};

export type AltarGuideDayContext = {
  appearanceKey: string;
  feastLevel?: number;
  weekday?: number;
  /** Day has evening Presanctified Liturgy. */
  isPresanctified: boolean;
};

export function availableAltarForms(ctx: AltarGuideDayContext): AltarLiturgyForm[] {
  if (ctx.appearanceKey === 'great_friday') {
    return ['great_friday'];
  }
  if (ctx.isPresanctified) {
    return ['presanctified', 'hierarchical'];
  }
  return ['priest', 'hierarchical'];
}

export function defaultAltarForm(ctx: AltarGuideDayContext): AltarLiturgyForm {
  return availableAltarForms(ctx)[0]!;
}

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
        'altarRoles.hierarchical.greatProtodeaconGospel',
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
  presanctified: [
    {
      momentKey: 'altarRoles.moment.hours',
      roleKeys: [
        'altarRoles.presanctified.hoursPrep',
        'altarRoles.presanctified.hoursCandle',
      ],
    },
    {
      momentKey: 'altarRoles.moment.vespers',
      roleKeys: [
        'altarRoles.presanctified.vespersCenser',
        'altarRoles.presanctified.vespersDoors',
      ],
    },
    {
      momentKey: 'altarRoles.moment.greatEntrance',
      roleKeys: [
        'altarRoles.presanctified.entranceCandles',
        'altarRoles.presanctified.entranceCenser',
      ],
      noteKey: 'altarRoles.presanctified.entranceNote',
    },
    {
      momentKey: 'altarRoles.moment.communion',
      roleKeys: [
        'altarRoles.presanctified.communionZeon',
        'altarRoles.presanctified.communionPlatter',
      ],
    },
  ],
  great_friday: [
    {
      momentKey: 'altarRoles.moment.royalHours',
      roleKeys: [
        'altarRoles.greatFriday.hoursCandle',
        'altarRoles.greatFriday.hoursCenser',
        'altarRoles.greatFriday.hoursBooks',
      ],
    },
    {
      momentKey: 'altarRoles.moment.vespers',
      roleKeys: [
        'altarRoles.greatFriday.vespersShroud',
        'altarRoles.greatFriday.vespersCandles',
        'altarRoles.greatFriday.vespersCenser',
      ],
      noteKey: 'altarRoles.greatFriday.vespersNote',
    },
  ],
};

export const ALTAR_ROLE_SOURCE_KEYS = [
  'altarRoles.sourceAzbyka',
  'altarRoles.sourceOstrovsky',
] as const;
