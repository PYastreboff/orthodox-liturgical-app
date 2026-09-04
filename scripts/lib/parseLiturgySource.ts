/**
 * Parse GOARCH / congregational liturgy source files into display paragraphs.
 * Each paragraph is ideally one role line, heading, rubric, or speech block.
 */

const EN_ROLE = '(?:DEACON|PRIEST|CHOIR|PEOPLE|READER|Exclamation)';
const EN_ROLE_SPLIT = new RegExp(
  `(?=\\b${EN_ROLE}(?:\\s*\\([^)]*\\))?\\s*(?::|\\s))`,
  'gi',
);

const RU_ROLE = '(?:Священник|Диакон|Чтец|Народ|Хор|Сослужащие)';
const RU_ROLE_SPLIT = new RegExp(`(?=\\b${RU_ROLE}\\s*:?)`, 'gi');

export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function cleanParagraph(text: string): string {
  return normalizeWhitespace(
    text
      .replace(/Divine Liturgy of St John Chrysostom\s*-\s*\d+/gi, ' ')
      .replace(/\s+([,.;:!?])/g, '$1'),
  );
}

function isSkipLine(line: string): boolean {
  return (
    !line ||
    /^Books\b/i.test(line) ||
    /^Sources\b/i.test(line) ||
    /^This is the/i.test(line) ||
    /^Hieratikon/i.test(line) ||
    /^-\s*c\d+/i.test(line)
  );
}

function isBannerLine(line: string): boolean {
  return /^_{3,}/.test(line);
}

function isAllCapsHeading(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length < 4 || trimmed.length > 96) return false;
  if (/[a-zа-яё]/.test(trimmed)) return false;
  return /^[A-ZΑ-Ω0-9\s,'’"()–—\-&/]+$/.test(trimmed);
}

function normalizeEnglishRoleLine(line: string): string {
  let trimmed = line.trim();
  if (!trimmed) return trimmed;

  // "## PRIEST: text" exclamations
  if (/^##\s*/.test(trimmed)) {
    trimmed = trimmed.replace(/^##\s*/, '').trim();
  }

  if (/^CLERGY\s+or\s*:\s*CHOIR\s*$/i.test(trimmed)) {
    return '(Clergy or choir)';
  }

  const colonMatch = trimmed.match(
    /^(DEACON|PRIEST|CHOIR|PEOPLE|READER|Exclamation)(\s*\([^)]*\))?\s*:\s*(.*)$/i,
  );
  if (colonMatch) {
    const role = colonMatch[1]!.toUpperCase();
    const dir = colonMatch[2] ?? '';
    const speech = colonMatch[3]!.trim();
    return speech ? `${role}${dir}: ${speech}` : `${role}${dir}`;
  }

  const roleOnly = trimmed.match(/^(DEACON|PRIEST|CHOIR|PEOPLE|READER)(\s*\([^)]*\))?\s*$/i);
  if (roleOnly) {
    return `${roleOnly[1]!.toUpperCase()}${roleOnly[2] ?? ''}`;
  }

  const roleSpeech = trimmed.match(
    /^(DEACON|PRIEST|CHOIR|PEOPLE|READER)(\s*\([^)]*\))?\s+(.+)$/i,
  );
  if (roleSpeech) {
    return `${roleSpeech[1]!.toUpperCase()}${roleSpeech[2] ?? ''}: ${roleSpeech[3]!.trim()}`;
  }

  return trimmed;
}

function splitEnglishRoles(text: string): string[] {
  const parts = text.split(EN_ROLE_SPLIT).map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 1) return [normalizeEnglishRoleLine(text)];
  return parts.map(normalizeEnglishRoleLine).filter(Boolean);
}

export function splitRussianRoles(text: string): string[] {
  const parts = text.split(RU_ROLE_SPLIT).map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 1) return [cleanParagraph(text)];
  return parts.map(cleanParagraph).filter(Boolean);
}

function pushLogical(target: string[], line: string) {
  const trimmed = line.trim();
  if (!trimmed) return;
  const last = target[target.length - 1];
  if (
    last &&
    !/^(DEACON|PRIEST|CHOIR|PEOPLE|READER)\s*:/i.test(trimmed) &&
  !/^(DEACON|PRIEST|CHOIR|PEOPLE|READER)\s*$/i.test(trimmed) &&
    (!/[.!?:]$/.test(last) ||
      /^[a-z('"(\[]/.test(trimmed) ||
      (/:\s*$/.test(last) && /^[A-Z]/.test(trimmed)))
  ) {
    target[target.length - 1] = `${last} ${trimmed}`;
    return;
  }
  target.push(trimmed);
}

/** Merge physical lines into logical units, then split by speaker. */
export function parseEnglishBlock(block: string): string[] {
  const physical = block.split(/\r?\n/);
  const logical: string[] = [];
  let rolePending: string | null = null;
  let acc = '';

  const flushAcc = () => {
    if (!acc.trim()) return;
    pushLogical(logical, acc.trim());
    acc = '';
  };

  const flushRolePending = (speech: string) => {
    if (!rolePending) return;
    pushLogical(logical, `${rolePending}: ${speech}`);
    rolePending = null;
  };

  for (const raw of physical) {
    const line = raw.trim();
    if (isSkipLine(line)) continue;

    if (isBannerLine(line)) {
      flushAcc();
      rolePending = null;
      continue;
    }

    if (/^##\s*/.test(line)) {
      flushAcc();
      rolePending = null;
      logical.push(line.replace(/^##\s*/, '').trim());
      continue;
    }

    if (isAllCapsHeading(line) && !/^(DEACON|PRIEST|CHOIR|PEOPLE|READER)\b/i.test(line)) {
      flushAcc();
      rolePending = null;
      logical.push(line);
      continue;
    }

    const roleOnly = line.match(/^(DEACON|PRIEST|CHOIR|PEOPLE|READER)(\s*\([^)]*\))?\s*$/i);
    if (roleOnly) {
      flushAcc();
      rolePending = `${roleOnly[1]!.toUpperCase()}${roleOnly[2] ?? ''}`;
      continue;
    }

    const colonRole = line.match(
      /^(DEACON|PRIEST|CHOIR|PEOPLE|READER)(\s*\([^)]*\))?\s*:\s*(.*)$/i,
    );
    if (colonRole) {
      flushAcc();
      rolePending = null;
      const speech = colonRole[3]!.trim();
      if (speech) {
        logical.push(`${colonRole[1]!.toUpperCase()}${colonRole[2] ?? ''}: ${speech}`);
      } else {
        rolePending = `${colonRole[1]!.toUpperCase()}${colonRole[2] ?? ''}`;
      }
      continue;
    }

    if (rolePending) {
      flushRolePending(line);
      continue;
    }

    // Continuation of previous role line or wrapped speech
    if (/^[a-z('"(\[]/.test(line) && logical.length > 0) {
      pushLogical(logical, line);
      continue;
    }

    // Inline role boundaries inside a long PDF-merged line
    if (EN_ROLE_SPLIT.test(line)) {
      flushAcc();
      logical.push(...splitEnglishRoles(line));
      EN_ROLE_SPLIT.lastIndex = 0;
      continue;
    }

    if (!acc) {
      acc = line;
    } else if (/^[a-z('"(\[]/.test(line)) {
      acc += ` ${line}`;
    } else {
      flushAcc();
      acc = line;
    }
  }

  flushAcc();
  if (rolePending && acc) {
    flushRolePending(acc);
    acc = '';
  } else if (rolePending) {
    logical.push(rolePending);
  }
  flushAcc();

  const split: string[] = [];
  for (const item of logical) {
    if (EN_ROLE_SPLIT.test(item)) {
      split.push(...splitEnglishRoles(item));
      EN_ROLE_SPLIT.lastIndex = 0;
    } else {
      split.push(normalizeEnglishRoleLine(item));
    }
  }

  return postProcessEnglish(split.map(cleanParagraph).filter(Boolean));
}

function postProcessEnglish(paragraphs: string[]): string[] {
  const result: string[] = [];

  for (const paragraph of paragraphs) {
  // Kiss of peace banner merged into choir line
    if (/KISS OF PEACE AND CREED/i.test(paragraph)) {
      const rest = paragraph.replace(/^CHOIR:\s*Amen\.\s*/i, '').trim();
      if (/^CHOIR:\s*Amen/i.test(paragraph)) {
        result.push('CHOIR: Amen.');
      }
      result.push('KISS OF PEACE AND CREED');
      const afterBanner = rest.replace(/KISS OF PEACE AND CREED\s*/i, '').trim();
      if (afterBanner) {
        result.push(...splitEnglishRoles(afterBanner));
      }
      continue;
    }

    // Creed title + opening clause merged
    if (/^PEOPLE:\s*The Creed\s+I believe/i.test(paragraph)) {
      const body = paragraph.replace(/^PEOPLE:\s*The Creed\s*/i, '');
      result.push('PEOPLE: The Symbol of Faith');
      result.push(...splitCreedClauses(body, 'PEOPLE'));
      continue;
    }
    if (/^The Creed\s+I believe/i.test(paragraph)) {
      const body = paragraph.replace(/^The Creed\s*/i, '');
      result.push('The Symbol of Faith');
      result.push(...splitCreedClauses(body, 'PEOPLE'));
      continue;
    }

    // Lord's Prayer heading merged with text
    if (/The Lord'?s Prayer\s+Our Father/i.test(paragraph)) {
      const prayer = paragraph.replace(/^.*The Lord'?s Prayer\s+/i, '');
      if (!result.some((line) => /Lord'?s Prayer/i.test(line))) {
        result.push("The Lord's Prayer");
      }
      result.push(`PEOPLE: ${prayer}`);
      continue;
    }

    if (/^THE LORD'?S PRAYER$/i.test(paragraph)) {
      if (!result.some((line) => /Lord'?s Prayer/i.test(line))) {
        result.push("The Lord's Prayer");
      }
      continue;
    }

    // Trailing creed clause with choir amen
    if (/I look for the resurrection.*CHOIR:\s*Amen/i.test(paragraph)) {
      const [clause] = paragraph.split(/\s*CHOIR:\s*/i);
      if (clause?.trim()) result.push(clause.trim());
      result.push('CHOIR: Amen.');
      continue;
    }

    if (/^And grant us, Master.*and to say:$/i.test(paragraph)) {
      result.push(`PRIEST: ${paragraph}`);
      continue;
    }

    if (/and to say:\s*PEOPLE\s*$/i.test(paragraph)) {
      result.push(paragraph.replace(/\s*PEOPLE\s*$/i, '').trim());
      continue;
    }

    result.push(paragraph);
  }

  return result;
}

function splitCreedClauses(body: string, role?: string): string[] {
  const prefix = role ? `${role}: ` : '';
  const normalized = cleanParagraph(body);
  const clauses = normalized
    .split(
      /(?<=\.)\s+(?=And in one Lord|And in the Holy Spirit|I confess one baptism|I look for the resurrection|И во единаго|И в Духа|Исповедую|Чаю|Καὶ εἰς ἕνα|Καὶ εἰς τὸ Πνεῦμα|Καὶ εἰς τὸ πνεῦμα|Ὁμολογῶ|Προσδοκῶ)/i,
    )
    .map((clause) => cleanParagraph(clause))
    .filter(Boolean);

  if (clauses.length <= 1) {
    return [`${prefix}${normalized}`];
  }

  return clauses.map((clause) => `${prefix}${clause}`);
}

export function splitCreedClausesFromBody(body: string): string[] {
  return splitCreedClauses(body)
    .map((clause) => clause.replace(/^(PEOPLE|Народ|ΛΑΟΣ):\s*/i, '').trim())
    .filter(Boolean);
}

export function splitCreedParagraphs(paragraphs: string[]): string[] {
  const flattened: string[] = [];
  for (const paragraph of paragraphs) {
    if (/I believe|Верую|Πιστεύω/i.test(paragraph)) {
      flattened.push(...splitCreedClauses(paragraph.replace(/^(The Creed|Символ веры|Σύμβολον τῆς Πίστεως)\s*/i, '')));
    } else {
      flattened.push(paragraph);
    }
  }

  const title =
    paragraphs.find((p) => /^(The Creed|Символ|Σύμβολον|Symbol of Faith)/i.test(p))?.match(
      /^(The Creed|Символ веры|Σύμβολον τῆς Πίστεως|The Symbol of Faith)/i,
    )?.[0] ?? 'The Symbol of Faith';

  const body = flattened.filter((p) => !/^(The Creed|Символ|Σύμβολον)/i.test(p));
  return [title, ...body];
}

const GREEK_LINE = /[\u0370-\u03FF\u1F00-\u1FFF]/;

export function isGreekContentLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed || /^-\s*c\d+/i.test(trimmed)) return false;
  if (!GREEK_LINE.test(trimmed)) return false;
  const greekChars = (trimmed.match(/[\u0370-\u03FF\u1F00-\u1FFF]/g) ?? []).length;
  const latinChars = (trimmed.match(/[A-Za-z]/g) ?? []).length;
  if (latinChars > greekChars * 0.5) return false;
  return true;
}

/** Extract Greek (and role labels) from GOARCH gr-en skeleton lines. */
function extractGreekGrEnLine(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed || isSkipLine(trimmed)) return null;
  if (/^(Books|Sources|This is the|__________)/i.test(trimmed)) return null;

  const roleWithEnglish = trimmed.match(
    /^(ΔΙΑΚΟΝΟΣ|ΙΕΡΕΥΣ|ΧΟΡΟΣ|ΛΑΟΣ|ΑΝΑΓΝΩΣΤΗΣ)(?:\s+[A-Z][A-Za-z]*)?$/iu,
  );
  if (roleWithEnglish) return roleWithEnglish[1]!.toUpperCase();

  if (!GREEK_LINE.test(trimmed)) return null;

  const greekOnly = trimmed
    .replace(/\.\s+(?=[A-Z][a-z]).*$/u, '.')
    .replace(/\s+[A-Z][A-Za-z0-9 ,;'"()–—\-]*$/u, '')
    .trim();
  if (!greekOnly || !GREEK_LINE.test(greekOnly)) return null;
  return greekOnly;
}

export function parseGreekBlock(block: string): string[] {
  const paragraphs: string[] = [];
  let rolePending: string | null = null;

  for (const rawLine of block.split(/\r?\n/)) {
    const extracted = extractGreekGrEnLine(rawLine);
    if (!extracted) continue;
    const line = extracted;

    const roleSpeech = line.match(/^(ΔΙΑΚΟΝΟΣ|ΙΕΡΕΥΣ|ΧΟΡΟΣ|ΛΑΟΣ|ΑΝΑΓΝΩΣΤΗΣ)\s*[:·]\s*(.+)$/i);
    if (roleSpeech) {
      rolePending = null;
      paragraphs.push(`${roleSpeech[1]!.toUpperCase()}: ${cleanParagraph(roleSpeech[2]!)}`);
      continue;
    }

    const roleOnly = /^(ΔΙΑΚΟΝΟΣ|ΙΕΡΕΥΣ|ΧΟΡΟΣ|ΛΑΟΣ|ΑΝΑΓΝΩΣΤΗΣ)$/i.test(line);
    if (roleOnly) {
      rolePending = line.toUpperCase();
      continue;
    }

    if (rolePending) {
      paragraphs.push(`${rolePending}: ${cleanParagraph(line)}`);
      rolePending = null;
      continue;
    }

    paragraphs.push(cleanParagraph(line));
  }

  return paragraphs.filter(Boolean);
}

export function parseRussianBlock(block: string): string[] {
  const physical = block.split(/\r?\n/);
  const logical: string[] = [];
  let rolePending: string | null = null;
  let acc = '';

  const flushAcc = () => {
    if (!acc.trim()) return;
    logical.push(acc.trim());
    acc = '';
  };

  for (const raw of physical) {
    const line = raw.trim();
    if (!line || isSkipLine(line)) continue;
    if (isBannerLine(line)) {
      flushAcc();
      rolePending = null;
      continue;
    }

    const colonRole = line.match(/^(Священник|Диакон|Чтец|Народ|Хор|Сослужащие)\s*:\s*(.*)$/i);
    if (colonRole) {
      flushAcc();
      const speech = colonRole[2]!.trim();
      if (speech) {
        logical.push(`${colonRole[1]}: ${speech}`);
        rolePending = null;
      } else {
        rolePending = `${colonRole[1]}:`;
      }
      continue;
    }

    if (rolePending) {
      flushAcc();
      logical.push(`${rolePending} ${line}`);
      rolePending = null;
      continue;
    }

    if (RU_ROLE_SPLIT.test(line)) {
      flushAcc();
      logical.push(...splitRussianRoles(line));
      RU_ROLE_SPLIT.lastIndex = 0;
      continue;
    }

    if (!acc) {
      acc = line;
    } else if (/^[а-яё(«"']/i.test(line)) {
      acc += ` ${line}`;
    } else {
      flushAcc();
      acc = line;
    }
  }

  flushAcc();

  const split: string[] = [];
  for (const item of logical) {
    if (RU_ROLE_SPLIT.test(item)) {
      split.push(...splitRussianRoles(item));
      RU_ROLE_SPLIT.lastIndex = 0;
    } else {
      split.push(item);
    }
  }

  return split.map(cleanParagraph).filter(Boolean);
}

export function parseLiturgyBlock(block: string, lang: 'en' | 'ru' | 'el'): string[] {
  if (lang === 'en') return parseEnglishBlock(block);
  if (lang === 'ru') return parseRussianBlock(block);
  return parseGreekBlock(block);
}
