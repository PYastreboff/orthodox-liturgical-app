import { useEffect, useMemo, useState } from 'react';

import type { OrthocalDay, OrthocalVerse } from '../lib/api/orthocal';
import { applyChurchSlavonicToSections } from '../lib/bible/churchSlavonicScripture';
import { overlayTypikonSlavonicHymns } from '../lib/liturgical/menaion/overlayTypikonSlavonicHymns';
import {
  buildLiturgicalTextSections,
  type BuildLiturgicalTextsOptions,
  type LiturgicalTextCategory,
  type LiturgicalTextSection,
} from '../lib/liturgical/liturgicalTexts';
import { translate } from '../i18n/translate';
import type { TextLanguage, UiLanguage } from '../state/PreferencesContext';

const SCRIPTURE_CATEGORIES = new Set<LiturgicalTextCategory>([
  'epistle',
  'gospel',
  'prokeimenon',
  'alleluia',
  'communion',
]);

function annotateNonScriptureForSlavonic(
  sections: LiturgicalTextSection[],
  lang: UiLanguage,
): LiturgicalTextSection[] {
  const note = translate(lang, 'vestments.slavonicNoText');
  return sections.map((section) => {
    if (SCRIPTURE_CATEGORIES.has(section.id) || !section.items.length) return section;
    return {
      ...section,
      items: section.items.map((item) => ({
        ...item,
        detail: item.menaionSlavonic ? item.detail : item.detail ? `${item.detail} · ${note}` : note,
      })),
    };
  });
}

function englishPassagesByCitation(day: OrthocalDay | null): Map<string, OrthocalVerse[] | undefined> {
  const map = new Map<string, OrthocalVerse[] | undefined>();
  if (!day?.readings) return map;
  for (const reading of day.readings) {
    if (!reading.passage?.length) continue;
    for (const key of [reading.display, reading.short_display]) {
      const trimmed = key?.trim();
      if (trimmed) map.set(trimmed, reading.passage);
    }
  }
  return map;
}

export function useLiturgicalTexts(
  day: OrthocalDay | null,
  textLang: TextLanguage,
  uiLanguage: UiLanguage = 'en',
  options: BuildLiturgicalTextsOptions = {},
) {
  const julianMonthDay = options.julianMonthDay;
  const appearanceKey = options.appearanceKey;

  const buildOptions = useMemo(
    (): BuildLiturgicalTextsOptions => ({
      julianMonthDay,
      appearanceKey,
      textLang,
    }),
    [julianMonthDay, appearanceKey, textLang],
  );

  const englishSections = useMemo(
    () => buildLiturgicalTextSections(day, uiLanguage, buildOptions),
    [day, uiLanguage, buildOptions],
  );
  const passageMap = useMemo(() => englishPassagesByCitation(day), [day]);

  const [slavonicSections, setSlavonicSections] = useState<LiturgicalTextSection[] | null>(null);
  const [loadingSlavonic, setLoadingSlavonic] = useState(false);

  useEffect(() => {
    if (textLang === 'en' || !day) {
      setSlavonicSections(null);
      setLoadingSlavonic(false);
      return;
    }

    let cancelled = false;
    setLoadingSlavonic(true);

    applyChurchSlavonicToSections(englishSections, passageMap).then((scriptureSlavonic) => {
      if (cancelled) return;

      const withHymns = overlayTypikonSlavonicHymns(
        scriptureSlavonic,
        day,
        { julianMonthDay, appearanceKey },
        uiLanguage,
      );
      setSlavonicSections(annotateNonScriptureForSlavonic(withHymns, uiLanguage));
      setLoadingSlavonic(false);
    });

    return () => {
      cancelled = true;
    };
  }, [day, englishSections, passageMap, textLang, uiLanguage, julianMonthDay, appearanceKey]);

  const displaySections = useMemo(() => {
    if (textLang === 'chu') {
      return slavonicSections ?? englishSections;
    }
    return englishSections;
  }, [englishSections, slavonicSections, textLang]);

  return {
    englishSections,
    slavonicSections,
    displaySections,
    loadingSlavonic,
    sideBySide: textLang === 'both',
  };
}
