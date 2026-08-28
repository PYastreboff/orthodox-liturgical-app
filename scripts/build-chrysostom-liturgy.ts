/**
 * Build data/liturgy/chrysostom-liturgy.json — full fixed parts in EN (GOARCH), RU, EL.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const sourcesDir = join(root, 'scripts/liturgy-sources');
const outFile = join(root, 'data/liturgy/chrysostom-liturgy.json');

const SECTION_IDS = [
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

type SectionId = (typeof SECTION_IDS)[number];
type Lang = 'en' | 'ru' | 'el';

type LangConfig = {
  file: string;
  markers: { id: SectionId; pattern: RegExp }[];
  /** Extract only Greek lines from GOARCH gr-en interleaved file. */
  greekOnly?: boolean;
};

const LANGUAGE_CONFIG: Record<Lang, LangConfig> = {
  en: {
    file: 'chrysostom-en-goarch.txt',
    markers: [
      { id: 'opening', pattern: /ENARXIS, PEACE LITANY/i },
      { id: 'great_litany', pattern: /In peace let us pray to the Lord/i },
      { id: 'antiphons', pattern: /^THE ENTRANCE$/i },
      { id: 'readings', pattern: /Epistle Reading/i },
      { id: 'cherubic', pattern: /ENTRANCE OF THE HOLY GIFTS/i },
      { id: 'creed', pattern: /KISS OF PEACE AND CREED|The Creed I believe/i },
      { id: 'anaphora', pattern: /HOLY ANAPHORA/i },
      { id: 'communion', pattern: /ELEVATION – FRACTION/i },
      { id: 'dismissal', pattern: /^THANKSGIVING$/i },
    ],
  },
  ru: {
    file: 'chrysostom-ru.txt',
    markers: [
      { id: 'opening', pattern: /Благослови, владыко/i },
      { id: 'great_litany', pattern: /Миром.*Господу помолимся/i },
      { id: 'antiphons', pattern: /малый вход.*евангели/i },
      { id: 'readings', pattern: /^апостол$/i },
      { id: 'cherubic', pattern: /херувимская песнь и великий вход/i },
      { id: 'creed', pattern: /символ веры/i },
      { id: 'anaphora', pattern: /евхаристическая молитва.*анафора/i },
      { id: 'communion', pattern: /^причащение$/i },
      { id: 'dismissal', pattern: /заключительное благословение и отпуст/i },
    ],
  },
  el: {
    file: 'chrysostom-gr-en-goarch.txt',
    greekOnly: true,
    markers: [
      { id: 'opening', pattern: /Εὐλόγησον, Δέσποτα/ },
      { id: 'great_litany', pattern: /Ἐν εἰρήνῃ τοῦ Κυρίου δεηθῶμεν/ },
      { id: 'antiphons', pattern: /^Η ΕΙΣΟΔΟΣ$/ },
      { id: 'readings', pattern: /ΕΥΧΗ ΤΟΥ ΕΥΑΓΓΕΛΙΟΥ|Τὸ Εὐαγγέλιον/ },
      { id: 'cherubic', pattern: /Η ΕΙΣΟΔΟΣ ΤΩΝ ΤΙΜΙΩΝ ΔΩΡΩΝ/ },
      { id: 'creed', pattern: /Σύμβολον τῆς Πίστεως/ },
      { id: 'anaphora', pattern: /Η ΑΓΙΑ ΑΝΑΦΟΡΑ/ },
      { id: 'communion', pattern: /ΥΨΩΣΙΣ – ΜΕΛΙΣΜΟΣ/ },
      { id: 'dismissal', pattern: /^ΕΥΧΑΡΙΣΤΙΑ$/ },
    ],
  },
};

const GREEK_LINE = /[\u0370-\u03FF\u1F00-\u1FFF]/;
const SKIP_LINE = /^-\s*c\d+/i;

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function cleanParagraph(text: string): string {
  return normalizeWhitespace(
    text
      .replace(/Divine Liturgy of St John Chrysostom\s*-\s*\d+/gi, ' ')
      .replace(/\s+([,.;:!?])/g, '$1'),
  );
}

function splitCreedParagraphs(paragraphs: string[]): string[] {
  const joined = paragraphs.join(' ');
  const titleMatch = joined.match(/^(The Creed|Символ веры|Σύμβολον τῆς Πίστεως)\s*/i);
  const title = titleMatch?.[1] ?? 'The Symbol of Faith';
  const body = joined.replace(/^(The Creed|Символ веры|Σύμβολον τῆς Πίστεως)\s*/i, '');
  const clauses = body
    .split(/(?<=\.)\s+(?=And in |I confess|I look|И во |Исповедую|Чаю|Καὶ εἰς |Ὁμολογῶ|Προσδοκῶ)/i)
    .map((clause) => cleanParagraph(clause))
    .filter(Boolean);
  return [title, ...clauses];
}

function isGreekContentLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed || SKIP_LINE.test(trimmed)) return false;
  if (!GREEK_LINE.test(trimmed)) return false;
  // Skip all-caps Greek role headers without sentence punctuation.
  if (/^[Α-ΩΆ-ώ\s]+$/.test(trimmed) && trimmed.length < 40 && !/[,.;·]/.test(trimmed)) {
    return false;
  }
  return true;
}

function extractGreekParagraphs(block: string): string[] {
  const paragraphs: string[] = [];
  for (const rawLine of block.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || SKIP_LINE.test(line)) continue;
    if (!GREEK_LINE.test(line)) continue;
    if (/^(Books|Sources|This is the|__________)/i.test(line)) continue;
    const greekChars = (line.match(/[\u0370-\u03FF\u1F00-\u1FFF]/g) ?? []).length;
    const latinChars = (line.match(/[A-Za-z]/g) ?? []).length;
    if (latinChars > greekChars * 0.5) continue;
    paragraphs.push(cleanParagraph(line));
  }
  return paragraphs;
}

function preprocessLines(text: string, lang: Lang, greekOnly?: boolean): string[] {
  if (!greekOnly) return text.split(/\r?\n/);
  return extractGreekParagraphs(text);
}

function splitIntoParagraphs(block: string, lang: Lang): string[] {
  const raw = block
    .split(/\n\s*\n/)
    .map((part) => cleanParagraph(part))
    .filter(Boolean);

  const paragraphs: string[] = [];
  for (const part of raw) {
    const roleSplit = part.split(
      /(?=(?:People|Deacon|Priest|Reader|Choir|Exclamation|CLERGY|Диакон|Священник|Хор|Чтец)\s*(?:\([^)]*\))?\s*:)|(?=\b(?:DEACON|PRIEST|CHOIR|PEOPLE|READER)\b)/i,
    );
    for (const piece of roleSplit) {
      const line = cleanParagraph(piece);
      if (line) paragraphs.push(line);
    }
  }

  if (lang === 'el' && paragraphs.length === 0) {
    return block
      .split(/\n/)
      .map((l) => cleanParagraph(l))
      .filter((l) => isGreekContentLine(l));
  }

  return paragraphs;
}

function findSectionStarts(lines: string[], markers: LangConfig['markers']): Map<SectionId, number> {
  const starts = new Map<SectionId, number>();

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

function buildLanguageSections(lang: Lang): Map<SectionId, string[]> {
  const config = LANGUAGE_CONFIG[lang];
  const text = readFileSync(join(sourcesDir, config.file), 'utf8');
  const rawLines = text.split(/\r?\n/);
  const starts = findSectionStarts(rawLines, config.markers);

  for (const id of SECTION_IDS) {
    if (!starts.has(id)) {
      throw new Error(`[${lang}] Missing section marker for "${id}"`);
    }
  }

  const sections = new Map<SectionId, string[]>();
  for (let i = 0; i < SECTION_IDS.length; i++) {
    const id = SECTION_IDS[i]!;
    const start = starts.get(id)!;
    const end =
      i + 1 < SECTION_IDS.length ? starts.get(SECTION_IDS[i + 1]!)! : rawLines.length;
    const slice = rawLines.slice(start, end).join('\n');
    const processed = config.greekOnly ? slice : slice;
    let paragraphs = config.greekOnly
      ? extractGreekParagraphs(processed)
      : splitIntoParagraphs(processed, lang);
    if (id === 'creed') {
      paragraphs = splitCreedParagraphs(paragraphs);
    }
    if (paragraphs.length === 0) {
      throw new Error(`[${lang}] Section "${id}" produced no paragraphs`);
    }
    sections.set(id, paragraphs);
  }

  return sections;
}

const enSections = buildLanguageSections('en');
const ruSections = buildLanguageSections('ru');
const elSections = buildLanguageSections('el');

const sections = SECTION_IDS.map((id) => ({
  id,
  paragraphs: {
    en: enSections.get(id)!,
    ru: ruSections.get(id)!,
    el: elSections.get(id)!,
  },
}));

const payload = {
  version: 2,
  updated: new Date().toISOString().slice(0, 10),
  source:
    'Full fixed parts of the Divine Liturgy of St John Chrysostom (GOARCH English; Russian congregational text; GOARCH Greek). Variable antiphons, troparia, and readings omitted.',
  sections,
};

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

for (const lang of ['en', 'ru', 'el'] as const) {
  const total = sections.reduce((n, s) => n + s.paragraphs[lang].length, 0);
  console.log(`${lang}: ${total} paragraphs`);
}
console.log(`Wrote ${outFile}`);
