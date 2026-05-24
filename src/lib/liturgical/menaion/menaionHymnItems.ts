import { translate } from '../../../i18n/translate';
import type { UiLanguage } from '../../../i18n/types';
import type { LiturgicalTextItem } from '../liturgicalTexts';
import type { TypikonHymn } from './typikonTypes';

function hymnParagraphs(text: string) {
  return [[{ verse: 0, text }]];
}

function typikonDetail(lang: UiLanguage, hymn: TypikonHymn, titleRu: string): string {
  const parts = [translate(lang, 'readings.typikonSource')];
  if (hymn.echo) {
    parts.push(translate(lang, 'readings.roysterTone', { tone: String(hymn.echo) }));
  }
  const title = hymn.titleRu?.replace(/<[^>]+>/g, '').trim();
  if (title) parts.push(title);
  else if (titleRu) parts.push(titleRu.replace(/<[^>]+>/g, '').trim());
  return parts.join(' · ');
}

export function hymnToSlavonicItem(
  category: 'troparion' | 'kontakion',
  hymn: TypikonHymn,
  feastTitleRu: string,
  lang: UiLanguage,
): LiturgicalTextItem {
  const label =
    category === 'troparion'
      ? translate(lang, 'readings.troparion')
      : translate(lang, 'readings.kontakion');

  return {
    label,
    citation: feastTitleRu.replace(/<[^>]+>/g, '').trim() || label,
    paragraphs: hymnParagraphs(hymn.textRu),
    detail: typikonDetail(lang, hymn, feastTitleRu),
    plainText: true,
    menaionSlavonic: true,
    source: translate(lang, 'readings.typikonSourceShort'),
  };
}

export function hymnToEnglishItem(
  category: 'troparion' | 'kontakion',
  hymn: TypikonHymn,
  feastTitleRu: string,
  lang: UiLanguage,
  englishText: string,
): LiturgicalTextItem {
  const label =
    category === 'troparion'
      ? translate(lang, 'readings.troparion')
      : translate(lang, 'readings.kontakion');

  return {
    label,
    citation: feastTitleRu.replace(/<[^>]+>/g, '').trim() || label,
    paragraphs: hymnParagraphs(englishText),
    detail: [translate(lang, 'readings.typikonSourceEn'), typikonDetail(lang, hymn, feastTitleRu)].join(
      ' · ',
    ),
    plainText: true,
    source: translate(lang, 'readings.typikonSourceShort'),
  };
}
