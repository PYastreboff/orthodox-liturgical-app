import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useMemo, useState, type ReactNode } from 'react';
import { Feather } from '@expo/vector-icons';

import { AppScrollView } from './AppScrollView';
import { CompareSidePicker } from './CompareSidePicker';
import { LiturgyLanguageToggle } from './LiturgyLanguageToggle';
import { LiturgyLine } from './LiturgyLine';
import { WorshipServiceToggle } from './WorshipServiceToggle';
import { useAppTranslation } from '../i18n/useAppTranslation';
import { useChrysostomLiturgy } from '../hooks/useChrysostomLiturgy';
import { useVespersLiturgy } from '../hooks/useVespersLiturgy';
import type { UiLanguage } from '../i18n/types';
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
import { liturgyCompareHasSelection } from '../lib/liturgy/liturgyViewMode';
import { expandLiturgyDisplayLines } from '../lib/liturgy/liturgySanitize';
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
  service?: WorshipServiceId;
  onServiceChange?: (service: WorshipServiceId) => void;
  showServiceToggle?: boolean;
};

type LiturgyLoadState =
  | { status: 'loading'; sections: readonly ChrysostomSection[] | readonly VespersSection[] }
  | { status: 'ready'; sections: readonly ChrysostomSection[] | readonly VespersSection[] }
  | { status: 'offline'; sections: readonly ChrysostomSection[] | readonly VespersSection[]; error: string };

function normalizeSearch(value: string): string {
  return value.trim().toLowerCase();
}

function lineMatches(line: string, query: string): boolean {
  if (!query) return true;
  return line.toLowerCase().includes(query);
}

function sectionHasChrysostomContent(
  sections: readonly ChrysostomSection[],
  id: ChrysostomSectionId,
): boolean {
  return (['en', 'el', 'ru'] as const).some((lang) =>
    chrysostomSectionParagraphs(sections, id, lang).some((line) => line.trim()),
  );
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
  lines,
  lang,
  textColor,
  mutedColor,
  isDark,
  searchQuery,
}: {
  lines: string[];
  lang: 'en' | 'el' | 'ru';
  textColor: string;
  mutedColor: string;
  isDark: boolean;
  searchQuery: string;
}) {
  const expanded = lines.flatMap((line) => expandLiturgyDisplayLines(line)).filter((line) => line.trim());
  const filtered = searchQuery
    ? expanded.filter((line) => lineMatches(line, searchQuery))
    : expanded;
  if (!filtered.length) {
    return null;
  }
  return (
    <>
      {filtered.map((line, index) => (
        <LiturgyLine
          key={`${lang}-${index}-${line.slice(0, 12)}`}
          line={line}
          lang={lang}
          textColor={textColor}
          mutedColor={mutedColor}
          isDark={isDark}
          compact
        />
      ))}
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

function LiturgyToolbar({
  service,
  onServiceChange,
  showServiceToggle,
  mode,
  onChange,
  isDark,
  hintType,
  mutedColor,
  textColor,
  searchQuery,
  onSearchQueryChange,
}: {
  service: WorshipServiceId;
  onServiceChange?: (service: WorshipServiceId) => void;
  showServiceToggle: boolean;
  mode: LiturgyDisplayMode;
  onChange: (mode: LiturgyDisplayMode) => void;
  isDark: boolean;
  hintType: { fontSize: number; lineHeight: number };
  mutedColor: string;
  textColor: string;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
}) {
  const { t } = useAppTranslation();
  const searchBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(43,38,35,0.05)';

  return (
    <View style={styles.toolbarStack}>
      {showServiceToggle && onServiceChange ? (
        <WorshipServiceToggle
          value={service}
          onChange={onServiceChange}
          isDark={isDark}
          fullWidth
        />
      ) : null}
      <View style={[styles.searchWrap, { backgroundColor: searchBg, borderColor: mutedColor }]}>
        <Feather name="search" size={16} color={mutedColor} />
        <TextInput
          value={searchQuery}
          onChangeText={onSearchQueryChange}
          placeholder={t('liturgy.worship.searchPlaceholder')}
          placeholderTextColor={mutedColor}
          style={[styles.searchInput, hintType, { color: textColor }]}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          accessibilityLabel={t('liturgy.worship.searchPlaceholder')}
        />
        {searchQuery ? (
          <Pressable
            onPress={() => onSearchQueryChange('')}
            accessibilityRole="button"
            accessibilityLabel={t('liturgy.worship.searchClear')}
            hitSlop={8}
          >
            <Feather name="x" size={16} color={mutedColor} />
          </Pressable>
        ) : null}
      </View>
      <LiturgyLanguageToggle mode={mode} onChange={onChange} isDark={isDark} fullWidth />
      {mode.kind === 'compare' ? (
        <>
          <CompareSidePicker<LiturgyTextLang>
            left={mode.left}
            right={mode.right}
            onChangeLeft={(left) => onChange({ kind: 'compare', left, right: mode.right })}
            onChangeRight={(right) => onChange({ kind: 'compare', left: mode.left, right })}
            options={[
              { value: 'en', label: 'EN' },
              { value: 'el', label: 'ΕΛ' },
              { value: 'ru', label: 'ЧС' },
            ]}
            leftLabel={t('readings.compareColumnLeft')}
            rightLabel={t('readings.compareColumnRight')}
            isDark={isDark}
          />
          <Text style={[hintType, styles.compareHint, { color: mutedColor }]}>
            {t('liturgy.chrysostom.compareHint')}
          </Text>
        </>
      ) : null}
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
}: {
  id: ChrysostomSectionId;
  sections: readonly ChrysostomSection[];
  mode: LiturgyDisplayMode;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  isDark: boolean;
  bodyType: { fontSize: number; lineHeight: number };
  searchQuery: string;
}) {
  const { t } = useAppTranslation();
  const title = t(chrysostomTitleKey(id));

  if (!sectionHasChrysostomContent(sections, id)) return null;

  const body = (() => {
    if (mode.kind === 'compare') {
      const left = mode.left;
      const right = mode.right;
      const hasSelection = liturgyCompareHasSelection(mode);
      const leftLines = left ? chrysostomSectionParagraphs(sections, id, left) : [];
      const rightLines = right ? chrysostomSectionParagraphs(sections, id, right) : [];
      const rowCount = Math.max(leftLines.length, rightLines.length);

      if (!hasSelection) return null;

      const rows = Array.from({ length: rowCount }, (_, row) => {
        const leftCell = left ? (
          <CompareCell
            lines={[leftLines[row] ?? '']}
            lang={left}
            textColor={textColor}
            mutedColor={mutedColor}
            isDark={isDark}
            searchQuery={searchQuery}
          />
        ) : null;
        const rightCell = right ? (
          <CompareCell
            lines={[rightLines[row] ?? '']}
            lang={right}
            textColor={textColor}
            mutedColor={mutedColor}
            isDark={isDark}
            searchQuery={searchQuery}
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
    const lines = chrysostomSectionParagraphs(sections, id, lang)
      .flatMap((line) => expandLiturgyDisplayLines(line))
      .filter((line) => line.trim())
      .filter((line) => lineMatches(line, searchQuery));

    if (!lines.length) return null;

    return (
      <View style={styles.lines}>
        {lines.map((line, index) => (
          <View key={`${id}-${index}`} style={styles.lineItem}>
            <LiturgyLine
              line={line}
              lang={lang}
              textColor={textColor}
              mutedColor={mutedColor}
              isDark={isDark}
            />
          </View>
        ))}
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
            lines={[leftLines[row] ?? '']}
            lang={left}
            textColor={textColor}
            mutedColor={mutedColor}
            isDark={isDark}
            searchQuery={searchQuery}
          />
        ) : null;
        const rightCell = right ? (
          <CompareCell
            lines={[rightLines[row] ?? '']}
            lang={right}
            textColor={textColor}
            mutedColor={mutedColor}
            isDark={isDark}
            searchQuery={searchQuery}
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
      .filter((line) => line.trim())
      .filter((line) => lineMatches(line, searchQuery));

    if (!lines.length) return null;

    return (
      <View style={styles.lines}>
        {lines.map((line, index) => (
          <View key={`${id}-${index}`} style={styles.lineItem}>
            <LiturgyLine
              line={line}
              lang={lang}
              textColor={textColor}
              mutedColor={mutedColor}
              isDark={isDark}
            />
          </View>
        ))}
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
  service = 'chrysostom',
  onServiceChange,
  showServiceToggle = false,
}: Props) {
  const { t } = useAppTranslation();
  const chrysostom = useChrysostomLiturgy();
  const vespers = useVespersLiturgy();
  const [mode, setMode] = useState<LiturgyDisplayMode>({ kind: 'single', lang: 'en' });
  const [searchQuery, setSearchQuery] = useState('');
  const searchNorm = normalizeSearch(searchQuery);

  const liturgyState: LiturgyLoadState =
    service === 'vespers'
      ? vespers.status === 'loading'
        ? { status: 'loading', sections: vespers.sections }
        : vespers.status === 'offline'
          ? { status: 'offline', sections: [], error: vespers.error }
          : { status: 'ready', sections: vespers.sections }
      : chrysostom.status === 'loading'
        ? { status: 'loading', sections: chrysostom.sections }
        : chrysostom.status === 'offline'
          ? { status: 'offline', sections: [], error: chrysostom.error }
          : { status: 'ready', sections: chrysostom.sections };

  const introKey =
    service === 'vespers' ? 'liturgy.vespers.intro' : 'liturgy.chrysostom.intro';
  const disclaimerKey =
    service === 'vespers' ? 'liturgy.vespers.disclaimer' : 'liturgy.chrysostom.disclaimer';
  const loadingKey =
    service === 'vespers' ? 'liturgy.vespers.loading' : 'liturgy.chrysostom.loading';
  const offlineKey =
    service === 'vespers' ? 'liturgy.vespers.offline' : 'liturgy.chrysostom.offline';

  const showSections =
    liturgyState.status === 'ready' &&
    (mode.kind !== 'compare' || liturgyCompareHasSelection(mode));

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
        />
      ));
    }

    const sections = liturgyState.sections as readonly ChrysostomSection[];
    return CHRYSOSTOM_SECTION_IDS.map((id) => (
      <ChrysostomSectionBody
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
      />
    ));
  }, [
    bodyType,
    borderColor,
    isDark,
    liturgyState.sections,
    mode,
    mutedColor,
    searchNorm,
    service,
    showSections,
    textColor,
  ]);

  const visibleSectionCount = useMemo(() => {
    if (!showSections) return 0;
    if (service === 'vespers') {
      const sections = liturgyState.sections as readonly VespersSection[];
      return VESPERS_SECTION_IDS.filter((id) => {
        if (!sectionHasVespersContent(sections, id)) return false;
        const lang = mode.kind === 'compare' ? 'en' : mode.lang;
        return vespersSectionParagraphs(sections, id, lang as UiLanguage)
          .flatMap((line) => expandLiturgyDisplayLines(line))
          .some((line) => lineMatches(line, searchNorm));
      }).length;
    }
    const sections = liturgyState.sections as readonly ChrysostomSection[];
    return CHRYSOSTOM_SECTION_IDS.filter((id) => {
      if (!sectionHasChrysostomContent(sections, id)) return false;
      const lang = mode.kind === 'compare' ? 'en' : mode.lang;
      return chrysostomSectionParagraphs(sections, id, lang as UiLanguage)
        .flatMap((line) => expandLiturgyDisplayLines(line))
        .some((line) => lineMatches(line, searchNorm));
    }).length;
  }, [liturgyState.sections, mode, searchNorm, service, showSections]);

  const reload = service === 'vespers' ? vespers.reload : chrysostom.reload;

  const content = (
    <>
      {liturgyState.status === 'ready' ? (
        <View style={[styles.topCard, surfaceCard(isDark, { radius: radii.lg })]}>
          <Text style={[styles.intro, hintType, { color: mutedColor }]}>{t(introKey)}</Text>
          <LiturgyToolbar
            service={service}
            onServiceChange={onServiceChange}
            showServiceToggle={showServiceToggle}
            mode={mode}
            onChange={setMode}
            isDark={isDark}
            hintType={hintType}
            mutedColor={mutedColor}
            textColor={textColor}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
          />
        </View>
      ) : (
        <Text style={[styles.intro, hintType, { color: mutedColor }]}>{t(introKey)}</Text>
      )}

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
        <>
          {searchNorm && visibleSectionCount === 0 ? (
            <Text style={[hintType, styles.noResults, { color: mutedColor }]}>
              {t('liturgy.worship.searchNoResults')}
            </Text>
          ) : null}
          <View style={styles.sections}>{sectionBlocks}</View>
        </>
      ) : null}

      <Text style={[styles.disclaimer, hintType, { color: mutedColor }]}>{t(disclaimerKey)}</Text>
    </>
  );

  if (variant === 'tab') {
    return (
      <View style={styles.root}>
        <AppScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollBottomPadding }]}
        >
          {content}
        </AppScrollView>
      </View>
    );
  }

  return <View style={styles.embeddedRoot}>{content}</View>;
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
    gap: 16,
    paddingTop: 4,
  },
  embeddedRoot: {
    gap: 16,
  },
  topCard: {
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  intro: {
    lineHeight: 20,
  },
  toolbarStack: {
    gap: 12,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    padding: 0,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' as 'solid' } : null),
  },
  compareHint: {
    lineHeight: 18,
    opacity: 0.9,
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
  noResults: {
    textAlign: 'center',
    paddingVertical: 12,
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
