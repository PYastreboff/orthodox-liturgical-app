import type { OrthocalDay } from '../../api/orthocal';
import {
  liturgicalItemHasText,
  type BuildLiturgicalTextsOptions,
  type LiturgicalTextCategory,
  type LiturgicalTextItem,
} from '../liturgicalTexts';
import { isOrthocalGreatFeastLevel } from '../liturgicalDayTitle';
import { resolveRoysterLiturgySequence } from './resolveRoysterLiturgy';
import { roysterSequenceToItems } from './toLiturgicalItems';
import type { UiLanguage } from '../../../i18n/types';

const ROYSTER_CATEGORIES: LiturgicalTextCategory[] = ['prokeimenon', 'alleluia', 'communion'];

/**
 * Fills prokeimenon, alleluia, and communion when orthocal does not supply them.
 */
export function appendRoysterLiturgy(
  buckets: Record<LiturgicalTextCategory, LiturgicalTextItem[]>,
  day: OrthocalDay,
  lang: UiLanguage,
  _options: BuildLiturgicalTextsOptions,
): void {
  const sequence = resolveRoysterLiturgySequence(day);
  if (!sequence) return;

  const isSunday = day.weekday === 0;
  const isFeastDay = isOrthocalGreatFeastLevel(day);

  const items = roysterSequenceToItems(sequence, lang, { isSunday, isFeastDay });

  for (const category of ROYSTER_CATEGORIES) {
    const existing = buckets[category];
    if (existing.some(liturgicalItemHasText)) continue;
    const next = items[category];
    if (!next?.length) continue;
    if (existing.length) buckets[category] = [...next];
    else buckets[category].push(...next);
  }
}
