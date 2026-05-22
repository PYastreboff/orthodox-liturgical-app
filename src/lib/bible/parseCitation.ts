import { getBibleBookNumber } from './bookNumbers';

export type ScriptureRef = {
  bookNum: number;
  chapter: number;
  startVerse: number;
  endVerse: number;
};

/** Parse orthocal `short_display` / `display` (e.g. "John 1.29-34", "Titus 2.11-14, 3.4-7"). */
export function parseScriptureCitation(citation: string): ScriptureRef[] | null {
  const trimmed = citation.trim();
  if (!trimmed || /^composite\s/i.test(trimmed)) return null;

  const parts = trimmed.split(',').map((p) => p.trim());
  let bookNum: number | null = null;
  const refs: ScriptureRef[] = [];

  for (const part of parts) {
    const withBook = part.match(/^([1-3]?\s*[A-Za-z.]+)\s+(\d+)\.(\d+)(?:-(\d+))?$/);
    if (withBook) {
      const bookName = withBook[1].trim();
      bookNum = getBibleBookNumber(bookName);
      if (bookNum === null) return null;
      const chapter = Number(withBook[2]);
      const startVerse = Number(withBook[3]);
      const endVerse = Number(withBook[4] ?? withBook[3]);
      refs.push({ bookNum, chapter, startVerse, endVerse });
      continue;
    }

    const continuation = part.match(/^(\d+)\.(\d+)(?:-(\d+))?$/);
    if (continuation && bookNum !== null) {
      const chapter = Number(continuation[1]);
      const startVerse = Number(continuation[2]);
      const endVerse = Number(continuation[3] ?? continuation[2]);
      refs.push({ bookNum, chapter, startVerse, endVerse });
      continue;
    }

    return null;
  }

  return refs.length ? refs : null;
}
