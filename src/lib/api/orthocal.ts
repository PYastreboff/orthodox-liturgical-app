import type { PlainDate } from '../calendar/julianGregorian';

const API_BASE = 'https://orthocal.info/api';

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
  saints: string[];
  service_notes: string[];
  abbreviated_reading_indices: number[];
  readings: OrthocalReading[];
  stories?: { title: string; story: string }[];
};

const dayCache = new Map<string, OrthocalDay>();
const gregorianMonthCache = new Map<string, OrthocalDay[]>();

function cacheKey(cal: OrthocalCalendar, date: PlainDate) {
  return `${cal}:${date.year}-${date.month}-${date.day}`;
}

function gregorianMonthKey(year: number, month: number): string {
  return `${year}-${month}`;
}

function cacheOrthocalDay(cal: OrthocalCalendar, day: OrthocalDay): void {
  dayCache.set(cacheKey(cal, { year: day.year, month: day.month, day: day.day }), day);
}

/** All days in a civil Gregorian month — one HTTP request instead of ~30. */
export async function fetchOrthocalGregorianMonth(
  year: number,
  month: number,
): Promise<OrthocalDay[]> {
  const key = gregorianMonthKey(year, month);
  const hit = gregorianMonthCache.get(key);
  if (hit) return hit;

  const url = `${API_BASE}/gregorian/${year}/${month}/`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Orthocal API ${res.status} for gregorian ${year}-${month}`);
  }

  const data = (await res.json()) as OrthocalDay[];
  gregorianMonthCache.set(key, data);
  for (const day of data) {
    cacheOrthocalDay('gregorian', day);
  }
  return data;
}

export async function fetchOrthocalDay(
  cal: OrthocalCalendar,
  date: PlainDate,
): Promise<OrthocalDay> {
  const key = cacheKey(cal, date);
  const hit = dayCache.get(key);
  if (hit) return hit;

  const url = `${API_BASE}/${cal}/${date.year}/${date.month}/${date.day}/`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Orthocal API ${res.status} for ${cal} ${date.year}-${date.month}-${date.day}`);
  }

  const data = (await res.json()) as OrthocalDay;
  dayCache.set(key, data);
  return data;
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

const FAST_FOODS_BY_LEVEL: Record<number, string> = {
  0: 'All standard foods are allowed.',
  1: 'All standard foods are allowed.',
  2: 'Wine and oil permitted; follow your typikon for other foods.',
  3: 'Fish, wine, and oil are generally permitted; no meat or dairy.',
  4: 'Dairy, eggs, fish, wine, and oil may be permitted; no meat.',
  5: 'Strict fast: no meat, dairy, eggs, fish, wine, or oil (typical weekday rule).',
};

export function fastingFoodsForLevel(fastLevel: number, fallbackKey: string): string {
  if (FAST_FOODS_BY_LEVEL[fastLevel] !== undefined) {
    return FAST_FOODS_BY_LEVEL[fastLevel];
  }
  if (fallbackKey.includes('lent')) {
    return FAST_FOODS_BY_LEVEL[5];
  }
  if (fallbackKey === 'wednesday_fast' || fallbackKey === 'friday_fast') {
    return FAST_FOODS_BY_LEVEL[5];
  }
  if (fallbackKey.includes('fast')) {
    return 'Plant-based foods; wine and oil may be allowed depending on the day.';
  }
  return FAST_FOODS_BY_LEVEL[0];
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

