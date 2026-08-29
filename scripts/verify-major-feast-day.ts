import type { OrthocalDay } from '../src/lib/api/orthocal';
import {
  isMajorFeastDayForDateBlock,
  liturgicalDayTitle,
} from '../src/lib/liturgical/liturgicalDayTitle';
import { getFeastRankDisplay } from '../src/lib/liturgical/typikonSymbols';

type Case = {
  name: string;
  day: Partial<OrthocalDay>;
  appearanceKey: string;
  expectMajor: boolean;
};

const cases: Case[] = [
  {
    name: 'Great and Holy Monday — forefeast of Annunciation (level 4)',
    appearanceKey: 'holy_week',
    day: {
      summary_title: 'Great and Holy Monday',
      titles: ['Great and Holy Monday'],
      feasts: ['Forefeast of Annunciation'],
      pascha_distance: -6,
      feast_level: 4,
      feast_level_description: 'Red cross (polyeleos typikon symbol)',
    },
    expectMajor: false,
  },
  {
    name: 'Transfiguration (major feast level 7)',
    appearanceKey: 'transfiguration',
    day: {
      summary_title: 'Transfiguration of our Lord',
      titles: ['Transfiguration of our Lord'],
      feasts: ['Transfiguration of our Lord'],
      feast_level: 7,
      feast_level_description: 'Major feast (Lord)',
    },
    expectMajor: true,
  },
  {
    name: 'Apostles Peter and Paul (great feast level 6, not major UI)',
    appearanceKey: 'peter_and_paul',
    day: {
      summary_title: 'Holy Apostles Peter and Paul',
      titles: ['Holy Apostles Peter and Paul'],
      feasts: ['Holy Apostles Peter and Paul'],
      feast_level: 6,
      feast_level_description: 'Great feast typikon',
    },
    expectMajor: false,
  },
];

let failed = 0;

for (const c of cases) {
  const day = c.day as OrthocalDay;
  const feastRank = getFeastRankDisplay(day.feast_level, day.feast_level_description);
  const dayTitle = liturgicalDayTitle(day, c.appearanceKey, 'Liturgical Day', feastRank, 'en');
  const isMajor = isMajorFeastDayForDateBlock(day, c.appearanceKey, feastRank, dayTitle);
  const ok = isMajor === c.expectMajor;
  if (!ok) failed += 1;
  console.log(
    `${ok ? 'OK' : 'FAIL'}  ${c.name}`,
    `\n      title: ${dayTitle}`,
    `\n      isMajorFeastDay: ${isMajor}${ok ? '' : ` (expected ${c.expectMajor})`}`,
  );
}

if (failed > 0) {
  console.error(`\n${failed} case(s) failed`);
  process.exit(1);
}

console.log(`\nAll ${cases.length} cases passed.`);
