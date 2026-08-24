/**
 * Choir / chorister guide — typical Russian Orthodox parish kliros practice.
 *
 * Priest’s Liturgy: antiphons through Communion responses.
 * Hierarchical: Many years, special hierarchical responses.
 * Presanctified / Great Friday: Lenten / Passion singing.
 */

export type ChoirLiturgyForm = 'priest' | 'hierarchical' | 'presanctified' | 'great_friday';

export type ChoirGuideRow = {
  momentKey: string;
  roleKeys: string[];
  noteKey?: string;
};

export type ChoirGuideDayContext = {
  appearanceKey: string;
  feastLevel?: number;
  weekday?: number;
  isPresanctified: boolean;
};

export function availableChoirForms(ctx: ChoirGuideDayContext): ChoirLiturgyForm[] {
  if (ctx.appearanceKey === 'great_friday') {
    return ['great_friday'];
  }
  if (ctx.isPresanctified) {
    return ['presanctified', 'hierarchical'];
  }
  return ['priest', 'hierarchical'];
}

export function defaultChoirForm(ctx: ChoirGuideDayContext): ChoirLiturgyForm {
  return availableChoirForms(ctx)[0]!;
}

export const CHOIR_GUIDE_ROWS: Record<ChoirLiturgyForm, ChoirGuideRow[]> = {
  priest: [
    {
      momentKey: 'choirGuide.moment.prepare',
      roleKeys: [
        'choirGuide.priest.prepareBooks',
        'choirGuide.priest.prepareTones',
        'choirGuide.priest.prepareCommunion',
      ],
    },
    {
      momentKey: 'choirGuide.moment.opening',
      roleKeys: [
        'choirGuide.priest.openingAmen',
        'choirGuide.priest.openingAntiphons',
        'choirGuide.priest.openingMercy',
      ],
    },
    {
      momentKey: 'choirGuide.moment.smallEntrance',
      roleKeys: [
        'choirGuide.priest.smallComeWorship',
        'choirGuide.priest.smallTroparia',
        'choirGuide.priest.smallTrisagion',
      ],
      noteKey: 'choirGuide.priest.smallEntranceNote',
    },
    {
      momentKey: 'choirGuide.moment.readings',
      roleKeys: [
        'choirGuide.priest.readingsProkeimenon',
        'choirGuide.priest.readingsAlleluia',
        'choirGuide.priest.readingsGospel',
      ],
    },
    {
      momentKey: 'choirGuide.moment.cherubic',
      roleKeys: [
        'choirGuide.priest.cherubicStart',
        'choirGuide.priest.cherubicPause',
        'choirGuide.priest.cherubicFinish',
      ],
      noteKey: 'choirGuide.priest.cherubicNote',
    },
    {
      momentKey: 'choirGuide.moment.anaphora',
      roleKeys: [
        'choirGuide.priest.anaphoraCreed',
        'choirGuide.priest.anaphoraMercy',
        'choirGuide.priest.anaphoraResponses',
      ],
    },
    {
      momentKey: 'choirGuide.moment.communion',
      roleKeys: [
        'choirGuide.priest.communionHymn',
        'choirGuide.priest.communionDuring',
        'choirGuide.priest.communionAfter',
      ],
    },
  ],
  hierarchical: [
    {
      momentKey: 'choirGuide.moment.prepare',
      roleKeys: [
        'choirGuide.hierarchical.prepareManyYears',
        'choirGuide.hierarchical.prepareTone',
      ],
    },
    {
      momentKey: 'choirGuide.moment.opening',
      roleKeys: [
        'choirGuide.hierarchical.openingMeet',
        'choirGuide.hierarchical.openingResponses',
      ],
      noteKey: 'choirGuide.hierarchical.openingNote',
    },
    {
      momentKey: 'choirGuide.moment.smallEntrance',
      roleKeys: [
        'choirGuide.hierarchical.smallEisodikon',
        'choirGuide.hierarchical.smallTroparia',
      ],
    },
    {
      momentKey: 'choirGuide.moment.readings',
      roleKeys: [
        'choirGuide.hierarchical.readingsFollow',
        'choirGuide.hierarchical.readingsGospel',
      ],
    },
    {
      momentKey: 'choirGuide.moment.cherubic',
      roleKeys: [
        'choirGuide.hierarchical.cherubicPace',
        'choirGuide.hierarchical.cherubicSolea',
      ],
    },
    {
      momentKey: 'choirGuide.moment.anaphora',
      roleKeys: [
        'choirGuide.hierarchical.anaphoraAxios',
        'choirGuide.hierarchical.anaphoraResponses',
      ],
    },
    {
      momentKey: 'choirGuide.moment.communion',
      roleKeys: [
        'choirGuide.hierarchical.communionHymn',
        'choirGuide.hierarchical.communionManyYears',
      ],
    },
  ],
  presanctified: [
    {
      momentKey: 'choirGuide.moment.prepare',
      roleKeys: [
        'choirGuide.presanctified.prepareBooks',
        'choirGuide.presanctified.preparePsalm',
      ],
    },
    {
      momentKey: 'choirGuide.moment.vespers',
      roleKeys: [
        'choirGuide.presanctified.vespersPsalms',
        'choirGuide.presanctified.vespersEntrance',
      ],
    },
    {
      momentKey: 'choirGuide.moment.paremia',
      roleKeys: [
        'choirGuide.presanctified.paremiaPrayer',
        'choirGuide.presanctified.paremiaVerse',
      ],
      noteKey: 'choirGuide.presanctified.paremiaNote',
    },
    {
      momentKey: 'choirGuide.moment.cherubic',
      roleKeys: [
        'choirGuide.presanctified.entranceHymn',
        'choirGuide.presanctified.entranceKneel',
      ],
      noteKey: 'choirGuide.presanctified.entranceNote',
    },
    {
      momentKey: 'choirGuide.moment.communion',
      roleKeys: [
        'choirGuide.presanctified.communionHymn',
        'choirGuide.presanctified.communionAfter',
      ],
    },
  ],
  great_friday: [
    {
      momentKey: 'choirGuide.moment.royalHours',
      roleKeys: [
        'choirGuide.greatFriday.hoursAntiphons',
        'choirGuide.greatFriday.hoursTroparia',
      ],
      noteKey: 'choirGuide.greatFriday.hoursNote',
    },
    {
      momentKey: 'choirGuide.moment.vespers',
      roleKeys: [
        'choirGuide.greatFriday.vespersAposticha',
        'choirGuide.greatFriday.vespersShroud',
        'choirGuide.greatFriday.vespersBurial',
      ],
    },
  ],
};

export const CHOIR_GUIDE_SOURCE_KEYS = [
  'choirGuide.sourcePriest',
  'choirGuide.sourceHier',
  'choirGuide.sourceLenten',
] as const;
