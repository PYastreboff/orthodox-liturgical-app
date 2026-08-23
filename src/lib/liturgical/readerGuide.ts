/**
 * Reader (чтец) guide for Divine Liturgy — typical Russian Orthodox parish practice.
 *
 * Priest’s Liturgy: Slavonic Apostol dialogue (orthodox.net translation);
 *   ROCOR Europe blessing / posture notes; OrthodoxWiki Reader duties.
 * Hierarchical Liturgy: azbyka.ru «Указания… при архиерейском служении»
 *   (Hours at the cathedra; first deacon usually reads the Epistle; prokeimenon “по обычаю”).
 */

export type ReaderLiturgyForm = 'priest' | 'hierarchical';

export type ReaderGuideRow = {
  momentKey: string;
  roleKeys: string[];
  noteKey?: string;
};

export const READER_LITURGY_FORMS: ReaderLiturgyForm[] = ['priest', 'hierarchical'];

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
};

export const READER_GUIDE_SOURCE_KEYS = [
  'readerGuide.sourceApostol',
  'readerGuide.sourceRocor',
  'readerGuide.sourceAzbykaHier',
] as const;
