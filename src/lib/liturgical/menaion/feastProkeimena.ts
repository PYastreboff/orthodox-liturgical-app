import type { OrthocalDay } from '../../api/orthocal';
import { isOrthocalGreatFeastLevel } from '../liturgicalDayTitle';
import type { RoysterLiturgySequence } from '../royster/types';

/**
 * Menaion prokeimenon / alleluia / communion for great feasts (Divine Liturgy).
 * Sources: OCA/MP menaion; LXX psalm numbering as in Royster tables.
 */
const BY_JULIAN: Record<string, RoysterLiturgySequence> = {
  '01-06': {
    prokeimenon: {
      tone: 4,
      citation: 'Psalm 28:1, 2',
      scriptureCitation: 'Ps 28.1-2',
      lines: [
        'The voice of the Lord is upon the waters; the God of glory hath thundered.',
        'The voice of the Lord is upon the waters, the God of glory hath thundered, the Lord is upon many waters.',
      ],
    },
    alleluia: {
      tone: 4,
      citation: 'Psalm 28:3, 4',
      scriptureCitation: 'Ps 28.3-4',
      lines: [
        'The voice of the Lord is upon the waters.',
        'The Lord sitteth upon the flood; yea, the Lord sitteth as King for ever.',
      ],
    },
    communion: {
      citation: 'Psalm 28:9',
      scriptureCitation: 'Ps 28.9',
      lines: ['The Lord will give strength unto His people; the Lord will bless His people with peace.'],
    },
  },
  '03-25': {
    prokeimenon: {
      tone: 4,
      citation: 'Psalm 27:9, 1',
      scriptureCitation: 'Ps 27.9-1',
      lines: [
        'Save Thy people, O Lord, and bless Thine inheritance.',
        'Unto Thee, O Lord, will I cry, O my God, be not silent unto me.',
      ],
    },
    alleluia: {
      tone: 4,
      citation: 'Psalm 27:9, 10',
      scriptureCitation: 'Ps 27.9-10',
      lines: [
        'Save Thy people, O Lord, and bless Thine inheritance.',
        'The Lord is my strength and my shield; in Him hath my heart trusted.',
      ],
    },
    communion: {
      citation: 'Psalm 27:9',
      scriptureCitation: 'Ps 27.9',
      lines: ['Save Thy people, O Lord, and bless Thine inheritance.'],
    },
  },
  '08-06': {
    prokeimenon: {
      tone: 4,
      citation: 'Psalm 88:6, 1',
      scriptureCitation: 'Ps 88.6-1',
      lines: [
        'The heavens shall confess Thy wonders, O Lord, and Thy truth in the church of the saints.',
        'I will sing of Thy mercies, O Lord, for ever; with my mouth will I declare Thy truth.',
      ],
    },
    alleluia: {
      tone: 4,
      citation: 'Psalm 88:6, 7',
      scriptureCitation: 'Ps 88.6-7',
      lines: [
        'The heavens shall confess Thy wonders, O Lord.',
        'For who in the heavens can be compared unto the Lord?',
      ],
    },
    communion: {
      citation: 'Psalm 88:6',
      scriptureCitation: 'Ps 88.6',
      lines: ['The heavens shall confess Thy wonders, O Lord.'],
    },
  },
  '08-15': {
    prokeimenon: {
      tone: 4,
      citation: 'Psalm 28:9, 1',
      scriptureCitation: 'Ps 28.9-1',
      lines: [
        'The Lord will give strength unto His people; the Lord will bless His people with peace.',
        'Bring unto the Lord, O ye sons of God, bring unto the Lord glory and honour.',
      ],
    },
    alleluia: {
      tone: 4,
      citation: 'Psalm 28:9, 2',
      scriptureCitation: 'Ps 28.9-2',
      lines: [
        'The Lord will give strength unto His people.',
        'The voice of the Lord is upon the waters, the God of glory hath thundered.',
      ],
    },
    communion: {
      citation: 'Psalm 28:9',
      scriptureCitation: 'Ps 28.9',
      lines: ['The Lord will give strength unto His people; the Lord will bless His people with peace.'],
    },
  },
  '09-08': {
    prokeimenon: {
      tone: 4,
      citation: 'Psalm 98:5, 1',
      scriptureCitation: 'Ps 98.5-1',
      lines: [
        'Make a joyful noise unto the Lord, all the earth; sing praises unto the Lord with the harp.',
        'The Lord reigneth; let the people rejoice.',
      ],
    },
    alleluia: {
      tone: 4,
      citation: 'Psalm 98:5, 6',
      scriptureCitation: 'Ps 98.5-6',
      lines: [
        'Make a joyful noise unto the Lord, all the earth.',
        'With trumpets and sound of cornet make a joyful noise before the Lord the King.',
      ],
    },
    communion: {
      citation: 'Psalm 98:5',
      scriptureCitation: 'Ps 98.5',
      lines: ['Make a joyful noise unto the Lord, all the earth; sing praises unto the Lord with the harp.'],
    },
  },
  '09-14': {
    prokeimenon: {
      tone: 4,
      citation: 'Psalm 98:5, 1',
      scriptureCitation: 'Ps 98.5-1',
      lines: [
        'Make a joyful noise unto the Lord, all the earth; sing praises unto the Lord with the harp.',
        'The Lord reigneth; let the people rejoice.',
      ],
    },
    alleluia: {
      tone: 4,
      citation: 'Psalm 98:5, 6',
      scriptureCitation: 'Ps 98.5-6',
      lines: [
        'Make a joyful noise unto the Lord, all the earth.',
        'With trumpets and sound of cornet make a joyful noise before the Lord the King.',
      ],
    },
    communion: {
      citation: 'Psalm 98:5',
      scriptureCitation: 'Ps 98.5',
      lines: ['Make a joyful noise unto the Lord, all the earth; sing praises unto the Lord with the harp.'],
    },
  },
  '12-25': {
    prokeimenon: {
      tone: 4,
      citation: 'Psalm 98:5, 1',
      scriptureCitation: 'Ps 98.5-1',
      lines: [
        'Make a joyful noise unto the Lord, all the earth; sing praises unto the Lord with the harp.',
        'The Lord reigneth; let the people rejoice.',
      ],
    },
    alleluia: {
      tone: 4,
      citation: 'Psalm 98:5, 6',
      scriptureCitation: 'Ps 98.5-6',
      lines: [
        'Make a joyful noise unto the Lord, all the earth.',
        'With trumpets and sound of cornet make a joyful noise before the Lord the King.',
      ],
    },
    communion: {
      citation: 'Psalm 98:5',
      scriptureCitation: 'Ps 98.5',
      lines: ['Make a joyful noise unto the Lord, all the earth; sing praises unto the Lord with the harp.'],
    },
  },
};

const BY_PASCHA_DISTANCE: Record<number, RoysterLiturgySequence> = {
  0: {
    prokeimenon: {
      tone: 4,
      citation: 'Psalm 28:9, 1',
      scriptureCitation: 'Ps 28.9-1',
      lines: [
        'The Lord will give strength unto His people; the Lord will bless His people with peace.',
        'Bring unto the Lord, O ye sons of God, bring unto the Lord glory and honour.',
      ],
    },
    alleluia: {
      tone: 4,
      citation: 'Psalm 28:9, 2',
      scriptureCitation: 'Ps 28.9-2',
      lines: [
        'The Lord will give strength unto His people.',
        'The voice of the Lord is upon the waters, the God of glory hath thundered.',
      ],
    },
    communion: {
      citation: 'Psalm 28:9',
      scriptureCitation: 'Ps 28.9',
      lines: ['The Lord will give strength unto His people; the Lord will bless His people with peace.'],
    },
  },
  49: {
    prokeimenon: {
      tone: 4,
      citation: 'Psalm 28:9, 1',
      scriptureCitation: 'Ps 28.9-1',
      lines: [
        'The Lord will give strength unto His people; the Lord will bless His people with peace.',
        'Bring unto the Lord, O ye sons of God, bring unto the Lord glory and honour.',
      ],
    },
    alleluia: {
      tone: 4,
      citation: 'Psalm 28:9, 2',
      scriptureCitation: 'Ps 28.9-2',
      lines: [
        'The Lord will give strength unto His people.',
        'The voice of the Lord is upon the waters, the God of glory hath thundered.',
      ],
    },
    communion: {
      citation: 'Psalm 28:9',
      scriptureCitation: 'Ps 28.9',
      lines: ['The Lord will give strength unto His people; the Lord will bless His people with peace.'],
    },
  },
};

const BY_APPEARANCE: Record<string, RoysterLiturgySequence> = {
  palm_sunday: {
    prokeimenon: {
      tone: 4,
      citation: 'Psalm 98:5, 1',
      scriptureCitation: 'Ps 98.5-1',
      lines: [
        'Make a joyful noise unto the Lord, all the earth; sing praises unto the Lord with the harp.',
        'The Lord reigneth; let the people rejoice.',
      ],
    },
    alleluia: {
      tone: 4,
      citation: 'Psalm 98:5, 6',
      scriptureCitation: 'Ps 98.5-6',
      lines: [
        'Make a joyful noise unto the Lord, all the earth.',
        'With trumpets and sound of cornet make a joyful noise before the Lord the King.',
      ],
    },
    communion: {
      citation: 'Psalm 98:5',
      scriptureCitation: 'Ps 98.5',
      lines: ['Make a joyful noise unto the Lord, all the earth; sing praises unto the Lord with the harp.'],
    },
  },
};

export function resolveFeastProkeimenonSequence(
  day: OrthocalDay,
  julianMonthDay: string | undefined,
  appearanceKey: string | undefined,
): RoysterLiturgySequence | null {
  if (!isOrthocalGreatFeastLevel(day)) return null;

  if (appearanceKey && BY_APPEARANCE[appearanceKey]) {
    return BY_APPEARANCE[appearanceKey];
  }

  const pascha = day.pascha_distance;
  if (pascha !== undefined && BY_PASCHA_DISTANCE[pascha]) {
    return BY_PASCHA_DISTANCE[pascha];
  }

  if (julianMonthDay && BY_JULIAN[julianMonthDay]) {
    return BY_JULIAN[julianMonthDay];
  }

  return null;
}
