import type { PlainDate } from '../calendar/julianGregorian';
import { createRequestLimiter, fetchJson } from '../net/fetchJson';
import {
  hydrateOrthocalMemoryCache,
  readPersistedOrthocalDay,
  writePersistedOrthocalDay,
  writePersistedOrthocalDays,
} from './orthocalPersistentCache';
import { normalizeOrthocalDay } from './orthocalValidate';

const API_BASE = 'https://orthocal.info/api';
/** orthocal.info is a free community service — keep the app's fan-out polite. */
const orthocalLimiter = createRequestLimiter(6);
/** A cached day is re-fetched in the background at most this often. */
const REFRESH_TTL_MS = 6 * 60 * 60 * 1000;

export type OrthocalCalendar = 'julian' | 'gregorian';

export type OrthocalVerse = {
  book: string;
  chapter: number;
  verse: number;
  content: string;
  paragraph_start: boolean;
};

export type OrthocalReading = {
  source: string;
  book: string;
  description: string;
  display: string;
  short_display: string;
  passage: OrthocalVerse[] | null;
};

export type OrthocalDay = {
  pascha_distance: number;
  julian_day_number: number;
  year: number;
  month: number;
  day: number;
  weekday: number;
  tone: number;
  titles: string[];
  summary_title: string;
  feast_level: number;
  feast_level_description: string;
  feasts: string[] | null;
  fast_level: number;
  fast_level_desc: string;
  fast_exception: number;
  fast_exception_desc: string;
  /** Foods to abstain from that day (orthocal.info API). Omitted on legacy cached payloads. */
  fast_abstentions?: string[];
  saints: string[];
  service_notes: string[];
  abbreviated_reading_indices: number[];
  readings: OrthocalReading[];
  stories?: { title: string; story: string }[];
};

const dayCache = new Map<string, OrthocalDay>();
/** When each day was last fetched from the network (this session or persisted). */
const dayFetchedAt = new Map<string, number>();
const dayInFlight = new Map<string, Promise<OrthocalDay>>();
const gregorianMonthCache = new Map<string, OrthocalDay[]>();
const monthInFlight = new Map<string, Promise<OrthocalDay[]>>();

function cacheKey(cal: OrthocalCalendar, date: PlainDate) {
  return `${cal}:${date.year}-${date.month}-${date.day}`;
}

function gregorianMonthKey(year: number, month: number): string {
  return `${year}-${month}`;
}

/** Restore previously saved days into the in-memory cache (app launch). */
export function primeOrthocalDayCache(
  cal: OrthocalCalendar,
  queryDate: PlainDate,
  day: OrthocalDay,
): void {
  dayCache.set(cacheKey(cal, queryDate), day);
}

export async function hydrateOrthocalFromPersistentCache(): Promise<number> {
  return hydrateOrthocalMemoryCache((key, day, fetchedAt) => {
    dayCache.set(key, day);
    if (!dayFetchedAt.has(key)) dayFetchedAt.set(key, fetchedAt);
  });
}

export async function loadOrthocalDayFromPersistentCache(
  cal: OrthocalCalendar,
  queryDate: PlainDate,
): Promise<OrthocalDay | null> {
  const hit = dayCache.get(cacheKey(cal, queryDate));
  if (hit) return hit;
  const persisted = await readPersistedOrthocalDay(cal, queryDate);
  if (persisted) {
    primeOrthocalDayCache(cal, queryDate, persisted);
  }
  return persisted;
}

/** All days in a civil Gregorian month — one HTTP request instead of ~30. */
export async function fetchOrthocalGregorianMonth(
  year: number,
  month: number,
): Promise<OrthocalDay[]> {
  const key = gregorianMonthKey(year, month);
  const hit = gregorianMonthCache.get(key);
  if (hit) return hit;
  const pending = monthInFlight.get(key);
  if (pending) return pending;

  const promise = orthocalLimiter(async () => {
    const raw = await fetchJson(`${API_BASE}/gregorian/${year}/${month}/`);
    if (!Array.isArray(raw)) throw new Error(`Orthocal: unexpected month payload ${year}-${month}`);
    const data = raw.map(normalizeOrthocalDay).filter((d): d is OrthocalDay => d !== null);
    if (data.length === 0) throw new Error(`Orthocal: empty month ${year}-${month}`);

    gregorianMonthCache.set(key, data);
    const now = Date.now();
    const persistBatch: { queryDate: PlainDate; day: OrthocalDay }[] = [];
    for (const day of data) {
      const queryDate: PlainDate = { year: day.year, month: day.month, day: day.day };
      const dayKey = cacheKey('gregorian', queryDate);
      dayCache.set(dayKey, day);
      dayFetchedAt.set(dayKey, now);
      persistBatch.push({ queryDate, day });
    }
    void writePersistedOrthocalDays('gregorian', persistBatch);
    return data;
  }).finally(() => {
    monthInFlight.delete(key);
  });
  monthInFlight.set(key, promise);
  return promise;
}

/**
 * One day from orthocal.info. Concurrent callers for the same day share one request.
 * `refresh` re-fetches a cached day, but only when it is older than REFRESH_TTL_MS.
 */
export async function fetchOrthocalDay(
  cal: OrthocalCalendar,
  date: PlainDate,
  options?: { refresh?: boolean },
): Promise<OrthocalDay> {
  const key = cacheKey(cal, date);
  const hit = dayCache.get(key);
  if (hit) {
    const age = Date.now() - (dayFetchedAt.get(key) ?? 0);
    if (!options?.refresh || age < REFRESH_TTL_MS) return hit;
  }
  const pending = dayInFlight.get(key);
  if (pending) return pending;

  const promise = orthocalLimiter(async () => {
    const raw = await fetchJson(`${API_BASE}/${cal}/${date.year}/${date.month}/${date.day}/`);
    const data = normalizeOrthocalDay(raw);
    if (!data) throw new Error(`Orthocal: unexpected day payload ${key}`);
    dayCache.set(key, data);
    dayFetchedAt.set(key, Date.now());
    void writePersistedOrthocalDay(cal, date, data);
    return data;
  }).finally(() => {
    dayInFlight.delete(key);
  });
  dayInFlight.set(key, promise);
  return promise;
}

export function getCachedOrthocalDay(
  cal: OrthocalCalendar,
  date: PlainDate,
): OrthocalDay | undefined {
  return dayCache.get(cacheKey(cal, date));
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

export function formatOrthocalFastLabel(day: OrthocalDay): string {
  let label = day.fast_level_desc?.trim() || 'No fast';
  const exception = day.fast_exception_desc?.trim();
  if (exception) {
    label = `${label} · ${exception}`;
  }
  return label;
}

/** Canonical abstention tokens from orthocal `fast_abstentions`. */
export type OrthocalFastAbstention = 'meat' | 'dairy' | 'eggs' | 'fish' | 'wine' | 'oil';

const ORTHOCAL_FAST_ABSTENTION_SET = new Set<OrthocalFastAbstention>([
  'meat',
  'dairy',
  'eggs',
  'fish',
  'wine',
  'oil',
]);

function normalizeOrthocalFastText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Foods orthocal marks as abstained that day. Empty array = no fast / all foods allowed. */
export function orthocalFastAbstentions(day: Pick<OrthocalDay, 'fast_abstentions'>): string[] {
  return day.fast_abstentions ?? [];
}

export function hasOrthocalFastAbstentions(
  day: Pick<OrthocalDay, 'fast_abstentions'>,
): day is OrthocalDay & { fast_abstentions: string[] } {
  return Array.isArray(day.fast_abstentions);
}

/** True when orthocal reports no abstentions (fast free / feast day). */
export function isOrthocalFastFreeDay(
  day: Pick<OrthocalDay, 'fast_level' | 'fast_exception_desc' | 'fast_abstentions'>,
): boolean {
  if (hasOrthocalFastAbstentions(day)) {
    return day.fast_abstentions.length === 0;
  }
  if ((day.fast_level ?? 0) >= 1) return false;
  const exception = day.fast_exception_desc?.trim();
  if (!exception) return true;
  const normalized = normalizeOrthocalFastText(exception);
  return normalized === 'fast free' || normalized === 'fast free day' || normalized === 'no fast';
}

/** Cheesefare week meat fast — only `meat` is abstained. */
export function isOrthocalMeatFastDay(
  day: Pick<OrthocalDay, 'fast_abstentions' | 'fast_exception_desc' | 'fast_level_desc' | 'pascha_distance'>,
): boolean {
  if (hasOrthocalFastAbstentions(day)) {
    const abstentions = day.fast_abstentions.map((entry) => entry.toLowerCase());
    return abstentions.length === 1 && abstentions[0] === 'meat';
  }
  const exception = day.fast_exception_desc?.trim();
  if (exception) {
    const normalized = normalizeOrthocalFastText(exception);
    if (normalized === 'meat fast' || normalized.endsWith(' meat fast')) return true;
  }
  const levelDesc = day.fast_level_desc?.trim();
  if (levelDesc) {
    const normalized = normalizeOrthocalFastText(levelDesc);
    if (normalized === 'meat fast' || normalized.endsWith(' meat fast')) return true;
  }
  return day.pascha_distance >= -55 && day.pascha_distance <= -49;
}

export function orthocalFastAbstentionKinds(
  day: Pick<OrthocalDay, 'fast_abstentions'>,
): OrthocalFastAbstention[] {
  return orthocalFastAbstentions(day).filter((entry): entry is OrthocalFastAbstention =>
    ORTHOCAL_FAST_ABSTENTION_SET.has(entry.toLowerCase() as OrthocalFastAbstention),
  );
}

export type LiturgicalVerseLine = {
  verse: number;
  text: string;
};

export type LiturgicalReadingView = {
  label: string;
  citation: string;
  /** Verse lines grouped into paragraphs (same breaks as orthocal passage). */
  paragraphs: LiturgicalVerseLine[][];
  source?: string;
};

export function passageToParagraphs(passage: OrthocalVerse[]): LiturgicalVerseLine[][] {
  const paragraphs: LiturgicalVerseLine[][] = [];
  let current: LiturgicalVerseLine[] = [];

  for (const verse of passage) {
    const text = stripHtml(verse.content).trim();
    if (!text) continue;
    const line = { verse: verse.verse, text };
    if (verse.paragraph_start && current.length > 0) {
      paragraphs.push(current);
      current = [line];
    } else {
      current.push(line);
    }
  }

  if (current.length > 0) {
    paragraphs.push(current);
  }

  return paragraphs;
}

