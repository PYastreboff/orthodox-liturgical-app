import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View, type ScrollView, type View as RNView, type ViewStyle } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { AppScrollView } from './AppScrollView';
import { CompareSidePicker } from './CompareSidePicker';
import { LiturgyDisplayControls } from './LiturgyDisplayControls';
import { LiturgyLine } from './LiturgyLine';
import { LiturgySearchBar } from './LiturgySearchBar';
import { useTabBarClearance } from '../hooks/useTabBarBottomPadding';
import { useTabBarScroll } from '../hooks/useTabBarScroll';
import { useLayoutSafeAreaInsets } from '../hooks/useLayoutSafeAreaInsets';
import { useAppTranslation } from '../i18n/useAppTranslation';
import { useBasilLiturgy } from '../hooks/useBasilLiturgy';
import { useChrysostomLiturgy } from '../hooks/useChrysostomLiturgy';
import { useVespersLiturgy } from '../hooks/useVespersLiturgy';
import {
  BASIL_SECTION_IDS,
  basilSectionParagraphs,
  basilTitleKey,
  type BasilSection,
  type BasilSectionId,
} from '../lib/liturgy/basilLiturgy';
import {
  CHRYSOSTOM_SECTION_IDS,
  chrysostomSectionParagraphs,
  chrysostomTitleKey,
  type ChrysostomSection,
  type ChrysostomSectionId,
} from '../lib/liturgy/chrysostomLiturgy';
import {
  VESPERS_SECTION_IDS,
  vespersSectionParagraphs,
  vespersTitleKey,
  type VespersSection,
  type VespersSectionId,
} from '../lib/liturgy/vespersLiturgy';
import type { WorshipServiceId } from '../lib/liturgical/worshipNavigation';
import type { LiturgyDisplayMode, LiturgyTextLang } from '../lib/liturgy/liturgyViewMode';
import { liturgyCompareHasSelection, liturgyCompareReady } from '../lib/liturgy/liturgyViewMode';
import { expandLiturgyDisplayLines } from '../lib/liturgy/liturgySanitize';
import {
  buildWorshipSearchPlan,
  type WorshipLineEntry,
} from '../lib/text/worshipSearch';
import { scrollAppScrollViewToElement } from '../lib/ui/scrollAppScrollViewToElement';
import { surfaceCard } from '../theme/cards';
import { colors, radii } from '../theme/tokens';

type Props = {
  textColor: string;
  mutedColor: string;
  borderColor: string;
  isDark: boolean;
  bodyType: { fontSize: number; lineHeight: number };
  hintType: { fontSize: number; lineHeight: number };
  variant?: 'tab' | 'embedded';
  scrollBottomPadding?: number;
  /** Tab route name — enables tab-bar scroll reporting / tap-to-top when in tab mode. */
  scrollRoute?: string;
  service?: WorshipServiceId;
  onServiceChange?: (service: WorshipServiceId) => void;
  showServiceToggle?: boolean;
};

type LiturgyLoadState =
  | { status: 'loading'; sections: readonly ChrysostomSection[] | readonly BasilSection[] | readonly VespersSection[] }
  | { status: 'ready'; sections: readonly ChrysostomSection[] | readonly BasilSection[] | readonly VespersSection[] }
  | { status: 'offline'; sections: readonly ChrysostomSection[] | readonly BasilSection[] | readonly VespersSection[]; error: string };

function normalizeSearch(value: string): string {
  return value.trim();
}

function collectWorshipLineEntries(
  sections: readonly ChrysostomSection[] | readonly BasilSection[] | readonly VespersSection[],
  service: WorshipServiceId,
  mode: LiturgyDisplayMode,
): WorshipLineEntry[] {
  const entries: WorshipLineEntry[] = [];

  if (service === 'vespers') {
    const vSections = sections as readonly VespersSection[];
    for (const id of VESPERS_SECTION_IDS) {
      if (!sectionHasVespersContent(vSections, id)) continue;
      if (mode.kind === 'compare') {
        if (!liturgyCompareHasSelection(mode)) continue;
        const left = mode.left;
        const right = mode.right;
        const leftLines = left ? vespersSectionParagraphs(vSections, id, left) : [];
        const rightLines = right ? vespersSectionParagraphs(vSections, id, right) : [];
        const rowCount = Math.max(leftLines.length, rightLines.length);
        for (let row = 0; row < rowCount; row += 1) {
          if (left) {
            expandLiturgyDisplayLines(leftLines[row] ?? '')
              .filter((line) => line.trim())
              .forEach((line, index) => {
                entries.push({ key: `${id}-compare-${row}-left-${index}`, line, lang: left });
              });
          }
          if (right) {
            expandLiturgyDisplayLines(rightLines[row] ?? '')
              .filter((line) => line.trim())
              .forEach((line, index) => {
                entries.push({ key: `${id}-compare-${row}-right-${index}`, line, lang: right });
              });
          }
        }
      } else {
        vespersSectionParagraphs(vSections, id, mode.lang)
          .flatMap((line) => expandLiturgyDisplayLines(line))
          .filter((line) => line.trim())
          .forEach((line, index) => {
            entries.push({ key: `${id}-${index}`, line, lang: mode.lang });
          });
      }
    }
    return entries;
  }

  if (service === 'basil') {
    const bSections = sections as readonly BasilSection[];
    for (const id of BASIL_SECTION_IDS) {
      if (!sectionHasDivineLiturgyContent(bSections, id, 'basil')) continue;
      if (mode.kind === 'compare') {
        if (!liturgyCompareHasSelection(mode)) continue;
        const left = mode.left;
        const right = mode.right;
        const leftLines = left ? basilSectionParagraphs(bSections, id, left) : [];
        const rightLines = right ? basilSectionParagraphs(bSections, id, right) : [];
        const rowCount = Math.max(leftLines.length, rightLines.length);
        for (let row = 0; row < rowCount; row += 1) {
          if (left) {
            expandLiturgyDisplayLines(leftLines[row] ?? '')
              .filter((line) => line.trim())
              .forEach((line, index) => {
                entries.push({ key: `${id}-compare-${row}-left-${index}`, line, lang: left });
              });
          }
          if (right) {
            expandLiturgyDisplayLines(rightLines[row] ?? '')
              .filter((line) => line.trim())
              .forEach((line, index) => {
                entries.push({ key: `${id}-compare-${row}-right-${index}`, line, lang: right });
              });
          }
        }
      } else {
        basilSectionParagraphs(bSections, id, mode.lang)
          .flatMap((line) => expandLiturgyDisplayLines(line))
          .filter((line) => line.trim())
          .forEach((line, index) => {
            entries.push({ key: `${id}-${index}`, line, lang: mode.lang });
          });
      }
    }
    return entries;
  }

  const cSections = sections as readonly ChrysostomSection[];
  for (const id of CHRYSOSTOM_SECTION_IDS) {
    if (!sectionHasChrysostomContent(cSections, id)) continue;
    if (mode.kind === 'compare') {
      if (!liturgyCompareHasSelection(mode)) continue;
      const left = mode.left;
      const right = mode.right;
      const leftLines = left ? chrysostomSectionParagraphs(cSections, id, left) : [];
      const rightLines = right ? chrysostomSectionParagraphs(cSections, id, right) : [];
      const rowCount = Math.max(leftLines.length, rightLines.length);
      for (let row = 0; row < rowCount; row += 1) {
        if (left) {
          expandLiturgyDisplayLines(leftLines[row] ?? '')
            .filter((line) => line.trim())
            .forEach((line, index) => {
              entries.push({ key: `${id}-compare-${row}-left-${index}`, line, lang: left });
            });
        }
        if (right) {
          expandLiturgyDisplayLines(rightLines[row] ?? '')
            .filter((line) => line.trim())
            .forEach((line, index) => {
              entries.push({ key: `${id}-compare-${row}-right-${index}`, line, lang: right });
            });
        }
      }
    } else {
      chrysostomSectionParagraphs(cSections, id, mode.lang)
        .flatMap((line) => expandLiturgyDisplayLines(line))
        .filter((line) => line.trim())
        .forEach((line, index) => {
          entries.push({ key: `${id}-${index}`, line, lang: mode.lang });
        });
    }
  }

  return entries;
}

function WorshipLiturgyLineItem({
  lineKey,
  line,
  lang,
  textColor,
  mutedColor,
  isDark,
  compact = false,
  searchQuery,
  activeMatchIndex,
  matchIndexOffset,
  registerLineRef,
}: {
  lineKey: string;
  line: string;
  lang: LiturgyTextLang;
  textColor: string;
  mutedColor: string;
  isDark: boolean;
  compact?: boolean;
  searchQuery: string;
  activeMatchIndex: number | null;
  matchIndexOffset: number;
  registerLineRef: (key: string, node: RNView | null) => void;
}) {
  return (
    <View
      ref={(node) => registerLineRef(lineKey, node)}
      nativeID={`worship-search-line-${lineKey}`}
      style={compact ? styles.compareLineItem : styles.lineItem}
    >
      <LiturgyLine
        line={line}
        lang={lang}
        textColor={textColor}
        mutedColor={mutedColor}
        isDark={isDark}
        compact={compact}
        searchQuery={searchQuery}
        activeMatchIndex={activeMatchIndex}
        matchIndexOffset={matchIndexOffset}
      />
    </View>
  );
}

function sectionHasDivineLiturgyContent(
  sections: readonly ChrysostomSection[] | readonly BasilSection[],
  id: ChrysostomSectionId | BasilSectionId,
  variant: 'chrysostom' | 'basil',
): boolean {
  return (['en', 'el', 'ru'] as const).some((lang) => {
    const lines =
      variant === 'basil'
        ? basilSectionParagraphs(sections as readonly BasilSection[], id as BasilSectionId, lang)
        : chrysostomSectionParagraphs(
            sections as readonly ChrysostomSection[],
            id as ChrysostomSectionId,
            lang,
          );
    return lines.some((line) => line.trim());
  });
}

function sectionHasChrysostomContent(
  sections: readonly ChrysostomSection[],
  id: ChrysostomSectionId,
): boolean {
  return sectionHasDivineLiturgyContent(sections, id, 'chrysostom');
}

function sectionHasVespersContent(
  sections: readonly VespersSection[],
  id: VespersSectionId,
): boolean {
  return (['en', 'el', 'ru'] as const).some((lang) =>
    vespersSectionParagraphs(sections, id, lang).some((line) => line.trim()),
  );
}

function CompareCell({
  lineKeyPrefix,
  lines,
  lang,
  textColor,
  mutedColor,
  isDark,
  searchQuery,
  activeMatchIndex,
  searchOffsets,
  registerLineRef,
}: {
  lineKeyPrefix: string;
  lines: string[];
  lang: 'en' | 'el' | 'ru';
  textColor: string;
  mutedColor: string;
  isDark: boolean;
  searchQuery: string;
  activeMatchIndex: number | null;
  searchOffsets: Record<string, number>;
  registerLineRef: (key: string, node: RNView | null) => void;
}) {
  const expanded = lines.flatMap((line) => expandLiturgyDisplayLines(line)).filter((line) => line.trim());
  if (!expanded.length) {
    return null;
  }
  return (
    <>
      {expanded.map((line, index) => {
        const lineKey = `${lineKeyPrefix}-${index}`;
        return (
          <WorshipLiturgyLineItem
            key={lineKey}
            lineKey={lineKey}
            line={line}
            lang={lang}
            textColor={textColor}
            mutedColor={mutedColor}
            isDark={isDark}
            compact
            searchQuery={searchQuery}
            activeMatchIndex={activeMatchIndex}
            matchIndexOffset={searchOffsets?.[lineKey] ?? 0}
            registerLineRef={registerLineRef}
          />
        );
      })}
    </>
  );
}

function LiturgySectionBlock({
  title,
  body,
  textColor,
  isDark,
  bodyType,
}: {
  title: string;
  body: ReactNode;
  textColor: string;
  isDark: boolean;
  bodyType: { fontSize: number; lineHeight: number };
}) {
  const titleColor = isDark ? '#e8c97a' : colors.accentWine;
  if (!body) return null;

  return (
    <View style={[styles.sectionCard, surfaceCard(isDark, { radius: radii.lg })]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, bodyType, { color: titleColor }]}>{title}</Text>
      </View>
      {body}
    </View>
  );
}

function ChrysostomSectionBody({
  id,
  sections,
  mode,
  textColor,
  mutedColor,
  borderColor,
  isDark,
  bodyType,
  searchQuery,
  activeMatchIndex,
  searchOffsets,
  registerLineRef,
  variant = 'chrysostom',
}: {
  id: ChrysostomSectionId | BasilSectionId;
  sections: readonly ChrysostomSection[] | readonly BasilSection[];
  mode: LiturgyDisplayMode;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  isDark: boolean;
  bodyType: { fontSize: number; lineHeight: number };
  searchQuery: string;
  activeMatchIndex: number | null;
  searchOffsets: Record<string, number>;
  registerLineRef: (key: string, node: RNView | null) => void;
  variant?: 'chrysostom' | 'basil';
}) {
  const { t } = useAppTranslation();
  const title = t(variant === 'basil' ? basilTitleKey(id as BasilSectionId) : chrysostomTitleKey(id as ChrysostomSectionId));

  if (!sectionHasDivineLiturgyContent(sections, id, variant)) return null;

  const sectionParagraphs = (sectionId: ChrysostomSectionId | BasilSectionId, lang: LiturgyTextLang) =>
    variant === 'basil'
      ? basilSectionParagraphs(sections as readonly BasilSection[], sectionId as BasilSectionId, lang)
      : chrysostomSectionParagraphs(
          sections as readonly ChrysostomSection[],
          sectionId as ChrysostomSectionId,
          lang,
        );

  const body = (() => {
    if (mode.kind === 'compare') {
      const left = mode.left;
      const right = mode.right;
      const hasSelection = liturgyCompareHasSelection(mode);
      const leftLines = left ? sectionParagraphs(id, left) : [];
      const rightLines = right ? sectionParagraphs(id, right) : [];
      const rowCount = Math.max(leftLines.length, rightLines.length);

      if (!hasSelection) return null;

      const rows = Array.from({ length: rowCount }, (_, row) => {
        const leftCell = left ? (
          <CompareCell
            lineKeyPrefix={`${id}-compare-${row}-left`}
            lines={[leftLines[row] ?? '']}
            lang={left}
            textColor={textColor}
            mutedColor={mutedColor}
            isDark={isDark}
            searchQuery={searchQuery}
            activeMatchIndex={activeMatchIndex}
            searchOffsets={searchOffsets}
            registerLineRef={registerLineRef}
          />
        ) : null;
        const rightCell = right ? (
          <CompareCell
            lineKeyPrefix={`${id}-compare-${row}-right`}
            lines={[rightLines[row] ?? '']}
            lang={right}
            textColor={textColor}
            mutedColor={mutedColor}
            isDark={isDark}
            searchQuery={searchQuery}
            activeMatchIndex={activeMatchIndex}
            searchOffsets={searchOffsets}
            registerLineRef={registerLineRef}
          />
        ) : null;
        if (!leftCell && !rightCell) return null;
        return (
          <View key={`${id}-compare-${row}`} style={styles.compareRow}>
            <View style={[styles.compareCell, styles.compareCellFlex]}>{leftCell}</View>
            <View style={[styles.columnDivider, { backgroundColor: borderColor }]} />
            <View style={[styles.compareCell, styles.compareCellFlex]}>{rightCell}</View>
          </View>
        );
      }).filter(Boolean);

      if (!rows.length) return null;
      return <View style={styles.compareBody}>{rows}</View>;
    }

    const lang = mode.lang;
    const lines = sectionParagraphs(id, lang)
      .flatMap((line) => expandLiturgyDisplayLines(line))
      .filter((line) => line.trim());

    if (!lines.length) return null;

    return (
      <View style={styles.lines}>
        {lines.map((line, index) => {
          const lineKey = `${id}-${index}`;
          return (
            <WorshipLiturgyLineItem
              key={lineKey}
              lineKey={lineKey}
              line={line}
              lang={lang}
              textColor={textColor}
              mutedColor={mutedColor}
              isDark={isDark}
              searchQuery={searchQuery}
              activeMatchIndex={activeMatchIndex}
              matchIndexOffset={searchOffsets?.[lineKey] ?? 0}
              registerLineRef={registerLineRef}
            />
          );
        })}
      </View>
    );
  })();

  return (
    <LiturgySectionBlock
      title={title}
      body={body}
      textColor={textColor}
      isDark={isDark}
      bodyType={bodyType}
    />
  );
}

function VespersSectionBody({
  id,
  sections,
  mode,
  textColor,
  mutedColor,
  borderColor,
  isDark,
  bodyType,
  searchQuery,
  activeMatchIndex,
  searchOffsets,
  registerLineRef,
}: {
  id: VespersSectionId;
  sections: readonly VespersSection[];
  mode: LiturgyDisplayMode;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  isDark: boolean;
  bodyType: { fontSize: number; lineHeight: number };
  searchQuery: string;
  activeMatchIndex: number | null;
  searchOffsets: Record<string, number>;
  registerLineRef: (key: string, node: RNView | null) => void;
}) {
  const { t } = useAppTranslation();
  const title = t(vespersTitleKey(id));

  if (!sectionHasVespersContent(sections, id)) return null;

  const body = (() => {
    if (mode.kind === 'compare') {
      const left = mode.left;
      const right = mode.right;
      const hasSelection = liturgyCompareHasSelection(mode);
      const leftLines = left ? vespersSectionParagraphs(sections, id, left) : [];
      const rightLines = right ? vespersSectionParagraphs(sections, id, right) : [];
      const rowCount = Math.max(leftLines.length, rightLines.length);

      if (!hasSelection) return null;

      const rows = Array.from({ length: rowCount }, (_, row) => {
        const leftCell = left ? (
          <CompareCell
            lineKeyPrefix={`${id}-compare-${row}-left`}
            lines={[leftLines[row] ?? '']}
            lang={left}
            textColor={textColor}
            mutedColor={mutedColor}
            isDark={isDark}
            searchQuery={searchQuery}
            activeMatchIndex={activeMatchIndex}
            searchOffsets={searchOffsets}
            registerLineRef={registerLineRef}
          />
        ) : null;
        const rightCell = right ? (
          <CompareCell
            lineKeyPrefix={`${id}-compare-${row}-right`}
            lines={[rightLines[row] ?? '']}
            lang={right}
            textColor={textColor}
            mutedColor={mutedColor}
            isDark={isDark}
            searchQuery={searchQuery}
            activeMatchIndex={activeMatchIndex}
            searchOffsets={searchOffsets}
            registerLineRef={registerLineRef}
          />
        ) : null;
        if (!leftCell && !rightCell) return null;
        return (
          <View key={`${id}-compare-${row}`} style={styles.compareRow}>
            <View style={[styles.compareCell, styles.compareCellFlex]}>{leftCell}</View>
            <View style={[styles.columnDivider, { backgroundColor: borderColor }]} />
            <View style={[styles.compareCell, styles.compareCellFlex]}>{rightCell}</View>
          </View>
        );
      }).filter(Boolean);

      if (!rows.length) return null;
      return <View style={styles.compareBody}>{rows}</View>;
    }

    const lang = mode.lang;
    const lines = vespersSectionParagraphs(sections, id, lang)
      .flatMap((line) => expandLiturgyDisplayLines(line))
      .filter((line) => line.trim());

    if (!lines.length) return null;

    return (
      <View style={styles.lines}>
        {lines.map((line, index) => {
          const lineKey = `${id}-${index}`;
          return (
            <WorshipLiturgyLineItem
              key={lineKey}
              lineKey={lineKey}
              line={line}
              lang={lang}
              textColor={textColor}
              mutedColor={mutedColor}
              isDark={isDark}
              searchQuery={searchQuery}
              activeMatchIndex={activeMatchIndex}
              matchIndexOffset={searchOffsets?.[lineKey] ?? 0}
              registerLineRef={registerLineRef}
            />
          );
        })}
      </View>
    );
  })();

  return (
    <LiturgySectionBlock
      title={title}
      body={body}
      textColor={textColor}
      isDark={isDark}
      bodyType={bodyType}
    />
  );
}

export function WorshipLiturgyBody({
  textColor,
  mutedColor,
  borderColor,
  isDark,
  bodyType,
  hintType,
  variant = 'embedded',
  scrollBottomPadding = 24,
  scrollRoute,
  service = 'chrysostom',
  onServiceChange,
  showServiceToggle = false,
}: Props) {
  const { t } = useAppTranslation();
  const tabBarClearance = useTabBarClearance(8);
  const layoutInsets = useLayoutSafeAreaInsets();
  const comparePickerBottomInset =
    variant === 'tab' ? tabBarClearance : layoutInsets.bottom + 8;
  const chrysostom = useChrysostomLiturgy();
  const basil = useBasilLiturgy();
  const vespers = useVespersLiturgy();
  const [mode, setMode] = useState<LiturgyDisplayMode>({ kind: 'single', lang: 'en' });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMatchIndex, setActiveMatchIndex] = useState<number | null>(null);
  const searchNorm = normalizeSearch(searchQuery);
  const pageBg = isDark ? colors.darkBg : colors.parchment;
  const scrollRef = useRef<ScrollView>(null);
  const onTabScroll = useTabBarScroll(scrollRoute ?? '__none__', scrollRef);
  const scrollContentRef = useRef<RNView>(null);
  const searchCardRef = useRef<RNView>(null);
  const stickySearchHeightRef = useRef(48);
  const lineRefs = useRef<Record<string, RNView | null>>({});
  const shouldScrollToMatch = useRef(false);

  const onSearchCardLayout = useCallback(() => {
    searchCardRef.current?.measure((_x, _y, _width, height) => {
      if (height > 0) stickySearchHeightRef.current = height + 8;
    });
  }, []);

  const registerLineRef = useCallback((key: string, node: RNView | null) => {
    if (node) {
      lineRefs.current[key] = node;
      return;
    }
    delete lineRefs.current[key];
  }, []);

  const liturgyState: LiturgyLoadState =
    service === 'vespers'
      ? vespers.status === 'loading'
        ? { status: 'loading', sections: vespers.sections }
        : vespers.status === 'offline'
          ? { status: 'offline', sections: [], error: vespers.error }
          : { status: 'ready', sections: vespers.sections }
      : service === 'basil'
        ? basil.status === 'loading'
          ? { status: 'loading', sections: basil.sections }
          : basil.status === 'offline'
            ? { status: 'offline', sections: [], error: basil.error }
            : { status: 'ready', sections: basil.sections }
        : chrysostom.status === 'loading'
          ? { status: 'loading', sections: chrysostom.sections }
          : chrysostom.status === 'offline'
            ? { status: 'offline', sections: [], error: chrysostom.error }
            : { status: 'ready', sections: chrysostom.sections };

  const introKey =
    service === 'vespers'
      ? 'liturgy.vespers.intro'
      : service === 'basil'
        ? 'liturgy.basil.intro'
        : 'liturgy.chrysostom.intro';
  const disclaimerKey =
    service === 'vespers'
      ? 'liturgy.vespers.disclaimer'
      : service === 'basil'
        ? 'liturgy.basil.disclaimer'
        : 'liturgy.chrysostom.disclaimer';
  const loadingKey =
    service === 'vespers'
      ? 'liturgy.vespers.loading'
      : service === 'basil'
        ? 'liturgy.basil.loading'
        : 'liturgy.chrysostom.loading';
  const offlineKey =
    service === 'vespers'
      ? 'liturgy.vespers.offline'
      : service === 'basil'
        ? 'liturgy.basil.offline'
        : 'liturgy.chrysostom.offline';

  const inCompareMode = liturgyState.status === 'ready' && mode.kind === 'compare';
  const compareReady = inCompareMode && liturgyCompareReady(mode);
  const showCompareSetup = inCompareMode && !compareReady;

  const showSections =
    liturgyState.status === 'ready' &&
    (mode.kind !== 'compare' || compareReady);

  const searchPlan = useMemo(() => {
    if (!searchNorm || !showSections) return null;
    const entries = collectWorshipLineEntries(liturgyState.sections, service, mode);
    return buildWorshipSearchPlan(entries, searchNorm);
  }, [liturgyState.sections, mode, searchNorm, service, showSections]);

  const searchMatchCount = searchPlan?.total ?? (searchNorm ? 0 : null);

  useEffect(() => {
    if (!searchNorm) {
      setActiveMatchIndex(null);
      return;
    }
    shouldScrollToMatch.current = false;
    setActiveMatchIndex(0);
  }, [searchNorm, service, mode]);

  const goToMatch = useCallback(
    (index: number) => {
      if (!searchPlan?.total) return;
      const wrapped = ((index % searchPlan.total) + searchPlan.total) % searchPlan.total;
      shouldScrollToMatch.current = true;
      setActiveMatchIndex(wrapped);
    },
    [searchPlan],
  );

  const goToNextMatch = useCallback(() => {
    goToMatch((activeMatchIndex ?? -1) + 1);
  }, [activeMatchIndex, goToMatch]);

  const goToPreviousMatch = useCallback(() => {
    goToMatch((activeMatchIndex ?? 0) - 1);
  }, [activeMatchIndex, goToMatch]);

  useEffect(() => {
    if (!shouldScrollToMatch.current) return;
    shouldScrollToMatch.current = false;
    if (!searchNorm || activeMatchIndex === null || !searchPlan?.total) return;
    const lineKey = searchPlan.lineKeys[activeMatchIndex];
    if (!lineKey) return;

    const matchId = `worship-search-match-${activeMatchIndex}`;
    const scrollOffset =
      variant === 'tab' && Platform.OS === 'web' ? stickySearchHeightRef.current : 0;

    const scrollToActiveMatch = () => {
      if (variant === 'tab') {
        const lineView = lineRefs.current[lineKey];
        const scrollContent = scrollContentRef.current;
        const scroll = scrollRef.current;
        if (lineView && scrollContent && scroll) {
          lineView.measureLayout(
            scrollContent,
            (_x, y) => {
              scroll.scrollTo({ y: Math.max(0, y - scrollOffset), animated: false });
            },
            () => {
              scrollAppScrollViewToElement(matchId, scrollOffset);
            },
          );
          return;
        }
      }
      scrollAppScrollViewToElement(matchId, scrollOffset);
    };

    if (Platform.OS === 'web') requestAnimationFrame(scrollToActiveMatch);
    else scrollToActiveMatch();
  }, [activeMatchIndex, searchNorm, searchPlan, variant]);

  const sectionBlocks = useMemo(() => {
    if (!showSections) return null;

    if (service === 'vespers') {
      const sections = liturgyState.sections as readonly VespersSection[];
      return VESPERS_SECTION_IDS.map((id) => (
        <VespersSectionBody
          key={id}
          id={id}
          sections={sections}
          mode={mode}
          textColor={textColor}
          mutedColor={mutedColor}
          borderColor={borderColor}
          isDark={isDark}
          bodyType={bodyType}
          searchQuery={searchNorm}
          activeMatchIndex={activeMatchIndex}
          searchOffsets={searchPlan?.offsets ?? {}}
          registerLineRef={registerLineRef}
        />
      ));
    }

    const sections = liturgyState.sections as readonly ChrysostomSection[] | readonly BasilSection[];
    const sectionIds = service === 'basil' ? BASIL_SECTION_IDS : CHRYSOSTOM_SECTION_IDS;
    return sectionIds.map((id) => (
      <ChrysostomSectionBody
        key={id}
        id={id}
        sections={sections}
        variant={service === 'basil' ? 'basil' : 'chrysostom'}
        mode={mode}
        textColor={textColor}
        mutedColor={mutedColor}
        borderColor={borderColor}
        isDark={isDark}
        bodyType={bodyType}
        searchQuery={searchNorm}
        activeMatchIndex={activeMatchIndex}
        searchOffsets={searchPlan?.offsets ?? {}}
        registerLineRef={registerLineRef}
      />
    ));
  }, [
    activeMatchIndex,
    bodyType,
    borderColor,
    isDark,
    liturgyState.sections,
    mode,
    mutedColor,
    registerLineRef,
    searchNorm,
    searchPlan?.offsets,
    service,
    showSections,
    textColor,
  ]);

  const reload =
    service === 'vespers' ? vespers.reload : service === 'basil' ? basil.reload : chrysostom.reload;

  const displayControls = (
    <LiturgyDisplayControls
      service={service}
      onServiceChange={onServiceChange}
      showServiceToggle={showServiceToggle}
      mode={mode}
      onChange={setMode}
      isDark={isDark}
    />
  );

  const compareSlots = inCompareMode ? (
    <CompareSidePicker<LiturgyTextLang>
      left={mode.left}
      right={mode.right}
      onChangeLeft={(left) => setMode({ kind: 'compare', left, right: mode.right })}
      onChangeRight={(right) => setMode({ kind: 'compare', left: mode.left, right })}
      options={[
        { value: 'en', label: t('liturgy.chrysostom.langEnglish') },
        { value: 'el', label: t('liturgy.chrysostom.langGreek') },
        { value: 'ru', label: t('liturgy.chrysostom.langSlavonic') },
      ]}
      isDark={isDark}
      fill={showCompareSetup}
      fillLayout={showCompareSetup ? 'flex' : 'measure'}
      bottomInset={showCompareSetup ? undefined : comparePickerBottomInset}
    />
  ) : null;

  const searchBar = (
    <LiturgySearchBar
      searchQuery={searchQuery}
      onSearchQueryChange={(value) => {
        setSearchQuery(value);
        if (!value.trim()) setActiveMatchIndex(null);
      }}
      isDark={isDark}
      hintType={hintType}
      mutedColor={mutedColor}
      textColor={textColor}
      searchMatchCount={searchNorm ? searchMatchCount : null}
      activeMatchIndex={activeMatchIndex}
      onPreviousMatch={goToPreviousMatch}
      onNextMatch={goToNextMatch}
      compact={variant === 'tab'}
    />
  );

  const searchCard = (
    <View style={[styles.searchCard, surfaceCard(isDark, { radius: radii.lg })]}>{searchBar}</View>
  );

  const stickySearchHeader = (
    <View ref={searchCardRef} onLayout={onSearchCardLayout} style={styles.stickySearchShell}>
      <View
        style={[
          styles.stickySearchBackdrop,
          { backgroundColor: pageBg },
          Platform.OS === 'web'
            ? ({
                backgroundColor: 'transparent',
                backgroundImage: `linear-gradient(to bottom, ${pageBg} 0%, ${pageBg} 50%, transparent 50%)`,
              } as unknown as ViewStyle)
            : null,
          { pointerEvents: 'none' },
        ]}
      />
      {searchCard}
    </View>
  );

  const introControls =
    liturgyState.status === 'ready' ? displayControls : null;

  const introHint =
    liturgyState.status === 'ready' && variant !== 'tab' ? (
      <Text style={[styles.intro, hintType, { color: mutedColor }]}>{t(introKey)}</Text>
    ) : null;

  const scrollableHeader =
    liturgyState.status === 'ready' ? (
      variant === 'tab' ? null : (
        <View style={styles.scrollBody}>
          {searchCard}
          {introControls}
          {compareSlots}
          {introHint}
        </View>
      )
    ) : variant === 'tab' ? null : (
      <Text style={[styles.intro, hintType, { color: mutedColor }]}>{t(introKey)}</Text>
    );

  const scrollBody = (
    <>
      {variant === 'tab' ? (
        <>
          {introControls}
          {compareSlots}
        </>
      ) : null}

      {liturgyState.status === 'loading' ? (
        <View style={styles.centered}>
          <ActivityIndicator color={mutedColor} />
          <Text style={[hintType, { color: mutedColor, marginTop: 8 }]}>{t(loadingKey)}</Text>
        </View>
      ) : liturgyState.status === 'offline' ? (
        <View style={styles.centered}>
          <Text style={[bodyType, { color: textColor }]}>{t(offlineKey)}</Text>
          <Pressable onPress={reload} accessibilityRole="button">
            <Text style={[bodyType, styles.retry, { color: textColor }]}>{t('recipes.retry')}</Text>
          </Pressable>
        </View>
      ) : showSections ? (
        <View style={styles.sections}>{sectionBlocks}</View>
      ) : null}

      {!showCompareSetup ? (
        <Text style={[styles.disclaimer, hintType, { color: mutedColor }]}>{t(disclaimerKey)}</Text>
      ) : null}
    </>
  );

  const stickyHeaderVisible = liturgyState.status === 'ready';

  const tabScrollBody = (
    <View
      ref={scrollContentRef}
      style={[
        styles.scrollBody,
        styles.tabBelowSearch,
        showCompareSetup ? styles.scrollBodyFill : null,
      ]}
    >
      {scrollBody}
    </View>
  );

  const tabScrollChildren = (
    <>
      {stickyHeaderVisible ? stickySearchHeader : null}
      {tabScrollBody}
    </>
  );

  if (variant === 'tab') {
    if (showCompareSetup && liturgyState.status === 'ready') {
      return (
        <View style={styles.root}>
          {stickySearchHeader}
          <View style={[styles.compareSetupRoot, { paddingBottom: comparePickerBottomInset }]}>
            {introControls}
            <View style={styles.comparePickerFill}>{compareSlots}</View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.root}>
        {Platform.OS === 'web' ? null : stickyHeaderVisible ? stickySearchHeader : null}
        <AppScrollView
          ref={scrollRef}
          onScroll={onTabScroll}
          scrollEventThrottle={16}
          {...(Platform.OS === 'web' ? { colorScheme: isDark ? 'dark' : 'light' } : {})}
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: scrollBottomPadding },
            showCompareSetup ? styles.scrollContentFill : null,
          ]}
          stickyHeaderIndices={
            Platform.OS === 'web' && stickyHeaderVisible ? [0] : undefined
          }
          showsVerticalScrollIndicator
        >
          {Platform.OS === 'web' ? tabScrollChildren : tabScrollBody}
        </AppScrollView>
      </View>
    );
  }

  return (
    <View style={styles.embeddedRoot}>
      {scrollableHeader}
      <View ref={scrollContentRef} style={styles.scrollBody}>
        {scrollBody}
      </View>
    </View>
  );
}

/** @deprecated Use WorshipLiturgyBody */
export const ChrysostomLiturgyBody = WorshipLiturgyBody;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: 0,
  },
  scrollContentFill: {
    flexGrow: 1,
  },
  scrollBody: {
    gap: 16,
  },
  scrollBodyFill: {
    flexGrow: 1,
    flex: 1,
  },
  compareSetupRoot: {
    flex: 1,
    minHeight: 0,
    paddingTop: 16,
    gap: 12,
  },
  comparePickerFill: {
    flex: 1,
    minHeight: 0,
  },
  embeddedRoot: {
    gap: 16,
  },
  topCard: {
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 1,
  },
  stickySearchShell: {
    position: 'relative',
    zIndex: 2,
    ...(Platform.OS === 'web'
      ? ({
          position: 'sticky',
          top: 0,
        } as unknown as ViewStyle)
      : null),
  },
  stickySearchBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
    ...Platform.select({
      web: { height: '100%' },
      default: { height: '50%' },
    }),
  },
  tabBelowSearch: {
    paddingTop: 16,
  },
  intro: {
    lineHeight: 20,
  },
  centered: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 4,
  },
  retry: {
    fontWeight: '600',
    marginTop: 8,
    textDecorationLine: 'underline',
  },
  disclaimer: {
    opacity: 0.8,
    lineHeight: 18,
    marginTop: 2,
  },
  sections: {
    gap: 12,
  },
  sectionCard: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  lines: {
    gap: 0,
  },
  lineItem: {
    paddingVertical: 5,
  },
  compareLineItem: {
    paddingVertical: 2,
  },
  compareBody: {
    gap: 8,
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 6,
  },
  compareCell: {
    paddingVertical: 4,
    justifyContent: 'flex-start',
  },
  compareCellFlex: {
    flex: 1,
    minWidth: 0,
  },
  columnDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    opacity: 0.35,
  },
});
