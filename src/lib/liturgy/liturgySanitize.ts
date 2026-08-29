import type { UiLanguage } from '../../i18n/types';
import type { ChrysostomSectionId } from './chrysostomLiturgy';

export const CREED_TITLE_MARKER = '__CREED_TITLE__';
export const LORDS_PRAYER_TITLE_MARKER = '__LORDS_PRAYER_TITLE__';

const ROLE_JUNK =
  /^(CLERGY|DEACON|PRIEST|CHOIR|PEOPLE|READER|CELEBRANT)(\s*\([^)]*\))?\s*:\s*(or:?|or)\s*$/i;
const ROLE_ONLY = /^(CLERGY|DEACON|PRIEST|CHOIR|PEOPLE|READER|CELEBRANT)(\s*\([^)]*\))?\s*$/i;

function isInlineSectionBanner(text: string): boolean {
  const t = text.trim();
  if (t.length < 4 || t.length > 96) return false;
  if (/[a-zа-яё]/.test(t)) return false;
  return /^[A-ZΑ-Ω0-9\s,.'’"()–—\-&/]+$/.test(t);
}

function normalizeSpaces(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function stripEmbeddedHeadings(text: string): string {
  return normalizeSpaces(
    text
      .replace(/\s*\[(?:SAAS|GOA)\]\s*/gi, ' ')
      .replace(/\s*\(See Liturgy Variables\.\)\s*/gi, ' ')
      .replace(/\s*See Liturgy Variables\.\s*/gi, ' ')
      .replace(/\s*\(The litanies of[^)]*omitted\.\)\s*/gi, ' ')
      .replace(/PRAYER OF (?:FIRST|SECOND|THIRD) ANTIPHON\s*/gi, '')
      .replace(/^PRAYER OF (?:FIRST|SECOND|THIRD) ANTIPHON\s*/gi, '')
      .replace(
        /PRAYER OF THE (?:TRISAGIOS HYMN|GOSPEL|CHERUBIC HYMN|CATECHUMENS|FAITHFUL|OFFERTORY)\s*/gi,
        '',
      )
      .replace(/\s*Small Litany\s*$/gi, '')
      .replace(/\s*The Gospel\s*$/gi, '')
      .replace(/\s*Trisagion Hymn\s*$/gi, '')
      .replace(/The \d+(?:st|nd|rd|th) Antiphon\s*/gi, '')
      .replace(/Entrance Hymn\.\s*(?:Mode \d+\.\s*)?/gi, '')
      .replace(/Hymns after the Entrance\.\s*/gi, '')
      .replace(/Alleluia before Gospel\s*/gi, '')
      .replace(/Communion Hymn\s*/gi, '')
      .replace(/Hymn (?:to the Theotokos|after Holy Communion)\.?\s*/gi, '')
      .replace(/Prokeimenon\.\s*/gi, '')
      .replace(/The reading is from \(See Liturgy Variables\.\)\s*/gi, '')
      .replace(
        /The reading is from the holy Gospel according to \(See Liturgy Variables\.\)\s*/gi,
        'The reading is from the holy Gospel. ',
      )
      .replace(/and ever…/gi, 'and ever and to the ages of ages')
      .replace(/\s*_{3,}\s*/g, ' ')
      .replace(/\s*\[[^\]]*\]\s*/g, ' '),
  );
}

function greekStartsWith(text: string, prefix: string): boolean {
  return normalizeGreek(text).startsWith(normalizeGreek(prefix));
}

function isCreedClause(text: string): boolean {
  const speech = stripRolePrefix(text.trim());
  return (
    /^i believe in one god\b/i.test(speech) ||
    /^and in one lord\b/i.test(speech) ||
    /^who for us\b/i.test(speech) ||
    /^and in the holy spirit\b/i.test(speech) ||
    /^i acknowledge one baptism\b/i.test(speech) ||
    /^i confess one baptism\b/i.test(speech) ||
    /^i look for the resurrection\b/i.test(speech) ||
    greekStartsWith(speech, 'πιστεύω εἰς') ||
    greekStartsWith(speech, 'πιστευω εις') ||
    greekStartsWith(speech, 'καὶ εἰς') ||
    greekStartsWith(speech, 'τὸν δι') ||
    greekStartsWith(speech, 'ὁμολογῶ') ||
    greekStartsWith(speech, 'προσδοκῶ') ||
    /^верую во едина/i.test(speech) ||
    /^и во единаго/i.test(speech) ||
    /^ради нас/i.test(speech) ||
    /^и в единаго/i.test(speech) ||
    /^исповедую/i.test(speech) ||
    /^чаю/i.test(speech)
  );
}

function isLordsPrayerText(text: string): boolean {
  const t = text.trim();
  const speech = stripRolePrefix(t);
  return (
    /^our father\b/i.test(t) ||
    /^our father\b/i.test(speech) ||
    greekStartsWith(t, 'πάτερ ἡμῶν') ||
    greekStartsWith(speech, 'πάτερ ἡμῶν') ||
    /^отче наш/i.test(t) ||
    /^отче наш/i.test(speech)
  );
}

function normalizeGreek(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

function isCreedTitleLine(text: string): boolean {
  const t = text.trim();
  if (/^PEOPLE:\s*The Symbol of Faith$/i.test(t)) return true;
  if (/^(the symbol of faith|symbol of faith|символ веры)$/i.test(t)) return true;
  if (/^σ[ύυ]?μβολον/i.test(t)) return true;
  const compact = normalizeGreek(t).replace(/[\s·.,:;]/g, '');
  return compact.includes('συμβολον') && compact.includes('πιστεως');
}

function isLordsPrayerTitleLine(text: string): boolean {
  return /^the lord'?s prayer$/i.test(text.trim());
}

function stripRolePrefix(text: string): string {
  return text
    .replace(/^(PEOPLE|CHOIR|ΛΑΟΣ|ΧΟΡΟΣ|Народ|Хор)(\s*\([^)]*\))?\s*:\s*/i, '')
    .trim();
}

/** Clean a single liturgy line. Returns null to drop the line. */
export function sanitizeLiturgyLine(
  line: string,
  lang: UiLanguage,
  _sectionId?: ChrysostomSectionId,
): string | null {
  let text = normalizeSpaces(line);
  if (!text) return null;

  if (text === CREED_TITLE_MARKER || text === LORDS_PRAYER_TITLE_MARKER) return text;

  if (ROLE_JUNK.test(text) || ROLE_ONLY.test(text)) return null;
  if (/^KISS OF PEACE AND CREED$/i.test(text)) return null;
  if (/^_{3,}/.test(text)) return null;
  if (isInlineSectionBanner(text)) return null;

  if (lang === 'el' && /^the symbol of faith$/i.test(text)) return null;

  if (/^PEOPLE:\s*The Symbol of Faith$/i.test(text)) return null;
  if (isCreedTitleLine(text) && _sectionId === 'creed') return null;

  if (/Or, for concelebrations:/i.test(text)) {
    text = text.split(/Or, for concelebrations:/i)[0]!.trim();
  }

  text = stripEmbeddedHeadings(text);

  if (/^CHOIR(\s*\([^)]*\))?\s*:\s*$/i.test(text)) return null;
  if (/^READER(\s*\([^)]*\))?\s*:\s*$/i.test(text)) return null;
  if (/^DEACON(\s*\([^)]*\))?\s*:\s*$/i.test(text)) return null;

  const speechOnly = text.replace(/^(CLERGY|DEACON|PRIEST|CHOIR|PEOPLE|READER)(\s*\([^)]*\))?\s*:\s*/i, '');
  if (text !== speechOnly && !speechOnly.trim()) return null;

  if (!text) return null;
  if (/^_{3,}$/.test(text)) return null;

  if (lang === 'ru') {
    text = text
      .replace(/\s*\d+-й антифон[^.]*$/i, '')
      .replace(/\s*(?:великая|малая|сугубая|просительная)(?:\s*\([^)]*\))?\s*ектения[^.]*$/i, '')
      .replace(/\s*ектения и молитва[^.]*$/i, '')
      .replace(/\s*проповедь[^.]*$/i, '')
      .replace(/\s+В великие \(Двунадесятые\)[^.]*$/i, '')
      .replace(/\s+оглашенных\)[^.]*$/i, '')
      .replace(/\s+верных вторая[^.]*$/i, '')
      .replace(/\s+по причащении[^.]*$/i, '')
      .replace(/\s+Диакон читает Евангелие[^.]*$/i, '')
      .replace(/\s+По окончании чтения[^.]*$/i, '')
      .trim();
  }

  return text;
}

function insertCreedTitle(lines: string[]): string[] {
  const out: string[] = [];
  let titleInserted = false;

  for (const line of lines) {
    if (line === CREED_TITLE_MARKER) continue;
    if (isCreedTitleLine(line)) continue;

    if (!titleInserted && (isCreedClause(line) || isCreedClause(stripRolePrefix(line)))) {
      out.push(CREED_TITLE_MARKER);
      titleInserted = true;
    }

    out.push(line);
  }

  return out;
}

function insertLordsPrayerTitle(lines: string[]): string[] {
  const out: string[] = [];
  let titleInserted = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]!;

    if (line === LORDS_PRAYER_TITLE_MARKER) {
      if (!titleInserted) {
        out.push(line);
        titleInserted = true;
      }
      continue;
    }

    if (isLordsPrayerTitleLine(line)) continue;

    if (/and to say:\s*The Lord'?s Prayer\s*$/i.test(line)) {
      line = line.replace(/\s*and to say:\s*The Lord'?s Prayer\s*$/i, '.');
    }

    if (!titleInserted && isLordsPrayerText(line)) {
      out.push(LORDS_PRAYER_TITLE_MARKER);
      titleInserted = true;
    }

    out.push(line);
  }

  return out;
}

function expandMarkerLines(lines: string[]): string[] {
  const out: string[] = [];
  for (const line of lines) {
    if (line.startsWith(`${CREED_TITLE_MARKER} `)) {
      out.push(CREED_TITLE_MARKER, line.slice(CREED_TITLE_MARKER.length).trim());
      continue;
    }
    if (line.startsWith(`${LORDS_PRAYER_TITLE_MARKER} `)) {
      out.push(LORDS_PRAYER_TITLE_MARKER, line.slice(LORDS_PRAYER_TITLE_MARKER.length).trim());
      continue;
    }
    out.push(line);
  }
  return out;
}

/** Sanitize a full section for one language. */
export function sanitizeLiturgyLines(
  lines: string[],
  lang: UiLanguage,
  sectionId: ChrysostomSectionId,
): string[] {
  const cleaned = lines
    .map((line) => sanitizeLiturgyLine(line, lang, sectionId))
    .filter((line): line is string => line != null);

  const sectioned =
    sectionId === 'creed'
      ? insertCreedTitle(cleaned)
      : sectionId === 'anaphora'
        ? insertLordsPrayerTitle(cleaned)
        : cleaned;

  return expandMarkerLines(sectioned);
}

export function localizedDevotionalTitleKey(marker: string): string | null {
  if (marker === CREED_TITLE_MARKER) return 'liturgy.chrysostom.creedTitle';
  if (marker === LORDS_PRAYER_TITLE_MARKER) return 'liturgy.chrysostom.lordsPrayerTitle';
  return null;
}

export function isDevotionalTitleMarker(line: string): boolean {
  return line === CREED_TITLE_MARKER || line === LORDS_PRAYER_TITLE_MARKER;
}

/** Split combined marker + prayer lines produced by imperfect alignment. */
export function expandLiturgyDisplayLines(line: string): string[] {
  const trimmed = line.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith(`${CREED_TITLE_MARKER} `)) {
    return [CREED_TITLE_MARKER, trimmed.slice(CREED_TITLE_MARKER.length).trim()];
  }
  if (trimmed.startsWith(`${LORDS_PRAYER_TITLE_MARKER} `)) {
    return [LORDS_PRAYER_TITLE_MARKER, trimmed.slice(LORDS_PRAYER_TITLE_MARKER.length).trim()];
  }
  return [trimmed];
}

export { isCreedClause, isLordsPrayerText, stripRolePrefix };
