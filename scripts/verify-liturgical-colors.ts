/**
 * Spot-check liturgical appearance keys + vestment swatches for key feasts.
 * Run: npx tsx scripts/verify-liturgical-colors.ts
 */
import type { OrthocalDay } from '../src/lib/api/orthocal';
import { getLiturgicalAppearanceForLocalDate } from '../src/lib/calendar/dayAppearance';
import { orthodoxPaschaJdn } from '../src/lib/calendar/pascha';
import {
  julianCalendarToGregorian,
  julianDayNumberToGregorianCalendar,
} from '../src/lib/calendar/julianGregorian';
import {
  fastSummaryKindFromDetail,
  isOrthocalFastDay,
  localizedFastingFoodsDetail,
} from '../src/i18n/fastingLabels';

type Swatch = 'gold' | 'blue' | 'green' | 'red' | 'dark' | 'purple' | 'white' | 'black';

/** Mirror of vestments.ts liturgicalSwatchKey — keep in sync for verification. */
function expectedSwatchForKey(key: string): Swatch {
  if (key === 'ascension' || key === 'ascension_leavetaking') return 'gold';
  if (key === 'theophany' || key === 'annunciation' || key === 'dormition') return 'blue';
  if (key === 'nativity_theotokos' || key === 'presentation') return 'blue';
  if (key === 'pascha' || key === 'bright_week' || key === 'holy_saturday') return 'white';
  if (
    key === 'palm_sunday' ||
    key === 'pentecost' ||
    key === 'holy_spirit' ||
    key === 'pentecost_season' ||
    key === 'trinity_day' ||
    key === 'all_saints' ||
    key === 'all_saints_russia'
  ) {
    return 'green';
  }
  if (key === 'peter_and_paul' || key === 'elevation_cross') return 'red';
  if (key === 'great_friday') return 'black';
  if (key.includes('lent') || key === 'holy_week') return 'purple';
  if (key.includes('fast')) return 'dark';
  if (key === 'nativity' || key === 'transfiguration' || key === 'sunday') return 'gold';
  return 'gold';
}

function swatchName(appearance: ReturnType<typeof getLiturgicalAppearanceForLocalDate>): Swatch {
  return expectedSwatchForKey(appearance.key);
}

function civilFromJulian(y: number, m: number, d: number): Date {
  const g = julianCalendarToGregorian(y, m, d);
  return new Date(g.year, g.month - 1, g.day);
}

function paschaPlus(days: number, year = 2026): Date {
  const g = julianDayNumberToGregorianCalendar(orthodoxPaschaJdn(year) + days);
  return new Date(g.year, g.month - 1, g.day);
}

type Case = {
  name: string;
  date: Date;
  expectKey: string;
  expectSwatch: Swatch;
  orthocal?: Partial<OrthocalDay>;
  expectFish?: boolean;
};

const cases: Case[] = [
  {
    name: 'Ascension (pascha+39)',
    date: paschaPlus(39),
    expectKey: 'ascension',
    expectSwatch: 'gold',
  },
  {
    name: 'Leavetaking of Ascension (pascha+40)',
    date: paschaPlus(40),
    expectKey: 'ascension_leavetaking',
    expectSwatch: 'gold',
  },
  {
    name: 'Day of the Holy Spirit (pascha+50)',
    date: paschaPlus(50),
    expectKey: 'holy_spirit',
    expectSwatch: 'green',
  },
  {
    name: 'Trinity weekday (pascha+52)',
    date: paschaPlus(52),
    expectKey: 'pentecost_season',
    expectSwatch: 'green',
  },
  {
    name: 'All Saints Sunday (pascha+56)',
    date: paschaPlus(56),
    expectKey: 'all_saints',
    expectSwatch: 'green',
  },
  {
    name: 'All Saints of Russia (pascha+63)',
    date: paschaPlus(63),
    expectKey: 'all_saints_russia',
    expectSwatch: 'green',
    orthocal: {
      feasts: ['All Saints of America, All Saints of Russia'],
      fast_level: 3,
      fast_level_desc: 'Apostles Fast',
      fast_exception_desc: 'Fish, Wine and Oil are Allowed',
    },
    expectFish: true,
  },
  {
    name: 'Apostles Fast weekday (pascha+58, no feast)',
    date: paschaPlus(58),
    expectKey: 'apostles_fast',
    expectSwatch: 'dark',
  },
  {
    name: 'SS Peter & Paul (29 Jun Julian 2026)',
    date: civilFromJulian(2026, 6, 29),
    expectKey: 'peter_and_paul',
    expectSwatch: 'red',
  },
  {
    name: 'Presentation (2 Feb Julian 2026)',
    date: civilFromJulian(2026, 2, 2),
    expectKey: 'presentation',
    expectSwatch: 'blue',
  },
  {
    name: 'Nativity of the Theotokos (8 Sep Julian 2026)',
    date: civilFromJulian(2026, 9, 8),
    expectKey: 'nativity_theotokos',
    expectSwatch: 'blue',
  },
  {
    name: 'Orthocal override: Russia feast on apostles-fast Sunday',
    date: new Date(2026, 5, 14),
    expectKey: 'all_saints_russia',
    expectSwatch: 'green',
    orthocal: {
      feasts: ['All Saints of America, All Saints of Russia'],
      summary_title: '2nd Sunday after Pentecost',
      fast_level: 3,
      fast_exception_desc: 'Fish, Wine and Oil are Allowed',
    },
    expectFish: true,
  },
];

let failed = 0;

for (const c of cases) {
  const appearance = getLiturgicalAppearanceForLocalDate(
    c.date,
    'julian',
    c.orthocal as OrthocalDay | undefined,
  );
  const swatch = swatchName(appearance);
  const keyOk = appearance.key === c.expectKey;
  const swatchOk = swatch === c.expectSwatch;

  let fastingOk = true;
  let fastingNote = '';
  if (c.orthocal?.fast_level !== undefined) {
    const detail = localizedFastingFoodsDetail(
      c.orthocal as OrthocalDay,
      appearance.key,
      false,
      'en',
      { year: c.date.getFullYear(), month: c.date.getMonth() + 1, day: c.date.getDate() },
    );
    const isFast = isOrthocalFastDay(c.orthocal as OrthocalDay, appearance.key, false);
    const kind = fastSummaryKindFromDetail(detail, isFast);
    const hasFish = detail.allowed.some((f) => f.kind === 'fish');
    if (c.expectFish !== undefined) {
      fastingOk = hasFish === c.expectFish;
      fastingNote = ` fish=${hasFish} kind=${kind}`;
    }
  }

  const ok = keyOk && swatchOk && fastingOk;
  if (!ok) failed += 1;

  const status = ok ? 'OK' : 'FAIL';
  console.log(
    `${status}  ${c.name}`,
    `\n      key: ${appearance.key}${keyOk ? '' : ` (expected ${c.expectKey})`}`,
    `\n      swatch: ${swatch}${swatchOk ? '' : ` (expected ${c.expectSwatch})`}${fastingNote}`,
  );
}

console.log(`\n${failed === 0 ? 'All checks passed.' : `${failed} check(s) failed.`}`);
process.exit(failed === 0 ? 0 : 1);
