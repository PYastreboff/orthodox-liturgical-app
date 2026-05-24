import type { PrimaryCalendar } from '../calendar/dateDisplay';
import { fromDayIso } from '../calendar/localDate';
import type { MonthDayMap } from './orthocalMonthCache';
import { loadCalendarYear } from './orthocalMonthCache';

export type CalendarSearchKind = 'saint' | 'feast';

export type CalendarSearchResult = {
  iso: string;
  date: Date;
  name: string;
  kind: CalendarSearchKind;
  dayTitle: string;
  /** True for feast entries that are great feasts (pink calendar cells). */
  isGreatFeast: boolean;
};

export type CalendarSearchFilter = 'all' | 'saint' | 'feast';

function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim();
}

function matchesQuery(text: string, query: string): boolean {
  const needle = normalizeSearchText(query);
  if (!needle) return false;
  return normalizeSearchText(text).includes(needle);
}

function isGreatFeastName(name: string, greatFeastNames: string[]): boolean {
  const norm = (value: string) => normalizeSearchText(value);
  const needle = norm(name);
  return greatFeastNames.some((feast) => norm(feast) === needle);
}

export function buildCalendarSearchIndex(dayByIso: MonthDayMap): CalendarSearchResult[] {
  const entries: CalendarSearchResult[] = [];

  for (const [iso, info] of Object.entries(dayByIso)) {
    const date = fromDayIso(iso);
    if (!date) continue;

    for (const name of info.saints) {
      entries.push({
        iso,
        date,
        name,
        kind: 'saint',
        dayTitle: info.dayTitle,
        isGreatFeast: false,
      });
    }

    const feastNames = new Set(info.feasts);
    if (info.dayTitle) feastNames.add(info.dayTitle);

    for (const name of feastNames) {
      entries.push({
        iso,
        date,
        name,
        kind: 'feast',
        dayTitle: info.dayTitle,
        isGreatFeast: isGreatFeastName(name, info.greatFeastNames),
      });
    }
  }

  return entries.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function searchCalendarIndex(
  index: CalendarSearchResult[],
  query: string,
  filter: CalendarSearchFilter,
  limit = 40,
): CalendarSearchResult[] {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const hits: CalendarSearchResult[] = [];
  for (const entry of index) {
    if (filter !== 'all' && entry.kind !== filter) continue;
    if (!matchesQuery(entry.name, trimmed)) continue;
    hits.push(entry);
    if (hits.length >= limit) break;
  }
  return hits;
}

const yearIndexCache = new Map<string, CalendarSearchResult[]>();
const yearLoadCache = new Map<string, Promise<CalendarSearchResult[]>>();

function yearIndexKey(calendar: PrimaryCalendar, year: number): string {
  return `${calendar}:${year}`;
}

/** Full-year index for saint / feast search (cached per calendar + year). */
export function loadCalendarSearchIndex(
  calendar: PrimaryCalendar,
  year: number,
): Promise<CalendarSearchResult[]> {
  const key = yearIndexKey(calendar, year);
  const hit = yearIndexCache.get(key);
  if (hit) return Promise.resolve(hit);

  const pending = yearLoadCache.get(key);
  if (pending) return pending;

  const promise = loadCalendarYear(calendar, year).then((dayByIso) => {
    const index = buildCalendarSearchIndex(dayByIso);
    yearIndexCache.set(key, index);
    yearLoadCache.delete(key);
    return index;
  });
  yearLoadCache.set(key, promise);
  return promise;
}

export function searchCachedCalendarIndex(
  dayByIso: MonthDayMap,
  query: string,
  filter: CalendarSearchFilter,
): CalendarSearchResult[] {
  return searchCalendarIndex(buildCalendarSearchIndex(dayByIso), query, filter, 20);
}
