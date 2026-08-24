/**
 * Deacon guide — typical Russian Orthodox parish practice.
 *
 * Priest’s Liturgy: common diaconal cues (litanies, entrances, Gospel, Communion).
 * Hierarchical: azbyka.ru / Ostrovsky hierarchical directions (protodeacon & deacons).
 * Presanctified / Great Friday: Lenten adaptations.
 */

export type DeaconLiturgyForm = 'priest' | 'hierarchical' | 'presanctified' | 'great_friday';

export type DeaconGuideRow = {
  momentKey: string;
  roleKeys: string[];
  noteKey?: string;
};

export type DeaconGuideDayContext = {
  appearanceKey: string;
  feastLevel?: number;
  weekday?: number;
  isPresanctified: boolean;
};

export function availableDeaconForms(ctx: DeaconGuideDayContext): DeaconLiturgyForm[] {
  if (ctx.appearanceKey === 'great_friday') {
    return ['great_friday'];
  }
  if (ctx.isPresanctified) {
    return ['presanctified', 'hierarchical'];
  }
  return ['priest', 'hierarchical'];
}

export function defaultDeaconForm(ctx: DeaconGuideDayContext): DeaconLiturgyForm {
  return availableDeaconForms(ctx)[0]!;
}

export const DEACON_GUIDE_ROWS: Record<DeaconLiturgyForm, DeaconGuideRow[]> = {
  priest: [
    {
      momentKey: 'deaconGuide.moment.prepare',
      roleKeys: [
        'deaconGuide.priest.prepareVest',
        'deaconGuide.priest.prepareCenser',
        'deaconGuide.priest.prepareBooks',
      ],
    },
    {
      momentKey: 'deaconGuide.moment.opening',
      roleKeys: [
        'deaconGuide.priest.openingBless',
        'deaconGuide.priest.openingPeace',
        'deaconGuide.priest.openingStand',
      ],
      noteKey: 'deaconGuide.priest.openingNote',
    },
    {
      momentKey: 'deaconGuide.moment.smallEntrance',
      roleKeys: [
        'deaconGuide.priest.smallGospel',
        'deaconGuide.priest.smallWisdom',
        'deaconGuide.priest.smallDoors',
      ],
    },
    {
      momentKey: 'deaconGuide.moment.epistle',
      roleKeys: [
        'deaconGuide.priest.epistleCense',
        'deaconGuide.priest.epistleWisdom',
        'deaconGuide.priest.epistleAttend',
      ],
    },
    {
      momentKey: 'deaconGuide.moment.gospel',
      roleKeys: [
        'deaconGuide.priest.gospelBless',
        'deaconGuide.priest.gospelAnnounce',
        'deaconGuide.priest.gospelRead',
      ],
      noteKey: 'deaconGuide.priest.gospelNote',
    },
    {
      momentKey: 'deaconGuide.moment.litanies',
      roleKeys: [
        'deaconGuide.priest.litaniesFervent',
        'deaconGuide.priest.litaniesCatechumens',
        'deaconGuide.priest.litaniesFaithful',
      ],
    },
    {
      momentKey: 'deaconGuide.moment.greatEntrance',
      roleKeys: [
        'deaconGuide.priest.greatCenser',
        'deaconGuide.priest.greatProcession',
        'deaconGuide.priest.greatDoors',
      ],
      noteKey: 'deaconGuide.priest.greatEntranceNote',
    },
    {
      momentKey: 'deaconGuide.moment.anaphora',
      roleKeys: [
        'deaconGuide.priest.anaphoraDoors',
        'deaconGuide.priest.anaphoraStand',
        'deaconGuide.priest.anaphoraZeon',
      ],
    },
    {
      momentKey: 'deaconGuide.moment.communion',
      roleKeys: [
        'deaconGuide.priest.communionInvite',
        'deaconGuide.priest.communionAssist',
        'deaconGuide.priest.communionDismissal',
      ],
    },
  ],
  hierarchical: [
    {
      momentKey: 'deaconGuide.moment.prepare',
      roleKeys: [
        'deaconGuide.hierarchical.prepareMeet',
        'deaconGuide.hierarchical.prepareVest',
        'deaconGuide.hierarchical.prepareOrder',
      ],
      noteKey: 'deaconGuide.hierarchical.prepareNote',
    },
    {
      momentKey: 'deaconGuide.moment.opening',
      roleKeys: [
        'deaconGuide.hierarchical.openingCathedra',
        'deaconGuide.hierarchical.openingPeace',
      ],
    },
    {
      momentKey: 'deaconGuide.moment.smallEntrance',
      roleKeys: [
        'deaconGuide.hierarchical.smallCensers',
        'deaconGuide.hierarchical.smallProtodeacon',
        'deaconGuide.hierarchical.smallFlank',
      ],
      noteKey: 'deaconGuide.hierarchical.smallEntranceNote',
    },
    {
      momentKey: 'deaconGuide.moment.epistle',
      roleKeys: [
        'deaconGuide.hierarchical.epistleFirst',
        'deaconGuide.hierarchical.epistleBless',
        'deaconGuide.hierarchical.epistleAmbon',
      ],
      noteKey: 'deaconGuide.hierarchical.epistleNote',
    },
    {
      momentKey: 'deaconGuide.moment.gospel',
      roleKeys: [
        'deaconGuide.hierarchical.gospelCense',
        'deaconGuide.hierarchical.gospelProtodeacon',
        'deaconGuide.hierarchical.gospelOmophor',
      ],
    },
    {
      momentKey: 'deaconGuide.moment.greatEntrance',
      roleKeys: [
        'deaconGuide.hierarchical.greatCensers',
        'deaconGuide.hierarchical.greatDiskos',
        'deaconGuide.hierarchical.greatSolea',
      ],
      noteKey: 'deaconGuide.hierarchical.greatEntranceNote',
    },
    {
      momentKey: 'deaconGuide.moment.anaphora',
      roleKeys: [
        'deaconGuide.hierarchical.anaphoraAssist',
        'deaconGuide.hierarchical.anaphoraCenser',
      ],
    },
    {
      momentKey: 'deaconGuide.moment.communion',
      roleKeys: [
        'deaconGuide.hierarchical.communionBishop',
        'deaconGuide.hierarchical.communionPeople',
      ],
    },
  ],
  presanctified: [
    {
      momentKey: 'deaconGuide.moment.prepare',
      roleKeys: [
        'deaconGuide.presanctified.prepareVest',
        'deaconGuide.presanctified.prepareCenser',
      ],
    },
    {
      momentKey: 'deaconGuide.moment.vespers',
      roleKeys: [
        'deaconGuide.presanctified.vespersLitanies',
        'deaconGuide.presanctified.vespersEntrance',
      ],
    },
    {
      momentKey: 'deaconGuide.moment.paremia',
      roleKeys: [
        'deaconGuide.presanctified.paremiaWisdom',
        'deaconGuide.presanctified.paremiaPrayer',
      ],
      noteKey: 'deaconGuide.presanctified.paremiaNote',
    },
    {
      momentKey: 'deaconGuide.moment.greatEntrance',
      roleKeys: [
        'deaconGuide.presanctified.entranceSilent',
        'deaconGuide.presanctified.entranceKneel',
      ],
      noteKey: 'deaconGuide.presanctified.entranceNote',
    },
    {
      momentKey: 'deaconGuide.moment.communion',
      roleKeys: [
        'deaconGuide.presanctified.communionInvite',
        'deaconGuide.presanctified.communionAssist',
      ],
    },
  ],
  great_friday: [
    {
      momentKey: 'deaconGuide.moment.royalHours',
      roleKeys: [
        'deaconGuide.greatFriday.hoursCense',
        'deaconGuide.greatFriday.hoursGospel',
        'deaconGuide.greatFriday.hoursStand',
      ],
      noteKey: 'deaconGuide.greatFriday.hoursNote',
    },
    {
      momentKey: 'deaconGuide.moment.vespers',
      roleKeys: [
        'deaconGuide.greatFriday.vespersLitanies',
        'deaconGuide.greatFriday.vespersGospel',
        'deaconGuide.greatFriday.vespersShroud',
      ],
      noteKey: 'deaconGuide.greatFriday.vespersNote',
    },
  ],
};

export const DEACON_GUIDE_SOURCE_KEYS = [
  'deaconGuide.sourcePriest',
  'deaconGuide.sourceHier',
  'deaconGuide.sourceLenten',
] as const;
