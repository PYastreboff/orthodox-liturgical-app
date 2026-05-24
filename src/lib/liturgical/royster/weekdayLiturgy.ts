import type { RoysterLiturgySequence, WeekdayIndex } from './types';

/**
 * Daily prokeimenon, alleluia, and communion for Monday–Saturday.
 * Source: https://www.ponomar.net/data/royster/DailyProkeimena.htm
 */
export const WEEKDAY_LITURGY: Record<Exclude<WeekdayIndex, 0>, RoysterLiturgySequence> = {
  1: {
    prokeimenon: {
      tone: 4,
      citation: 'Psalm 103:4, 1',
      scriptureCitation: 'Ps 103.4-1',
      lines: [
        'Who maketh His angels spirits, His servers a flaming fire.',
        'Bless the Lord, O my soul; O Lord my God, thou art become very great.',
      ],
    },
    alleluia: {
      tone: 5,
      citation: 'Psalm 148:2, 5',
      scriptureCitation: 'Ps 148.2-5',
      lines: [
        'Praise ye the Lord, all His angels; praise ye Him all His powers.',
        'For He spoke, and they came into being; He commanded and they were created.',
      ],
    },
    communion: {
      citation: 'Psalm 103:4',
      scriptureCitation: 'Ps 103.4',
      lines: ['Who maketh His angels spirits, His servers a flaming fire.'],
    },
  },
  2: {
    prokeimenon: {
      tone: 7,
      citation: 'Psalm 63:10, 1',
      scriptureCitation: 'Ps 63.10-1',
      lines: [
        'The righteous shall rejoice in the Lord, and he shall hope in Him.',
        'Hear my prayer, O God, when I pray unto thee.',
      ],
    },
    alleluia: {
      tone: 4,
      citation: 'Psalm 91:12, 13',
      scriptureCitation: 'Ps 91.12-13',
      lines: [
        'The righteous shall flourish like the palm tree; like the cedars of Lebanon He shall increase.',
        'They that are planted in the house of the Lord shall flourish in the courts of our God.',
      ],
    },
    communion: {
      citation: 'Psalm 111:6, 7',
      scriptureCitation: 'Ps 111.6-7',
      lines: ['The righteous shall be in eternal memory; He shall not fear evil tidings.'],
    },
  },
  3: {
    prokeimenon: {
      tone: 3,
      citation: 'The Song of the Theotokos',
      lines: [
        'My soul doth magnify the Lord, and my spirit hath rejoiced in God my Savior.',
        'For He hath looked upon the humility of His servant; for behold from henceforth all generations shall bless me.',
      ],
    },
    alleluia: {
      tone: 8,
      citation: 'Psalm 44:10, 12',
      scriptureCitation: 'Ps 44.10-12',
      lines: [
        'Hearken, O Daughter, and see, and incline thine ear.',
        'The rich among the people of the earth shall entreat thy countenance.',
      ],
    },
    communion: {
      citation: 'Psalm 115:4',
      scriptureCitation: 'Ps 115.4',
      lines: ['I will take the cup of salvation, and I will call upon the name of the Lord.'],
    },
  },
  4: {
    prokeimenon: {
      tone: 8,
      citation: 'Psalm 18:4, 1',
      scriptureCitation: 'Ps 18.4-1',
      lines: [
        'Their sound is gone forth into all the earth; their sayings to the ends of the world.',
        'The heavens declare the glory of God; and the firmament proclaimeth His handiwork.',
      ],
    },
    alleluia: {
      tone: 1,
      citation: 'Psalm 88:5, 7',
      scriptureCitation: 'Ps 88.5-7',
      lines: [
        'The heavens confess thy wonders, O Lord, thy truth in the church of the saints.',
        'God, who is glorified in the council of the saints.',
      ],
    },
    communion: {
      citation: 'Psalm 18:4',
      scriptureCitation: 'Ps 18.4',
      lines: ['Their sound is gone forth into all the earth; their sayings to the ends of the world.'],
    },
  },
  5: {
    prokeimenon: {
      tone: 7,
      citation: 'Psalm 98:5, 1',
      scriptureCitation: 'Ps 98.5-1',
      lines: [
        'Exalt ye the Lord our God, and worship at His footstool, for He is holy.',
        'The Lord hath reigned, let the people rage.',
      ],
    },
    alleluia: {
      tone: 1,
      citation: 'Psalm 73:2, 12',
      scriptureCitation: 'Ps 73.2-12',
      lines: [
        'Remember thy congregation, which thou hast possessed from the beginning.',
        'God is our King before the ages; He hath wrought salvation in the midst of the earth.',
      ],
    },
    communion: {
      citation: 'Psalm 74:12',
      scriptureCitation: 'Ps 74.12',
      lines: ['Thou hast wrought salvation in the midst of the earth, O God.'],
    },
  },
  6: {
    prokeimenon: {
      tone: 8,
      citation: 'Psalm 31:11, 1',
      scriptureCitation: 'Ps 31.11-1',
      lines: [
        'Be glad in the Lord, and rejoice, ye righteous.',
        'Blessed are they whose transgressions are forgiven, and whose sins are covered.',
      ],
    },
    alleluia: {
      tone: 4,
      citation: 'Psalm 33:17, 19; 64:4',
      scriptureCitation: 'Ps 33.17-19',
      lines: [
        'The righteous cried, and the Lord heard them, and delivered them out of all their tribulations.',
        'Many are the tribulations of the righteous, but out of them all will the Lord deliver them.',
      ],
    },
    communion: {
      citation: 'Psalm 32:1',
      scriptureCitation: 'Ps 32.1',
      lines: ['Rejoice in the Lord, ye righteous; Praise becometh the upright.'],
      alternate: {
        citation: 'Psalm 64:4',
        lines: ['Blessed are they whom thou hast chosen and taken, O Lord; their memory is from generation to generation.'],
      },
    },
  },
};
