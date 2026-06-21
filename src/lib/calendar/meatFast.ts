import type { OrthocalDay } from '../api/orthocal';

function normalizeFastText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Cheesefare week (Mon–Sun before Clean Monday): no meat; dairy, eggs, fish, wine, oil allowed. */
export function isCheesefareWeekPaschaDistance(paschaDistance: number): boolean {
  return paschaDistance >= -55 && paschaDistance <= -49;
}

function isMeatFastText(raw: string | undefined | null): boolean {
  if (!raw?.trim()) return false;
  const normalized = normalizeFastText(raw);
  return normalized === 'meat fast' || normalized.endsWith(' meat fast');
}

/** True during Cheesefare week meat fast (orthocal “Meat Fast” or pascha_distance −55…−49). */
export function isMeatFastRule(day: Pick<OrthocalDay, 'pascha_distance' | 'fast_exception_desc' | 'fast_level_desc'>): boolean {
  if (isMeatFastText(day.fast_exception_desc)) return true;
  if (isMeatFastText(day.fast_level_desc)) return true;
  return isCheesefareWeekPaschaDistance(day.pascha_distance);
}
