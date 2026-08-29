import type { UiLanguage } from '../../i18n/types';
import type { ChrysostomSectionId } from './chrysostomLiturgy';
import {
  CREED_TITLE_MARKER,
  isDevotionalTitleMarker,
  localizedDevotionalTitleKey,
  LORDS_PRAYER_TITLE_MARKER,
  stripRolePrefix,
} from './liturgySanitize';

export type LiturgyRole = 'priest' | 'deacon' | 'choir' | 'people' | 'reader' | 'celebrant' | 'clergy';

export type ParsedLiturgyLine =
  | { kind: 'banner'; text: string }
  | { kind: 'heading'; text: string }
  | { kind: 'role-only'; role: LiturgyRole; label: string; direction?: string }
  | { kind: 'role-speech'; role: LiturgyRole; label: string; speech: string; direction?: string }
  | { kind: 'devotional'; variant: 'title' | 'creed' | 'prayer'; text: string; titleKey?: string }
  | { kind: 'rubric'; text: string }
  | { kind: 'speech'; text: string };

const EN_ROLE_SPEECH =
  /^(Priest|Deacon|Choir|People|Reader|Celebrant|Clergy)(\s*\(([^)]+)\))?\s*:\s*(.+)$/i;
const EN_ROLE_ONLY =
  /^(Priest|Deacon|Choir|People|Reader|Celebrant|Clergy)(\s*\(([^)]+)\))?\s*$/i;

const RU_ROLE_SPEECH =
  /^(Священник|Диакон|Чтец|Народ|Хор|Сослужащие)\s*:\s*(.+)$/i;
const RU_ROLE_ONLY = /^(Священник|Диакон|Чтец|Народ|Хор)\s*:?\s*$/i;

const EL_ROLE_SPEECH =
  /^(ΔΙΑΚΟΝΟΣ|ΙΕΡΕΥΣ|ΧΟΡΟΣ|ΛΑΟΣ|ΑΝΑΓΝΩΣΤΗΣ)\s*[:·]\s*(.+)$/i;
const EL_ROLE_ONLY = /^(ΔΙΑΚΟΝΟΣ|ΙΕΡΕΥΣ|ΧΟΡΟΣ|ΛΑΟΣ|ΑΝΑΓΝΩΣΤΗΣ)$/;

function normalizeRole(word: string): LiturgyRole {
  const key = word.toLowerCase();
  if (key.includes('priest') || key.includes('священ') || key === 'ιερευς') return 'priest';
  if (key.includes('deacon') || key.includes('диакон') || key === 'διακονος') return 'deacon';
  if (key.includes('choir') || key.includes('хор') || key === 'χορος') return 'choir';
  if (key.includes('people') || key.includes('народ') || key === 'λαος') return 'people';
  if (key.includes('reader') || key.includes('чтец') || key === 'αναγνωστης') return 'reader';
  if (key.includes('clergy')) return 'clergy';
  return 'celebrant';
}

function isCreedTitle(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed === CREED_TITLE_MARKER) return true;
  return /^(the symbol of faith|symbol of faith|символ веры|σύμβολον τῆς πίστεως|συμβολον της πιστεως)$/i.test(
    trimmed,
  );
}

function isLordsPrayerTitle(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed === LORDS_PRAYER_TITLE_MARKER) return true;
  return /^the lord'?s prayer$/i.test(trimmed);
}

function devotionalTitle(line: string): ParsedLiturgyLine {
  const markerKey = localizedDevotionalTitleKey(line.trim());
  if (markerKey) {
    return { kind: 'devotional', variant: 'title', text: '', titleKey: markerKey };
  }
  return { kind: 'devotional', variant: 'title', text: line.trim() };
}

function devotionalFromSpeech(speech: string): ParsedLiturgyLine | null {
  const trimmed = speech.trim();
  if (isCreedTitle(trimmed)) return devotionalTitle(trimmed);
  if (isLordsPrayerTitle(trimmed)) return devotionalTitle(trimmed);
  if (isLordsPrayerText(trimmed)) {
    return { kind: 'devotional', variant: 'prayer', text: stripRolePrefix(trimmed) };
  }
  if (isCreedText(trimmed)) {
    return { kind: 'devotional', variant: 'creed', text: stripRolePrefix(trimmed) };
  }
  return null;
}

function devotionalFromLine(line: string): ParsedLiturgyLine | null {
  const trimmed = line.trim();
  if (isDevotionalTitleMarker(trimmed)) return devotionalTitle(trimmed);
  if (isCreedTitle(trimmed)) return null;
  if (isLordsPrayerTitle(trimmed)) return null;
  if (isLordsPrayerText(trimmed)) {
    return { kind: 'devotional', variant: 'prayer', text: stripRolePrefix(trimmed) };
  }
  if (isCreedText(trimmed)) {
    return { kind: 'devotional', variant: 'creed', text: stripRolePrefix(trimmed) };
  }
  return null;
}

function isCreedText(text: string): boolean {
  const speech = stripRolePrefix(text.trim());
  return (
    /^i believe in one god\b/i.test(speech) ||
    /^and in one lord\b/i.test(speech) ||
    /^who for us\b/i.test(speech) ||
    /^and in the holy spirit\b/i.test(speech) ||
    /^i acknowledge one baptism\b/i.test(speech) ||
    /^i confess one baptism\b/i.test(speech) ||
    /^i look for the resurrection\b/i.test(speech) ||
    /^πιστεύω εἰς/i.test(speech) ||
    /^πιστευω εις/i.test(speech) ||
    /^καὶ εἰς ἕνα/i.test(speech) ||
    /^καὶ εἰς τὸ πνεῦμα/i.test(speech) ||
    /^τὸν δι/i.test(speech) ||
    /^ὁμολογῶ/i.test(speech) ||
    /^προσδοκῶ/i.test(speech) ||
    /^верую во едина/i.test(speech) ||
    /^и во единаго\b/i.test(speech) ||
    /^ради нас/i.test(speech) ||
    /^и в единаго/i.test(speech) ||
    /^исповедую\b/i.test(speech) ||
    /^чаю\b/i.test(speech)
  );
}

function isLordsPrayerText(text: string): boolean {
  const speech = stripRolePrefix(text.trim());
  return (
    /^our father\b/i.test(speech) ||
    /^πάτερ ἡμῶν/i.test(speech) ||
    /^πατερ ημων/i.test(speech) ||
    /^отче наш/i.test(speech)
  );
}

function isCongregationalRole(role: LiturgyRole): boolean {
  return role === 'people' || role === 'choir';
}

function isBannerLine(trimmed: string): boolean {
  return /^_{4,}/.test(trimmed);
}

function isHeadingLine(trimmed: string): boolean {
  if (trimmed.length < 4 || trimmed.length > 96) return false;
  if (/[a-zа-яёα-ωά-ώ]/.test(trimmed)) return false;
  return /^[A-ZΑ-Ω0-9\s,.'’"()–—\-&/]+$/.test(trimmed);
}

function isRubricLine(trimmed: string): boolean {
  if (trimmed.startsWith('(') && trimmed.endsWith(')')) return true;
  if (/^(People|Deacon|Priest|Reader|Choir|Clergy)(\s*\([^)]*\))?\s*:/i.test(trimmed)) return false;
  if (trimmed.endsWith(':') && !RU_ROLE_ONLY.test(trimmed)) return true;
  return false;
}

function isLitanyDeaconLine(trimmed: string, lang: UiLanguage): boolean {
  if (lang === 'en') {
    return /^in peace let us pray/i.test(trimmed) || /^let us pray to the lord/i.test(trimmed);
  }
  if (lang === 'el') {
    return /^Ἐν εἰρήνῃ τοῦ Κυρίου δεηθῶμεν/i.test(trimmed);
  }
  if (lang === 'ru') {
    return /^миром.*господу помолимся/i.test(trimmed);
  }
  return false;
}

/** Parse one liturgy paragraph into a display block. */
export function parseLiturgyLine(line: string, lang: UiLanguage): ParsedLiturgyLine {
  const trimmed = line.trim();
  if (!trimmed) return { kind: 'speech', text: '' };

  if (isBannerLine(trimmed) || isHeadingLine(trimmed)) {
    return { kind: 'speech', text: '' };
  }

  const devotional = devotionalFromLine(trimmed);
  if (devotional) return devotional;

  if (lang === 'en') {
    const speechMatch = trimmed.match(EN_ROLE_SPEECH);
    if (speechMatch) {
      const speech = speechMatch[4].trim();
      const congregationalDevotional = isCongregationalRole(normalizeRole(speechMatch[1]))
        ? devotionalFromSpeech(speech)
        : null;
      if (congregationalDevotional) return congregationalDevotional;

      const role = normalizeRole(speechMatch[1]);
      return {
        kind: 'role-speech',
        role,
        label: speechMatch[1].toUpperCase(),
        direction: speechMatch[3]?.trim(),
        speech: speechMatch[4].trim(),
      };
    }
    const roleOnly = trimmed.match(EN_ROLE_ONLY);
    if (roleOnly) {
      return {
        kind: 'role-only',
        role: normalizeRole(roleOnly[1]),
        label: roleOnly[1].toUpperCase(),
        direction: roleOnly[3]?.trim(),
      };
    }
    if (isLitanyDeaconLine(trimmed, 'en')) {
      return { kind: 'role-speech', role: 'deacon', label: 'DEACON', speech: trimmed };
    }
  }

  if (lang === 'ru') {
    const speechMatch = trimmed.match(RU_ROLE_SPEECH);
    if (speechMatch) {
      const speech = speechMatch[2].trim();
      const congregationalDevotional = isCongregationalRole(normalizeRole(speechMatch[1]))
        ? devotionalFromSpeech(speech)
        : null;
      if (congregationalDevotional) return congregationalDevotional;

      const role = normalizeRole(speechMatch[1]);
      return {
        kind: 'role-speech',
        role,
        label: speechMatch[1],
        speech: speech,
      };
    }
    const roleOnly = trimmed.match(RU_ROLE_ONLY);
    if (roleOnly) {
      return {
        kind: 'role-only',
        role: normalizeRole(roleOnly[1]),
        label: roleOnly[1],
      };
    }
  }

  if (lang === 'el') {
    const speechMatch = trimmed.match(EL_ROLE_SPEECH);
    if (speechMatch) {
      const speech = speechMatch[2].trim();
      const congregationalDevotional = isCongregationalRole(normalizeRole(speechMatch[1]))
        ? devotionalFromSpeech(speech)
        : null;
      if (congregationalDevotional) return congregationalDevotional;

      const role = normalizeRole(speechMatch[1]);
      return {
        kind: 'role-speech',
        role,
        label: speechMatch[1].toUpperCase(),
        speech: speech,
      };
    }
    if (EL_ROLE_ONLY.test(trimmed)) {
      return {
        kind: 'role-only',
        role: normalizeRole(trimmed),
        label: trimmed,
      };
    }
    if (isLitanyDeaconLine(trimmed, 'el')) {
      return { kind: 'role-speech', role: 'deacon', label: 'ΔΙΑΚΟΝΟΣ', speech: trimmed };
    }
  }

  if (isHeadingLine(trimmed)) {
    return { kind: 'speech', text: '' };
  }

  if (isRubricLine(trimmed)) {
    return { kind: 'rubric', text: trimmed };
  }

  return { kind: 'speech', text: trimmed };
}

export function liturgyRoleLabelKey(role: LiturgyRole): string {
  switch (role) {
    case 'priest':
      return 'liturgy.chrysostom.rolePriest';
    case 'deacon':
      return 'liturgy.chrysostom.roleDeacon';
    case 'choir':
      return 'liturgy.chrysostom.roleChoir';
    case 'people':
      return 'liturgy.chrysostom.rolePeople';
    case 'reader':
      return 'liturgy.chrysostom.roleReader';
    case 'clergy':
      return 'liturgy.chrysostom.roleClergy';
    default:
      return 'liturgy.chrysostom.roleCelebrant';
  }
}
