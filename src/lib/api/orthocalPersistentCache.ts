import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PlainDate } from '../calendar/julianGregorian';
import type { OrthocalCalendar, OrthocalDay } from './orthocal';

const STORAGE_KEY = '@orthodaily/orthocal-days/v2';
/** ~13 months of daily lookups for two calendar modes. */
const MAX_ENTRIES = 400;

type CachedEntry = {
  day: OrthocalDay;
  fetchedAt: number;
};

type Store = Record<string, CachedEntry>;

let store: Store | null = null;
let loadPromise: Promise<Store> | null = null;
let persistTimer: ReturnType<typeof setTimeout> | null = null;

export function orthocalPersistentKey(cal: OrthocalCalendar, queryDate: PlainDate): string {
  return `${cal}:${queryDate.year}-${queryDate.month}-${queryDate.day}`;
}

function isOrthocalDay(value: unknown): value is OrthocalDay {
  if (!value || typeof value !== 'object') return false;
  const day = value as OrthocalDay;
  return (
    typeof day.year === 'number' &&
    typeof day.month === 'number' &&
    typeof day.day === 'number' &&
    Array.isArray(day.saints)
  );
}

function trimStore(next: Store): Store {
  const keys = Object.keys(next);
  if (keys.length <= MAX_ENTRIES) return next;

  const sorted = keys.sort(
    (a, b) => (next[a]?.fetchedAt ?? 0) - (next[b]?.fetchedAt ?? 0),
  );
  const trimmed: Store = {};
  for (const key of sorted.slice(sorted.length - MAX_ENTRIES)) {
    trimmed[key] = next[key];
  }
  return trimmed;
}

function schedulePersist(): void {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    persistTimer = null;
    if (!store) return;
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store)).catch(() => {});
  }, 400);
}

async function ensureLoaded(): Promise<Store> {
  if (store) return store;
  if (!loadPromise) {
    loadPromise = (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed = raw ? (JSON.parse(raw) as Store) : {};
        store = trimStore(parsed);
      } catch {
        store = {};
      }
      return store;
    })();
  }
  return loadPromise;
}

/** Load disk cache into memory on app start (non-blocking). */
export async function hydrateOrthocalMemoryCache(
  memorySet: (key: string, day: OrthocalDay) => void,
): Promise<number> {
  const loaded = await ensureLoaded();
  let count = 0;
  for (const [key, entry] of Object.entries(loaded)) {
    if (!isOrthocalDay(entry?.day)) continue;
    memorySet(key, entry.day);
    count += 1;
  }
  return count;
}

export async function readPersistedOrthocalDay(
  cal: OrthocalCalendar,
  queryDate: PlainDate,
): Promise<OrthocalDay | null> {
  const loaded = await ensureLoaded();
  const entry = loaded[orthocalPersistentKey(cal, queryDate)];
  return entry && isOrthocalDay(entry.day) ? entry.day : null;
}

export async function writePersistedOrthocalDay(
  cal: OrthocalCalendar,
  queryDate: PlainDate,
  day: OrthocalDay,
): Promise<void> {
  const loaded = await ensureLoaded();
  const key = orthocalPersistentKey(cal, queryDate);
  loaded[key] = { day, fetchedAt: Date.now() };
  store = trimStore(loaded);
  schedulePersist();
}

export async function writePersistedOrthocalDays(
  cal: OrthocalCalendar,
  entries: Array<{ queryDate: PlainDate; day: OrthocalDay }>,
): Promise<void> {
  if (entries.length === 0) return;
  const loaded = await ensureLoaded();
  const now = Date.now();
  for (const { queryDate, day } of entries) {
    loaded[orthocalPersistentKey(cal, queryDate)] = { day, fetchedAt: now };
  }
  store = trimStore(loaded);
  schedulePersist();
}
