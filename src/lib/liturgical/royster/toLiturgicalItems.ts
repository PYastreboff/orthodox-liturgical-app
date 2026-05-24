import { translate } from '../../../i18n/translate';
import type { UiLanguage } from '../../../i18n/types';
import type {
  LiturgicalTextCategory,
  LiturgicalTextItem,
} from '../liturgicalTexts';
import type { RoysterCommunion, RoysterLiturgySequence, RoysterSticheron } from './types';

function sticheronParagraphs(sticheron: RoysterSticheron) {
  return [
    [
      { verse: 0, text: sticheron.lines[0] },
      { verse: 0, text: `Verse: ${sticheron.lines[1]}` },
    ],
  ];
}

function communionParagraphs(communion: RoysterCommunion) {
  const lines: { verse: number; text: string }[] = [
    { verse: 0, text: communion.lines[0] },
  ];
  if (communion.alternate) {
    lines.push({
      verse: 0,
      text: `Another (${communion.alternate.citation}): ${communion.alternate.lines[0]}`,
    });
  }
  return [lines];
}

function sticheronDetail(
  sticheron: RoysterSticheron,
  lang: UiLanguage,
  feastNote: boolean,
  menaionFeast: boolean,
): string {
  const parts = [
    translate(lang, 'readings.roysterTone', { tone: String(sticheron.tone) }),
    translate(lang, menaionFeast ? 'readings.menaionSource' : 'readings.roysterSource'),
  ];
  if (feastNote && !menaionFeast) parts.push(translate(lang, 'readings.roysterFeastNote'));
  return parts.join(' · ');
}

function communionDetail(
  communion: RoysterCommunion,
  lang: UiLanguage,
  feastNote: boolean,
  sundayNote: boolean,
  menaionFeast: boolean,
): string {
  const parts = [translate(lang, menaionFeast ? 'readings.menaionSource' : 'readings.roysterSource')];
  if (sundayNote) parts.push(translate(lang, 'readings.roysterSundayCommunionNote'));
  if (feastNote && !menaionFeast) parts.push(translate(lang, 'readings.roysterFeastNote'));
  return parts.join(' · ');
}

function toSticheronItem(
  category: 'prokeimenon' | 'alleluia',
  sticheron: RoysterSticheron,
  lang: UiLanguage,
  feastNote: boolean,
  menaionFeast: boolean,
): LiturgicalTextItem {
  const label =
    category === 'prokeimenon'
      ? translate(lang, 'readings.prokeimenon')
      : translate(lang, 'readings.alleluia');

  return {
    label,
    citation: sticheron.citation,
    paragraphs: sticheronParagraphs(sticheron),
    detail: sticheronDetail(sticheron, lang, feastNote, menaionFeast),
    plainText: !sticheron.scriptureCitation,
    scriptureCitation: sticheron.scriptureCitation,
    source: translate(lang, menaionFeast ? 'readings.menaionSourceShort' : 'readings.roysterSourceShort'),
  };
}

function toCommunionItem(
  communion: RoysterCommunion,
  lang: UiLanguage,
  feastNote: boolean,
  sundayNote: boolean,
  menaionFeast: boolean,
): LiturgicalTextItem {
  return {
    label: translate(lang, 'readings.communion'),
    citation: communion.citation,
    paragraphs: communionParagraphs(communion),
    detail: communionDetail(communion, lang, feastNote, sundayNote, menaionFeast),
    plainText: !communion.scriptureCitation,
    scriptureCitation: communion.scriptureCitation,
    source: translate(lang, menaionFeast ? 'readings.menaionSourceShort' : 'readings.roysterSourceShort'),
  };
}

export function roysterSequenceToItems(
  sequence: RoysterLiturgySequence,
  lang: UiLanguage,
  options: { isSunday: boolean; isFeastDay: boolean; menaionFeast?: boolean },
): Partial<Record<LiturgicalTextCategory, LiturgicalTextItem[]>> {
  const feastNote = options.isFeastDay;
  const menaionFeast = !!options.menaionFeast;

  return {
    prokeimenon: [
      toSticheronItem('prokeimenon', sequence.prokeimenon, lang, feastNote, menaionFeast),
    ],
    alleluia: [toSticheronItem('alleluia', sequence.alleluia, lang, feastNote, menaionFeast)],
    communion: [
      toCommunionItem(
        sequence.communion,
        lang,
        feastNote,
        options.isSunday,
        menaionFeast,
      ),
    ],
  };
}
