export type BibleTextLang = 'en' | 'el' | 'chu';

export const BIBLE_TRANSLATION_IDS: Record<BibleTextLang, string> = {
  en: 'kjv',
  el: 'moderngreek',
  chu: 'csielizabeth',
};

export const DEFAULT_BIBLE_TEXT_LANG: BibleTextLang = 'en';
