import { useEffect, useMemo, useState } from 'react';

import type { OrthocalDay, OrthocalVerse } from '../lib/api/orthocal';
import { applyChurchSlavonicToSections } from '../lib/bible/churchSlavonicScripture';
import {
  buildLiturgicalTextSections,
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
        detail: item.detail ? `${item.detail} · ${note}` : note,
      })),
    };
  });
}

function englishPassagesByCitation(day: OrthocalDay | null): Map<string, OrthocalVerse[] | undefined> {
  const map = new Map<string, OrthocalVerse[] | undefined>();
  if (!day?.readings) return map;
  for (const reading of day.readings) {
    const key = reading.display || reading.short_display;
    if (key && reading.passage?.length) {
      map.set(key, reading.passage);
    }
  }
  return map;
}

export function useLiturgicalTexts(
  day: OrthocalDay | null,
  textLang: TextLanguage,
  uiLanguage: UiLanguage = 'en',
) {
  const englishSections = useMemo(
    () => buildLiturgicalTextSections(day, uiLanguage),
    [day, uiLanguage],
  );
  const passageMap = useMemo(() => englishPassagesByCitation(day), [day]);

  const [slavonicSections, setSlavonicSections] = useState<LiturgicalTextSection[] | null>(null);
  const [loadingSlavonic, setLoadingSlavonic] = useState(false);

  useEffect(() => {
    setSlavonicSections(null);
  }, [englishSections]);

  useEffect(() => {
    if (textLang === 'en' || !day) {
      setLoadingSlavonic(false);
      return;
    }

    let cancelled = false;
    setLoadingSlavonic(true);

    applyChurchSlavonicToSections(englishSections, passageMap).then((next) => {
      if (!cancelled) {
        setSlavonicSections(annotateNonScriptureForSlavonic(next, uiLanguage));
        setLoadingSlavonic(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [day, englishSections, passageMap, textLang, uiLanguage]);

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
