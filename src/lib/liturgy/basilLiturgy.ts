import type { UiLanguage } from '../../i18n/types';
import { getCachedBasilLiturgy } from './basilLiturgyRemote';
import {
  CHRYSOSTOM_SECTION_IDS,
  type ChrysostomSection,
  type ChrysostomSectionId,
} from './chrysostomLiturgy';
import { sectionUnits, unitLine, type LiturgyUnit } from './liturgyUnit';

export const BASIL_SECTION_IDS = CHRYSOSTOM_SECTION_IDS;
export type BasilSectionId = ChrysostomSectionId;
export type BasilSection = ChrysostomSection;

export function basilSectionUnits(
  sections: readonly BasilSection[],
  id: BasilSectionId,
): LiturgyUnit[] {
  const section = sections.find((entry) => entry.id === id);
  if (!section) return [];
  return sectionUnits(section);
}

export function basilSectionParagraphs(
  sections: readonly BasilSection[],
  id: BasilSectionId,
  lang: UiLanguage,
): string[] {
  const section = sections.find((entry) => entry.id === id);
  if (!section) return [];
  const paragraphs = section.paragraphs?.[lang];
  if (paragraphs?.length) return paragraphs;
  return basilSectionUnits(sections, id).map((unit) => unitLine(unit, lang));
}

export function basilTitleKey(id: BasilSectionId): string {
  return `liturgy.basil.${id}.title`;
}

export function basilNavKey(id: BasilSectionId): string {
  return `liturgy.basil.${id}.nav`;
}

export function basilParagraphs(id: BasilSectionId, lang: UiLanguage): string[] {
  return basilSectionParagraphs(getCachedBasilLiturgy() ?? [], id, lang);
}
