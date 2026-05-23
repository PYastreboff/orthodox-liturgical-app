import type { OrthocalDay } from '../lib/api/orthocal';
import { translate } from './translate';
import type { UiLanguage } from './types';

const FAST_LEVEL_KEYS: Record<number, string> = {
  0: 'fasting.noFast',
  1: 'fasting.noFast',
  2: 'fasting.levelWineOil',
  3: 'fasting.levelFish',
  4: 'fasting.levelDairy',
  5: 'fasting.levelStrict',
};

const FAST_FOODS_LEVEL_KEYS: Record<number, string> = {
  0: 'fasting.foodsAllAllowed',
  1: 'fasting.foodsAllAllowed',
  2: 'fasting.foodsWineOil',
  3: 'fasting.foodsFish',
  4: 'fasting.foodsDairy',
  5: 'fasting.foodsStrict',
};

function normalizeFastText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** orthocal `fast_level_desc` phrases when level mapping is missing. */
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

const REDUNDANT_FAST_EXCEPTIONS = new Set(['fast free', 'fast free day', 'no fast']);

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

function fastExceptionLabel(day: OrthocalDay, lang: UiLanguage): string | null {
  const exception = day.fast_exception_desc?.trim();
  if (!exception) return null;
  const normalized = normalizeFastText(exception);
  if (REDUNDANT_FAST_EXCEPTIONS.has(normalized)) return null;
  const key = FAST_EXCEPTION_KEYS[normalizeFastText(exception)];
  return key ? translate(lang, key) : exception;
}

/** UI fast pill / hero chip — localized from orthocal fast level, not English API prose. */
export function localizedOrthocalFastLabel(day: OrthocalDay, lang: UiLanguage): string {
  const label = fastLevelLabel(day, lang);
  const exception = fastExceptionLabel(day, lang);
  if (!exception || exception === label) return label;
  return `${label} · ${exception}`;
}

export function localizedFastingFoodsForLevel(
  fastLevel: number,
  appearanceKey: string,
  lang: UiLanguage,
): string {
  const byLevel = FAST_FOODS_LEVEL_KEYS[fastLevel];
  if (byLevel) return translate(lang, byLevel);

  if (appearanceKey.includes('lent')) {
    return translate(lang, FAST_FOODS_LEVEL_KEYS[5]);
  }
  if (appearanceKey === 'wednesday_fast' || appearanceKey === 'friday_fast') {
    return translate(lang, FAST_FOODS_LEVEL_KEYS[5]);
  }
  if (appearanceKey.includes('fast')) {
    return translate(lang, 'fasting.foodsPlantBased');
  }
  return translate(lang, FAST_FOODS_LEVEL_KEYS[0]);
}
