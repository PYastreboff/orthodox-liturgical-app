import type { OrthocalDay } from '../api/orthocal';
import { dayTitleStrings } from './lectionaryDay';

/** Remainder 0 → Tone 8; otherwise tone equals remainder (1–7). */
export function toneFromSundayAfterPaschaIndex(sundayIndex: number): number | null {
  if (!Number.isFinite(sundayIndex) || sundayIndex < 1) return null;
  const remainder = sundayIndex % 8;
  return remainder === 0 ? 8 : remainder;
}

const WEEKDAY_OF_NTH_SUNDAY_AFTER_PASCHA =
  /\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+of\s+the\s+(\d+)(?:st|nd|rd|th)?\s+sunday\s+(?:of\s+(?:pascha\b|)|after\s+pascha\b)/i;

const NTH_SUNDAY_AFTER_PASCHA =
  /\b(\d+)(?:st|nd|rd|th)?\s+sunday\s+(?:of\s+pascha\b|after\s+pascha\b)/i;

export function parseSundayAfterPaschaIndex(titles: string[]): number | null {
  for (const title of titles) {
    const weekdayMatch = title.match(WEEKDAY_OF_NTH_SUNDAY_AFTER_PASCHA);
    if (weekdayMatch) return Number(weekdayMatch[1]);

    const sundayMatch = title.match(NTH_SUNDAY_AFTER_PASCHA);
    if (sundayMatch) return Number(sundayMatch[1]);
  }
  return null;
}

/** Pascha = 0; 1st Sunday after Pascha is pascha_distance 7. */
export function sundayAfterPaschaIndexFromPaschaDistance(day: OrthocalDay): number | null {
  if (day.pascha_distance <= 0 || day.weekday !== 0) return null;
  if (day.pascha_distance % 7 !== 0) return null;
  return day.pascha_distance / 7;
}

/**
 * Orthocal sends tone 0 for pentecostarion Sundays; derive tone from
 * “Nth Sunday after Pascha” via index mod 8 (remainder 0 = Tone 8).
 */
export function resolveOrthocalTone(day: OrthocalDay | null | undefined): number | null {
  if (!day) return null;
  if (day.tone >= 1 && day.tone <= 8) return day.tone;

  const sundayIndex =
    parseSundayAfterPaschaIndex(dayTitleStrings(day)) ??
    sundayAfterPaschaIndexFromPaschaDistance(day);
  if (sundayIndex === null) return null;

  return toneFromSundayAfterPaschaIndex(sundayIndex);
}
