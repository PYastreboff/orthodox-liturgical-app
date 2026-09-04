import type { UiLanguage } from '../../i18n/types';
import { getCachedChrysostomLiturgy } from './chrysostomLiturgyRemote';
import { sectionUnits, unitLine, type LiturgyUnit } from './liturgyUnit';
import {
  CHRYSOSTOM_SECTION_IDS,
  type ChrysostomSection,
  type ChrysostomSectionId,
} from './chrysostomLiturgyTypes';

export {
  CHRYSOSTOM_SECTION_IDS,
  type ChrysostomSection,
  type ChrysostomSectionId,
} from './chrysostomLiturgyTypes';

export function chrysostomSectionUnits(
  sections: readonly ChrysostomSection[],
  id: ChrysostomSectionId,
): LiturgyUnit[] {
  const section = sections.find((entry) => entry.id === id);
  if (!section) return [];
  return sectionUnits(section);
}

export function chrysostomSectionParagraphs(
  sections: readonly ChrysostomSection[],
  id: ChrysostomSectionId,
  lang: UiLanguage,
): string[] {
  const section = sections.find((entry) => entry.id === id);
  if (!section) return [];
  const paragraphs = section.paragraphs?.[lang];
  if (paragraphs?.length) return paragraphs;
  return chrysostomSectionUnits(sections, id).map((unit) => unitLine(unit, lang));
}

export function chrysostomTitleKey(id: ChrysostomSectionId): string {
  return `liturgy.chrysostom.${id}.title`;
}

export function chrysostomNavKey(id: ChrysostomSectionId): string {
  return `liturgy.chrysostom.${id}.nav`;
}

/** @deprecated Use chrysostomSectionUnits */
export function chrysostomParagraphs(id: ChrysostomSectionId, lang: UiLanguage): string[] {
  return chrysostomSectionParagraphs(getCachedChrysostomLiturgy() ?? [], id, lang);
}
