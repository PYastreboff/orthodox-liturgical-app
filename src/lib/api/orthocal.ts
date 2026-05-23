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

function cacheKey(cal: OrthocalCalendar, date: PlainDate) {
  return `${cal}:${date.year}-${date.month}-${date.day}`;
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
  1: 'Fast-free day — all foods allowed.',
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

export function abbreviatedReadings(day: OrthocalDay): LiturgicalReadingView[] {
  const indices = day.abbreviated_reading_indices ?? [];
  return indices
    .map((i) => day.readings[i])
    .filter((r): r is OrthocalReading => Boolean(r))
    .map((r) => ({
      label: readingLabel(r),
      citation: r.display || r.short_display || r.description,
      paragraphs: passageToParagraphs(r.passage ?? []),
      source: r.source,
    }));
}

function readingLabel(r: OrthocalReading): string {
  const book = r.book?.toLowerCase() ?? '';
  if (book.includes('gospel')) return 'Gospel';
  if (book.includes('apostol') || book.includes('epistle')) return 'Epistle';
  if (r.description) return r.description;
  return r.book || r.source || 'Reading';
}

export function toneLabelFromApi(tone: number): string {
  if (tone >= 1 && tone <= 8) return `Tone ${tone}`;
  return 'Tone —';
}
