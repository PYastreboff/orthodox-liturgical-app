/**
 * Build St Basil Greek paragraphs aligned to the GOARCH English spine.
 * Uses Chrysostom Greek where the English matches, then GOARCH gr-en pairs,
 * then hand-maintained overrides translated from the Basil English text.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { ChrysostomSectionId } from '../../src/lib/liturgy/chrysostomLiturgy.ts';
import type { DivineLiturgySectionId } from './buildGoarchDivineLiturgy.ts';
import { DIVINE_LITURGY_SECTION_IDS } from './buildGoarchDivineLiturgy.ts';
import { normalizeLiturgyParagraphs } from './normalizeLiturgyLang.ts';
import { cleanParagraph, parseEnglishBlock, parseGreekBlock } from './parseLiturgySource.ts';

const GREEK = /[\u0370-\u03FF\u1F00-\u1FFF]/;
const LATIN = /[A-Za-z]/;

type SectionMarker = { id: DivineLiturgySectionId; pattern: RegExp };

type BasilElOverrides = Partial<Record<DivineLiturgySectionId, Record<string, string>>>;

function findSectionStarts(lines: string[], markers: SectionMarker[]): Map<DivineLiturgySectionId, number> {
  const starts = new Map<DivineLiturgySectionId, number>();
  for (const marker of markers) {
    let found = -1;
    for (let i = 0; i < lines.length; i++) {
      if (marker.pattern.test(lines[i]!.trim())) {
        found = i;
        break;
      }
    }
    if (found < 0) {
      throw new Error(`Missing marker ${marker.id}: ${marker.pattern}`);
    }
    starts.set(marker.id, found);
  }
  return starts;
}

function sectionSlice(text: string, markers: SectionMarker[], id: DivineLiturgySectionId): string {
  const lines = text.split(/\r?\n/);
  const starts = findSectionStarts(lines, markers);
  const index = DIVINE_LITURGY_SECTION_IDS.indexOf(id);
  const start = starts.get(id)!;
  const end =
    index + 1 < DIVINE_LITURGY_SECTION_IDS.length
      ? starts.get(DIVINE_LITURGY_SECTION_IDS[index + 1]!)!
      : lines.length;
  return lines.slice(start, end).join('\n');
}

function normEnKey(text: string): string {
  return cleanParagraph(text)
    .replace(/^(DEACON|PRIEST|CHOIR|PEOPLE|READER)(\s*\([^)]*\))?\s*:\s*/i, '')
    .replace(/^(ΔΙΑΚΟΝΟΣ|ΙΕΡΕΥΣ|ΧΟΡΟΣ|ΛΑΟΣ|ΑΝΑΓΝΩΣΤΗΣ)\s*[:·]\s*/i, '')
    .replace(/^(Священник|Диакон|Чтец|Народ|Хор)\s*:\s*/i, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function splitMixedLine(line: string): { greek?: string; english?: string } {
  const trimmed = line.trim();
  if (!trimmed || /^(_{3,}|Books|Sources|This is the|LITURGY OF)/i.test(trimmed)) {
    return {};
  }

  const rolePair = trimmed.match(
    /^(ΔΙΑΚΟΝΟΣ|ΙΕΡΕΥΣ|ΧΟΡΟΣ|ΛΑΟΣ|ΑΝΑΓΝΩΣΤΗΣ)(?:\s+[A-Z][A-Za-z]*)?$/iu,
  );
  if (rolePair) return { greek: rolePair[1]!.toUpperCase() };

  if (!GREEK.test(trimmed)) return { english: trimmed };

  const splitAtEnglish = trimmed.match(
    /^([\u0370-\u03FF\u1F00-\u1FFF0-9\s·,;:!?ʼ''""()—\-–.]+?)(?:\.\s+|\s{2,})([A-Za-z].*)$/u,
  );
  if (splitAtEnglish) {
    return {
      greek: cleanParagraph(splitAtEnglish[1]!),
      english: cleanParagraph(splitAtEnglish[2]!),
    };
  }

  if ((trimmed.match(LATIN) ?? []).length > (trimmed.match(GREEK) ?? []).length) {
    return { english: trimmed };
  }

  return { greek: cleanParagraph(trimmed) };
}

/** Pair Greek fragments with their English translation from a gr-en section slice. */
export function extractBasilGrEnPairs(sectionText: string): Map<string, string> {
  const pairs = new Map<string, string>();
  let greekPending: string[] = [];
  let englishPending: string[] = [];

  const flush = () => {
    if (!greekPending.length || !englishPending.length) {
      greekPending = [];
      englishPending = [];
      return;
    }
    const el = greekPending.join(' ').trim();
    const en = englishPending.join(' ').trim();
    if (el && en) {
      pairs.set(normEnKey(en), el);
      const roleSpeech = en.match(/^(DEACON|PRIEST|CHOIR|PEOPLE|READER)(\s*\([^)]*\))?\s*:\s*(.+)$/i);
      if (roleSpeech?.[3]) pairs.set(normEnKey(roleSpeech[3]), el);
      const elRoleSpeech = el.match(/^(ΔΙΑΚΟΝΟΣ|ΙΕΡΕΥΣ|ΧΟΡΟΣ|ΛΑΟΣ|ΑΝΑΓΝΩΣΤΗΣ)\s*[:·]\s*(.+)$/i);
      if (elRoleSpeech) pairs.set(normEnKey(en), el);
    }
    greekPending = [];
    englishPending = [];
  };

  for (const raw of sectionText.split(/\r?\n/)) {
    const { greek, english } = splitMixedLine(raw);
    if (greek && english) {
      flush();
      pairs.set(normEnKey(english), greek.includes(':') ? greek : greek);
      if (!/^(ΔΙΑΚΟΝΟΣ|ΙΕΡΕΥΣ|ΧΟΡΟΣ|ΛΑΟΣ|ΑΝΑΓΝΩΣΤΗΣ)$/i.test(greek)) {
        pairs.set(normEnKey(english), greek);
      }
      continue;
    }
    if (greek) {
      if (englishPending.length) flush();
      if (/^(ΔΙΑΚΟΝΟΣ|ΙΕΡΕΥΣ|ΧΟΡΟΣ|ΛΑΟΣ|ΑΝΑΓΝΩΣΤΗΣ)$/i.test(greek) && greekPending.length) {
        greekPending.push(greek);
      } else if (/^(ΔΙΑΚΟΝΟΣ|ΙΕΡΕΥΣ|ΧΟΡΟΣ|ΛΑΟΣ|ΑΝΑΓΝΩΣΤΗΣ)$/i.test(greek)) {
        greekPending = [greek];
      } else {
        greekPending.push(greek);
      }
      continue;
    }
    if (english) {
      englishPending.push(english);
      continue;
    }
    flush();
  }
  flush();
  return pairs;
}

const COMMON_GREEK_BY_EN: Record<string, string> = {
  'CHOIR: Amen.': 'ΧΟΡΟΣ: Αμήν.',
  'CHOIR: To You, O Lord.': 'ΧΟΡΟΣ: Σοὶ Κύριε.',
  'CHOIR: And with your spirit.': 'ΧΟΡΟΣ: Καὶ μετὰ τοῦ πνεύματός σου.',
  'PRIEST: Peace be with all.': 'ΙΕΡΕΥΣ: Ἡ εἰρήνη πᾶσι.',
  'DEACON: Let us bow our heads to the Lord.': 'ΔΙΑΚΟΝΟΣ: Ἰδοὺ προσκύνωμεν. Κύριε, ἐλέησον.',
  'CHOIR (after each petition): Lord, have mercy.': 'ΧΟΡΟΣ (μετὰ ἕκαστον αἴτημα): Κύριε, ἐλέησον.',
  'CHOIR (after each petition): Grant this, O Lord.': 'ΧΟΡΟΣ (μετὰ ἕκαστον αἴτημα): Παράσχου, Κύριε.',
  '__CREED_TITLE__': '__CREED_TITLE__',
  '__LORDS_PRAYER_TITLE__': '__LORDS_PRAYER_TITLE__',
};

function greekRolePrefix(en: string): string | null {
  const match = en.match(/^(DEACON|PRIEST|CHOIR|PEOPLE|READER)(\s*\([^)]*\))?\s*:\s*/i);
  if (!match) return null;
  const role = match[1]!.toUpperCase();
  const map: Record<string, string> = {
    DEACON: 'ΔΙΑΚΟΝΟΣ',
    PRIEST: 'ΙΕΡΕΥΣ',
    CHOIR: 'ΧΟΡΟΣ',
    PEOPLE: 'ΛΑΟΣ',
    READER: 'ΑΝΑΓΝΩΣΤΗΣ',
  };
  return map[role] ?? null;
}

function attachRolePrefix(en: string, greekSpeech: string): string {
  const prefix = greekRolePrefix(en);
  if (!prefix) return greekSpeech;
  if (new RegExp(`^${prefix}\\s*[:·]`, 'i').test(greekSpeech)) return greekSpeech;
  return `${prefix}: ${greekSpeech}`;
}

function cleanEnForLookup(text: string): string {
  return text
    .replace(/LITURGY OF ST\.?\s*BASIL[^\s]*/gi, '')
    .replace(/ΛΕΙΤΟΥΡΓΙΑ ΜΕΓΑΛΟΥ ΒΑΣΙΛΕΙΟΥ[^\s]*/gi, '')
    .replace(/\bTrisagion Hymn\b/gi, '')
    .replace(/\bOFFERTORY PRAYER\b/gi, '')
    .replace(/\bBOWING OF HEADS\b/gi, '')
    .replace(/\s+\d+\s*$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function lookupByChrysostomSection(
  en: string,
  chrysEn: string[],
  chrysEl: string[],
): string {
  const key = normEnKey(cleanEnForLookup(en));
  if (!key || key.length < 16) return '';
  for (let i = 0; i < chrysEn.length; i++) {
    const cKey = normEnKey(cleanEnForLookup(chrysEn[i]!));
    if (!cKey) continue;
    if (cKey === key || cKey.startsWith(key.slice(0, 36)) || key.startsWith(cKey.slice(0, 36))) {
      return chrysEl[i]?.trim() ?? '';
    }
  }
  return '';
}

function lookupGreek(
  en: string,
  chrysEnToEl: Map<string, string>,
  chrysNormToEl: Map<string, string>,
  grEnPairs: Map<string, string>,
  overrides: BasilElOverrides,
  sectionId: DivineLiturgySectionId,
  chrysSectionEn: string[],
  chrysSectionEl: string[],
): string {
  const trimmed = cleanEnForLookup(en.trim());
  if (!trimmed || /^\d+$/.test(trimmed)) return '';

  const sectionOverrides = overrides[sectionId] ?? {};
  const raw = en.trim();

  if (sectionOverrides[raw]) return sectionOverrides[raw]!;
  if (sectionOverrides[trimmed]) return sectionOverrides[trimmed]!;
  if (COMMON_GREEK_BY_EN[trimmed]) return COMMON_GREEK_BY_EN[trimmed]!;
  if (chrysEnToEl.has(trimmed)) return chrysEnToEl.get(trimmed)!;

  const speechKey = normEnKey(trimmed);
  if (chrysNormToEl.has(speechKey)) return attachRolePrefix(trimmed, chrysNormToEl.get(speechKey)!);
  if (grEnPairs.has(speechKey)) return attachRolePrefix(trimmed, grEnPairs.get(speechKey)!);

  const colonSpeech = trimmed.match(/^(?:DEACON|PRIEST|CHOIR|PEOPLE|READER)(\s*\([^)]*\))?\s*:\s*(.+)$/i);
  if (colonSpeech?.[2] && grEnPairs.has(normEnKey(colonSpeech[2]))) {
    return attachRolePrefix(trimmed, grEnPairs.get(normEnKey(colonSpeech[2]!))!);
  }

  return lookupByChrysostomSection(trimmed, chrysSectionEn, chrysSectionEl);
}

export function buildBasilGreekParagraphs(args: {
  sourcesDir: string;
  enBySection: Map<DivineLiturgySectionId, string[]>;
  chrysostomEnBySection: Map<DivineLiturgySectionId, string[]>;
  chrysostomElBySection: Map<DivineLiturgySectionId, string[]>;
  grEnFile: string;
  grEnMarkers: SectionMarker[];
  overridesFile?: string;
}): Map<DivineLiturgySectionId, string[]> {
  const grEnText = readFileSync(join(args.sourcesDir, args.grEnFile), 'utf8');
  let overrides: BasilElOverrides = {};
  if (args.overridesFile) {
    try {
      overrides = JSON.parse(readFileSync(join(args.sourcesDir, args.overridesFile), 'utf8')) as BasilElOverrides;
    } catch {
      overrides = {};
    }
  }

  const chrysEnToEl = new Map<string, string>();
  const chrysNormToEl = new Map<string, string>();
  for (const id of DIVINE_LITURGY_SECTION_IDS) {
    const enLines = args.chrysostomEnBySection.get(id) ?? [];
    const elLines = args.chrysostomElBySection.get(id) ?? [];
    for (let i = 0; i < enLines.length; i++) {
      const en = enLines[i]?.trim();
      const el = elLines[i]?.trim();
      if (en && el && !chrysEnToEl.has(en)) chrysEnToEl.set(en, el);
      if (en && el) {
        const key = normEnKey(en);
        if (key && !chrysNormToEl.has(key)) chrysNormToEl.set(key, el);
      }
    }
  }

  const result = new Map<DivineLiturgySectionId, string[]>();
  for (const id of DIVINE_LITURGY_SECTION_IDS) {
    const enLines = args.enBySection.get(id) ?? [];
    const chrysSectionEn = args.chrysostomEnBySection.get(id) ?? [];
    const chrysSectionEl = args.chrysostomElBySection.get(id) ?? [];
    const chrysCreedClauses = chrysSectionEl.filter((line) => /^ΛΑΟΣ:/i.test(line.trim()));
    let creedClauseIndex = 0;

    const grEnSlice = sectionSlice(grEnText, args.grEnMarkers, id);
    const grEnPairs = extractBasilGrEnPairs(grEnSlice);

    const elLines = enLines.map((en) => {
      const trimmed = en.trim();
      if (id === 'creed' && /^PEOPLE:/i.test(trimmed)) {
        if (/symbol of faith/i.test(trimmed)) return '__CREED_TITLE__';
        if (creedClauseIndex < chrysCreedClauses.length) {
          return chrysCreedClauses[creedClauseIndex++]!;
        }
      }
      return lookupGreek(
        en,
        chrysEnToEl,
        chrysNormToEl,
        grEnPairs,
        overrides,
        id,
        chrysSectionEn,
        chrysSectionEl,
      );
    });

    const normalized = normalizeLiturgyParagraphs(
      elLines,
      'el',
      id as ChrysostomSectionId,
      { preserveLength: true },
    );

    result.set(id, normalized);
  }

  return result;
}

export function loadBasilElOverrides(path: string): BasilElOverrides {
  return JSON.parse(readFileSync(path, 'utf8')) as BasilElOverrides;
}

/** Utility for the generator script: parse English/Greek blocks from a section slice. */
export function debugSectionBlocks(sectionText: string) {
  return {
    en: parseEnglishBlock(sectionText),
    el: parseGreekBlock(sectionText),
  };
}
