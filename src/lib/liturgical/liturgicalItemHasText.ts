import type { LiturgicalTextItem } from './liturgicalTexts';

/** True when at least one verse line has non-whitespace text (citation-only stubs count as empty). */
export function liturgicalItemHasText(item: LiturgicalTextItem): boolean {
  return item.paragraphs.some((p) => p.some((line) => line.text.trim().length > 0));
}
