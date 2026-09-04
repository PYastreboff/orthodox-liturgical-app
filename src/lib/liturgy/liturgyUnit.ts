import type { UiLanguage } from '../../i18n/types';
import { parseLiturgyLine, type LiturgyRole } from './parseLiturgyLine';

export type LiturgyUnit = {
  en: string;
  el?: string;
  ru?: string;
};

export type LiturgySectionData = {
  id: string;
  units: LiturgyUnit[];
};

export function unitLine(unit: LiturgyUnit, lang: UiLanguage): string {
  if (lang === 'en') return unit.en;
  if (lang === 'el') return unit.el ?? '';
  return unit.ru ?? '';
}

export function sectionUnits(section: {
  units?: LiturgyUnit[];
  paragraphs?: Partial<Record<UiLanguage, string[]>>;
}): LiturgyUnit[] {
  if (section.units?.length) return section.units;
  const en = section.paragraphs?.en ?? [];
  const el = section.paragraphs?.el ?? [];
  const ru = section.paragraphs?.ru ?? [];
  return en.map((line, index) => ({
    en: line,
    el: el[index],
    ru: ru[index],
  }));
}

export function lineRole(line: string, lang: UiLanguage): LiturgyRole | null {
  const parsed = parseLiturgyLine(line, lang);
  if (parsed.kind === 'role-speech' || parsed.kind === 'role-only') return parsed.role;
  return null;
}

export function lineKind(line: string, lang: UiLanguage): ReturnType<typeof parseLiturgyLine>['kind'] {
  return parseLiturgyLine(line, lang).kind;
}
