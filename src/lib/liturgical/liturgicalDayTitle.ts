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
  isOrdinarySeasonLectionaryTitle,
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
  palm_sunday: /\bpalm sunday\b/i,
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

/** Pascha + 39/40 — feast of the Ascension of the Lord. */
function isAscensionGreatFeastDay(day: OrthocalDay): boolean {
  if (keepHolyWeekHeadlineOverAscension(day)) return false;
  if (day.pascha_distance === 39 || day.pascha_distance === 40) return true;
  if (!isOrthocalGreatFeastLevel(day)) return false;
  if (ASCENSION_FEAST.test(day.feast_level_description ?? '')) return true;
  return dayTitleStrings(day).some((t) => ASCENSION_FEAST.test(t));
}

function ascensionFeastName(day: OrthocalDay): string | null {
  const fromFeasts = allFeastsFromOrthocalDay(day).find((f) => ASCENSION_FEAST.test(f));
  if (fromFeasts) return fromFeasts;
  return titleMatchingPattern(day, ASCENSION_FEAST);
}

function isLectionaryLikeFeastName(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed) return true;
  if (feastMatchesHolyWeekDayLabel(trimmed)) return true;
  return isOrdinarySeasonLectionaryTitle(trimmed);
}

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
  if (appearanceKey === 'palm_sunday') return false;
  if (appearanceKey === 'holy_week') return true;
  if (appearanceKey === 'great_friday' || appearanceKey === 'holy_saturday') return true;
  const d = day.pascha_distance;
  return d >= -6 && d <= -1;
}

function primaryFeastTitle(day: OrthocalDay, appearanceKey: string): string | null {
  const feasts = allFeastsFromOrthocalDay(day);
  if (!feasts.length) return null;

  if (isAscensionGreatFeastDay(day)) {
    const ascension = ascensionFeastName(day);
    if (ascension) return ascension;
  }

  const appearancePattern = APPEARANCE_FEAST_PATTERN[appearanceKey];
  if (appearancePattern) {
    const match = feasts.find((f) => appearancePattern.test(f));
    if (match) return match;
  }

  const levelDesc = day.feast_level_description?.trim();
  if (levelDesc && isOrthocalGreatFeastLevel(day)) {
    const cleanDesc = sanitizeTypikonProse(levelDesc);
    const byDesc = feasts.find((f) => feastMatchesLevelDescription(f, cleanDesc));
    if (byDesc) return byDesc;
  }

  if (isOrthocalGreatFeastLevel(day)) {
    const named = feasts.find((f) => !isLectionaryLikeFeastName(f));
    if (named) return named;
  }

  const holyWeek = isHolyWeekContext(day, appearanceKey);
  const filtered = feasts.filter((f) => {
    if (appearanceKey !== 'annunciation' && ANNUNCIATION_FEAST.test(f)) return false;
    if (holyWeek && ASCENSION_FEAST.test(f)) return false;
    return true;
  });

  return filtered[0] ?? null;
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

  if (isAscensionGreatFeastDay(day)) {
    const ascension = ascensionFeastName(day);
    if (ascension) return ascension;
  }

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

  if (isOrthocalGreatFeastLevel(day)) {
    const named = feasts.find((f) => !isLectionaryLikeFeastName(f));
    if (named) return named;
  }

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

/** Hero / calendar title is a Holy Week weekday (e.g. Great and Holy Tuesday), not a transferred feast. */
export function isHolyWeekWeekdayHeadline(
  day: OrthocalDay | null | undefined,
  appearanceKey: string,
  title: string,
): boolean {
  if (!day) return false;
  const headline = holyWeekHeadline(day, appearanceKey);
  if (!headline || headline.trim() !== title.trim()) return false;
  return feastMatchesHolyWeekDayLabel(headline);
}

/**
 * Today → Date “Major Feast” block and feast-rank styling.
 * Holy Week weekdays stay ordinary even when orthocal ranks a transferred feast (e.g. Annunciation).
 */
export function isMajorFeastDayForDateBlock(
  day: OrthocalDay | null | undefined,
  appearanceKey: string,
  feastRank: FeastRankDisplay | null | undefined,
  dayTitle: string,
): boolean {
  if (!shouldUseMajorFeastDayTitle(day, appearanceKey, feastRank)) return false;
  if (isHolyWeekWeekdayHeadline(day, appearanceKey, dayTitle)) return false;
  return true;
}

/** Calendar pink cell — not when orthocal level 6+ is only for a feast on a Holy Week weekday. */
export function isOrthocalGreatFeastForCalendar(
  day: OrthocalDay | null | undefined,
  appearanceKey: string,
  dayTitle: string,
): boolean {
  if (!isOrthocalGreatFeastLevel(day)) return false;
  if (isHolyWeekWeekdayHeadline(day, appearanceKey, dayTitle)) return false;
  return true;
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
  if (!day) return calendarTitle;

  if (isHolyWeekWeekdayHeadline(day, appearanceKey, calendarTitle)) {
    const transferred = greatFeastNameFromOrthocal(day, appearanceKey, calendarTitle);
    if (transferred && transferred.trim() !== calendarTitle.trim()) return transferred;
    return calendarTitle;
  }

  if (!shouldUseMajorFeastDayTitle(day, appearanceKey, feastRank)) {
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
