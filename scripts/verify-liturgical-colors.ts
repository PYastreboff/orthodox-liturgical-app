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
import { liturgicalSwatchKey } from '../src/lib/liturgical/liturgicalSwatchKey';

type Swatch = ReturnType<typeof liturgicalSwatchKey>;

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
    name: 'Great Lent weekday (pascha-45)',
    date: paschaPlus(-45),
    expectKey: 'great_lent',
    expectSwatch: 'black',
  },
  {
    name: 'Great Lent Sunday (pascha-42)',
    date: paschaPlus(-42),
    expectKey: 'lent_sunday',
    expectSwatch: 'purple',
  },
  {
    name: 'Nativity Fast Sunday (Dec 21 Julian 2026)',
    date: civilFromJulian(2026, 12, 21),
    expectKey: 'nativity_fast_sunday',
    expectSwatch: 'red',
  },
  {
    name: 'Ascension (pascha+39)',
    date: paschaPlus(39),
    expectKey: 'ascension',
    expectSwatch: 'white',
  },
  {
    name: 'Leavetaking of Ascension (pascha+40)',
    date: paschaPlus(40),
    expectKey: 'ascension_leavetaking',
    expectSwatch: 'white',
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
    expectSwatch: 'gold',
  },
  {
    name: 'All Saints of Russia (pascha+63)',
    date: paschaPlus(63),
    expectKey: 'all_saints_russia',
    expectSwatch: 'gold',
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
    expectSwatch: 'purple',
  },
  {
    name: 'Apostles Fast Sunday (pascha+70)',
    date: paschaPlus(70),
    expectKey: 'apostles_fast_sunday',
    expectSwatch: 'red',
  },
  {
    name: 'Nativity Fast weekday (Nov 20 Julian 2026)',
    date: civilFromJulian(2026, 11, 20),
    expectKey: 'nativity_fast',
    expectSwatch: 'purple',
  },
  {
    name: 'Exaltation of the Cross (14 Sep Julian 2026)',
    date: civilFromJulian(2026, 9, 14),
    expectKey: 'elevation_cross',
    expectSwatch: 'red',
  },
  {
    name: 'Nativity of St John the Baptist (24 Jun Julian 2026)',
    date: civilFromJulian(2026, 6, 24),
    expectKey: 'nativity_john_baptist',
    expectSwatch: 'red',
  },
  {
    name: 'Beheading of St John the Baptist (29 Aug Julian 2026)',
    date: civilFromJulian(2026, 8, 29),
    expectKey: 'beheading_john_baptist',
    expectSwatch: 'red',
  },
  {
    name: 'Entry of the Theotokos (21 Nov Julian 2026)',
    date: civilFromJulian(2026, 11, 21),
    expectKey: 'entry_theotokos',
    expectSwatch: 'blue',
  },
  {
    name: 'Protection of the Theotokos / Pokrov (1 Oct Julian 2026)',
    date: civilFromJulian(2026, 10, 1),
    expectKey: 'pokrov',
    expectSwatch: 'blue',
  },
  {
    name: 'SS Peter & Paul (29 Jun Julian 2026)',
    date: civilFromJulian(2026, 6, 29),
    expectKey: 'peter_and_paul',
    expectSwatch: 'gold',
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
    name: 'Circumcision of Our Lord; St Basil (1 Jan Julian 2026)',
    date: civilFromJulian(2026, 1, 1),
    expectKey: 'circumcision',
    expectSwatch: 'white',
  },
  {
    name: 'Theophany (6 Jan Julian 2026)',
    date: civilFromJulian(2026, 1, 6),
    expectKey: 'theophany',
    expectSwatch: 'white',
  },
  {
    name: 'Transfiguration (6 Aug Julian 2026)',
    date: civilFromJulian(2026, 8, 6),
    expectKey: 'transfiguration',
    expectSwatch: 'white',
  },
  {
    name: 'Nativity (25 Dec Julian 2026)',
    date: civilFromJulian(2026, 12, 25),
    expectKey: 'nativity',
    expectSwatch: 'white',
  },
  {
    name: 'Great and Holy Monday — Forefeast of Annunciation stays Holy Week (2026)',
    date: paschaPlus(-6, 2026),
    expectKey: 'holy_week',
    expectSwatch: 'black',
    orthocal: {
      summary_title: 'Great and Holy Monday',
      titles: ['Great and Holy Monday'],
      feasts: ['Forefeast of Annunciation'],
      pascha_distance: -6,
    },
  },
  {
    name: 'Orthocal override: Russia feast on apostles-fast Sunday',
    date: new Date(2026, 5, 14),
    expectKey: 'all_saints_russia',
    expectSwatch: 'gold',
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
  const swatch = liturgicalSwatchKey(appearance);
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
