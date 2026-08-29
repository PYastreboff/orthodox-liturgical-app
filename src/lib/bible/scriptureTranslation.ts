import type { LiturgicalVerseLine, OrthocalVerse } from '../api/orthocal';
import type {
  LiturgicalTextCategory,
  LiturgicalTextItem,
  LiturgicalTextSection,
} from '../liturgical/liturgicalTexts';
import { resolveScriptureRefs } from './parseCitation';

const GETBIBLE_BASE = 'https://api.getbible.net/v2';

const SCRIPTURE_CATEGORIES = new Set<LiturgicalTextCategory>([
  'epistle',
  'gospel',
  'prokeimenon',
  'alleluia',
  'communion',
]);

export type BibleChapterVerse = {
  chapter: number;
  verse: number;
  text: string;
};

export type BibleChapterContent = {
  verses: BibleChapterVerse[];
  bookName: string;
  chapterTitle: string;
};

type ScriptureRef = NonNullable<ReturnType<typeof resolveScriptureRefs>>[number];

const chapterCache = new Map<string, BibleChapterContent>();

export async function fetchBibleChapter(
  translation: string,
  bookNum: number,
  chapter: number,
): Promise<BibleChapterContent | null> {
  const key = `${translation}:${bookNum}:${chapter}`;
  const cached = chapterCache.get(key);
  if (cached) return cached;

  try {
    const res = await fetch(`${GETBIBLE_BASE}/${translation}/${bookNum}/${chapter}.json`);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      verses?: BibleChapterVerse[];
      book_name?: string;
      name?: string;
      chapter?: number;
    };
    const verses = data.verses ?? [];
    if (!verses.length) return null;

    const bookName = data.book_name?.trim() ?? '';
    const chapterNum = data.chapter ?? chapter;
    const chapterTitle =
      data.name?.trim() ??
      (bookName ? `${bookName} ${chapterNum}` : `Chapter ${chapterNum}`);

    const content: BibleChapterContent = { verses, bookName, chapterTitle };
    chapterCache.set(key, content);
    return content;
  } catch {
    return null;
  }
}

function versesInRange(
  chapterVerses: BibleChapterVerse[],
  start: number,
  end: number,
): LiturgicalVerseLine[] {
  return chapterVerses
    .filter((v) => v.verse >= start && v.verse <= end)
    .map((v) => ({ verse: v.verse, text: v.text.trim() }));
}

async function linesForRefs(
  translationIds: readonly string[],
  refs: ScriptureRef[],
): Promise<LiturgicalVerseLine[] | null> {
  for (const translation of translationIds) {
    const lines: LiturgicalVerseLine[] = [];

    for (const ref of refs) {
      const chapterContent = await fetchBibleChapter(translation, ref.bookNum, ref.chapter);
      if (!chapterContent) {
        lines.length = 0;
        break;
      }
      const slice = versesInRange(chapterContent.verses, ref.startVerse, ref.endVerse);
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
    const templateVerse = template.find((entry) => entry.verse === line.verse);
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

export async function scriptureParagraphsForCitation(
  translationIds: readonly string[],
  citation: string,
  englishTemplate?: OrthocalVerse[] | null,
): Promise<LiturgicalVerseLine[][] | null> {
  const refs = resolveScriptureRefs(citation, englishTemplate);
  if (!refs) return null;

  const lines = await linesForRefs(translationIds, refs);
  if (!lines?.length) return null;
  return groupParagraphs(lines, englishTemplate ?? undefined);
}

export async function applyScriptureTranslationToSections(
  sections: LiturgicalTextSection[],
  englishPassageByCitation: Map<string, OrthocalVerse[] | undefined>,
  translationIds: readonly string[],
  detailLabel: string,
  unavailableLabel: string,
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
      const paragraphs = await scriptureParagraphsForCitation(
        translationIds,
        lookupCitation,
        template,
      );

      if (paragraphs) {
        items.push({
          ...item,
          paragraphs,
          detail: item.detail ? `${item.detail} · ${detailLabel}` : detailLabel,
          plainText: false,
        });
      } else {
        items.push({
          ...item,
          detail: item.detail ? `${item.detail} · ${unavailableLabel}` : unavailableLabel,
        });
      }
    }

    out.push({ ...section, items });
  }

  return out;
}
