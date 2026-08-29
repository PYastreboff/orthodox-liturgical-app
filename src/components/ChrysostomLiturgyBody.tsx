import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

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
import { LiturgyLanguageToggle } from './LiturgyLanguageToggle';
import { CompareSidePicker } from './CompareSidePicker';
import { LiturgyLine } from './LiturgyLine';
import { colors } from '../theme/tokens';

type Props = {
  textColor: string;
  mutedColor: string;
  borderColor: string;
  isDark: boolean;
  bodyType: { fontSize: number; lineHeight: number };
  hintType: { fontSize: number; lineHeight: number };
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

  if (mode.kind === 'compare') {
    const left = mode.left;
    const right = mode.right;
    const hasSelection = liturgyCompareHasSelection(mode);
    const leftLines = left ? chrysostomSectionParagraphs(sections, id, left) : [];
    const rightLines = right ? chrysostomSectionParagraphs(sections, id, right) : [];
    const rowCount = Math.max(leftLines.length, rightLines.length);

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, bodyType, { color: titleColor }]}>{title}</Text>
        </View>

        {hasSelection ? (
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
        ) : null}
      </View>
    );
  }

  const lang = mode.lang;
  const lines = chrysostomSectionParagraphs(sections, id, lang)
    .flatMap((line) => expandLiturgyDisplayLines(line))
    .filter((line) => line.trim());

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, bodyType, { color: titleColor }]}>{title}</Text>
      </View>

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
}: Props) {
  const { t } = useAppTranslation();
  const liturgy = useChrysostomLiturgy();
  const [mode, setMode] = useState<LiturgyDisplayMode>({ kind: 'single', lang: 'en' });

  return (
    <View style={styles.list}>
      <Text style={[styles.intro, hintType, { color: mutedColor }]}>{t('liturgy.chrysostom.intro')}</Text>

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
      ) : (
        <>
          <View style={styles.toolbar}>
            <LiturgyLanguageToggle mode={mode} onChange={setMode} isDark={isDark} />
          </View>

          {mode.kind === 'compare' ? (
            <CompareSidePicker<LiturgyTextLang>
              left={mode.left}
              right={mode.right}
              onChangeLeft={(left) => setMode({ kind: 'compare', left, right: mode.right })}
              onChangeRight={(right) => setMode({ kind: 'compare', left: mode.left, right })}
              options={[
                { value: 'en', label: 'EN' },
                { value: 'el', label: 'ΕΛ' },
                { value: 'ru', label: 'ЧС' },
              ]}
              leftLabel={t('readings.compareColumnLeft')}
              rightLabel={t('readings.compareColumnRight')}
              isDark={isDark}
            />
          ) : null}

          {mode.kind !== 'compare' || liturgyCompareHasSelection(mode) ? (
            <>
              {CHRYSOSTOM_SECTION_IDS.map((id) => (
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
            </>
          ) : null}
        </>
      )}

      <Text style={[styles.disclaimer, hintType, { color: mutedColor }]}>
        {t('liturgy.chrysostom.disclaimer')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 14,
  },
  intro: {
    opacity: 0.92,
    lineHeight: 20,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
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
  section: {
    paddingTop: 20,
  },
  sectionHeader: {
    marginBottom: 16,
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
