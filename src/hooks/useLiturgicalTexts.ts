import { useEffect, useMemo, useState } from 'react';

import type { OrthocalDay, OrthocalVerse } from '../lib/api/orthocal';
import { applyChurchSlavonicToSections } from '../lib/bible/churchSlavonicScripture';
import { applyGreekToSections } from '../lib/bible/greekScripture';
import { overlayTypikonSlavonicHymns } from '../lib/liturgical/menaion/overlayTypikonSlavonicHymns';
import {
  buildLiturgicalTextSections,
  type BuildLiturgicalTextsOptions,
  type LiturgicalTextCategory,
  type LiturgicalTextSection,
} from '../lib/liturgical/liturgicalTexts';
import {
  needsGreekSections,
  needsSlavonicSections,
  readingsSideBySide,
  type ReadingsCompareSides,
  type ReadingsSingleLanguage,
  type TextLanguage,
} from '../lib/readings/textLanguage';
import { translate } from '../i18n/translate';
import type { UiLanguage } from '../state/PreferencesContext';

const SCRIPTURE_CATEGORIES = new Set<LiturgicalTextCategory>([
  'epistle',
  'gospel',
  'prokeimenon',
  'alleluia',
  'communion',
]);

function annotateNonScriptureForTranslation(
  sections: LiturgicalTextSection[],
  lang: UiLanguage,
  noteKey: 'vestments.slavonicNoText' | 'readings.greekNoText',
): LiturgicalTextSection[] {
  const note = translate(lang, noteKey);
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

export function sectionsForReadingsLanguage(
  lang: ReadingsSingleLanguage | null,
  englishSections: LiturgicalTextSection[],
  slavonicSections: LiturgicalTextSection[] | null,
  greekSections: LiturgicalTextSection[] | null,
): LiturgicalTextSection[] | null {
  if (!lang) return null;
  if (lang === 'en') return englishSections;
  if (lang === 'chu') return slavonicSections;
  return greekSections;
}

export function loadingForReadingsLanguage(
  lang: ReadingsSingleLanguage | null,
  loadingSlavonic: boolean,
  loadingGreek: boolean,
): boolean {
  if (!lang) return false;
  if (lang === 'chu') return loadingSlavonic;
  if (lang === 'el') return loadingGreek;
  return false;
}

export function useLiturgicalTexts(
  day: OrthocalDay | null,
  textLang: TextLanguage,
  uiLanguage: UiLanguage = 'en',
  options: BuildLiturgicalTextsOptions = {},
  compareSides: ReadingsCompareSides = { left: null, right: null },
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
  const [greekSections, setGreekSections] = useState<LiturgicalTextSection[] | null>(null);
  const [loadingSlavonic, setLoadingSlavonic] = useState(false);
  const [loadingGreek, setLoadingGreek] = useState(false);

  const sideBySide = readingsSideBySide(textLang);
  const loadSlavonic = needsSlavonicSections(textLang, compareSides);
  const loadGreek = needsGreekSections(textLang, compareSides);

  useEffect(() => {
    if (!loadSlavonic) {
      setSlavonicSections(null);
      setLoadingSlavonic(false);
    } else if (!day) {
      setSlavonicSections(null);
      setLoadingSlavonic(false);
    } else {
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
        setSlavonicSections(annotateNonScriptureForTranslation(withHymns, uiLanguage, 'vestments.slavonicNoText'));
        setLoadingSlavonic(false);
      });

      return () => {
        cancelled = true;
      };
    }
  }, [day, englishSections, passageMap, loadSlavonic, uiLanguage, julianMonthDay, appearanceKey]);

  useEffect(() => {
    if (!loadGreek) {
      setGreekSections(null);
      setLoadingGreek(false);
    } else if (!day) {
      setGreekSections(null);
      setLoadingGreek(false);
    } else {
      let cancelled = false;
      setLoadingGreek(true);

      applyGreekToSections(englishSections, passageMap).then((translated) => {
        if (cancelled) return;
        setGreekSections(annotateNonScriptureForTranslation(translated, uiLanguage, 'readings.greekNoText'));
        setLoadingGreek(false);
      });

      return () => {
        cancelled = true;
      };
    }
  }, [day, englishSections, passageMap, loadGreek, uiLanguage]);

  const displaySections = useMemo(() => {
    if (textLang === 'chu') return slavonicSections ?? englishSections;
    if (textLang === 'el') return greekSections ?? englishSections;
    return englishSections;
  }, [englishSections, greekSections, slavonicSections, textLang]);

  const leftSections = useMemo(
    () =>
      sectionsForReadingsLanguage(
        sideBySide ? compareSides.left : null,
        englishSections,
        slavonicSections,
        greekSections,
      ),
    [compareSides.left, englishSections, greekSections, sideBySide, slavonicSections],
  );

  const rightSections = useMemo(
    () =>
      sectionsForReadingsLanguage(
        sideBySide ? compareSides.right : null,
        englishSections,
        slavonicSections,
        greekSections,
      ),
    [compareSides.right, englishSections, greekSections, sideBySide, slavonicSections],
  );

  const leftLoading = loadingForReadingsLanguage(compareSides.left, loadingSlavonic, loadingGreek);
  const rightLoading = loadingForReadingsLanguage(compareSides.right, loadingSlavonic, loadingGreek);

  return {
    englishSections,
    slavonicSections,
    greekSections,
    displaySections,
    leftSections,
    rightSections,
    loadingSlavonic,
    loadingGreek,
    leftLoading,
    rightLoading,
    sideBySide,
  };
}
