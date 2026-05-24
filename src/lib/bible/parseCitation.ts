import type { OrthocalVerse } from '../api/orthocal';
import { getBibleBookNumber } from './bookNumbers';

export type ScriptureRef = {
  bookNum: number;
  chapter: number;
  startVerse: number;
  endVerse: number;
};

const MAX_VERSE = 999;

/** Parse orthocal `short_display` / `display` (e.g. "John 1.29-34", "John 9.39-10.9"). */
export function parseScriptureCitation(citation: string): ScriptureRef[] | null {
  const trimmed = citation.trim();
  if (!trimmed || /^composite\s/i.test(trimmed)) return null;

  const normalized = trimmed.replace(/(\d+):(\d+)/g, '$1.$2');

  const crossChapter = normalized.match(
    /^([1-3]?\s*[A-Za-z.]+)\s+(\d+)\.(\d+)-(\d+)\.(\d+)$/,
  );
  if (crossChapter) {
    const bookNum = getBibleBookNumber(crossChapter[1]);
    if (bookNum === null) return null;
    const startChapter = Number(crossChapter[2]);
    const startVerse = Number(crossChapter[3]);
    const endChapter = Number(crossChapter[4]);
    const endVerse = Number(crossChapter[5]);
    const refs: ScriptureRef[] = [];

    refs.push({
      bookNum,
      chapter: startChapter,
      startVerse,
      endVerse: MAX_VERSE,
    });

    for (let chapter = startChapter + 1; chapter < endChapter; chapter += 1) {
      refs.push({ bookNum, chapter, startVerse: 1, endVerse: MAX_VERSE });
    }

    if (endChapter > startChapter) {
      refs.push({ bookNum, chapter: endChapter, startVerse: 1, endVerse });
    }

    return refs;
  }

  const parts = normalized.split(',').map((p) => p.trim());
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
      const endPart = withBook[4];
      if (endPart !== undefined) {
        const endVerse = Number(endPart);
        // Royster sticheron citations: Ps 27.9-1 → v. 9 then v. 1 (not v. 9–1).
        if (endVerse < startVerse) {
          refs.push({ bookNum, chapter, startVerse, endVerse: startVerse });
          refs.push({ bookNum, chapter, startVerse: endVerse, endVerse });
          continue;
        }
        refs.push({ bookNum, chapter, startVerse, endVerse });
        continue;
      }
      refs.push({ bookNum, chapter, startVerse, endVerse: startVerse });
      continue;
    }

    const verseOnly = part.match(/^(\d+)$/);
    if (verseOnly && bookNum !== null && refs.length > 0) {
      const last = refs[refs.length - 1]!;
      const verse = Number(verseOnly[1]);
      refs.push({
        bookNum: last.bookNum,
        chapter: last.chapter,
        startVerse: verse,
        endVerse: verse,
      });
      continue;
    }

    const continuation = part.match(/^(\d+)\.(\d+)(?:-(\d+))?$/);
    if (continuation && bookNum !== null) {
      const chapter = Number(continuation[1]);
      const startVerse = Number(continuation[2]);
      const endPart = continuation[3];
      if (endPart !== undefined) {
        const endVerse = Number(endPart);
        if (endVerse < startVerse) {
          refs.push({ bookNum, chapter, startVerse, endVerse: startVerse });
          refs.push({ bookNum, chapter, startVerse: endVerse, endVerse });
          continue;
        }
        refs.push({ bookNum, chapter, startVerse, endVerse });
        continue;
      }
      refs.push({ bookNum, chapter, startVerse, endVerse: startVerse });
      continue;
    }

    return null;
  }

  return refs.length ? refs : null;
}

/** Build verse ranges from orthocal passage metadata (USFM book codes, exact chapters). */
export function refsFromOrthocalPassage(passage: OrthocalVerse[]): ScriptureRef[] | null {
  if (!passage.length) return null;

  const refs: ScriptureRef[] = [];
  let current: ScriptureRef | null = null;

  for (const verse of passage) {
    const bookNum = getBibleBookNumber(verse.book);
    if (bookNum === null) return null;

    if (
      !current ||
      current.bookNum !== bookNum ||
      current.chapter !== verse.chapter ||
      verse.verse !== current.endVerse + 1
    ) {
      if (current) refs.push(current);
      current = {
        bookNum,
        chapter: verse.chapter,
        startVerse: verse.verse,
        endVerse: verse.verse,
      };
    } else {
      current.endVerse = verse.verse;
    }
  }

  if (current) refs.push(current);
  return refs.length ? refs : null;
}

/** Prefer orthocal passage verses; fall back to parsing the display citation. */
export function resolveScriptureRefs(
  citation: string,
  passage?: OrthocalVerse[] | null,
): ScriptureRef[] | null {
  if (passage?.length) {
    const fromPassage = refsFromOrthocalPassage(passage);
    if (fromPassage) return fromPassage;
  }
  return parseScriptureCitation(citation);
}
