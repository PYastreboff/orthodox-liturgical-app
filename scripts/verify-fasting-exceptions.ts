import { localizedFastingFoodsDetail } from '../src/i18n/fastingLabels';
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
const cases = [
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
];

let failed = 0;
for (const c of cases) {
  const result = kinds(
    localizedFastingFoodsDetail(c.day, 'great_lent', c.weeklyFast ?? false, 'en', civil),
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
}

process.exit(failed === 0 ? 0 : 1);
