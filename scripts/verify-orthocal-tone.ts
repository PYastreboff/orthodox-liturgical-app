import assert from 'node:assert/strict';

import type { OrthocalDay } from '../src/lib/api/orthocal';
import {
  resolveOrthocalTone,
  toneFromSundayAfterPaschaIndex,
} from '../src/lib/liturgical/orthocalTone';

function day(partial: Partial<OrthocalDay> & Pick<OrthocalDay, 'pascha_distance' | 'weekday' | 'tone'>): OrthocalDay {
  return {
    julian_day_number: 0,
    year: 2026,
    month: 5,
    day: 1,
    titles: [],
    summary_title: '',
    feast_level: 0,
    feast_level_description: '',
    feasts: null,
    fast_level: 0,
    fast_level_desc: '',
    fast_exception: 0,
    fast_exception_desc: '',
    saints: [],
    service_notes: [],
    abbreviated_reading_indices: [],
    readings: [],
    ...partial,
  };
}

assert.equal(toneFromSundayAfterPaschaIndex(9), 1);
assert.equal(toneFromSundayAfterPaschaIndex(16), 8);
assert.equal(toneFromSundayAfterPaschaIndex(38), 6);

assert.equal(
  resolveOrthocalTone(
    day({
      tone: 0,
      weekday: 0,
      pascha_distance: 63,
      summary_title: '9th Sunday After Pascha',
    }),
  ),
  1,
);

assert.equal(
  resolveOrthocalTone(
    day({
      tone: 0,
      weekday: 0,
      pascha_distance: 112,
      summary_title: '16th Sunday After Pascha',
    }),
  ),
  8,
);

assert.equal(
  resolveOrthocalTone(
    day({
      tone: 0,
      weekday: 0,
      pascha_distance: 266,
      summary_title: '38th Sunday After Pascha',
    }),
  ),
  6,
);

assert.equal(
  resolveOrthocalTone(
    day({
      tone: 0,
      weekday: 3,
      pascha_distance: 68,
      summary_title: 'Wednesday of the 9th Sunday after Pascha',
    }),
  ),
  1,
);

assert.equal(resolveOrthocalTone(day({ tone: 4, weekday: 0, pascha_distance: 14 })), 4);

console.log('verify-orthocal-tone: ok');
