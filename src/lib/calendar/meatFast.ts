import { isOrthocalMeatFastDay } from '../api/orthocal';

/** Cheesefare week (Mon–Sun before Clean Monday): no meat; dairy, eggs, fish, wine, oil allowed. */
export function isCheesefareWeekPaschaDistance(paschaDistance: number): boolean {
  return paschaDistance >= -55 && paschaDistance <= -49;
}

/** True during Cheesefare week meat fast (orthocal `fast_abstentions: ["meat"]`). */
export function isMeatFastRule(
  day: Parameters<typeof isOrthocalMeatFastDay>[0],
): boolean {
  return isOrthocalMeatFastDay(day);
}
