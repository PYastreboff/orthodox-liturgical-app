/**
 * Align EL/RU paragraphs to the English spine (one row per English line).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { ChrysostomSectionId } from '../../src/lib/liturgy/chrysostomLiturgy.ts';
import { sanitizeLiturgyLines } from '../../src/lib/liturgy/liturgySanitize.ts';
import { alignLiturgySection } from './alignLiturgySection.ts';
import type { DivineLiturgySectionId } from './buildGoarchDivineLiturgy.ts';
import { DIVINE_LITURGY_SECTION_IDS } from './buildGoarchDivineLiturgy.ts';

export type LiturgyTranslationOverrides = Partial<
  Record<DivineLiturgySectionId, Record<string, string>>
>;

export function loadLiturgyOverrides(
  sourcesDir: string,
  file: string,
): LiturgyTranslationOverrides {
  try {
    return JSON.parse(readFileSync(join(sourcesDir, file), 'utf8')) as LiturgyTranslationOverrides;
  } catch {
    return {};
  }
}

export function loadGlobalLiturgyTranslations(sourcesDir: string): {
  el: Record<string, string>;
  ru: Record<string, string>;
} {
  try {
    const data = JSON.parse(
      readFileSync(join(sourcesDir, 'liturgy-translations.json'), 'utf8'),
    ) as { el?: Record<string, string>; ru?: Record<string, string> };
    return { el: data.el ?? {}, ru: data.ru ?? {} };
  } catch {
    return { el: {}, ru: {} };
  }
}

const EN_ROLE_RE = /^(DEACON|PRIEST|CHOIR|PEOPLE|READER)(\s*\([^)]*\))?\s*:/i;
const EL_ROLE_RE = /^(ΔΙΑΚΟΝΟΣ|ΙΕΡΕΥΣ|ΧΟΡΟΣ|ΛΑΟΣ|ΑΝΑΓΝΩΣΤΗΣ)(\s*\([^)]*\))?\s*[:·]/i;
const RU_ROLE_RE = /^(Священник|Диакон|Чтец|Народ|Хор)(\s*\([^)]*\))?\s*:/i;

function normalizedRole(line: string, lang: 'en' | 'el' | 'ru'): string | null {
  const re = lang === 'en' ? EN_ROLE_RE : lang === 'el' ? EL_ROLE_RE : RU_ROLE_RE;
  const match = line.trim().match(re);
  if (!match) return null;
  const role = match[1]!.toLowerCase();
  if (lang === 'el') {
    if (role.includes('διακον')) return 'deacon';
    if (role.includes('ιερευ')) return 'priest';
    if (role.includes('χορ')) return 'choir';
    if (role.includes('λαο')) return 'people';
    if (role.includes('αναγνωστ')) return 'reader';
  }
  if (lang === 'ru') {
    if (role.includes('диакон')) return 'deacon';
    if (role.includes('священник')) return 'priest';
    if (role.includes('хор')) return 'choir';
    if (role.includes('народ')) return 'people';
    if (role.includes('чтец')) return 'reader';
  }
  return role;
}

function countRoleLabels(line: string, lang: 'el' | 'ru'): number {
  const labelRe =
    lang === 'el'
      ? /(?:^|(?<=\.\s))(?:ΔΙΑΚΟΝΟΣ|ΙΕΡΕΥΣ|ΧΟΡΟΣ|ΛΑΟΣ|ΑΝΑΓΝΩΣΤΗΣ)(\s*\([^)]*\))?\s*[:·]/gi
      : /(?:^|(?<=\.\s))(?:Диакон|Священник|Чтец|Народ|Хор)(\s*\([^)]*\))?\s*:/gi;
  return (line.match(labelRe) ?? []).length;
}

function rolesAlign(enLine: string, translated: string, lang: 'el' | 'ru'): boolean {
  const enRole = normalizedRole(enLine, 'en');
  if (!enRole) return true;
  const trRole = normalizedRole(translated, lang);
  if (!trRole) return false;
  if (trRole !== enRole) return false;
  if (countRoleLabels(translated, lang) > 1) return false;
  return true;
}

function applyBuiltThenGlobal(
  enLines: string[],
  builtLines: string[],
  globalMap: Record<string, string>,
  sectionOverrides: Record<string, string>,
  lang: 'el' | 'ru',
): string[] {
  return enLines.map((en, index) => {
    const trimmed = en.trim();
    if (sectionOverrides[trimmed]) return sectionOverrides[trimmed]!;
    if (sectionOverrides[en]) return sectionOverrides[en]!;
    const built = builtLines[index]?.trim() ?? '';
    if (built && rolesAlign(trimmed, built, lang)) return built;
    if (globalMap[trimmed] && rolesAlign(trimmed, globalMap[trimmed]!, lang)) {
      return globalMap[trimmed]!;
    }
    if (globalMap[en] && rolesAlign(trimmed, globalMap[en]!, lang)) return globalMap[en]!;
    return '';
  });
}

function applyGlobalThenBuilt(
  enLines: string[],
  builtLines: string[],
  globalMap: Record<string, string>,
  sectionOverrides: Record<string, string>,
  lang: 'el' | 'ru',
): string[] {
  return enLines.map((en, index) => {
    const trimmed = en.trim();
    if (sectionOverrides[trimmed]) return sectionOverrides[trimmed]!;
    if (sectionOverrides[en]) return sectionOverrides[en]!;
    if (globalMap[trimmed] && rolesAlign(trimmed, globalMap[trimmed]!, lang)) {
      return globalMap[trimmed]!;
    }
    if (globalMap[en] && rolesAlign(trimmed, globalMap[en]!, lang)) return globalMap[en]!;
    const built = builtLines[index]?.trim() ?? '';
    if (built && rolesAlign(trimmed, built, lang)) return built;
    return '';
  });
}

export function buildRussianOnEnSpine(
  enSections: Map<DivineLiturgySectionId, string[]>,
  ruSections: Map<DivineLiturgySectionId, string[]>,
  overrides: LiturgyTranslationOverrides,
  globalTranslations?: { ru: Record<string, string> },
): Map<DivineLiturgySectionId, string[]> {
  const result = new Map<DivineLiturgySectionId, string[]>();
  const globalRu = globalTranslations?.ru ?? {};

  for (const id of DIVINE_LITURGY_SECTION_IDS) {
    const en = sanitizeLiturgyLines(enSections.get(id)!, 'en', id);
    const ruRaw = sanitizeLiturgyLines(ruSections.get(id)!, 'ru', id);
    const aligned = alignLiturgySection(en, ruRaw, ruRaw.map(() => '')).map((unit) => unit.ru?.trim() ?? '');
    const sectionOverrides = overrides[id] ?? {};
    result.set(id, applyGlobalThenBuilt(en, aligned, globalRu, sectionOverrides, 'ru'));
  }

  return result;
}

export function applyGreekGlobalTranslations(
  enSections: Map<DivineLiturgySectionId, string[]>,
  elSections: Map<DivineLiturgySectionId, string[]>,
  globalTranslations: { el: Record<string, string> },
  overrides: LiturgyTranslationOverrides,
): Map<DivineLiturgySectionId, string[]> {
  const result = new Map<DivineLiturgySectionId, string[]>();
  const globalEl = globalTranslations.el;

  for (const id of DIVINE_LITURGY_SECTION_IDS) {
    const en = sanitizeLiturgyLines(enSections.get(id)!, 'en', id);
    const el = sanitizeLiturgyLines(elSections.get(id)!, 'el', id, { preserveLength: true });
    const sectionOverrides = overrides[id] ?? {};
    result.set(id, applyBuiltThenGlobal(en, el, globalEl, sectionOverrides, 'el'));
  }

  return result;
}

export function assembleEnSpineSections(
  enSections: Map<DivineLiturgySectionId, string[]>,
  ruSections: Map<DivineLiturgySectionId, string[]>,
  elSections: Map<DivineLiturgySectionId, string[]>,
) {
  return DIVINE_LITURGY_SECTION_IDS.map((id) => {
    const en = sanitizeLiturgyLines(enSections.get(id)!, 'en', id);
    const ru = sanitizeLiturgyLines(ruSections.get(id)!, 'ru', id, { preserveLength: true });
    const el = sanitizeLiturgyLines(elSections.get(id)!, 'el', id, { preserveLength: true });

    while (ru.length < en.length) ru.push('');
    while (el.length < en.length) el.push('');
    if (ru.length > en.length) ru.length = en.length;
    if (el.length > en.length) el.length = en.length;

    const units = en.map((enLine, index) => ({
      en: enLine,
      ru: ru[index] || undefined,
      el: el[index] || undefined,
    }));

    return {
      id,
      units,
      paragraphs: { en, ru, el },
    };
  });
}

export function normalizeElParagraphs(
  lines: string[],
  sectionId: DivineLiturgySectionId,
): string[] {
  return sanitizeLiturgyLines(lines, 'el', sectionId as ChrysostomSectionId, { preserveLength: true });
}
