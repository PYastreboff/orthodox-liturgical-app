import type { LiturgicalVerseLine, OrthocalVerse } from '../api/orthocal';
import type {
  LiturgicalTextCategory,
  LiturgicalTextItem,
  LiturgicalTextSection,
} from '../liturgical/liturgicalTexts';
import { resolveScriptureRefs, type ScriptureRef } from './parseCitation';

const GETBIBLE_TRANSLATIONS = ['csielizabeth'] as const;
const GETBIBLE_BASE = 'https://api.getbible.net/v2';
const SLAVONIC_DETAIL = 'Church Slavonic (Elizabeth Bible, 1757)';

const SCRIPTURE_CATEGORIES = new Set<LiturgicalTextCategory>([
  'epistle',
  'gospel',
  'prokeimenon',
  'alleluia',
  'communion',
]);

type GetBibleVerse = {
  chapter: number;
  verse: number;
  text: string;
};

const chapterCache = new Map<string, GetBibleVerse[]>();

async function fetchChapter(
  translation: string,
  bookNum: number,
  chapter: number,
): Promise<GetBibleVerse[] | null> {
  const key = `${translation}:${bookNum}:${chapter}`;
  const cached = chapterCache.get(key);
  if (cached) return cached;

  try {
    const res = await fetch(`${GETBIBLE_BASE}/${translation}/${bookNum}/${chapter}.json`);
    if (!res.ok) return null;
    const data = (await res.json()) as { verses?: GetBibleVerse[] };
    const verses = data.verses ?? [];
    chapterCache.set(key, verses);
    return verses;
  } catch {
    return null;
  }
}

async function slavonicLinesForRefs(refs: ScriptureRef[]): Promise<LiturgicalVerseLine[] | null> {
  const lines: LiturgicalVerseLine[] = [];

  for (const translation of GETBIBLE_TRANSLATIONS) {
    lines.length = 0;

    for (const ref of refs) {
      const chapterVerses = await fetchChapter(translation, ref.bookNum, ref.chapter);
      if (!chapterVerses) {
        lines.length = 0;
        break;
      }
      const slice = versesInRange(chapterVerses, ref.startVerse, ref.endVerse);
      if (!slice.length) {
        lines.length = 0;
        break;
      }
      lines.push(...slice);
    }

    if (lines.length) return lines;
  }

  return null;
}

function versesInRange(
  chapterVerses: GetBibleVerse[],
  start: number,
  end: number,
): LiturgicalVerseLine[] {
  return chapterVerses
    .filter((v) => v.verse >= start && v.verse <= end)
    .map((v) => ({ verse: v.verse, text: v.text.trim() }));
}

function groupParagraphs(
  lines: LiturgicalVerseLine[],
  template?: OrthocalVerse[],
): LiturgicalVerseLine[][] {
  if (!lines.length) return [];
  if (!template?.length) return [lines];

  if (lines.length === template.length) {
    const paragraphs: LiturgicalVerseLine[][] = [];
    let current: LiturgicalVerseLine[] = [];
    for (let i = 0; i < lines.length; i += 1) {
      if (template[i].paragraph_start && current.length > 0) {
        paragraphs.push(current);
        current = [lines[i]];
      } else {
        current.push(lines[i]);
      }
    }
    if (current.length > 0) paragraphs.push(current);
    return paragraphs.length ? paragraphs : [lines];
  }

  const paragraphs: LiturgicalVerseLine[][] = [];
  let current: LiturgicalVerseLine[] = [];

  for (const line of lines) {
    const templateVerse = template.find((t) => t.verse === line.verse);
    if (templateVerse?.paragraph_start && current.length > 0) {
      paragraphs.push(current);
      current = [line];
    } else {
      current.push(line);
    }
  }

  if (current.length > 0) paragraphs.push(current);
  return paragraphs.length ? paragraphs : [lines];
}

export async function slavonicParagraphsForCitation(
  citation: string,
  englishTemplate?: OrthocalVerse[] | null,
): Promise<LiturgicalVerseLine[][] | null> {
  const refs = resolveScriptureRefs(citation, englishTemplate);
  if (!refs) return null;

  const lines = await slavonicLinesForRefs(refs);
  if (!lines?.length) return null;
  return groupParagraphs(lines, englishTemplate ?? undefined);
}

export async function applyChurchSlavonicToSections(
  sections: LiturgicalTextSection[],
  englishPassageByCitation: Map<string, OrthocalVerse[] | undefined>,
): Promise<LiturgicalTextSection[]> {
  const out: LiturgicalTextSection[] = [];

  for (const section of sections) {
    if (!SCRIPTURE_CATEGORIES.has(section.id)) {
      out.push(section);
      continue;
    }

    const items: LiturgicalTextItem[] = [];
    for (const item of section.items) {
      if (item.plainText && !item.scriptureCitation) {
        items.push(item);
        continue;
      }

      const template = englishPassageByCitation.get(item.citation);
      const lookupCitation = item.scriptureCitation ?? item.citation;
      const paragraphs = await slavonicParagraphsForCitation(lookupCitation, template);

      if (paragraphs) {
        items.push({
          ...item,
          paragraphs,
          detail: item.detail ? `${item.detail} · ${SLAVONIC_DETAIL}` : SLAVONIC_DETAIL,
          plainText: false,
        });
      } else {
        items.push({
          ...item,
          detail: item.detail
            ? `${item.detail} · Slavonic unavailable — English (KJV)`
            : 'Slavonic unavailable — English (KJV)',
        });
      }
    }

    out.push({ ...section, items });
  }

  return out;
}
