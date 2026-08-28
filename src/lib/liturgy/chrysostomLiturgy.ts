import type { UiLanguage } from '../../i18n/types';

import { getCachedChrysostomLiturgy } from './chrysostomLiturgyRemote';

export const CHRYSOSTOM_SECTION_IDS = [
  'opening',
  'great_litany',
  'antiphons',
  'readings',
  'cherubic',
  'creed',
  'anaphora',
  'communion',
  'dismissal',
] as const;

export type ChrysostomSectionId = (typeof CHRYSOSTOM_SECTION_IDS)[number];

type LocalizedLines = Record<UiLanguage, string[]>;

export type ChrysostomSection = {
  id: ChrysostomSectionId;
  paragraphs: LocalizedLines;
};

export function chrysostomParagraphs(id: ChrysostomSectionId, lang: UiLanguage): string[] {
  const section = getCachedChrysostomLiturgy()?.find((s) => s.id === id);
  if (!section) return [];
  return section.paragraphs[lang]?.length ? section.paragraphs[lang] : section.paragraphs.en;
}

export function chrysostomTitleKey(id: ChrysostomSectionId): string {
  return `liturgy.chrysostom.${id}.title`;
}
