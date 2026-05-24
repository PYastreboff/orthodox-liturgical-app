import type { OrthocalDay } from '../../api/orthocal';
import type { UiLanguage } from '../../../i18n/types';
import type { BuildLiturgicalTextsOptions, LiturgicalTextSection } from '../liturgicalTexts';
import { typikonFeastForJulianMonthDay, typikonFeastForPaschaDistance, typikonHymn } from './typikonIndex';
import { hymnToSlavonicItem } from './menaionHymnItems';

/** Replace troparion/kontakion text with typikon Church Slavonic for CHU / side-by-side columns. */
export function overlayTypikonSlavonicHymns(
  sections: LiturgicalTextSection[],
  day: OrthocalDay,
  options: Pick<BuildLiturgicalTextsOptions, 'julianMonthDay' | 'appearanceKey'>,
  lang: UiLanguage,
): LiturgicalTextSection[] {
  const typikonFeast =
    typikonFeastForPaschaDistance(day.pascha_distance) ??
    (options.julianMonthDay ? typikonFeastForJulianMonthDay(options.julianMonthDay) : null);

  if (!typikonFeast) return sections;

  const titleRu = typikonFeast.titleRu;

  return sections.map((section) => {
    if (section.id !== 'troparion' && section.id !== 'kontakion') return section;

    const hymn = typikonHymn(typikonFeast, section.id);
    if (!hymn) return section;

    const csItem = hymnToSlavonicItem(section.id, hymn, titleRu, lang);

    if (!section.items.length) {
      return { ...section, items: [csItem] };
    }

    return {
      ...section,
      items: section.items.map((item, index) =>
        index === 0
          ? {
              ...item,
              paragraphs: csItem.paragraphs,
              menaionSlavonic: true,
              detail: csItem.detail,
              source: csItem.source,
            }
          : item,
      ),
    };
  });
}
