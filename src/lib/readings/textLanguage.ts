export type ReadingsSingleLanguage = 'en' | 'chu' | 'el';

export type TextLanguage = ReadingsSingleLanguage | 'compare';

export type ReadingsCompareSides = {
  left: ReadingsSingleLanguage | null;
  right: ReadingsSingleLanguage | null;
};

export function isTextLanguage(value: unknown): value is TextLanguage {
  return value === 'en' || value === 'chu' || value === 'el' || value === 'compare';
}

/** Migrate legacy persisted values. */
export function normalizeTextLanguage(value: unknown): TextLanguage {
  if (value === 'both' || value === 'both-el') return 'compare';
  if (isTextLanguage(value)) return value;
  return 'en';
}

export function readingsSideBySide(textLang: TextLanguage): boolean {
  return textLang === 'compare';
}

export function readingsCompareHasSelection(
  textLang: TextLanguage,
  sides: ReadingsCompareSides,
): boolean {
  return textLang === 'compare' && (sides.left != null || sides.right != null);
}

export function readingsCompareReady(textLang: TextLanguage, sides: ReadingsCompareSides): boolean {
  return textLang === 'compare' && sides.left != null && sides.right != null;
}

export function needsSlavonicSections(textLang: TextLanguage, sides: ReadingsCompareSides): boolean {
  if (textLang === 'chu') return true;
  if (textLang === 'compare') return sides.left === 'chu' || sides.right === 'chu';
  return false;
}

export function needsGreekSections(textLang: TextLanguage, sides: ReadingsCompareSides): boolean {
  if (textLang === 'el') return true;
  if (textLang === 'compare') return sides.left === 'el' || sides.right === 'el';
  return false;
}
