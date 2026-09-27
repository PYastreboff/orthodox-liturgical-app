import type { OrthocalDay, OrthocalReading, OrthocalVerse } from './orthocal';

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const num = (value: unknown, fallback = 0): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;
const str = (value: unknown): string => (typeof value === 'string' ? value : '');
const strList = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

function normalizeVerse(value: unknown): OrthocalVerse | null {
  if (!isObject(value) || typeof value.content !== 'string') return null;
  return {
    book: str(value.book),
    chapter: num(value.chapter),
    verse: num(value.verse),
    content: value.content,
    paragraph_start: value.paragraph_start === true,
  };
}

function normalizeReading(value: unknown): OrthocalReading | null {
  if (!isObject(value)) return null;
  const passage = Array.isArray(value.passage)
    ? value.passage.map(normalizeVerse).filter((v): v is OrthocalVerse => v !== null)
    : null;
  return {
    source: str(value.source),
    book: str(value.book),
    description: str(value.description),
    display: str(value.display),
    short_display: str(value.short_display),
    passage,
  };
}

/**
 * Coerce an orthocal.info day payload into the shape the UI relies on.
 * Returns null when the core date fields are missing (not a day at all), so an API
 * change or a corrupt cache entry degrades to "no data" instead of crashing a render.
 */
export function normalizeOrthocalDay(value: unknown): OrthocalDay | null {
  if (!isObject(value)) return null;
  const { year, month, day } = value;
  if (typeof year !== 'number' || typeof month !== 'number' || typeof day !== 'number') return null;

  const stories = Array.isArray(value.stories)
    ? value.stories
        .filter(isObject)
        .map((s) => ({ title: str(s.title), story: str(s.story) }))
    : undefined;

  return {
    pascha_distance: num(value.pascha_distance),
    julian_day_number: num(value.julian_day_number),
    year,
    month,
    day,
    weekday: num(value.weekday),
    tone: num(value.tone),
    titles: strList(value.titles),
    summary_title: str(value.summary_title),
    feast_level: num(value.feast_level),
    feast_level_description: str(value.feast_level_description),
    feasts: Array.isArray(value.feasts) ? strList(value.feasts) : null,
    fast_level: num(value.fast_level),
    fast_level_desc: str(value.fast_level_desc),
    fast_exception: num(value.fast_exception),
    fast_exception_desc: str(value.fast_exception_desc),
    ...(Array.isArray(value.fast_abstentions)
      ? { fast_abstentions: strList(value.fast_abstentions) }
      : null),
    saints: strList(value.saints),
    service_notes: strList(value.service_notes),
    abbreviated_reading_indices: Array.isArray(value.abbreviated_reading_indices)
      ? value.abbreviated_reading_indices.filter((n): n is number => typeof n === 'number')
      : [],
    readings: Array.isArray(value.readings)
      ? value.readings.map(normalizeReading).filter((r): r is OrthocalReading => r !== null)
      : [],
    ...(stories ? { stories } : null),
  };
}
