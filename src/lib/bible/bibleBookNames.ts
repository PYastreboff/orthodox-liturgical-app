import { bibleBookByNum } from './bibleCanon';
import type { BibleTextLang } from './bibleTranslation';

/** Traditional Church Slavonic book names (Elizabeth Bible tradition). */
const CHURCH_SLAVONIC_BOOK_NAMES: Record<number, string> = {
  1: 'Бытіе',
  2: 'Исходъ',
  3: 'Левитъ',
  4: 'Числа',
  5: 'Второзаконіе',
  6: 'Іисусъ Навинъ',
  7: 'Судіи',
  8: 'Руфь',
  9: '1 Царствъ',
  10: '2 Царствъ',
  11: '3 Царствъ',
  12: '4 Царствъ',
  13: '1 Паралипоменонъ',
  14: '2 Паралипоменонъ',
  15: '1 Ездра',
  16: 'Неемія',
  17: 'Есфирь',
  18: 'Іовъ',
  19: 'Псалтирь',
  20: 'Притчи Соломоновы',
  21: 'Екклезіастъ',
  22: 'Пѣснь Пѣсней',
  23: 'Исаія пророкъ',
  24: 'Іеремія пророкъ',
  25: 'Плачь Іереміинъ',
  26: 'Іезекіиль пророкъ',
  27: 'Даніилъ пророкъ',
  28: 'Осія пророкъ',
  29: 'Іоиль пророкъ',
  30: 'Амосъ пророкъ',
  31: 'Авдія пророкъ',
  32: 'Іона пророкъ',
  33: 'Міхей пророкъ',
  34: 'Наумъ пророкъ',
  35: 'Аввакумъ пророкъ',
  36: 'Софонія пророкъ',
  37: 'Аггей пророкъ',
  38: 'Захарія пророкъ',
  39: 'Малахія пророкъ',
  40: 'По Матѳею',
  41: 'По Марку',
  42: 'По Лукѣ',
  43: 'По Іоанну',
  44: 'Дѣянія Апостолъ',
  45: 'Посланіе къ Римлянамъ',
  46: '1-е къ Коринѳянамъ',
  47: '2-е къ Коринѳянамъ',
  48: 'Посланіе къ Галатамъ',
  49: 'Посланіе къ Ефесянамъ',
  50: 'Посланіе къ Филиппійцамъ',
  51: 'Посланіе къ Колоссянамъ',
  52: '1-е къ Солунчанамъ',
  53: '2-е къ Солунчанамъ',
  54: '1-е къ Тимофею',
  55: '2-е къ Тимофею',
  56: 'Посланіе къ Титу',
  57: 'Посланіе къ Филимону',
  58: 'Посланіе къ Евреямъ',
  59: 'Посланіе Іакова',
  60: '1-е Петра',
  61: '2-е Петра',
  62: '1-е Іоанна',
  63: '2-е Іоанна',
  64: '3-е Іоанна',
  65: 'Посланіе Іуды',
  66: 'Откровеніе Іоанна',
};

export function localizedBibleBookName(bookNum: number, lang: BibleTextLang): string {
  if (lang === 'chu') {
    return CHURCH_SLAVONIC_BOOK_NAMES[bookNum] ?? bibleBookByNum(bookNum)?.name ?? '';
  }
  return bibleBookByNum(bookNum)?.name ?? '';
}

export function localizedBibleChapterTitle(
  bookNum: number,
  chapter: number,
  lang: BibleTextLang,
  apiBookName?: string,
  apiChapterTitle?: string,
): string {
  if (lang === 'chu') {
    const bookName = localizedBibleBookName(bookNum, 'chu');
    return `${bookName}, глава ${chapter}`;
  }

  const trimmedTitle = apiChapterTitle?.trim();
  if (trimmedTitle) return trimmedTitle;

  const bookName = apiBookName?.trim() || localizedBibleBookName(bookNum, lang);
  return bookName ? `${bookName} ${chapter}` : `Chapter ${chapter}`;
}

export function localizeBibleChapterTitles(
  bookNum: number,
  chapter: number,
  lang: BibleTextLang,
  apiBookName: string,
  apiChapterTitle: string,
): { bookName: string; chapterTitle: string } {
  const bookName =
    lang === 'chu'
      ? localizedBibleBookName(bookNum, 'chu')
      : apiBookName.trim() || localizedBibleBookName(bookNum, lang);

  return {
    bookName,
    chapterTitle: localizedBibleChapterTitle(bookNum, chapter, lang, bookName, apiChapterTitle),
  };
}
