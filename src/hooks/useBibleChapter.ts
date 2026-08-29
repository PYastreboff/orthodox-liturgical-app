import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import {
  bibleBookByNum,
  DEFAULT_BIBLE_BOOK_NUM,
  DEFAULT_BIBLE_CHAPTER,
  nextChapterLocation,
  prevChapterLocation,
} from '../lib/bible/bibleCanon';
import { BIBLE_TRANSLATION_IDS, DEFAULT_BIBLE_TEXT_LANG, type BibleTextLang } from '../lib/bible/bibleTranslation';
import { localizeBibleChapterTitles, localizedBibleBookName, localizedBibleChapterTitle } from '../lib/bible/bibleBookNames';
import { fetchBibleChapter, type BibleChapterVerse } from '../lib/bible/scriptureTranslation';

const STORAGE_KEY = '@orthoDaily/bibleLocation';

type StoredLocation = {
  bookNum: number;
  chapter: number;
  translation: BibleTextLang;
};

type BibleChapterState = {
  bookNum: number;
  chapter: number;
  translation: BibleTextLang;
  bookName: string;
  chapterTitle: string;
  verses: BibleChapterVerse[];
  loading: boolean;
  error: boolean;
  canGoPrev: boolean;
  canGoNext: boolean;
  setBook: (bookNum: number) => void;
  setChapter: (chapter: number) => void;
  setTranslation: (translation: BibleTextLang) => void;
  goPrev: () => void;
  goNext: () => void;
};

function normalizeStored(raw: string | null): StoredLocation | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredLocation>;
    const bookNum = parsed.bookNum;
    const chapter = parsed.chapter;
    const translation = parsed.translation;
    if (
      typeof bookNum !== 'number' ||
      typeof chapter !== 'number' ||
      !bibleBookByNum(bookNum) ||
      chapter < 1 ||
      chapter > (bibleBookByNum(bookNum)?.chapters ?? 0) ||
      (translation !== 'en' && translation !== 'el' && translation !== 'chu')
    ) {
      return null;
    }
    return { bookNum, chapter, translation };
  } catch {
    return null;
  }
}

export function useBibleChapter(): BibleChapterState {
  const [bookNum, setBookNum] = useState(DEFAULT_BIBLE_BOOK_NUM);
  const [chapter, setChapterState] = useState(DEFAULT_BIBLE_CHAPTER);
  const [translation, setTranslationState] = useState<BibleTextLang>(DEFAULT_BIBLE_TEXT_LANG);
  const [verses, setVerses] = useState<BibleChapterVerse[]>([]);
  const [bookName, setBookName] = useState(
    localizedBibleBookName(DEFAULT_BIBLE_BOOK_NUM, DEFAULT_BIBLE_TEXT_LANG),
  );
  const [chapterTitle, setChapterTitle] = useState(
    localizedBibleChapterTitle(DEFAULT_BIBLE_BOOK_NUM, DEFAULT_BIBLE_CHAPTER, DEFAULT_BIBLE_TEXT_LANG),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const stored = normalizeStored(await AsyncStorage.getItem(STORAGE_KEY));
      if (cancelled) return;
      if (stored) {
        setBookNum(stored.bookNum);
        setChapterState(stored.chapter);
        setTranslationState(stored.translation);
      }
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (location: StoredLocation) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(location));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;

    void (async () => {
      setLoading(true);
      setError(false);
      const translationId = BIBLE_TRANSLATION_IDS[translation];
      const fetched = await fetchBibleChapter(translationId, bookNum, chapter);
      if (cancelled) return;
      if (!fetched?.verses.length) {
        setVerses([]);
        setError(true);
        setBookName(localizedBibleBookName(bookNum, translation));
        setChapterTitle(localizedBibleChapterTitle(bookNum, chapter, translation));
      } else {
        const titles = localizeBibleChapterTitles(
          bookNum,
          chapter,
          translation,
          fetched.bookName,
          fetched.chapterTitle,
        );
        setVerses(fetched.verses);
        setBookName(titles.bookName);
        setChapterTitle(titles.chapterTitle);
        setError(false);
      }
      setLoading(false);
      void persist({ bookNum, chapter, translation });
    })();

    return () => {
      cancelled = true;
    };
  }, [bookNum, chapter, translation, hydrated, persist]);

  const setBook = useCallback((nextBookNum: number) => {
    const nextBook = bibleBookByNum(nextBookNum);
    if (!nextBook) return;
    setBookNum(nextBookNum);
    setChapterState(1);
  }, []);

  const setChapter = useCallback(
    (nextChapter: number) => {
      const currentBook = bibleBookByNum(bookNum);
      if (!currentBook) return;
      const clamped = Math.max(1, Math.min(currentBook.chapters, nextChapter));
      setChapterState(clamped);
    },
    [bookNum],
  );

  const setTranslation = useCallback((next: BibleTextLang) => {
    setTranslationState(next);
  }, []);

  const goPrev = useCallback(() => {
    const prev = prevChapterLocation(bookNum, chapter);
    if (!prev) return;
    setBookNum(prev.bookNum);
    setChapterState(prev.chapter);
  }, [bookNum, chapter]);

  const goNext = useCallback(() => {
    const next = nextChapterLocation(bookNum, chapter);
    if (!next) return;
    setBookNum(next.bookNum);
    setChapterState(next.chapter);
  }, [bookNum, chapter]);

  return {
    bookNum,
    chapter,
    translation,
    bookName,
    chapterTitle,
    verses,
    loading,
    error,
    canGoPrev: prevChapterLocation(bookNum, chapter) != null,
    canGoNext: nextChapterLocation(bookNum, chapter) != null,
    setBook,
    setChapter,
    setTranslation,
    goPrev,
    goNext,
  };
}
