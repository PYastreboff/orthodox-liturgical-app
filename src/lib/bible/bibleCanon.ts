export type BibleTestament = 'ot' | 'nt';

export type BibleBook = {
  readonly bookNum: number;
  readonly usfm: string;
  readonly name: string;
  readonly chapters: number;
  readonly testament: BibleTestament;
};

/** Standard 66-book canon with getBible book numbers (1–66). */
export const BIBLE_BOOKS: readonly BibleBook[] = [
  { bookNum: 1, usfm: 'GEN', name: 'Genesis', chapters: 50, testament: 'ot' },
  { bookNum: 2, usfm: 'EXO', name: 'Exodus', chapters: 40, testament: 'ot' },
  { bookNum: 3, usfm: 'LEV', name: 'Leviticus', chapters: 27, testament: 'ot' },
  { bookNum: 4, usfm: 'NUM', name: 'Numbers', chapters: 36, testament: 'ot' },
  { bookNum: 5, usfm: 'DEU', name: 'Deuteronomy', chapters: 34, testament: 'ot' },
  { bookNum: 6, usfm: 'JOS', name: 'Joshua', chapters: 24, testament: 'ot' },
  { bookNum: 7, usfm: 'JDG', name: 'Judges', chapters: 21, testament: 'ot' },
  { bookNum: 8, usfm: 'RUT', name: 'Ruth', chapters: 4, testament: 'ot' },
  { bookNum: 9, usfm: '1SA', name: '1 Samuel', chapters: 31, testament: 'ot' },
  { bookNum: 10, usfm: '2SA', name: '2 Samuel', chapters: 24, testament: 'ot' },
  { bookNum: 11, usfm: '1KI', name: '1 Kings', chapters: 22, testament: 'ot' },
  { bookNum: 12, usfm: '2KI', name: '2 Kings', chapters: 25, testament: 'ot' },
  { bookNum: 13, usfm: '1CH', name: '1 Chronicles', chapters: 29, testament: 'ot' },
  { bookNum: 14, usfm: '2CH', name: '2 Chronicles', chapters: 36, testament: 'ot' },
  { bookNum: 15, usfm: 'EZR', name: 'Ezra', chapters: 10, testament: 'ot' },
  { bookNum: 16, usfm: 'NEH', name: 'Nehemiah', chapters: 13, testament: 'ot' },
  { bookNum: 17, usfm: 'EST', name: 'Esther', chapters: 10, testament: 'ot' },
  { bookNum: 18, usfm: 'JOB', name: 'Job', chapters: 42, testament: 'ot' },
  { bookNum: 19, usfm: 'PSA', name: 'Psalms', chapters: 150, testament: 'ot' },
  { bookNum: 20, usfm: 'PRO', name: 'Proverbs', chapters: 31, testament: 'ot' },
  { bookNum: 21, usfm: 'ECC', name: 'Ecclesiastes', chapters: 12, testament: 'ot' },
  { bookNum: 22, usfm: 'SNG', name: 'Song of Solomon', chapters: 8, testament: 'ot' },
  { bookNum: 23, usfm: 'ISA', name: 'Isaiah', chapters: 66, testament: 'ot' },
  { bookNum: 24, usfm: 'JER', name: 'Jeremiah', chapters: 52, testament: 'ot' },
  { bookNum: 25, usfm: 'LAM', name: 'Lamentations', chapters: 5, testament: 'ot' },
  { bookNum: 26, usfm: 'EZK', name: 'Ezekiel', chapters: 48, testament: 'ot' },
  { bookNum: 27, usfm: 'DAN', name: 'Daniel', chapters: 12, testament: 'ot' },
  { bookNum: 28, usfm: 'HOS', name: 'Hosea', chapters: 14, testament: 'ot' },
  { bookNum: 29, usfm: 'JOL', name: 'Joel', chapters: 3, testament: 'ot' },
  { bookNum: 30, usfm: 'AMO', name: 'Amos', chapters: 9, testament: 'ot' },
  { bookNum: 31, usfm: 'OBA', name: 'Obadiah', chapters: 1, testament: 'ot' },
  { bookNum: 32, usfm: 'JON', name: 'Jonah', chapters: 4, testament: 'ot' },
  { bookNum: 33, usfm: 'MIC', name: 'Micah', chapters: 7, testament: 'ot' },
  { bookNum: 34, usfm: 'NAM', name: 'Nahum', chapters: 3, testament: 'ot' },
  { bookNum: 35, usfm: 'HAB', name: 'Habakkuk', chapters: 3, testament: 'ot' },
  { bookNum: 36, usfm: 'ZEP', name: 'Zephaniah', chapters: 3, testament: 'ot' },
  { bookNum: 37, usfm: 'HAG', name: 'Haggai', chapters: 2, testament: 'ot' },
  { bookNum: 38, usfm: 'ZEC', name: 'Zechariah', chapters: 14, testament: 'ot' },
  { bookNum: 39, usfm: 'MAL', name: 'Malachi', chapters: 4, testament: 'ot' },
  { bookNum: 40, usfm: 'MAT', name: 'Matthew', chapters: 28, testament: 'nt' },
  { bookNum: 41, usfm: 'MRK', name: 'Mark', chapters: 16, testament: 'nt' },
  { bookNum: 42, usfm: 'LUK', name: 'Luke', chapters: 24, testament: 'nt' },
  { bookNum: 43, usfm: 'JHN', name: 'John', chapters: 21, testament: 'nt' },
  { bookNum: 44, usfm: 'ACT', name: 'Acts', chapters: 28, testament: 'nt' },
  { bookNum: 45, usfm: 'ROM', name: 'Romans', chapters: 16, testament: 'nt' },
  { bookNum: 46, usfm: '1CO', name: '1 Corinthians', chapters: 16, testament: 'nt' },
  { bookNum: 47, usfm: '2CO', name: '2 Corinthians', chapters: 13, testament: 'nt' },
  { bookNum: 48, usfm: 'GAL', name: 'Galatians', chapters: 6, testament: 'nt' },
  { bookNum: 49, usfm: 'EPH', name: 'Ephesians', chapters: 6, testament: 'nt' },
  { bookNum: 50, usfm: 'PHP', name: 'Philippians', chapters: 4, testament: 'nt' },
  { bookNum: 51, usfm: 'COL', name: 'Colossians', chapters: 4, testament: 'nt' },
  { bookNum: 52, usfm: '1TH', name: '1 Thessalonians', chapters: 5, testament: 'nt' },
  { bookNum: 53, usfm: '2TH', name: '2 Thessalonians', chapters: 3, testament: 'nt' },
  { bookNum: 54, usfm: '1TI', name: '1 Timothy', chapters: 6, testament: 'nt' },
  { bookNum: 55, usfm: '2TI', name: '2 Timothy', chapters: 4, testament: 'nt' },
  { bookNum: 56, usfm: 'TIT', name: 'Titus', chapters: 3, testament: 'nt' },
  { bookNum: 57, usfm: 'PHM', name: 'Philemon', chapters: 1, testament: 'nt' },
  { bookNum: 58, usfm: 'HEB', name: 'Hebrews', chapters: 13, testament: 'nt' },
  { bookNum: 59, usfm: 'JAS', name: 'James', chapters: 5, testament: 'nt' },
  { bookNum: 60, usfm: '1PE', name: '1 Peter', chapters: 5, testament: 'nt' },
  { bookNum: 61, usfm: '2PE', name: '2 Peter', chapters: 3, testament: 'nt' },
  { bookNum: 62, usfm: '1JN', name: '1 John', chapters: 5, testament: 'nt' },
  { bookNum: 63, usfm: '2JN', name: '2 John', chapters: 1, testament: 'nt' },
  { bookNum: 64, usfm: '3JN', name: '3 John', chapters: 1, testament: 'nt' },
  { bookNum: 65, usfm: 'JUD', name: 'Jude', chapters: 1, testament: 'nt' },
  { bookNum: 66, usfm: 'REV', name: 'Revelation', chapters: 22, testament: 'nt' },
];

export const DEFAULT_BIBLE_BOOK_NUM = 40;
export const DEFAULT_BIBLE_CHAPTER = 1;

export function bibleBookByNum(bookNum: number): BibleBook | undefined {
  return BIBLE_BOOKS.find((book) => book.bookNum === bookNum);
}

export function bibleBookIndex(bookNum: number): number {
  return BIBLE_BOOKS.findIndex((book) => book.bookNum === bookNum);
}

export function nextChapterLocation(
  bookNum: number,
  chapter: number,
): { bookNum: number; chapter: number } | null {
  const book = bibleBookByNum(bookNum);
  if (!book) return null;
  if (chapter < book.chapters) return { bookNum, chapter: chapter + 1 };
  const next = BIBLE_BOOKS[bibleBookIndex(bookNum) + 1];
  if (!next) return null;
  return { bookNum: next.bookNum, chapter: 1 };
}

export function prevChapterLocation(
  bookNum: number,
  chapter: number,
): { bookNum: number; chapter: number } | null {
  if (chapter > 1) return { bookNum, chapter: chapter - 1 };
  const prev = BIBLE_BOOKS[bibleBookIndex(bookNum) - 1];
  if (!prev) return null;
  return { bookNum: prev.bookNum, chapter: prev.chapters };
}
