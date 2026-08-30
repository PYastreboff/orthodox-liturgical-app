/**
 * Post-process parsed liturgy paragraphs so EN/RU/EL share comparable structure.
 */
import type { UiLanguage } from '../../src/i18n/types.ts';
import type { ChrysostomSectionId } from '../../src/lib/liturgy/chrysostomLiturgy.ts';
import { splitCreedClausesFromBody } from './parseLiturgySource.ts';

const RU_EMBEDDED_ROLE = /\s+(?=(?:Священник|Диакон|Чтец|Народ|Хор|Сослужащие)\s*:)/gi;
const EN_EMBEDDED_ROLE =
  /\s+(?=(?:DEACON|PRIEST|CHOIR|PEOPLE|READER)(?:\s*\([^)]*\))?\s*:)/gi;

const RU_SECTION_JUNK =
  /(?:\.\s*|\s+)(?:\d+-й антифон[^.]*|(?:великая|малая|сугубая|просительная)(?:\s*\([^)]*\))?\s*ектения[^.]*|ектения и молитва[^.]*|проповедь[^.]*|В великие \(Двунадесятые\)[^.]*|Диакон читает Евангелие[^.]*|По окончании чтения[^.]*|оглашенных\)[^.]*|верных вторая[^.]*|по причащении[^.]*)\s*$/i;

const EN_SECTION_JUNK =
  /\s+(?:PRAYER OF (?:FIRST|SECOND|THIRD) ANTIPHON|Small Litany|The \d+(?:st|nd|rd|th) Antiphon|ENTRANCE PRAYER|PRAYER AFTER EVERYONE COMMUNES|The Dismissal)\b.*$/i;

function splitEmbeddedRoles(line: string, lang: UiLanguage): string[] {
  const splitRe = lang === 'ru' ? RU_EMBEDDED_ROLE : lang === 'en' ? EN_EMBEDDED_ROLE : null;
  if (!splitRe) return [line];
  const parts = line.split(splitRe).map((p) => p.trim()).filter(Boolean);
  return parts.length > 1 ? parts : [line];
}

function stripSectionJunk(line: string, lang: UiLanguage): string {
  if (lang === 'ru') {
    let text = line
      .replace(RU_SECTION_JUNK, '.')
      .replace(/\s+\./g, '.')
      .trim();
    if (/^Хор:\s*Аминь/i.test(text)) {
      text = text.replace(/^(Хор:\s*Аминь)[.\s].*/i, '$1.');
    }
    if (/^Хор:\s*Господи,\s*помилуй\b/i.test(text) && /\s+Диакон:\s*/i.test(text)) {
      return text.split(/\s+(?=Диакон:\s*)/i)[0]!.trim();
    }
    return text;
  }
  if (lang === 'en') return line.replace(EN_SECTION_JUNK, '').trim();
  return line.trim();
}

function fixRussianWordBreaks(text: string): string {
  return text
    .replace(/помо\s+лимся/gi, 'помолимся')
    .replace(/споду\s+помолимся/gi, 'Господу помолимся')
    .replace(/Го\s+споду/gi, 'Господу')
    .replace(/по\s+гибнут/gi, 'погибнут')
    .replace(/благо\s+слови/gi, 'благослови')
    .replace(/не\s+ви\s+димым/gi, 'невидимым')
    .replace(/Бо\s+жия/gi, 'Божия')
    .replace(/че\s+ловек/gi, 'человек')
    .replace(/не\s+бес/gi, 'небес')
    .replace(/Понтийстем/gi, 'Понтийстем')
    .replace(/погребен\s+на/gi, 'погребена')
    .replace(/От\s+ца/gi, 'Отца')
    .replace(/еди\s+носущна/gi, 'единосущна')
    .replace(/спо\s+кланяема/gi, 'спокланяема')
    .replace(/гре\s+хов/gi, 'грехов')
    .replace(/При\s+снодеву/gi, 'Приснодеву')
    .replace(/Хри\s+сту/gi, 'Христу')
    .replace(/^лимся\.\s*/i, '')
    .replace(/^(диакон|священник|хор|чтец|народ)\s*:/i, (match) => match.charAt(0).toUpperCase() + match.slice(1));
}

function isRussianLitanyPetition(text: string): boolean {
  return /господу помолимся|господу по\s*молимся/i.test(text);
}

function isGreekLitanyPetition(text: string): boolean {
  return /τοῦ κυρίου δεηθῶμεν|τοῦ Κυρίου δεηθῶμεν/i.test(text);
}

function prefixRussianRole(line: string, role: string): string {
  if (/^(Священник|Диакон|Чтец|Народ|Хор)\s*:/i.test(line)) return line;
  return `${role}: ${line}`;
}

function reassignRussianLitanyRoles(lines: string[], sectionId: ChrysostomSectionId): string[] {
  if (sectionId !== 'great_litany' && sectionId !== 'readings' && sectionId !== 'cherubic') {
    return lines;
  }

  const out: string[] = [];
  let afterChoirMercy = false;

  for (const raw of lines) {
    let line = raw;

    if (/^Хор:\s*Господи,\s*помилуй/i.test(line)) {
      out.push(line);
      afterChoirMercy = true;
      continue;
    }

    if (/^Хор:\s*Тебе,\s*Господи/i.test(line)) {
      afterChoirMercy = false;
      out.push(line);
      continue;
    }

    if (afterChoirMercy && isRussianLitanyPetition(line) && !/^Хор:/i.test(line)) {
      out.push(prefixRussianRole(line, 'Диакон'));
      continue;
    }

    if (afterChoirMercy && isRussianLitanyPetition(line) && /^Хор:\s*/i.test(line)) {
      const speech = line.replace(/^Хор:\s*/i, '');
      out.push('Хор: Господи, помилуй (после каждого прошения).');
      out.push(prefixRussianRole(speech, 'Диакон'));
      continue;
    }

    if (/^Хор:\s*Аминь\.?$/i.test(line)) {
      afterChoirMercy = false;
    }

    out.push(line);
  }

  return out;
}

function mergeGreekLitanyPetitions(lines: string[], sectionId: ChrysostomSectionId): string[] {
  if (
    sectionId !== 'great_litany' &&
    sectionId !== 'readings' &&
    sectionId !== 'cherubic' &&
    sectionId !== 'anaphora' &&
    sectionId !== 'communion' &&
    sectionId !== 'dismissal'
  ) {
    return lines;
  }

  const out: string[] = [];
  let buffer: string[] = [];

  const flush = () => {
    if (!buffer.length) return;
    out.push(buffer.join(' '));
    buffer = [];
  };

  for (const line of lines) {
    const speech = line.replace(/^(ΔΙΑΚΟΝΟΣ|ΙΕΡΕΥΣ|ΧΟΡΟΣ|ΛΑΟΣ)\s*:\s*/i, '').trim();
    const isPetition =
      isGreekLitanyPetition(speech) ||
      (/^Ὑπὲρ\b/.test(speech) && /δεηθῶμεν/i.test(speech));

    if (isPetition && !/^ΧΟΡΟΣ:/i.test(line)) {
      buffer.push(speech);
      continue;
    }

    flush();
    out.push(line);
  }

  flush();
  return out;
}

function normalizeCreedParagraphs(lines: string[], lang: UiLanguage): string[] {
  const out: string[] = [];
  for (const line of lines) {
    if (line === '__CREED_TITLE__') {
      out.push(line);
      continue;
    }

    const body = line
      .replace(/^(PEOPLE|Народ|ΛΑΟΣ):\s*/i, '')
      .replace(/^__CREED_TITLE__\s*/i, '')
      .trim();

    if (/^(верую|πιστεύω|i believe)/i.test(body) || (lang === 'el' && /καὶ εἰς|ὁμολογῶ|προσδοκῶ/i.test(body))) {
      const clauses = splitCreedClausesFromBody(body);
      for (const clause of clauses) {
        const prefix =
          lang === 'en' ? 'PEOPLE: ' : lang === 'ru' ? 'Народ: ' : 'ΛΑΟΣ: ';
        out.push(`${prefix}${clause}`);
      }
      continue;
    }

    if (/^(и во единаго|и в духа|исповедую|чаю|καὶ εἰς|ὁμολογῶ|προσδοκῶ|and in one lord|and in the holy spirit|i confess|i look for)/i.test(body)) {
      const prefix =
        lang === 'en' ? 'PEOPLE: ' : lang === 'ru' ? 'Народ: ' : 'ΛΑΟΣ: ';
      out.push(`${prefix}${body}`);
      continue;
    }

    out.push(line);
  }
  return out;
}

function prefixOpeningDeaconRoles(
  lines: string[],
  lang: UiLanguage,
  sectionId: ChrysostomSectionId,
): string[] {
  if (sectionId !== 'opening') return lines;

  return lines.map((line) => {
    const trimmed = line.trim();
    if (/^(DEACON|ΔΙΑΚΟΝΟΣ|Диакон)\b/i.test(trimmed)) return line;
    if (lang === 'en' && /^master,?\s+give the blessing/i.test(trimmed)) {
      return `DEACON: ${trimmed}`;
    }
    if (lang === 'el' && /^εὐλ[όο]γησον,?\s+δ[έε]σποτα/i.test(trimmed.normalize('NFD').replace(/\p{M}/gu, ''))) {
      return `ΔΙΑΚΟΝΟΣ: ${trimmed}`;
    }
    if (lang === 'ru' && /^благослови,?\s+владыко/i.test(trimmed)) {
      return `Диакон: ${trimmed}`;
    }
    return line;
  });
}

function mergeOpeningRussianPriest(
  lines: string[],
  lang: UiLanguage,
  sectionId: ChrysostomSectionId,
): string[] {
  if (sectionId !== 'opening' || lang !== 'ru') return lines;

  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const next = lines[i + 1];
    if (
      /^Священник:/i.test(line) &&
      next &&
      !/^(Священник|Диакон|Хор|Чтец|Народ)\s*:/i.test(next.trim())
    ) {
      out.push(`${line.replace(/\s+$/, '')} ${next.trim()}`);
      i++;
      continue;
    }
    out.push(line);
  }
  return out;
}

/** Normalize paragraphs for one language within a section. */
export function normalizeLiturgyParagraphs(
  lines: string[],
  lang: UiLanguage,
  sectionId: ChrysostomSectionId,
  options?: { preserveLength?: boolean },
): string[] {
  let normalized = options?.preserveLength
    ? lines.map((line) => line.trim())
    : lines.flatMap((line) => splitEmbeddedRoles(line, lang));
  if (lang === 'ru') {
    normalized = normalized.map((line) => fixRussianWordBreaks(line));
  }
  normalized = normalized.map((line) => stripSectionJunk(line, lang));

  if (options?.preserveLength) {
    if (sectionId === 'opening') {
      normalized = prefixOpeningDeaconRoles(normalized, lang, sectionId);
    }
    return normalized;
  }

  if (lang === 'ru') {
    normalized = reassignRussianLitanyRoles(normalized, sectionId);
  }

  if (lang === 'el') {
    normalized = mergeGreekLitanyPetitions(normalized, sectionId);
  }

  if (sectionId === 'creed') {
    normalized = normalizeCreedParagraphs(normalized, lang);
  }

  normalized = prefixOpeningDeaconRoles(normalized, lang, sectionId);
  normalized = mergeOpeningRussianPriest(normalized, lang, sectionId);

  return normalized.filter((line) => line.trim().length > 0);
}
