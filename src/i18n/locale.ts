import type { UiLanguage } from './types';

/** BCP 47 tag for `Intl` date/time formatting from app UI language. */
export function intlLocaleForLanguage(lang: UiLanguage): string {
  return lang === 'ru' ? 'ru-RU' : 'en-GB';
}
