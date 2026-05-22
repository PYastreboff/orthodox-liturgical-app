import type { LiturgicalReadingView, OrthocalDay, OrthocalReading } from '../api/orthocal';
import { passageToParagraphs, stripHtml } from '../api/orthocal';

export const NONE_FOR_DAY = 'None for this day.';

export type LiturgicalTextCategory =
  | 'troparion'
  | 'kontakion'
  | 'prokeimenon'
  | 'alleluia'
  | 'epistle'
  | 'gospel'
  | 'communion';

export type LiturgicalTextItem = LiturgicalReadingView & {
  /** When multiple items share a category (e.g. feast + daily epistle). */
  detail?: string;
  /** Hymn-style text without scripture verse numbers. */
  plainText?: boolean;
};

export type LiturgicalTextSection = {
  id: LiturgicalTextCategory;
  title: string;
  items: LiturgicalTextItem[];
};

const SECTION_ORDER: LiturgicalTextCategory[] = [
  'troparion',
  'kontakion',
  'prokeimenon',
  'alleluia',
  'epistle',
  'gospel',
  'communion',
];

const SECTION_TITLES: Record<LiturgicalTextCategory, { one: string; many: string }> = {
  troparion: { one: 'Troparion', many: 'Troparia' },
  kontakion: { one: 'Kontakion', many: 'Kontakia' },
  prokeimenon: { one: 'Prokeimenon', many: 'Prokeimenon' },
  alleluia: { one: 'Alleluia', many: 'Alleluia verses' },
  epistle: { one: 'Epistle', many: 'Epistle readings' },
  gospel: { one: 'Gospel', many: 'Gospel readings' },
  communion: { one: 'Communion verse', many: 'Communion verses' },
};

const GOSPEL_BOOKS = new Set([
  'matthew',
  'mark',
  'luke',
  'john',
  'matt',
  'mrk',
  'luk',
  'jhn',
]);

function norm(value: string | undefined | null): string {
  return (value ?? '').trim().toLowerCase();
}

function isCompositeDisplay(display: string): boolean {
  return /^composite\s+\d+/i.test(display.trim());
}

function isHymnPassage(passage: OrthocalReading['passage']): boolean {
  if (!passage?.length) return false;
  return passage.length === 1 && !passage[0]?.book;
}

export function classifyReading(r: OrthocalReading): LiturgicalTextCategory | null {
  const desc = norm(r.description);
  const source = norm(r.source);
  const book = norm(r.book);
  const display = r.display ?? '';

  if (desc.includes('troparion')) return 'troparion';
  if (desc.includes('kontakion')) return 'kontakion';
  if (desc.includes('prokeimenon') || desc.includes('prokimenon')) return 'prokeimenon';
  if (desc.includes('alleluia') || desc.includes('allelluia')) return 'alleluia';
  if (desc.includes('communion')) return 'communion';

  if (source === 'epistle' || desc === 'epistle') return 'epistle';
  if (source === 'gospel' || desc === 'gospel') return 'gospel';
  if (source === 'matins gospel') return 'gospel';

  if (book.includes('apostol') && source !== 'vespers' && !desc.includes('departed')) {
    if (desc.includes('prokeimenon') || desc.includes('prokimenon')) return 'prokeimenon';
    return 'epistle';
  }

  if (GOSPEL_BOOKS.has(book) && source !== 'vespers') {
    return 'gospel';
  }

  if (isCompositeDisplay(display)) {
    if (desc.includes('troparion')) return 'troparion';
    if (desc.includes('kontakion')) return 'kontakion';
    if (desc.includes('prokeimenon') || desc.includes('prokimenon')) return 'prokeimenon';
    if (desc.includes('alleluia')) return 'alleluia';
    if (desc.includes('communion')) return 'communion';
  }

  if (book === 'composite' || book.includes('menaion')) {
    if (desc.includes('troparion')) return 'troparion';
    if (desc.includes('kontakion')) return 'kontakion';
    if (desc.includes('prokeimenon') || desc.includes('prokimenon')) return 'prokeimenon';
    if (desc.includes('alleluia')) return 'alleluia';
    if (desc.includes('communion')) return 'communion';
  }

  return null;
}

function readingDetail(r: OrthocalReading): string | undefined {
  const parts: string[] = [];
  if (r.description?.trim()) parts.push(r.description.trim());
  if (r.source?.trim()) parts.push(r.source.trim());
  return parts.length ? parts.join(' · ') : undefined;
}

function readingLabel(category: LiturgicalTextCategory, r: OrthocalReading): string {
  if (category === 'epistle') return 'Epistle';
  if (category === 'gospel') {
    if (norm(r.source) === 'matins gospel') return 'Matins Gospel';
    return 'Gospel';
  }
  if (category === 'troparion') return 'Troparion';
  if (category === 'kontakion') return 'Kontakion';
  if (category === 'prokeimenon') return 'Prokeimenon';
  if (category === 'alleluia') return 'Alleluia';
  if (category === 'communion') return 'Communion';
  if (r.description?.trim()) return r.description.trim();
  return r.book || r.source || 'Reading';
}

function readingToItem(
  r: OrthocalReading,
  category: LiturgicalTextCategory,
): LiturgicalTextItem {
  const plain = isHymnPassage(r.passage);
  return {
    label: readingLabel(category, r),
    citation: r.display || r.short_display || r.description || r.source,
    paragraphs: passageToParagraphs(r.passage ?? []),
    source: r.source,
    detail: readingDetail(r),
    plainText: plain,
  };
}

function extractHymnFromStories(
  day: OrthocalDay,
  hymn: 'troparion' | 'kontakion',
): LiturgicalTextItem | null {
  const stories = day.stories ?? [];
  const label = hymn === 'troparion' ? 'Troparion' : 'Kontakion';
  const markerRe = new RegExp(`[—–-]\\s*${label}`, 'i');

  for (const story of stories) {
    const text = stripHtml(story.story);
    const match = text.match(markerRe);
    if (!match || match.index === undefined) continue;

    let snippet = text.slice(match.index + match[0].length).trim();
    snippet = snippet.replace(/^[.:]\s*/, '');
    const nextSection = snippet.search(/\s[—–-]\s+(?:The |Our |New )/);
    if (nextSection > 40) {
      snippet = snippet.slice(0, nextSection).trim();
    } else {
      const sentenceEnd = snippet.search(/\.\s+(?:The western|The |Our Venerable|On the day)/);
      if (sentenceEnd > 20) snippet = snippet.slice(0, sentenceEnd + 1).trim();
    }

    if (!snippet) continue;

    return {
      label,
      citation: story.title?.trim() || 'Commemoration',
      paragraphs: [[{ verse: 0, text: snippet }]],
      source: 'Commemoration',
      detail: 'From saint’s life (orthocal.info)',
      plainText: true,
    };
  }

  return null;
}

function sectionTitle(id: LiturgicalTextCategory, count: number): string {
  const titles = SECTION_TITLES[id];
  return count === 1 ? titles.one : titles.many;
}

export function buildLiturgicalTextSections(day: OrthocalDay | null): LiturgicalTextSection[] {
  const buckets: Record<LiturgicalTextCategory, LiturgicalTextItem[]> = {
    troparion: [],
    kontakion: [],
    prokeimenon: [],
    alleluia: [],
    epistle: [],
    gospel: [],
    communion: [],
  };

  if (day?.readings?.length) {
    for (const reading of day.readings) {
      const category = classifyReading(reading);
      if (!category) continue;
      buckets[category].push(readingToItem(reading, category));
    }
  }

  if (day) {
    if (!buckets.troparion.length) {
      const fromStory = extractHymnFromStories(day, 'troparion');
      if (fromStory) buckets.troparion.push(fromStory);
    }
    if (!buckets.kontakion.length) {
      const fromStory = extractHymnFromStories(day, 'kontakion');
      if (fromStory) buckets.kontakion.push(fromStory);
    }
  }

  return SECTION_ORDER.map((id) => ({
    id,
    title: sectionTitle(id, buckets[id].length),
    items: buckets[id],
  }));
}
