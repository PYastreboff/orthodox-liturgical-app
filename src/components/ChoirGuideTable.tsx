import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useFontScale } from '../hooks/useFontScale';
import { useAppTranslation } from '../i18n/useAppTranslation';
import {
  availableChoirForms,
  defaultChoirForm,
  CHOIR_GUIDE_ROWS,
  CHOIR_GUIDE_SOURCE_KEYS,
  type ChoirGuideDayContext,
  type ChoirLiturgyForm,
} from '../lib/liturgical/choirGuide';
import { colors } from '../theme/tokens';

type Props = {
  textColor: string;
  mutedColor: string;
  isDark: boolean;
  dayContext: ChoirGuideDayContext;
};

export function ChoirGuideTable({ textColor, mutedColor, isDark, dayContext }: Props) {
  const { t } = useAppTranslation();
  const { text } = useFontScale();
  const bodyType = text(14, 20);
  const hintType = text(12, 17);
  const headerType = text(12, 16);
  const forms = availableChoirForms(dayContext);
  const [form, setForm] = useState<ChoirLiturgyForm>(() => defaultChoirForm(dayContext));

  useEffect(() => {
    const nextForms = availableChoirForms(dayContext);
    const next = defaultChoirForm(dayContext);
    setForm((prev) => (nextForms.includes(prev) ? prev : next));
  }, [
    dayContext.appearanceKey,
    dayContext.feastLevel,
    dayContext.weekday,
    dayContext.isPresanctified,
  ]);

  const surfaceBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(43,38,35,0.06)';
  const rows = CHOIR_GUIDE_ROWS[form];

  return (
    <View>
      {forms.length > 1 ? (
        <View style={styles.toggleRow}>
          {forms.map((id) => {
            const selected = form === id;
            return (
              <Pressable
                key={id}
                style={[
                  styles.toggleBtn,
                  { backgroundColor: selected ? colors.accentWine : surfaceBg },
                ]}
                onPress={() => setForm(id)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text
                  style={[
                    styles.toggleLabel,
                    headerType,
                    { color: selected ? '#fff' : textColor },
                  ]}
                  numberOfLines={2}
                >
                  {t(`choirGuide.form.${id}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <Text style={[styles.singleFormLabel, headerType, { color: mutedColor }]}>
          {t(`choirGuide.form.${form}`)}
        </Text>
      )}

      {rows.map((row, index) => (
        <View
          key={`${form}-${row.momentKey}`}
          style={[styles.momentBlock, index > 0 ? styles.momentBlockSpaced : null]}
        >
          <Text style={[styles.momentTitle, bodyType, { color: textColor }]}>
            {t(row.momentKey)}
          </Text>
          {row.roleKeys.map((roleKey) => (
            <View key={roleKey} style={styles.roleRow}>
              <Text style={[styles.roleBullet, { color: mutedColor }]}>{'\u2022'}</Text>
              <Text style={[styles.roleText, bodyType, { color: textColor }]}>
                {t(roleKey)}
              </Text>
            </View>
          ))}
          {row.noteKey ? (
            <Text style={[styles.momentNote, hintType, { color: mutedColor }]}>
              {t(row.noteKey)}
            </Text>
          ) : null}
        </View>
      ))}

      <Text style={[styles.footnote, hintType, { color: mutedColor }]}>
        {t('choirGuide.footnote')}
      </Text>
      {CHOIR_GUIDE_SOURCE_KEYS.map((key) => (
        <Text key={key} style={[styles.sourceLine, hintType, { color: mutedColor }]}>
          {t(key)}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  toggleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  toggleBtn: {
    flexGrow: 1,
    flexBasis: '40%',
    minHeight: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  toggleLabel: {
    fontWeight: '700',
    textAlign: 'center',
  },
  singleFormLabel: {
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  momentBlock: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(128,128,128,0.08)',
  },
  momentBlockSpaced: {
    marginTop: 8,
  },
  momentTitle: {
    fontWeight: '700',
    marginBottom: 6,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 4,
  },
  roleBullet: {
    lineHeight: 20,
    width: 10,
  },
  roleText: {
    flex: 1,
    opacity: 0.92,
  },
  momentNote: {
    marginTop: 8,
    fontStyle: 'italic',
    opacity: 0.88,
  },
  footnote: {
    marginTop: 12,
    opacity: 0.9,
  },
  sourceLine: {
    marginTop: 4,
    opacity: 0.75,
  },
});
