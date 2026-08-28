import type { LiturgicalTextCategory, LiturgicalTextSection } from './liturgicalTexts';
import { liturgicalItemHasText } from './liturgicalTexts';

export type ReadingExcerpt = {
  citation: string;
  excerpt: string;
  label: string | null;
};

function firstCategoryExcerpt(
  sections: LiturgicalTextSection[],
  category: LiturgicalTextCategory,
  maxLines: number,
): ReadingExcerpt | null {
  const section = sections.find((entry) => entry.id === category);
  if (!section) return null;
  const item = section.items.find(liturgicalItemHasText);
  if (!item) return null;

  const lines: string[] = [];
  for (const paragraph of item.paragraphs) {
    for (const line of paragraph) {
      const text = line.text.trim();
      if (text) lines.push(text);
      if (lines.length >= maxLines) break;
    }
    if (lines.length >= maxLines) break;
  }
  if (lines.length === 0) return null;

  const citation = item.citation?.trim() || item.label?.trim() || '';
  const label = item.detail?.trim() || (item.label?.trim() !== citation ? item.label?.trim() : null) || null;

  return {
    citation,
    excerpt: lines.join(' '),
    label,
  };
}

/** First readable lines from a hymn category (troparion, kontakion, etc.). */
export function firstHymnExcerpt(
  sections: LiturgicalTextSection[],
  category: LiturgicalTextCategory,
  maxLines = 4,
): string | null {
  return firstCategoryExcerpt(sections, category, maxLines)?.excerpt ?? null;
}

/** Gospel passage preview for the Today home card. */
export function firstGospelExcerpt(
  sections: LiturgicalTextSection[],
  maxLines = 6,
): ReadingExcerpt | null {
  return firstCategoryExcerpt(sections, 'gospel', maxLines);
}
