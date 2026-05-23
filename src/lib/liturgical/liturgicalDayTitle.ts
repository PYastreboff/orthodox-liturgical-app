import type { OrthocalDay } from '../api/orthocal';
import { isFeastCellAppearance } from '../calendar/calendarCellStyle';
import {
  dayTitleStrings,
  GREAT_FRIDAY_TITLE,
  HOLY_SATURDAY_TITLE,
  HOLY_THURSDAY_TITLE,
  HOLY_TUESDAY_TITLE,
  HOLY_WEDNESDAY_TITLE,
  isGreatFridayDay,
  isHolyThursdayDay,
  isHolyTuesdayDay,
  isHolyWednesdayDay,
  isHolySaturdayDay,
} from './lectionaryDay';
import type { FeastRankDisplay } from './typikonSymbols';
import { sanitizeTypikonProse } from './typikonSymbols';

/** Great feast circle and above (orthocal FeastLevels ≥ 6). */
export const ORTHOCAL_GREAT_FEAST_LEVEL_MIN = 6;

/** orthocal feast_level — authoritative for great-feast calendar styling. */
export function isOrthocalGreatFeastLevel(day: OrthocalDay | null | undefined): boolean {
  return (day?.feast_level ?? 0) >= ORTHOCAL_GREAT_FEAST_LEVEL_MIN;
}

/** orthocal `pascha_distance` for Holy Week (Pascha = 0). */
const PASCHA_DISTANCE_HOLY_HEADLINE: Record<number, { pattern: RegExp; fallback: string }> = {
  [-5]: { pattern: HOLY_TUESDAY_TITLE, fallback: 'Great and Holy Tuesday' },
  [-4]: { pattern: HOLY_WEDNESDAY_TITLE, fallback: 'Great and Holy Wednesday' },
  [-3]: { pattern: HOLY_THURSDAY_TITLE, fallback: 'Great and Holy Thursday' },
  [-2]: { pattern: GREAT_FRIDAY_TITLE, fallback: 'Great and Holy Friday' },
  [-1]: { pattern: HOLY_SATURDAY_TITLE, fallback: 'Great and Holy Saturday' },
};

const HOLY_WEEK_TITLE_RULES: {
  pattern: RegExp;
  fallback: string;
  isDay: (day: OrthocalDay | null | undefined) => boolean;
}[] = [
  { pattern: GREAT_FRIDAY_TITLE, fallback: 'Great and Holy Friday', isDay: isGreatFridayDay },
  { pattern: HOLY_THURSDAY_TITLE, fallback: 'Great and Holy Thursday', isDay: isHolyThursdayDay },
  { pattern: HOLY_TUESDAY_TITLE, fallback: 'Great and Holy Tuesday', isDay: isHolyTuesdayDay },
  {
    pattern: HOLY_WEDNESDAY_TITLE,
    fallback: 'Great and Holy Wednesday',
    isDay: isHolyWednesdayDay,
  },
  { pattern: HOLY_SATURDAY_TITLE, fallback: 'Great and Holy Saturday', isDay: isHolySaturdayDay },
];

/** Fixed-calendar appearance → feast name in orthocal `feasts`. */
const APPEARANCE_FEAST_PATTERN: Partial<Record<string, RegExp>> = {
  annunciation: /\bannunciation\b/i,
  transfiguration: /\btransfiguration\b/i,
  nativity: /\bnativity\b|\bnativity of christ\b/i,
  theophany: /\btheophany\b|\bepiphany\b/i,
  dormition: /\bdormition\b/i,
  elevation_cross: /\belevation of (?:the )?cross\b/i,
  pascha: /\bpascha\b/i,
  pentecost: /\bpentecost\b/i,
};

const ANNUNCIATION_FEAST = /\bannunciation\b/i;
const ASCENSION_FEAST = /\bascension\b/i;

export function allFeastsFromOrthocalDay(day: OrthocalDay | null | undefined): string[] {
  if (!day?.feasts?.length) return [];
  return day.feasts.map((f) => sanitizeTypikonProse(f)).filter(Boolean);
}

function titleMatchingPattern(day: OrthocalDay, pattern: RegExp): string | null {
  for (const raw of dayTitleStrings(day)) {
    if (pattern.test(raw)) return sanitizeTypikonProse(raw);
  }
  for (const feast of allFeastsFromOrthocalDay(day)) {
    if (pattern.test(feast)) return feast;
  }
  return null;
}

function headlineForPaschaDistance(day: OrthocalDay): string | null {
  const rule = PASCHA_DISTANCE_HOLY_HEADLINE[day.pascha_distance];
  if (!rule) return null;
  return titleMatchingPattern(day, rule.pattern) ?? rule.fallback;
}

function headlineFromHolyWeekTitles(day: OrthocalDay): string | null {
  for (const rule of HOLY_WEEK_TITLE_RULES) {
    if (!rule.isDay(day)) continue;
    return titleMatchingPattern(day, rule.pattern) ?? rule.fallback;
  }
  return null;
}

function isHolyWeekContext(day: OrthocalDay, appearanceKey: string): boolean {
  if (appearanceKey === 'holy_week') return true;
  const d = day.pascha_distance;
  return d >= -7 && d <= -1;
}

function primaryFeastTitle(day: OrthocalDay, appearanceKey: string): string | null {
  const feasts = allFeastsFromOrthocalDay(day);
  if (!feasts.length) return null;

  const appearancePattern = APPEARANCE_FEAST_PATTERN[appearanceKey];
  if (appearancePattern) {
    const match = feasts.find((f) => appearancePattern.test(f));
    if (match) return match;
  }

  const holyWeek = isHolyWeekContext(day, appearanceKey);
  const filtered = feasts.filter((f) => {
    if (appearanceKey !== 'annunciation' && ANNUNCIATION_FEAST.test(f)) return false;
    if (holyWeek && ASCENSION_FEAST.test(f)) return false;
    return true;
  });

  return filtered[0] ?? null;
}

const HOLY_WEEK_HEADLINE_PATTERNS = [
  HOLY_TUESDAY_TITLE,
  HOLY_WEDNESDAY_TITLE,
  HOLY_THURSDAY_TITLE,
  GREAT_FRIDAY_TITLE,
  HOLY_SATURDAY_TITLE,
] as const;

function feastMatchesHolyWeekDayLabel(feast: string): boolean {
  return HOLY_WEEK_HEADLINE_PATTERNS.some((pattern) => pattern.test(feast));
}

/** Ascension stays a subordinate commemoration on Holy Thursday / Great Friday. */
function keepHolyWeekHeadlineOverAscension(day: OrthocalDay): boolean {
  return (
    isHolyThursdayDay(day) ||
    isGreatFridayDay(day) ||
    day.pascha_distance === -3 ||
    day.pascha_distance === -2
  );
}

function feastMatchesLevelDescription(feast: string, levelDesc: string): boolean {
  const a = feast.trim().toLowerCase();
  const b = levelDesc.trim().toLowerCase();
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
}

/**
 * orthocal `feasts` entry for the day's great / major feast (level 6+ or feast cell).
 * Does not apply Holy Week headline filtering used for calendar titles.
 */
function greatFeastNameFromOrthocal(
  day: OrthocalDay,
  appearanceKey: string,
  calendarTitle: string,
): string | null {
  const feasts = allFeastsFromOrthocalDay(day);
  if (!feasts.length) return null;

  const appearancePattern = APPEARANCE_FEAST_PATTERN[appearanceKey];
  if (appearancePattern) {
    const match = feasts.find((f) => appearancePattern.test(f));
    if (match) return match;
  }

  const holyHeadline = holyWeekHeadline(day, appearanceKey);
  if (holyHeadline && holyHeadline === calendarTitle) {
    const annunciation = feasts.find((f) => ANNUNCIATION_FEAST.test(f));
    if (annunciation) return annunciation;

    if (!keepHolyWeekHeadlineOverAscension(day)) {
      const transferred = feasts.find(
        (f) =>
          !feastMatchesHolyWeekDayLabel(f) &&
          !ASCENSION_FEAST.test(f) &&
          f.trim() !== calendarTitle.trim(),
      );
      if (transferred) return transferred;
    }
    return null;
  }

  const levelDesc = day.feast_level_description?.trim();
  if (levelDesc) {
    const cleanDesc = sanitizeTypikonProse(levelDesc);
    const byDesc = feasts.find((f) => feastMatchesLevelDescription(f, cleanDesc));
    if (byDesc) return byDesc;
  }

  const holyWeek = isHolyWeekContext(day, appearanceKey);
  for (const feast of feasts) {
    if (holyWeek && keepHolyWeekHeadlineOverAscension(day) && ASCENSION_FEAST.test(feast)) {
      continue;
    }
    if (feastMatchesHolyWeekDayLabel(feast)) continue;
    if (feast.trim() === calendarTitle.trim()) continue;
    return feast;
  }

  const annunciation = feasts.find((f) => ANNUNCIATION_FEAST.test(f));
  if (annunciation && annunciation.trim() !== calendarTitle.trim()) return annunciation;

  return feasts[0] ?? null;
}

function holyWeekHeadline(day: OrthocalDay, appearanceKey: string): string | null {
  const byDistance = headlineForPaschaDistance(day);
  if (byDistance) return byDistance;

  const byTitle = headlineFromHolyWeekTitles(day);
  if (byTitle) return byTitle;

  if (appearanceKey === 'holy_week') {
    const primaryTitle = dayTitleStrings(day)[0];
    if (primaryTitle) return sanitizeTypikonProse(primaryTitle);
  }

  return null;
}

/** Use orthocal feast name(s) as the displayed day title (home + calendar). */
export function shouldUseMajorFeastDayTitle(
  day: OrthocalDay | null | undefined,
  appearanceKey: string,
  feastRank: FeastRankDisplay | null | undefined,
): boolean {
  if (isFeastCellAppearance(appearanceKey)) return true;
  if (isOrthocalGreatFeastLevel(day)) return true;
  if (feastRank?.glyph === 'great_feast') return true;
  return false;
}

function defaultTitleFromOrthocal(day: OrthocalDay | null | undefined, fallback: string): string {
  if (day?.titles?.[0]?.trim()) {
    return sanitizeTypikonProse(day.titles[0]);
  }
  if (day?.summary_title?.trim()) {
    return sanitizeTypikonProse(day.summary_title);
  }
  return sanitizeTypikonProse(fallback);
}

/**
 * Home hero and calendar heading: Holy Week days and fixed feasts beat secondary
 * commemorations (e.g. Ascension, Annunciation) in orthocal `feasts`.
 */
export function liturgicalDayTitle(
  day: OrthocalDay | null | undefined,
  appearanceKey: string,
  appearanceLabel: string,
  feastRank: FeastRankDisplay | null | undefined,
): string {
  if (day) {
    const holyHeadline = holyWeekHeadline(day, appearanceKey);
    if (holyHeadline) return holyHeadline;
  }

  if (shouldUseMajorFeastDayTitle(day, appearanceKey, feastRank)) {
    const feast = day ? primaryFeastTitle(day, appearanceKey) : null;
    if (feast) return feast;
    if (isFeastCellAppearance(appearanceKey)) {
      return sanitizeTypikonProse(appearanceLabel);
    }
  }

  return defaultTitleFromOrthocal(day, appearanceLabel);
}

/** Calendar cell feast bullets — orthocal feasts except the headline title. */
export function calendarFeastsForDay(
  day: OrthocalDay | null | undefined,
  dayTitle: string,
): string[] {
  const all = allFeastsFromOrthocalDay(day);
  if (!all.length) return [];
  return all.filter((f) => f !== dayTitle);
}

/**
 * Great feast name for Today → Date (major feast block) and Feasts section highlighting.
 * `calendarTitle` stays on the calendar grid / hero when it differs (e.g. Holy Week weekdays).
 */
export function greatFeastDisplayTitle(
  day: OrthocalDay | null | undefined,
  appearanceKey: string,
  appearanceLabel: string,
  feastRank: FeastRankDisplay | null | undefined,
  calendarTitle: string,
): string {
  if (!day || !shouldUseMajorFeastDayTitle(day, appearanceKey, feastRank)) {
    return calendarTitle;
  }

  const feast = greatFeastNameFromOrthocal(day, appearanceKey, calendarTitle);
  if (feast) return feast;

  if (isFeastCellAppearance(appearanceKey)) {
    return sanitizeTypikonProse(appearanceLabel);
  }

  const fallback = primaryFeastTitle(day, appearanceKey);
  if (fallback) return fallback;

  return calendarTitle;
}
