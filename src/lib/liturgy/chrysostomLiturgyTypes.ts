import type { UiLanguage } from '../../i18n/types';
import type { LiturgyUnit } from './liturgyUnit';

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

export type ChrysostomSection = {
  id: ChrysostomSectionId;
  units?: LiturgyUnit[];
  paragraphs?: Partial<Record<UiLanguage, string[]>>;
};
