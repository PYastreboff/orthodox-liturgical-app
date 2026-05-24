import type { RoysterLiturgySequence, ToneNumber } from './types';

/**
 * Sunday Divine Liturgy prokeimenon and alleluia by eucharistic tone.
 * Source: https://www.ponomar.net/data/royster/SundayProkeimena.htm (liturgy only).
 * Communion on Sundays varies by season and typikon; omitted here.
 */
export const SUNDAY_LITURGY_BY_TONE: Record<ToneNumber, RoysterLiturgySequence> = {
  1: {
    prokeimenon: {
      tone: 1,
      citation: 'Psalm 32:22, 1',
      scriptureCitation: 'Ps 32.22-1',
      lines: [
        'Let thy mercy be upon us, O Lord, as we have set our hope on thee.',
        'Rejoice in the Lord, ye righteous; praise becometh the upright.',
      ],
    },
    alleluia: {
      tone: 1,
      citation: 'Psalm 17:47, 50',
      scriptureCitation: 'Ps 17.47-50',
      lines: [
        'It is God who giveth me vengeance, and hath subjected peoples under me.',
        'Who magnifieth the salvations of his king, and showeth mercy to David his anointed and to his seed for ever.',
      ],
    },
    communion: {
      citation: 'Psalm 148:1',
      scriptureCitation: 'Ps 148.1',
      lines: ['Praise ye the Lord from the heavens; praise ye Him in the heights.'],
    },
  },
  2: {
    prokeimenon: {
      tone: 2,
      citation: 'Psalm 117:14, 18',
      scriptureCitation: 'Ps 117.14-18',
      lines: [
        'My might and my song is the Lord, and He is become my salvation.',
        'The Lord hath sorely chastened me; but He hath not given me over unto death.',
      ],
    },
    alleluia: {
      tone: 2,
      citation: 'Psalm 19:2, 10',
      scriptureCitation: 'Ps 19.2-10',
      lines: [
        'The Lord hear thee in the day of tribulation; the name of the God of Jacob defend thee.',
        'O Lord, save the king and hearken unto us, in what day soever we shall call upon thee.',
      ],
    },
    communion: {
      citation: 'Psalm 148:1',
      scriptureCitation: 'Ps 148.1',
      lines: ['Praise ye the Lord from the heavens; praise ye Him in the heights.'],
    },
  },
  3: {
    prokeimenon: {
      tone: 3,
      citation: 'Psalm 46:6, 1',
      scriptureCitation: 'Ps 46.6-1',
      lines: [
        'Sing psalms unto our God, sing psalms; sing psalms unto our King, sing psalms.',
        'All ye nations, clap your hands; shout unto God with a joyful voice.',
      ],
    },
    alleluia: {
      tone: 3,
      citation: 'Psalm 30:1, 2',
      scriptureCitation: 'Ps 30.1-2',
      lines: [
        'In thee, O Lord, have I hoped; let me never be ashamed.',
        'Be thou unto me as God defender, and a House of refuge in order to save me.',
      ],
    },
    communion: {
      citation: 'Psalm 148:1',
      scriptureCitation: 'Ps 148.1',
      lines: ['Praise ye the Lord from the heavens; praise ye Him in the heights.'],
    },
  },
  4: {
    prokeimenon: {
      tone: 4,
      citation: 'Psalm 103:24, 1',
      scriptureCitation: 'Ps 103.24-1',
      lines: [
        'How great are thy works become, O Lord; in wisdom hast thou made them all.',
        'Bless the Lord, O my soul; O Lord my God, thou art become exceeding great.',
      ],
    },
    alleluia: {
      tone: 4,
      citation: 'Psalm 44:4, 7',
      scriptureCitation: 'Ps 44.4-7',
      lines: [
        'Draw thy bow, and prosper, and reign, because of truth and meekness and righteousness.',
        'Thou hast loved righteousness and hated transgression.',
      ],
    },
    communion: {
      citation: 'Psalm 148:1',
      scriptureCitation: 'Ps 148.1',
      lines: ['Praise ye the Lord from the heavens; praise ye Him in the heights.'],
    },
  },
  5: {
    prokeimenon: {
      tone: 5,
      citation: 'Psalm 11:8, 1',
      scriptureCitation: 'Ps 11.8-1',
      lines: [
        'Thou, O Lord, shalt keep us and guard us from this generation and forevermore.',
        'Save me, O Lord, for there is not one holy man left.',
      ],
    },
    alleluia: {
      tone: 5,
      citation: 'Psalm 88:2, 3',
      scriptureCitation: 'Ps 88.2-3',
      lines: [
        'Thy mercies, O Lord, I shall sing forever; from generation to generation shall I declare thy truth with my mouth.',
        'For thou hast said, Mercy shall be built up forever; thy truth shall be made ready in the heavens.',
      ],
    },
    communion: {
      citation: 'Psalm 148:1',
      scriptureCitation: 'Ps 148.1',
      lines: ['Praise ye the Lord from the heavens; praise ye Him in the heights.'],
    },
  },
  6: {
    prokeimenon: {
      tone: 6,
      citation: 'Psalm 27:9, 1',
      scriptureCitation: 'Ps 27.9-1',
      lines: [
        'Save, O Lord, thy people; and bless thine inheritance.',
        'To thee, O Lord, have I cried; O my God, keep thou not silent toward me.',
      ],
    },
    alleluia: {
      tone: 6,
      citation: 'Psalm 90:1, 2',
      scriptureCitation: 'Ps 90.1-2',
      lines: [
        'He that dwelleth in the help of the Most High, under the shelter of the God of heaven shall abide.',
        'He shall say to the Lord, Thou art my succor, and my refuge, my God, and I shall hope in Him.',
      ],
    },
    communion: {
      citation: 'Psalm 148:1',
      scriptureCitation: 'Ps 148.1',
      lines: ['Praise ye the Lord from the heavens; praise ye Him in the heights.'],
    },
  },
  7: {
    prokeimenon: {
      tone: 7,
      citation: 'Psalm 28:11, 1',
      scriptureCitation: 'Ps 28.11-1',
      lines: [
        'The Lord will give strength to His people; the Lord will bless His people with peace.',
        'Bring unto the Lord, ye sons of God, bring young rams unto the Lord.',
      ],
    },
    alleluia: {
      tone: 7,
      citation: 'Psalm 91:1, 2',
      scriptureCitation: 'Ps 91.1-2',
      lines: [
        'It is good to confess to the Lord, and to sing psalms to thy name, O Most High.',
        'To proclaim thy mercy in the morning and thy truth in the night.',
      ],
    },
    communion: {
      citation: 'Psalm 148:1',
      scriptureCitation: 'Ps 148.1',
      lines: ['Praise ye the Lord from the heavens; praise ye Him in the heights.'],
    },
  },
  8: {
    prokeimenon: {
      tone: 8,
      citation: 'Psalm 75:11, 1',
      scriptureCitation: 'Ps 75.11-1',
      lines: [
        'Pray ye, and render unto the Lord our God.',
        'In Judea is God known; in Israel great is His name.',
      ],
    },
    alleluia: {
      tone: 8,
      citation: 'Psalm 94:1, 2',
      scriptureCitation: 'Ps 94.1-2',
      lines: [
        'O come, let us rejoice unto the Lord; let us shout unto God our Savior.',
        'Let us come before His presence in confession, and in psalms let us shout unto Him.',
      ],
    },
    communion: {
      citation: 'Psalm 148:1',
      scriptureCitation: 'Ps 148.1',
      lines: ['Praise ye the Lord from the heavens; praise ye Him in the heights.'],
    },
  },
};
