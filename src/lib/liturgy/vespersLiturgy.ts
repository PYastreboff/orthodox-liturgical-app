import type { UiLanguage } from '../../i18n/types';
import { sectionUnits, unitLine, type LiturgyUnit } from './liturgyUnit';

export const VESPERS_SECTION_IDS = [
  'opening',
  'psalm_103',
  'great_litany',
  'lord_i_have_cried',
  'phos_hilaron',
  'aposticha',
  'supplication',
  'dismissal',
] as const;

export type VespersSectionId = (typeof VESPERS_SECTION_IDS)[number];

export type VespersSection = {
  id: VespersSectionId;
  units?: LiturgyUnit[];
  paragraphs?: Partial<Record<UiLanguage, string[]>>;
};

export function vespersSectionUnits(
  sections: readonly VespersSection[],
  id: VespersSectionId,
): LiturgyUnit[] {
  const section = sections.find((entry) => entry.id === id);
  if (!section) return [];
  return sectionUnits(section);
}

export function vespersSectionParagraphs(
  sections: readonly VespersSection[],
  id: VespersSectionId,
  lang: UiLanguage,
): string[] {
  const section = sections.find((entry) => entry.id === id);
  if (!section) return [];
  const paragraphs = section.paragraphs?.[lang];
  if (paragraphs?.length) return paragraphs;
  return vespersSectionUnits(sections, id).map((unit) => unitLine(unit, lang));
}

export function vespersTitleKey(id: VespersSectionId): string {
  return `liturgy.vespers.${id}.title`;
}
