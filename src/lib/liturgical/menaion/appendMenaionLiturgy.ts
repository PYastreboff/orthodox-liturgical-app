import type { OrthocalDay } from '../../api/orthocal';
import { translate } from '../../../i18n/translate';
import type { UiLanguage } from '../../../i18n/types';
import type { TextLanguage } from '../../../state/PreferencesContext';
import type {
  BuildLiturgicalTextsOptions,
  LiturgicalTextCategory,
  LiturgicalTextItem,
} from '../liturgicalTexts';
import { hymnToEnglishItem, hymnToSlavonicItem } from './menaionHymnItems';
import { majorFeastHymnsEn } from './majorFeastHymnsEn';
import { resolveFeastProkeimenonSequence } from './feastProkeimena';
import { roysterSequenceToItems } from '../royster/toLiturgicalItems';
import { typikonFeastForJulianMonthDay, typikonFeastForPaschaDistance, typikonHymn } from './typikonIndex';

function hymnParagraphs(text: string) {
  return [[{ verse: 0, text }]];
}

/**
 * Troparion/kontakion from Mount-Skete typikon; menaion prokeimenon on great feasts.
 * Church Slavonic hymns are used only for CHU mode; EN/both use English when available.
 */
export function appendMenaionLiturgy(
  buckets: Record<LiturgicalTextCategory, LiturgicalTextItem[]>,
  day: OrthocalDay,
  lang: UiLanguage,
  options: BuildLiturgicalTextsOptions,
): void {
  const julianMonthDay = options.julianMonthDay;
  const appearanceKey = options.appearanceKey;
  const textLang: TextLanguage = options.textLang ?? 'en';

  const typikonFeast =
    typikonFeastForPaschaDistance(day.pascha_distance) ??
    (julianMonthDay ? typikonFeastForJulianMonthDay(julianMonthDay) : null);

  const englishHymns = majorFeastHymnsEn(julianMonthDay, appearanceKey);
  const useChuHymns = textLang === 'chu';
  const useEnHymns = textLang === 'en' || textLang === 'both';

  if (typikonFeast) {
    const titleRu = typikonFeast.titleRu;

    if (!buckets.troparion.length) {
      const troparion = typikonHymn(typikonFeast, 'troparion');
      if (troparion) {
        if (useChuHymns) {
          buckets.troparion.push(hymnToSlavonicItem('troparion', troparion, titleRu, lang));
        } else if (useEnHymns && englishHymns?.troparion?.text) {
          buckets.troparion.push(
            hymnToEnglishItem('troparion', troparion, titleRu, lang, englishHymns.troparion.text),
          );
        }
      }
    }

    if (!buckets.kontakion.length) {
      const kontakion = typikonHymn(typikonFeast, 'kontakion');
      if (kontakion) {
        if (useChuHymns) {
          buckets.kontakion.push(hymnToSlavonicItem('kontakion', kontakion, titleRu, lang));
        } else if (useEnHymns && englishHymns?.kontakion?.text) {
          buckets.kontakion.push(
            hymnToEnglishItem('kontakion', kontakion, titleRu, lang, englishHymns.kontakion.text),
          );
        }
      }
    }
  } else if (useEnHymns && englishHymns) {
    if (!buckets.troparion.length && englishHymns.troparion) {
      buckets.troparion.push({
        label: translate(lang, 'readings.troparion'),
        citation: translate(lang, 'readings.typikonSourceShort'),
        paragraphs: hymnParagraphs(englishHymns.troparion.text),
        detail: translate(lang, 'readings.typikonSourceEn'),
        plainText: true,
        source: translate(lang, 'readings.typikonSourceShort'),
      });
    }
    if (!buckets.kontakion.length && englishHymns.kontakion) {
      buckets.kontakion.push({
        label: translate(lang, 'readings.kontakion'),
        citation: translate(lang, 'readings.typikonSourceShort'),
        paragraphs: hymnParagraphs(englishHymns.kontakion.text),
        detail: translate(lang, 'readings.typikonSourceEn'),
        plainText: true,
        source: translate(lang, 'readings.typikonSourceShort'),
      });
    }
  }

  const feastSequence = resolveFeastProkeimenonSequence(day, julianMonthDay, appearanceKey);
  if (!feastSequence) return;

  const isSunday = day.weekday === 0;
  const items = roysterSequenceToItems(feastSequence, lang, {
    isSunday,
    isFeastDay: true,
    menaionFeast: true,
  });

  for (const category of ['prokeimenon', 'alleluia', 'communion'] as const) {
    const next = items[category];
    if (next?.length) buckets[category] = [...next];
  }
}
