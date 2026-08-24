/**
 * Priest guide — typical Russian Orthodox parish practice.
 *
 * Priest’s Liturgy: cues with deacon, choir, and servers.
 * Hierarchical: concelebration notes (Ostrovsky / azbyka.ru).
 * Presanctified / Great Friday: Lenten adaptations.
 */

export type PriestLiturgyForm = 'priest' | 'hierarchical' | 'presanctified' | 'great_friday';

export type PriestGuideRow = {
  momentKey: string;
  roleKeys: string[];
  noteKey?: string;
};

export type PriestGuideDayContext = {
  appearanceKey: string;
  feastLevel?: number;
  weekday?: number;
  isPresanctified: boolean;
};

export function availablePriestForms(ctx: PriestGuideDayContext): PriestLiturgyForm[] {
  if (ctx.appearanceKey === 'great_friday') {
    return ['great_friday'];
  }
  if (ctx.isPresanctified) {
    return ['presanctified', 'hierarchical'];
  }
  return ['priest', 'hierarchical'];
}

export function defaultPriestForm(ctx: PriestGuideDayContext): PriestLiturgyForm {
  return availablePriestForms(ctx)[0]!;
}

export const PRIEST_GUIDE_ROWS: Record<PriestLiturgyForm, PriestGuideRow[]> = {
  priest: [
    {
      momentKey: 'priestGuide.moment.prepare',
      roleKeys: [
        'priestGuide.priest.prepareProskomedia',
        'priestGuide.priest.prepareVest',
        'priestGuide.priest.prepareAssign',
      ],
    },
    {
      momentKey: 'priestGuide.moment.opening',
      roleKeys: [
        'priestGuide.priest.openingBless',
        'priestGuide.priest.openingPeace',
        'priestGuide.priest.openingDoors',
      ],
    },
    {
      momentKey: 'priestGuide.moment.smallEntrance',
      roleKeys: [
        'priestGuide.priest.smallGospel',
        'priestGuide.priest.smallBless',
        'priestGuide.priest.smallKiss',
      ],
    },
    {
      momentKey: 'priestGuide.moment.readings',
      roleKeys: [
        'priestGuide.priest.readingsCense',
        'priestGuide.priest.readingsGospelBless',
        'priestGuide.priest.readingsPreach',
      ],
      noteKey: 'priestGuide.priest.readingsNote',
    },
    {
      momentKey: 'priestGuide.moment.greatEntrance',
      roleKeys: [
        'priestGuide.priest.greatCherubic',
        'priestGuide.priest.greatProcession',
        'priestGuide.priest.greatPlace',
      ],
      noteKey: 'priestGuide.priest.greatEntranceNote',
    },
    {
      momentKey: 'priestGuide.moment.anaphora',
      roleKeys: [
        'priestGuide.priest.anaphoraDoors',
        'priestGuide.priest.anaphoraPray',
        'priestGuide.priest.anaphoraEpiclesis',
      ],
    },
    {
      momentKey: 'priestGuide.moment.communion',
      roleKeys: [
        'priestGuide.priest.communionClergy',
        'priestGuide.priest.communionPeople',
        'priestGuide.priest.communionDismissal',
      ],
    },
  ],
  hierarchical: [
    {
      momentKey: 'priestGuide.moment.prepare',
      roleKeys: [
        'priestGuide.hierarchical.prepareMeet',
        'priestGuide.hierarchical.prepareConcelebrate',
        'priestGuide.hierarchical.prepareOrder',
      ],
      noteKey: 'priestGuide.hierarchical.prepareNote',
    },
    {
      momentKey: 'priestGuide.moment.opening',
      roleKeys: [
        'priestGuide.hierarchical.openingCathedra',
        'priestGuide.hierarchical.openingFollow',
      ],
    },
    {
      momentKey: 'priestGuide.moment.smallEntrance',
      roleKeys: [
        'priestGuide.hierarchical.smallProcession',
        'priestGuide.hierarchical.smallAmbon',
      ],
    },
    {
      momentKey: 'priestGuide.moment.readings',
      roleKeys: [
        'priestGuide.hierarchical.readingsStand',
        'priestGuide.hierarchical.readingsGospel',
      ],
    },
    {
      momentKey: 'priestGuide.moment.greatEntrance',
      roleKeys: [
        'priestGuide.hierarchical.greatChalice',
        'priestGuide.hierarchical.greatSolea',
      ],
      noteKey: 'priestGuide.hierarchical.greatEntranceNote',
    },
    {
      momentKey: 'priestGuide.moment.anaphora',
      roleKeys: [
        'priestGuide.hierarchical.anaphoraBishop',
        'priestGuide.hierarchical.anaphoraAssist',
      ],
    },
    {
      momentKey: 'priestGuide.moment.communion',
      roleKeys: [
        'priestGuide.hierarchical.communionBishop',
        'priestGuide.hierarchical.communionPeople',
      ],
    },
  ],
  presanctified: [
    {
      momentKey: 'priestGuide.moment.prepare',
      roleKeys: [
        'priestGuide.presanctified.prepareGifts',
        'priestGuide.presanctified.prepareVest',
      ],
    },
    {
      momentKey: 'priestGuide.moment.vespers',
      roleKeys: [
        'priestGuide.presanctified.vespersCense',
        'priestGuide.presanctified.vespersEntrance',
      ],
    },
    {
      momentKey: 'priestGuide.moment.paremia',
      roleKeys: [
        'priestGuide.presanctified.paremiaCues',
        'priestGuide.presanctified.paremiaPrayer',
      ],
    },
    {
      momentKey: 'priestGuide.moment.greatEntrance',
      roleKeys: [
        'priestGuide.presanctified.entranceSilent',
        'priestGuide.presanctified.entrancePlace',
      ],
      noteKey: 'priestGuide.presanctified.entranceNote',
    },
    {
      momentKey: 'priestGuide.moment.communion',
      roleKeys: [
        'priestGuide.presanctified.communionBreak',
        'priestGuide.presanctified.communionPeople',
      ],
    },
  ],
  great_friday: [
    {
      momentKey: 'priestGuide.moment.royalHours',
      roleKeys: [
        'priestGuide.greatFriday.hoursGospel',
        'priestGuide.greatFriday.hoursCense',
      ],
      noteKey: 'priestGuide.greatFriday.hoursNote',
    },
    {
      momentKey: 'priestGuide.moment.vespers',
      roleKeys: [
        'priestGuide.greatFriday.vespersGospel',
        'priestGuide.greatFriday.vespersShroud',
        'priestGuide.greatFriday.vespersPlace',
      ],
      noteKey: 'priestGuide.greatFriday.vespersNote',
    },
  ],
};

export const PRIEST_GUIDE_SOURCE_KEYS = [
  'priestGuide.sourcePriest',
  'priestGuide.sourceHier',
  'priestGuide.sourceLenten',
] as const;
