import typikonData from './data/typikonByJulianDate.json';
import type { TypikonFeastEntry, TypikonHymn, TypikonIndex } from './typikonTypes';

const index = typikonData as TypikonIndex;

function hymnScore(feast: TypikonFeastEntry): number {
  const rank = feast.rank ?? '';
  const rankScore =
    rank === 'great' ? 4 : rank === 'great_doxology' ? 3 : rank === 'middle' ? 2 : 1;
  return rankScore * 10 + feast.hymns.length;
}

function pickPrimaryFeast(feasts: TypikonFeastEntry[]): TypikonFeastEntry | null {
  const withHymns = feasts.filter((f) => f.hymns.length > 0);
  if (!withHymns.length) return null;
  return withHymns.sort((a, b) => hymnScore(b) - hymnScore(a))[0] ?? null;
}

export function typikonFeastForJulianMonthDay(monthDay: string): TypikonFeastEntry | null {
  const feasts = index.byJulian[monthDay];
  if (!feasts?.length) return null;
  return pickPrimaryFeast(feasts);
}

export function typikonFeastForPaschaDistance(paschaDistance: number): TypikonFeastEntry | null {
  const match = index.movable.find((f) => f.easterDays === paschaDistance);
  return match?.hymns.length ? match : null;
}

export function typikonHymn(
  feast: TypikonFeastEntry,
  type: 'troparion' | 'kontakion',
): TypikonHymn | null {
  return feast.hymns.find((h) => h.type === type) ?? null;
}
