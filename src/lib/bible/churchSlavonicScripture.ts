import type { LiturgicalVerseLine, OrthocalVerse } from '../api/orthocal';
import type {
  LiturgicalTextCategory,
  LiturgicalTextItem,
  LiturgicalTextSection,
} from '../liturgical/liturgicalTexts';
import { parseScriptureCitation } from './parseCitation';

const GETBIBLE_TRANSLATION = 'csielizabeth';
const GETBIBLE_BASE = 'https://api.getbible.net/v2';

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

async function fetchChapter(bookNum: number, chapter: number): Promise<GetBibleVerse[] | null> {
  const key = `${bookNum}:${chapter}`;
  const cached = chapterCache.get(key);
  if (cached) return cached;

  try {
    const res = await fetch(`${GETBIBLE_BASE}/${GETBIBLE_TRANSLATION}/${bookNum}/${chapter}.json`);
    if (!res.ok) return null;
    const data = (await res.json()) as { verses?: GetBibleVerse[] };
    const verses = data.verses ?? [];
    chapterCache.set(key, verses);
    return verses;
  } catch {
    return null;
  }
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
  const refs = parseScriptureCitation(citation);
  if (!refs) return null;

  const lines: LiturgicalVerseLine[] = [];

  for (const ref of refs) {
    const chapterVerses = await fetchChapter(ref.bookNum, ref.chapter);
    if (!chapterVerses) return null;
    lines.push(...versesInRange(chapterVerses, ref.startVerse, ref.endVerse));
  }

  if (!lines.length) return null;
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
      const template = englishPassageByCitation.get(item.citation);
      const paragraphs = await slavonicParagraphsForCitation(item.citation, template);

      if (paragraphs) {
        items.push({
          ...item,
          paragraphs,
          detail: 'Church Slavonic (Elizabeth Bible, 1757)',
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
