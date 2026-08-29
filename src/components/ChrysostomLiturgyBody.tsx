import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useMemo, useState } from 'react';

import { AppScrollView } from './AppScrollView';
import { CompareSidePicker } from './CompareSidePicker';
import { LiturgyLanguageToggle } from './LiturgyLanguageToggle';
import { LiturgyLine } from './LiturgyLine';
import { useAppTranslation } from '../i18n/useAppTranslation';
import { useChrysostomLiturgy } from '../hooks/useChrysostomLiturgy';
import {
  CHRYSOSTOM_SECTION_IDS,
  chrysostomSectionParagraphs,
  chrysostomTitleKey,
  type ChrysostomSectionId,
} from '../lib/liturgy/chrysostomLiturgy';
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
};

function sectionHasContent(
  sections: ReturnType<typeof useChrysostomLiturgy>['sections'],
  id: ChrysostomSectionId,
): boolean {
  return (['en', 'el', 'ru'] as const).some(
    (lang) => chrysostomSectionParagraphs(sections, id, lang).some((line) => line.trim()),
  );
}

function CompareCell({
  lines,
  lang,
  textColor,
  mutedColor,
  isDark,
}: {
  lines: string[];
  lang: 'en' | 'el' | 'ru';
  textColor: string;
  mutedColor: string;
  isDark: boolean;
}) {
  const expanded = lines.flatMap((line) => expandLiturgyDisplayLines(line)).filter((line) => line.trim());
  if (!expanded.length) {
    return null;
  }
  return (
    <>
      {expanded.map((line, index) => (
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
  id,
  sections,
  mode,
  textColor,
  mutedColor,
  borderColor,
  isDark,
  bodyType,
}: {
  id: ChrysostomSectionId;
  sections: ReturnType<typeof useChrysostomLiturgy>['sections'];
  mode: LiturgyDisplayMode;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  isDark: boolean;
  bodyType: { fontSize: number; lineHeight: number };
}) {
  const { t } = useAppTranslation();
  const title = t(chrysostomTitleKey(id));

  if (!sectionHasContent(sections, id)) return null;

  const titleColor = isDark ? '#e8c97a' : colors.accentWine;

  const body = (() => {
    if (mode.kind === 'compare') {
      const left = mode.left;
      const right = mode.right;
      const hasSelection = liturgyCompareHasSelection(mode);
      const leftLines = left ? chrysostomSectionParagraphs(sections, id, left) : [];
      const rightLines = right ? chrysostomSectionParagraphs(sections, id, right) : [];
      const rowCount = Math.max(leftLines.length, rightLines.length);

      if (!hasSelection) return null;

      return (
        <View style={styles.compareBody}>
          {Array.from({ length: rowCount }, (_, row) => (
            <View key={`${id}-compare-${row}`} style={styles.compareRow}>
              <View style={[styles.compareCell, styles.compareCellFlex]}>
                {left ? (
                  <CompareCell
                    lines={[leftLines[row] ?? '']}
                    lang={left}
                    textColor={textColor}
                    mutedColor={mutedColor}
                    isDark={isDark}
                  />
                ) : null}
              </View>
              <View style={[styles.columnDivider, { backgroundColor: borderColor }]} />
              <View style={[styles.compareCell, styles.compareCellFlex]}>
                {right ? (
                  <CompareCell
                    lines={[rightLines[row] ?? '']}
                    lang={right}
                    textColor={textColor}
                    mutedColor={mutedColor}
                    isDark={isDark}
                  />
                ) : null}
              </View>
            </View>
          ))}
        </View>
      );
    }

    const lang = mode.lang;
    const lines = chrysostomSectionParagraphs(sections, id, lang)
      .flatMap((line) => expandLiturgyDisplayLines(line))
      .filter((line) => line.trim());

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
    <View style={[styles.sectionCard, surfaceCard(isDark, { radius: radii.lg })]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, bodyType, { color: titleColor }]}>{title}</Text>
      </View>
      {body}
    </View>
  );
}

function LiturgyToolbar({
  mode,
  onChange,
  isDark,
  hintType,
  mutedColor,
}: {
  mode: LiturgyDisplayMode;
  onChange: (mode: LiturgyDisplayMode) => void;
  isDark: boolean;
  hintType: { fontSize: number; lineHeight: number };
  mutedColor: string;
}) {
  const { t } = useAppTranslation();

  return (
    <View style={styles.toolbarStack}>
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

export function ChrysostomLiturgyBody({
  textColor,
  mutedColor,
  borderColor,
  isDark,
  bodyType,
  hintType,
  variant = 'embedded',
  scrollBottomPadding = 24,
}: Props) {
  const { t } = useAppTranslation();
  const liturgy = useChrysostomLiturgy();
  const [mode, setMode] = useState<LiturgyDisplayMode>({ kind: 'single', lang: 'en' });

  const visibleSectionIds = useMemo(() => {
    if (liturgy.status !== 'ready') return [];
    return CHRYSOSTOM_SECTION_IDS.filter((id) => sectionHasContent(liturgy.sections, id));
  }, [liturgy]);

  const showSections =
    liturgy.status === 'ready' &&
    (mode.kind !== 'compare' || liturgyCompareHasSelection(mode));

  const content = (
    <>
      {liturgy.status === 'ready' ? (
        <View style={[styles.topCard, surfaceCard(isDark, { radius: radii.lg })]}>
          <Text style={[styles.intro, hintType, { color: mutedColor }]}>
            {t('liturgy.chrysostom.intro')}
          </Text>
          <LiturgyToolbar
            mode={mode}
            onChange={setMode}
            isDark={isDark}
            hintType={hintType}
            mutedColor={mutedColor}
          />
        </View>
      ) : (
        <Text style={[styles.intro, hintType, { color: mutedColor }]}>
          {t('liturgy.chrysostom.intro')}
        </Text>
      )}

      {liturgy.status === 'loading' ? (
        <View style={styles.centered}>
          <ActivityIndicator color={mutedColor} />
          <Text style={[hintType, { color: mutedColor, marginTop: 8 }]}>
            {t('liturgy.chrysostom.loading')}
          </Text>
        </View>
      ) : liturgy.status === 'offline' ? (
        <View style={styles.centered}>
          <Text style={[bodyType, { color: textColor }]}>{t('liturgy.chrysostom.offline')}</Text>
          <Pressable onPress={liturgy.reload} accessibilityRole="button">
            <Text style={[bodyType, styles.retry, { color: textColor }]}>{t('recipes.retry')}</Text>
          </Pressable>
        </View>
      ) : showSections ? (
        <View style={styles.sections}>
          {visibleSectionIds.map((id) => (
            <LiturgySectionBlock
              key={id}
              id={id}
              sections={liturgy.sections}
              mode={mode}
              textColor={textColor}
              mutedColor={mutedColor}
              borderColor={borderColor}
              isDark={isDark}
              bodyType={bodyType}
            />
          ))}
        </View>
      ) : null}

      <Text style={[styles.disclaimer, hintType, { color: mutedColor }]}>
        {t('liturgy.chrysostom.disclaimer')}
      </Text>
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
