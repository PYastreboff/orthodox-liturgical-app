import {
  calendarFastingFoodIcons,
  localizedFastingFoodsDetail,
} from '../src/i18n/fastingLabels';
import type { OrthocalDay } from '../src/lib/api/orthocal';

function kinds(detail: ReturnType<typeof localizedFastingFoodsDetail>) {
  return {
    allowed: detail.allowed.map((f) => f.kind).sort().join(','),
    notAllowed: detail.notAllowed.map((f) => f.kind).sort().join(','),
  };
}

function mockDay(partial: Partial<OrthocalDay>): OrthocalDay {
  return {
    pascha_distance: 0,
    julian_day_number: 0,
    year: 2026,
    month: 3,
    day: 1,
    weekday: 1,
    tone: 1,
    titles: [],
    summary_title: 'Test',
    feast_level: 0,
    feast_level_description: '',
    feasts: null,
    fast_level: 5,
    fast_level_desc: 'Strict Fast',
    fast_exception: 0,
    fast_exception_desc: '',
    saints: [],
    service_notes: [],
    abbreviated_reading_indices: [],
    readings: [],
    ...partial,
  };
}

const civil = { year: 2026, month: 3, day: 1 };
const cases: Array<{
  name: string;
  day: OrthocalDay | null;
  appearanceKey?: string;
  civil?: { year: number; month: number; day: number };
  weeklyFast?: boolean;
  expect: { allowed: string; notAllowed: string };
  icons?: { fish: boolean; wine: boolean; oil: boolean };
}> = [
  {
    name: 'no exception — strict only',
    day: mockDay({ fast_level: 5, fast_exception_desc: '' }),
    expect: { allowed: 'plant', notAllowed: 'dairy,eggs,fish,meat,oil,wine' },
  },
  {
    name: 'wine and oil allowed',
    day: mockDay({ fast_level: 5, fast_exception_desc: 'Wine and Oil Allowed' }),
    expect: { allowed: 'oil,plant,wine', notAllowed: 'dairy,eggs,fish,meat' },
  },
  {
    name: 'oil allowed only',
    day: mockDay({ fast_level: 5, fast_exception_desc: 'Oil Allowed' }),
    expect: { allowed: 'oil,plant', notAllowed: 'dairy,eggs,fish,meat,wine' },
  },
  {
    name: 'fish wine and oil allowed',
    day: mockDay({
      fast_level: 5,
      fast_exception_desc: 'Fish, Wine and Oil are Allowed',
    }),
    expect: { allowed: 'fish,oil,plant,wine', notAllowed: 'dairy,eggs,meat' },
  },
  {
    name: 'meat fast',
    day: mockDay({ fast_level: 1, fast_level_desc: 'Fast', fast_exception_desc: 'Meat Fast' }),
    expect: {
      allowed: 'dairy,eggs,fish,oil,plant,wine',
      notAllowed: 'meat',
    },
  },
  {
    name: 'meat fast on Wed with weekly override (level 0)',
    day: mockDay({
      fast_level: 0,
      fast_level_desc: 'No Fast',
      fast_exception_desc: 'Meat Fast',
    }),
    weeklyFast: true,
    expect: {
      allowed: 'dairy,eggs,fish,oil,plant,wine',
      notAllowed: 'meat',
    },
  },
  {
    name: 'cheesefare week without Meat Fast text',
    day: mockDay({
      pascha_distance: -52,
      fast_level: 1,
      fast_level_desc: 'Fast',
      fast_exception_desc: '',
    }),
    expect: {
      allowed: 'dairy,eggs,fish,oil,plant,wine',
      notAllowed: 'meat',
    },
  },
  {
    name: 'lenten fast — no exception (strict)',
    day: mockDay({
      fast_level: 2,
      fast_level_desc: 'Lenten Fast',
      fast_exception_desc: '',
    }),
    expect: { allowed: 'plant', notAllowed: 'dairy,eggs,fish,meat,oil,wine' },
    icons: { fish: false, wine: false, oil: false },
  },
  {
    name: 'lenten fast — wine and oil allowed',
    day: mockDay({
      fast_level: 2,
      fast_level_desc: 'Lenten Fast',
      fast_exception_desc: 'Wine and Oil are Allowed',
    }),
    expect: { allowed: 'oil,plant,wine', notAllowed: 'dairy,eggs,fish,meat' },
    icons: { fish: false, wine: true, oil: true },
  },
  {
    name: 'lenten fast — fish wine and oil allowed',
    day: mockDay({
      fast_level: 2,
      fast_level_desc: 'Lenten Fast',
      fast_exception_desc: 'Fish, Wine and Oil are Allowed',
    }),
    expect: { allowed: 'fish,oil,plant,wine', notAllowed: 'dairy,eggs,meat' },
    icons: { fish: true, wine: true, oil: true },
  },
  {
    name: 'lenten fast — no overrides',
    day: mockDay({
      fast_level: 2,
      fast_level_desc: 'Lenten Fast',
      fast_exception_desc: 'No overrides',
    }),
    expect: { allowed: 'plant', notAllowed: 'dairy,eggs,fish,meat,oil,wine' },
    icons: { fish: false, wine: false, oil: false },
  },
  {
    name: 'cheesefare Tue — no orthocal yet',
    day: null,
    appearanceKey: 'cheesefare_fast',
    civil: { year: 2026, month: 2, day: 17 },
    expect: {
      allowed: 'dairy,eggs,fish,oil,plant,wine',
      notAllowed: 'meat',
    },
    icons: { fish: true, wine: true, oil: true },
  },
  {
    name: 'cheesefare Wed — no orthocal yet',
    day: null,
    appearanceKey: 'cheesefare_fast',
    civil: { year: 2026, month: 2, day: 18 },
    expect: {
      allowed: 'dairy,eggs,fish,oil,plant,wine',
      notAllowed: 'meat',
    },
  },
];

let failed = 0;
for (const c of cases) {
  const result = kinds(
    localizedFastingFoodsDetail(
      c.day,
      c.appearanceKey ?? 'great_lent',
      c.weeklyFast ?? false,
      'en',
      c.civil ?? civil,
    ),
  );
  const ok =
    result.allowed === c.expect.allowed && result.notAllowed === c.expect.notAllowed;
  if (!ok) failed += 1;
  console.log(
    ok ? 'OK' : 'FAIL',
    c.name,
    '\n  got',
    result,
    '\n  expected',
    c.expect,
  );

  if (c.icons) {
    const iconResult = calendarFastingFoodIcons(
      c.day,
      c.appearanceKey ?? 'great_lent',
      c.weeklyFast ?? false,
      c.civil ?? civil,
    );
    const iconOk =
      iconResult.fish === c.icons.fish &&
      iconResult.wine === c.icons.wine &&
      iconResult.oil === c.icons.oil &&
      !iconResult.noEating;
    if (!iconOk) failed += 1;
    console.log(
      iconOk ? 'OK' : 'FAIL',
      `${c.name} (icons)`,
      '\n  got',
      { fish: iconResult.fish, wine: iconResult.wine, oil: iconResult.oil },
      '\n  expected',
      c.icons,
    );
  }
}

process.exit(failed === 0 ? 0 : 1);
