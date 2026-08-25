import type { OrthocalDay } from '../lib/api/orthocal';
import type { PlainDate } from '../lib/calendar/julianGregorian';
import { gregorianPlainToJulianPlain, julianCalendarToJulianDayNumber } from '../lib/calendar/julianGregorian';
import { isCheesefareWeekPaschaDistance, isMeatFastRule } from '../lib/calendar/meatFast';
import { isInCheesefareWeek, localizedWeeklyFastDayLabel } from '../lib/calendar/weeklyFast';
import { localizeOrthocalText } from './orthocalContent';
import { translate } from './translate';
import type { UiLanguage } from './types';

const FOOD_KEYS = {
  all: 'fasting.foodAll',
  plant: 'fasting.foodPlant',
  wine: 'fasting.foodWine',
  oil: 'fasting.foodOil',
  fish: 'fasting.foodFish',
  dairy: 'fasting.foodDairy',
  eggs: 'fasting.foodEggs',
  meat: 'fasting.foodMeat',
} as const;

export type FastingFoodKind = keyof typeof FOOD_KEYS;

export type FastingFoodItem = {
  kind: FastingFoodKind;
  label: string;
};

export type FastingFoodsDetail = {
  /** Orthocal season / day kind (fast_level), e.g. "Dormition Fast". */
  ruleLabel: string;
  allowed: FastingFoodItem[];
  notAllowed: FastingFoodItem[];
  exceptionNote?: string;
  /** Total fast — show a single no-eating message instead of food lists. */
  totalAbstinence?: boolean;
  /** Cheesefare week / orthocal meat fast — fast only from meat. */
  meatFast?: boolean;
};

/** Drives pill colour for Fast / No fast chips. */
export type FastSummaryKind =
  | 'no_fast'
  | 'strict'
  | 'wine_oil'
  | 'fish'
  | 'dairy'
  | 'total_abstinence';

/**
 * Orthocal `FastLevels` (calendarium/datetools.py) — season / kind of day,
 * not the food list. Foods come from `fast_exception` / `fast_abstentions`.
 *
 * 0 NoFast · 1 Fast · 2 LentenFast · 3 ApostlesFast · 4 DormitionFast · 5 NativityFast
 */
const ORTHOCAL_FAST_LEVEL_KEYS: Record<number, string> = {
  0: 'fasting.noFast',
  1: 'fasting.levelFast',
  2: 'appearance.great_lent',
  3: 'appearance.apostles_fast',
  4: 'appearance.dormition_fast',
  5: 'appearance.nativity_fast',
};

const FAST_DESC_KEYS: Record<string, string> = {
  'no fast': 'fasting.noFast',
  'fast free': 'fasting.noFast',
  'fast free day': 'fasting.noFast',
  fast: 'fasting.levelFast',
  'lenten fast': 'appearance.great_lent',
  'great lent': 'appearance.great_lent',
  'apostles fast': 'appearance.apostles_fast',
  'dormition fast': 'appearance.dormition_fast',
  'nativity fast': 'appearance.nativity_fast',
  'wine and oil': 'fasting.levelWineOil',
  'wine oil': 'fasting.levelWineOil',
  'fish allowed': 'fasting.levelFish',
  'fish wine and oil': 'fasting.levelFish',
  'dairy allowed': 'fasting.levelDairy',
  'dairy eggs fish wine and oil': 'fasting.levelDairy',
  'meat fast': 'fasting.levelMeatFast',
  'strict fast': 'fasting.levelStrict',
};

const FAST_EXCEPTION_KEYS: Record<string, string> = {
  'wine and oil allowed': 'fasting.exceptionWineOil',
  'wine and oil are allowed': 'fasting.exceptionWineOil',
  'wine oil allowed': 'fasting.exceptionWineOil',
  'fish wine and oil allowed': 'fasting.exceptionFishWineOil',
  'fish wine and oil are allowed': 'fasting.exceptionFishWineOil',
  'fish allowed': 'fasting.exceptionFish',
  'oil allowed': 'fasting.exceptionOil',
  'wine is allowed': 'fasting.exceptionWine',
  'wine allowed': 'fasting.exceptionWine',
  'wine oil and caviar are allowed': 'fasting.exceptionWineOilCaviar',
  'wine oil and caviar allowed': 'fasting.exceptionWineOilCaviar',
  'dairy allowed': 'fasting.exceptionDairy',
  'meat allowed': 'fasting.exceptionMeat',
  'meat permitted': 'fasting.exceptionMeat',
  'meat fast': 'fasting.levelMeatFast',
  'strict fast wine and oil': 'fasting.exceptionStrictWineOil',
  'strict fast': 'fasting.levelStrict',
  'no fast': 'fasting.noFast',
  'fast free': 'fasting.noFast',
};

const REDUNDANT_FAST_EXCEPTIONS = new Set([
  'fast free',
  'fast free day',
  'no fast',
  'no overrides',
  'no override',
]);

type AllowableFood = Exclude<FastingFoodKind, 'all' | 'plant'>;

type FastExceptionParse =
  | { kind: 'none' }
  | { kind: 'meat_fast' }
  | { kind: 'fast_free' }
  | { kind: 'allow'; foods: AllowableFood[] };

/** Text before "allowed" / "permitted" lists which foods orthocal permits that day. */
function allowancePrefixFromException(normalized: string): string {
  const match = normalized.match(/^(.+?)\s+(?:are\s+)?(?:allowed|permitted)\b/);
  if (match) return match[1];
  return normalized.replace(/\s+(?:are\s+)?(?:allowed|permitted)$/, '').trim();
}

function allowedFoodsInPrefix(prefix: string): AllowableFood[] {
  const foods: AllowableFood[] = [];
  if (/\bmeat\b/.test(prefix)) foods.push('meat');
  if (/\bdairy\b/.test(prefix)) foods.push('dairy');
  if (/\bfish\b/.test(prefix)) foods.push('fish');
  if (/\bwine\b/.test(prefix)) foods.push('wine');
  if (/\boil\b/.test(prefix)) foods.push('oil');
  if (/\begg/.test(prefix)) foods.push('eggs');
  return foods;
}

function parseFastExceptionDesc(raw: string | undefined | null): FastExceptionParse {
  const exception = raw?.trim();
  if (!exception) return { kind: 'none' };

  const normalized = normalizeFastText(exception);

  if (normalized === 'meat fast' || normalized.endsWith(' meat fast')) {
    return { kind: 'meat_fast' };
  }

  if (
    normalized === 'fast free' ||
    normalized === 'fast free day' ||
    normalized === 'no fast'
  ) {
    return { kind: 'fast_free' };
  }

  if (normalized === 'no overrides' || normalized === 'no override') {
    return { kind: 'none' };
  }

  if (normalized.includes('strict fast')) {
    const paren = normalized.match(/\(([^)]+)\)/);
    if (paren) {
      const foods = allowedFoodsInPrefix(paren[1]);
      if (foods.length > 0) return { kind: 'allow', foods };
    }
    // "Strict Fast (Wine and Oil)" after normalize → "strict fast wine and oil"
    if (normalized.includes('wine') || normalized.includes('oil')) {
      const foods = allowedFoodsInPrefix(normalized.replace(/^strict fast\s*/, ''));
      if (foods.length > 0) return { kind: 'allow', foods };
    }
    return { kind: 'none' };
  }

  if (!normalized.includes('allowed') && !normalized.includes('permitted')) {
    return { kind: 'none' };
  }

  const prefix = allowancePrefixFromException(normalized);
  const foods = allowedFoodsInPrefix(prefix);
  if (foods.length === 0) return { kind: 'none' };
  return { kind: 'allow', foods };
}

/** Cheesefare week (Mon–Sun before Clean Monday): no meat; dairy, eggs, fish, wine, oil allowed. */
function resolveFastException(day: OrthocalDay): FastExceptionParse {
  const fromException = parseFastExceptionDesc(day.fast_exception_desc);
  if (fromException.kind !== 'none') return fromException;
  if (isCheesefareWeekPaschaDistance(day.pascha_distance)) {
    return { kind: 'meat_fast' };
  }
  return { kind: 'none' };
}

export { isMeatFastRule } from '../lib/calendar/meatFast';

/** Meat fast from orthocal and/or local Cheesefare week appearance (incl. before API loads). */
function isMeatFastAppearance(
  day: OrthocalDay | null,
  appearanceKey: string,
  civil: PlainDate,
): boolean {
  if (day && isMeatFastRule(day)) return true;
  if (appearanceKey.startsWith('cheesefare_fast')) return true;
  const julian = gregorianPlainToJulianPlain(civil);
  const jdn = julianCalendarToJulianDayNumber(julian.year, julian.month, julian.day);
  return isInCheesefareWeek(jdn, julian.year);
}

function isStrictFastAppearanceFallback(appearanceKey: string): boolean {
  if (appearanceKey.startsWith('cheesefare_fast')) return false;
  return (
    appearanceKey === 'great_lent' ||
    appearanceKey.startsWith('lent_') ||
    appearanceKey === 'holy_week' ||
    appearanceKey.endsWith('_fast')
  );
}

function detailForMeatFast(lang: UiLanguage): FastingFoodsDetail {
  return {
    ruleLabel: translate(lang, 'fasting.levelMeatFast'),
    allowed: foodItems(lang, ['plant', 'dairy', 'eggs', 'fish', 'wine', 'oil']),
    notAllowed: foodItems(lang, ['meat']),
    meatFast: true,
  };
}

function normalizeFastText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tFood(lang: UiLanguage, key: FastingFoodKind): string {
  return translate(lang, FOOD_KEYS[key]);
}

function foodItem(lang: UiLanguage, kind: FastingFoodKind): FastingFoodItem {
  return { kind, label: tFood(lang, kind) };
}

function foodItems(lang: UiLanguage, kinds: FastingFoodKind[]): FastingFoodItem[] {
  return kinds.map((kind) => foodItem(lang, kind));
}

function isNoFastLevel(day: OrthocalDay): boolean {
  return day.fast_level <= 0;
}

export function isGreatAndHolyFriday(appearanceKey: string): boolean {
  return appearanceKey === 'great_friday';
}

function detailForGoodFriday(lang: UiLanguage): FastingFoodsDetail {
  return {
    ruleLabel: translate(lang, 'fasting.levelNoEating'),
    allowed: [],
    notAllowed: [],
    totalAbstinence: true,
  };
}

export function isOrthocalFastDay(
  day: OrthocalDay | null,
  appearanceKey: string,
  weeklyFast: boolean,
): boolean {
  if (isGreatAndHolyFriday(appearanceKey)) return true;
  if (weeklyFast) return true;
  if (day) return day.fast_level >= 1;
  return (
    appearanceKey.includes('lent') ||
    appearanceKey.startsWith('cheesefare_fast') ||
    appearanceKey === 'wednesday_fast' ||
    appearanceKey === 'friday_fast'
  );
}

/**
 * Orthocal season label from `fast_level` / `fast_level_desc`
 * (e.g. Dormition Fast). Not derived from allowed foods.
 */
function orthocalSeasonRuleLabel(
  day: OrthocalDay,
  civil: PlainDate,
  lang: UiLanguage,
): string {
  if (day.fast_level <= 0) {
    return translate(lang, 'fasting.noFast');
  }

  // Level 1 "Fast" is the generic Wed/Fri (and similar) marker.
  if (day.fast_level === 1) {
    const weekly = localizedWeeklyFastDayLabel(civil, lang);
    if (weekly) return weekly;
  }

  const desc = day.fast_level_desc?.trim();
  if (desc) {
    const byDesc = FAST_DESC_KEYS[normalizeFastText(desc)];
    if (byDesc) return translate(lang, byDesc);
    return localizeOrthocalText(desc, lang);
  }

  const byLevel = ORTHOCAL_FAST_LEVEL_KEYS[day.fast_level];
  if (byLevel) return translate(lang, byLevel);
  return translate(lang, 'fasting.levelFast');
}

const ABSTENTION_KINDS: Partial<Record<string, FastingFoodKind>> = {
  meat: 'meat',
  dairy: 'dairy',
  eggs: 'eggs',
  fish: 'fish',
  wine: 'wine',
  oil: 'oil',
};

const ALL_FAST_FOODS: FastingFoodKind[] = ['meat', 'dairy', 'eggs', 'fish', 'wine', 'oil'];

function detailFromAbstentions(
  abstentions: readonly string[],
  lang: UiLanguage,
): FastingFoodsDetail {
  const notAllowedKinds = abstentions
    .map((entry) => ABSTENTION_KINDS[entry.toLowerCase()])
    .filter((kind): kind is FastingFoodKind => kind !== undefined);
  const notAllowedSet = new Set(notAllowedKinds);
  const allowedKinds: FastingFoodKind[] = ['plant'];
  for (const kind of ALL_FAST_FOODS) {
    if (!notAllowedSet.has(kind)) allowedKinds.push(kind);
  }
  return {
    ruleLabel: '',
    allowed: foodItems(lang, allowedKinds),
    notAllowed: foodItems(lang, notAllowedKinds),
    meatFast: notAllowedSet.has('meat') && !notAllowedSet.has('dairy') && !notAllowedSet.has('eggs'),
  };
}

function fastExceptionNote(day: OrthocalDay, lang: UiLanguage): string | undefined {
  if (isNoFastLevel(day)) return undefined;
  const exception = day.fast_exception_desc?.trim();
  if (!exception) return undefined;
  const normalized = normalizeFastText(exception);
  if (REDUNDANT_FAST_EXCEPTIONS.has(normalized)) return undefined;
  const key = FAST_EXCEPTION_KEYS[normalized];
  return key ? translate(lang, key) : exception;
}

function detailForStrictFast(lang: UiLanguage): FastingFoodsDetail {
  return {
    ruleLabel: translate(lang, 'fasting.levelStrict'),
    allowed: foodItems(lang, ['plant']),
    notAllowed: foodItems(lang, ['meat', 'dairy', 'eggs', 'fish', 'wine', 'oil']),
  };
}

function detailForFastLevel(level: number, lang: UiLanguage): FastingFoodsDetail {
  if (level >= 1) {
    return {
      ...detailForStrictFast(lang),
      ruleLabel: translate(lang, ORTHOCAL_FAST_LEVEL_KEYS[level] ?? 'fasting.levelFast'),
    };
  }
  return {
    ruleLabel: translate(lang, 'fasting.noFast'),
    allowed: foodItems(lang, ['all']),
    notAllowed: [],
  };
}

function applyException(detail: FastingFoodsDetail, day: OrthocalDay, lang: UiLanguage): void {
  const parsed = resolveFastException(day);
  if (parsed.kind === 'meat_fast') {
    detail.allowed = foodItems(lang, ['plant', 'dairy', 'eggs', 'fish', 'wine', 'oil']);
    detail.notAllowed = foodItems(lang, ['meat']);
    detail.meatFast = true;
    return;
  }
  if (parsed.kind !== 'allow') return;

  const addAllowed = (kind: AllowableFood) => {
    const item = foodItem(lang, kind);
    if (!detail.allowed.some((entry) => entry.kind === kind)) detail.allowed.push(item);
    detail.notAllowed = detail.notAllowed.filter((entry) => entry.kind !== kind);
  };

  for (const kind of parsed.foods) {
    addAllowed(kind);
  }
}

/** Date row, hero chip, and Fasting section brown pill: "Fast" or "No fast" only. */
export function localizedFastSummaryLabel(
  day: OrthocalDay | null,
  appearanceKey: string,
  weeklyFast: boolean,
  lang: UiLanguage,
): string {
  return translate(
    lang,
    isOrthocalFastDay(day, appearanceKey, weeklyFast) ? 'fasting.summaryFast' : 'fasting.summaryNoFast',
  );
}

/** Pill background colour from the resolved fasting rule. */
export function fastSummaryKindFromDetail(
  detail: FastingFoodsDetail,
  isFastDay: boolean,
): FastSummaryKind {
  if (detail.totalAbstinence) return 'total_abstinence';
  if (!isFastDay || detail.allowed.some((item) => item.kind === 'all')) {
    return 'no_fast';
  }

  const allowed = new Set(detail.allowed.map((item) => item.kind));
  if (allowed.has('dairy') || allowed.has('eggs')) return 'dairy';
  if (allowed.has('fish')) return 'fish';
  if (allowed.has('wine') && allowed.has('oil')) return 'wine_oil';
  return 'strict';
}

/** Hero chip: "Fast" (with optional icons) or "No fast". */
export type HeroFastChipDisplay = {
  label: string;
  icons: { fish: boolean; wine: boolean; oil: boolean; noMeat: boolean };
};

export function heroFastChipDisplay(
  detail: FastingFoodsDetail,
  isFastDay: boolean,
  lang: UiLanguage,
): HeroFastChipDisplay {
  const noIcons = { fish: false, wine: false, oil: false, noMeat: false };

  if (!isFastDay || detail.allowed.some((item) => item.kind === 'all')) {
    return {
      label: translate(lang, 'fasting.summaryNoFast'),
      icons: noIcons,
    };
  }

  if (detail.meatFast) {
    return {
      label: translate(lang, 'fasting.summaryFast'),
      icons: { fish: false, wine: false, oil: false, noMeat: true },
    };
  }

  const allowed = new Set(detail.allowed.map((item) => item.kind));
  return {
    label: translate(lang, 'fasting.summaryFast'),
    icons: {
      fish: allowed.has('fish'),
      wine: allowed.has('wine'),
      oil: allowed.has('oil'),
      noMeat: false,
    },
  };
}

export function showHeroFeastRankChip(
  feastRank: { glyph: string },
  isMajorFeastDay: boolean,
): boolean {
  if (isMajorFeastDay) return true;
  return feastRank.glyph !== 'ordinary';
}

/** Allowed / not allowed lists and orthocal season name for the Fasting section body. */
export function localizedFastingFoodsDetail(
  day: OrthocalDay | null,
  appearanceKey: string,
  weeklyFast: boolean,
  lang: UiLanguage,
  civil: PlainDate,
): FastingFoodsDetail {
  if (isGreatAndHolyFriday(appearanceKey)) {
    return detailForGoodFriday(lang);
  }

  if (day) {
    const exception = resolveFastException(day);
    if (exception.kind === 'fast_free') {
      return detailForFastLevel(0, lang);
    }
  }

  if (isMeatFastAppearance(day, appearanceKey, civil)) {
    return detailForMeatFast(lang);
  }

  if (weeklyFast) {
    return {
      ...detailForStrictFast(lang),
      ruleLabel:
        localizedWeeklyFastDayLabel(civil, lang) ?? translate(lang, 'fasting.levelFast'),
    };
  }

  if (!day) {
    if (isStrictFastAppearanceFallback(appearanceKey)) {
      const fallback = detailForStrictFast(lang);
      if (appearanceKey.startsWith('dormition')) {
        fallback.ruleLabel = translate(lang, 'appearance.dormition_fast');
      } else if (appearanceKey.startsWith('nativity_fast')) {
        fallback.ruleLabel = translate(lang, 'appearance.nativity_fast');
      } else if (appearanceKey.startsWith('apostles')) {
        fallback.ruleLabel = translate(lang, 'appearance.apostles_fast');
      } else if (appearanceKey.includes('lent') || appearanceKey === 'holy_week') {
        fallback.ruleLabel = translate(lang, 'appearance.great_lent');
      }
      return fallback;
    }
    return detailForFastLevel(0, lang);
  }

  let detail =
    day.fast_abstentions && day.fast_abstentions.length > 0
      ? detailFromAbstentions(day.fast_abstentions, lang)
      : detailForStrictFast(lang);

  if (!day.fast_abstentions?.length) {
    applyException(detail, day, lang);
  }

  detail.ruleLabel = orthocalSeasonRuleLabel(day, civil, lang);

  const exceptionNote = fastExceptionNote(day, lang);
  if (exceptionNote) detail.exceptionNote = exceptionNote;
  return detail;
}

export type CalendarFastingFoodIcons = {
  fish: boolean;
  wine: boolean;
  oil: boolean;
  /** Meat fast / Cheesefare: no meat, with dairy-eggs-fish-wine-oil permitted. */
  noMeat: boolean;
  /** Black X — total fast (Great and Holy Friday). */
  noEating: boolean;
};

const MEAT_FAST_CALENDAR_ICONS = { fish: false, wine: false, oil: false, noMeat: true } as const;

/** Fish / wine / oil flags from orthocal abstentions or fast_exception_desc. */
function orthocalFastFoodFlags(day: OrthocalDay): {
  fish: boolean;
  wine: boolean;
  oil: boolean;
} {
  if (day.fast_abstentions?.length) {
    const abstained = new Set(day.fast_abstentions.map((entry) => entry.toLowerCase()));
    if (abstained.size === 1 && abstained.has('meat')) {
      return { ...MEAT_FAST_CALENDAR_ICONS };
    }
    return {
      fish: !abstained.has('fish'),
      wine: !abstained.has('wine'),
      oil: !abstained.has('oil'),
    };
  }

  const parsed = resolveFastException(day);
  if (parsed.kind === 'meat_fast') {
    return { ...MEAT_FAST_CALENDAR_ICONS };
  }
  if (parsed.kind === 'allow') {
    const foods = new Set(parsed.foods);
    return {
      fish: foods.has('fish'),
      wine: foods.has('wine'),
      oil: foods.has('oil'),
    };
  }
  return { fish: false, wine: false, oil: false };
}

/** Language-agnostic fish / wine / oil flags for calendar month cells. */
export function calendarFastingFoodIcons(
  day: OrthocalDay | null,
  appearanceKey: string,
  weeklyFast: boolean,
  civil: PlainDate,
): CalendarFastingFoodIcons {
  if (!isOrthocalFastDay(day, appearanceKey, weeklyFast)) {
    return { fish: false, wine: false, oil: false, noMeat: false, noEating: false };
  }
  if (isGreatAndHolyFriday(appearanceKey)) {
    return { fish: false, wine: false, oil: false, noMeat: false, noEating: true };
  }
  if (isMeatFastAppearance(day, appearanceKey, civil)) {
    return { ...MEAT_FAST_CALENDAR_ICONS, noEating: false };
  }
  if (!day || weeklyFast) {
    return { fish: false, wine: false, oil: false, noMeat: false, noEating: false };
  }
  const flags = orthocalFastFoodFlags(day);
  return { ...flags, noMeat: false, noEating: false };
}

export type CalendarFastingIconKind = 'fish' | 'wine' | 'oil' | 'noMeat';

const CALENDAR_FASTING_ICON_LABEL_KEYS: Record<CalendarFastingIconKind, `fasting.${string}`> = {
  fish: 'fasting.exceptionFish',
  wine: 'fasting.exceptionWine',
  oil: 'fasting.exceptionOil',
  noMeat: 'fasting.iconNoMeat',
};

/** Short labels for calendar / hero fasting icons — "Fish allowed", not food-list nouns. */
export function calendarFastingIconLabel(kind: CalendarFastingIconKind, lang: UiLanguage): string {
  return translate(lang, CALENDAR_FASTING_ICON_LABEL_KEYS[kind]);
}
