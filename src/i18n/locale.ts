import type { UiLanguage } from './types';

/** BCP 47 tag for `Intl` date/time formatting from app UI language. */
export function intlLocaleForLanguage(lang: UiLanguage): string {
  if (lang === 'ru') return 'ru-RU';
  if (lang === 'el') return 'el-GR';
  return 'en-GB';
}
