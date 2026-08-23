/**
 * Reader (чтец) guide — typical Russian Orthodox parish practice.
 *
 * Priest’s Liturgy: Slavonic Apostol dialogue; ROCOR Europe blessing notes.
 * Hierarchical: azbyka.ru hierarchical directions (Hours; Epistle often by first deacon).
 * Presanctified / Great Friday: Lenten reader duties (paremia / Hours).
 */

export type ReaderLiturgyForm = 'priest' | 'hierarchical' | 'presanctified' | 'great_friday';

export type ReaderGuideRow = {
  momentKey: string;
  roleKeys: string[];
  noteKey?: string;
};

export type ReaderGuideDayContext = {
  appearanceKey: string;
  feastLevel?: number;
  weekday?: number;
  isPresanctified: boolean;
};

export function availableReaderForms(ctx: ReaderGuideDayContext): ReaderLiturgyForm[] {
  if (ctx.appearanceKey === 'great_friday') {
    return ['great_friday'];
  }
  if (ctx.isPresanctified) {
    return ['presanctified', 'hierarchical'];
  }
  return ['priest', 'hierarchical'];
}

export function defaultReaderForm(ctx: ReaderGuideDayContext): ReaderLiturgyForm {
  return availableReaderForms(ctx)[0]!;
}

export const READER_GUIDE_ROWS: Record<ReaderLiturgyForm, ReaderGuideRow[]> = {
  priest: [
    {
      momentKey: 'readerGuide.moment.prepare',
      roleKeys: [
        'readerGuide.priest.prepareMark',
        'readerGuide.priest.prepareTone',
        'readerGuide.priest.prepareHours',
      ],
    },
    {
      momentKey: 'readerGuide.moment.blessing',
      roleKeys: [
        'readerGuide.priest.blessingAsk',
        'readerGuide.priest.blessingCarry',
        'readerGuide.priest.blessingStand',
      ],
      noteKey: 'readerGuide.priest.blessingNote',
    },
    {
      momentKey: 'readerGuide.moment.prokeimenon',
      roleKeys: [
        'readerGuide.priest.prokeimenonPeace',
        'readerGuide.priest.prokeimenonAnnounce',
        'readerGuide.priest.prokeimenonVerse',
        'readerGuide.priest.prokeimenonTwo',
      ],
    },
    {
      momentKey: 'readerGuide.moment.epistle',
      roleKeys: [
        'readerGuide.priest.epistleAnnounce',
        'readerGuide.priest.epistleRead',
        'readerGuide.priest.epistleTwo',
        'readerGuide.priest.epistlePeace',
      ],
    },
    {
      momentKey: 'readerGuide.moment.alleluia',
      roleKeys: [
        'readerGuide.priest.alleluiaAnnounce',
        'readerGuide.priest.alleluiaVerses',
        'readerGuide.priest.alleluiaTwo',
      ],
    },
    {
      momentKey: 'readerGuide.moment.after',
      roleKeys: [
        'readerGuide.priest.afterReturn',
        'readerGuide.priest.afterThanksgiving',
      ],
    },
  ],
  hierarchical: [
    {
      momentKey: 'readerGuide.moment.hours',
      roleKeys: [
        'readerGuide.hierarchical.hoursPlace',
        'readerGuide.hierarchical.hoursAmen',
        'readerGuide.hierarchical.hoursBless',
        'readerGuide.hierarchical.hoursBow',
      ],
      noteKey: 'readerGuide.hierarchical.hoursNote',
    },
    {
      momentKey: 'readerGuide.moment.prepare',
      roleKeys: [
        'readerGuide.hierarchical.prepareMark',
        'readerGuide.hierarchical.prepareReady',
      ],
    },
    {
      momentKey: 'readerGuide.moment.prokeimenon',
      roleKeys: [
        'readerGuide.hierarchical.prokeimenonCustom',
        'readerGuide.hierarchical.prokeimenonSame',
      ],
      noteKey: 'readerGuide.hierarchical.prokeimenonNote',
    },
    {
      momentKey: 'readerGuide.moment.epistle',
      roleKeys: [
        'readerGuide.hierarchical.epistleDeacon',
        'readerGuide.hierarchical.epistleIfAssigned',
      ],
      noteKey: 'readerGuide.hierarchical.epistleNote',
    },
    {
      momentKey: 'readerGuide.moment.alleluia',
      roleKeys: [
        'readerGuide.hierarchical.alleluiaCustom',
        'readerGuide.hierarchical.alleluiaStand',
      ],
    },
    {
      momentKey: 'readerGuide.moment.after',
      roleKeys: [
        'readerGuide.hierarchical.afterReturn',
        'readerGuide.hierarchical.afterBooks',
      ],
    },
  ],
  presanctified: [
    {
      momentKey: 'readerGuide.moment.prepare',
      roleKeys: [
        'readerGuide.presanctified.prepareHours',
        'readerGuide.presanctified.prepareParemia',
      ],
    },
    {
      momentKey: 'readerGuide.moment.hours',
      roleKeys: ['readerGuide.presanctified.hoursRead'],
    },
    {
      momentKey: 'readerGuide.moment.paremia',
      roleKeys: [
        'readerGuide.presanctified.paremiaAnnounce',
        'readerGuide.presanctified.paremiaRead',
      ],
      noteKey: 'readerGuide.presanctified.paremiaNote',
    },
  ],
  great_friday: [
    {
      momentKey: 'readerGuide.moment.royalHours',
      roleKeys: [
        'readerGuide.greatFriday.hoursPsalms',
        'readerGuide.greatFriday.hoursTroparia',
        'readerGuide.greatFriday.hoursScripture',
      ],
      noteKey: 'readerGuide.greatFriday.hoursNote',
    },
    {
      momentKey: 'readerGuide.moment.vespers',
      roleKeys: [
        'readerGuide.greatFriday.vespersParemia',
        'readerGuide.greatFriday.vespersEpistle',
      ],
    },
  ],
};

export const READER_GUIDE_SOURCE_KEYS = [
  'readerGuide.sourceApostol',
  'readerGuide.sourceRocor',
  'readerGuide.sourceAzbykaHier',
] as const;
