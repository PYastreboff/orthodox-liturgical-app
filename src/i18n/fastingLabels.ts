import type { OrthocalDay } from '../lib/api/orthocal';
import type { PlainDate } from '../lib/calendar/julianGregorian';
import { localizedWeeklyFastDayLabel } from '../lib/calendar/weeklyFast';
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
  /** orthocal rule name, e.g. "Wine and oil" (not shown on the Fast / No fast pill). */
  ruleLabel: string;
  allowed: FastingFoodItem[];
  notAllowed: FastingFoodItem[];
  exceptionNote?: string;
  /** Total fast — show a single no-eating message instead of food lists. */
  totalAbstinence?: boolean;
};

const FAST_LEVEL_KEYS: Record<number, string> = {
  0: 'fasting.noFast',
  1: 'fasting.levelStrict',
  2: 'fasting.levelWineOil',
  3: 'fasting.levelFish',
  4: 'fasting.levelDairy',
  5: 'fasting.levelStrict',
};

const FAST_DESC_KEYS: Record<string, string> = {
  'no fast': 'fasting.noFast',
  'fast free': 'fasting.noFast',
  'fast free day': 'fasting.noFast',
  'wine and oil': 'fasting.levelWineOil',
  'wine oil': 'fasting.levelWineOil',
  'fish allowed': 'fasting.levelFish',
  'fish wine and oil': 'fasting.levelFish',
  'dairy allowed': 'fasting.levelDairy',
  'dairy eggs fish wine and oil': 'fasting.levelDairy',
  'strict fast': 'fasting.levelStrict',
};

const FAST_EXCEPTION_KEYS: Record<string, string> = {
  'wine and oil allowed': 'fasting.exceptionWineOil',
  'wine oil allowed': 'fasting.exceptionWineOil',
  'fish wine and oil allowed': 'fasting.exceptionFishWineOil',
  'fish allowed': 'fasting.exceptionFish',
  'dairy allowed': 'fasting.exceptionDairy',
  'meat allowed': 'fasting.exceptionMeat',
  'meat permitted': 'fasting.exceptionMeat',
  'no fast': 'fasting.noFast',
};

const REDUNDANT_FAST_EXCEPTIONS = new Set([
  'fast free',
  'fast free day',
  'no fast',
  'no overrides',
  'no override',
  'fish wine and oil are allowed',
  'fish wine and oil allowed',
]);

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
    appearanceKey === 'wednesday_fast' ||
    appearanceKey === 'friday_fast'
  );
}

function fastLevelLabel(day: OrthocalDay, lang: UiLanguage): string {
  const byLevel = FAST_LEVEL_KEYS[day.fast_level];
  if (byLevel) return translate(lang, byLevel);

  const desc = day.fast_level_desc?.trim();
  if (desc) {
    const key = FAST_DESC_KEYS[normalizeFastText(desc)];
    if (key) return translate(lang, key);
  }

  return translate(lang, 'fasting.noFast');
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

function detailForFastLevel(level: number, lang: UiLanguage): FastingFoodsDetail {
  switch (level) {
    case 1:
      return {
        ruleLabel: translate(lang, 'fasting.levelStrict'),
        allowed: foodItems(lang, ['plant']),
        notAllowed: foodItems(lang, ['meat', 'dairy', 'eggs', 'fish', 'wine', 'oil']),
      };
    case 2:
      return {
        ruleLabel: translate(lang, 'fasting.levelWineOil'),
        allowed: foodItems(lang, ['plant', 'wine', 'oil']),
        notAllowed: foodItems(lang, ['meat', 'dairy', 'eggs', 'fish']),
      };
    case 3:
      return {
        ruleLabel: translate(lang, 'fasting.levelFish'),
        allowed: foodItems(lang, ['plant', 'fish', 'wine', 'oil']),
        notAllowed: foodItems(lang, ['meat', 'dairy', 'eggs']),
      };
    case 4:
      return {
        ruleLabel: translate(lang, 'fasting.levelDairy'),
        allowed: foodItems(lang, ['plant', 'dairy', 'eggs', 'fish', 'wine', 'oil']),
        notAllowed: foodItems(lang, ['meat']),
      };
    case 5:
      return {
        ruleLabel: translate(lang, 'fasting.levelStrict'),
        allowed: foodItems(lang, ['plant']),
        notAllowed: foodItems(lang, ['meat', 'dairy', 'eggs', 'fish', 'wine', 'oil']),
      };
    default:
      return {
        ruleLabel: translate(lang, 'fasting.noFast'),
        allowed: foodItems(lang, ['all']),
        notAllowed: [],
      };
  }
}

function applyException(detail: FastingFoodsDetail, day: OrthocalDay, lang: UiLanguage): void {
  const exception = day.fast_exception_desc?.trim();
  if (!exception) return;
  const normalized = normalizeFastText(exception);
  if (isNoFastLevel(day) && REDUNDANT_FAST_EXCEPTIONS.has(normalized)) return;

  const addAllowed = (kind: Exclude<FastingFoodKind, 'all'>) => {
    const item = foodItem(lang, kind);
    if (!detail.allowed.some((entry) => entry.kind === kind)) detail.allowed.push(item);
    detail.notAllowed = detail.notAllowed.filter((entry) => entry.kind !== kind);
  };

  if (normalized.includes('meat')) addAllowed('meat');
  if (normalized.includes('dairy')) addAllowed('dairy');
  if (normalized.includes('fish')) addAllowed('fish');
  if (normalized.includes('wine')) addAllowed('wine');
  if (normalized.includes('oil')) addAllowed('oil');
  if (normalized.includes('egg')) addAllowed('eggs');
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

/** Allowed / not allowed lists and orthocal rule name for the Fasting section body. */
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

  if (weeklyFast) {
    return {
      ruleLabel: localizedWeeklyFastDayLabel(civil, lang) ?? translate(lang, 'fasting.levelStrict'),
      allowed: foodItems(lang, ['plant']),
      notAllowed: foodItems(lang, ['meat', 'dairy', 'eggs', 'fish', 'wine', 'oil']),
    };
  }

  if (!day) {
    if (appearanceKey.includes('lent') || appearanceKey.includes('fast')) {
      return detailForFastLevel(5, lang);
    }
    return detailForFastLevel(0, lang);
  }

  const detail = detailForFastLevel(day.fast_level, lang);
  const weeklyLabel = localizedWeeklyFastDayLabel(civil, lang);
  if (weeklyLabel && day.fast_level === 1) {
    detail.ruleLabel = weeklyLabel;
  } else if (day.fast_level >= 1) {
    detail.ruleLabel = fastLevelLabel(day, lang);
  }
  applyException(detail, day, lang);
  const exceptionNote = fastExceptionNote(day, lang);
  if (exceptionNote) detail.exceptionNote = exceptionNote;
  return detail;
}
