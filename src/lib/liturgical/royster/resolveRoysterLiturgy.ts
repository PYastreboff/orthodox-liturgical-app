import type { OrthocalDay } from '../../api/orthocal';
import { SUNDAY_LITURGY_BY_TONE } from './sundayLiturgy';
import type { RoysterLiturgySequence, ToneNumber, WeekdayIndex } from './types';
import { WEEKDAY_LITURGY } from './weekdayLiturgy';

function clampTone(tone: number): ToneNumber {
  const t = Math.max(1, Math.min(8, tone || 1));
  return t as ToneNumber;
}

function clampWeekday(weekday: number): WeekdayIndex {
  const w = Math.max(0, Math.min(6, weekday || 0));
  return w as WeekdayIndex;
}

/** Liturgy prokeimenon / alleluia / communion from Royster tables when orthocal omits them. */
export function resolveRoysterLiturgySequence(day: OrthocalDay | null): RoysterLiturgySequence | null {
  if (!day) return null;

  const weekday = clampWeekday(day.weekday);

  if (weekday === 0) {
    return SUNDAY_LITURGY_BY_TONE[clampTone(day.tone)];
  }

  return WEEKDAY_LITURGY[weekday];
}
