import { fuzzyMatchScore, fuzzyNameScore } from '../src/lib/liturgical/fuzzySearch';
import { searchCalendarIndex, type CalendarSearchResult } from '../src/lib/liturgical/calendarSearch';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

assert(fuzzyMatchScore('Saint Nicholas', 'nicholas') > fuzzyMatchScore('Saint Nicholas', 'nick'), 'exact word beats prefix');
assert(fuzzyMatchScore('Saint Nicholas', 'nick') > 0, 'prefix matches');
assert(fuzzyMatchScore('John the Baptist', 'baptist') > 0, 'word match');
assert(fuzzyMatchScore('Basil the Great', 'basill') > 0, 'typo tolerance');
assert(fuzzyNameScore('Saint Nicholas the Wonderworker', 'nicholas wonder') > 0, 'multi-token');

const index: CalendarSearchResult[] = [
  {
    iso: '2026-03-01',
    date: new Date(2026, 2, 1),
    name: 'Saint Nicholas the Wonderworker',
    kind: 'saint',
    dayTitle: 'Sunday of Orthodoxy',
    isGreatFeast: false,
  },
  {
    iso: '2026-12-06',
    date: new Date(2026, 11, 6),
    name: 'Saint Nicholas the Wonderworker',
    kind: 'saint',
    dayTitle: 'Saint Nicholas',
    isGreatFeast: false,
  },
  {
    iso: '2026-05-09',
    date: new Date(2026, 4, 9),
    name: 'Translation of the relics of Saint Nicholas',
    kind: 'feast',
    dayTitle: 'Translation of the relics of Saint Nicholas',
    isGreatFeast: false,
  },
];

const ranked = searchCalendarIndex(index, 'nicholas', 'all', 10);
assert(ranked[0]?.name.includes('Nicholas'), 'most relevant nicholas result first');

console.log('OK fuzzy search verification passed');
