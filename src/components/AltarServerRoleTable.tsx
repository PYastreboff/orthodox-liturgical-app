import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useFontScale } from '../hooks/useFontScale';
import { useAppTranslation } from '../i18n/useAppTranslation';
import {
  ALTAR_LITURGY_FORMS,
  ALTAR_ROLE_SOURCE_KEYS,
  ALTAR_SERVER_ROLE_ROWS,
  type AltarLiturgyForm,
} from '../lib/liturgical/altarServerRoles';
import { colors } from '../theme/tokens';

type Props = {
  textColor: string;
  mutedColor: string;
  isDark: boolean;
};

export function AltarServerRoleTable({ textColor, mutedColor, isDark }: Props) {
  const { t } = useAppTranslation();
  const { text } = useFontScale();
  const bodyType = text(14, 20);
  const hintType = text(12, 17);
  const headerType = text(12, 16);
  const [form, setForm] = useState<AltarLiturgyForm>('priest');

  const surfaceBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(43,38,35,0.06)';
  const activeBg = isDark ? colors.accentWine : colors.accentWine;
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(43,38,35,0.12)';

  const rows = ALTAR_SERVER_ROLE_ROWS[form];

  return (
    <View>
      <View style={[styles.toggleRow, { borderColor }]}>
        {ALTAR_LITURGY_FORMS.map((id) => {
          const selected = form === id;
          return (
            <Pressable
              key={id}
              style={[
                styles.toggleBtn,
                { backgroundColor: selected ? activeBg : surfaceBg },
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
                {t(`altarRoles.form.${id}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>

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
        {t('altarRoles.footnote')}
      </Text>
      {ALTAR_ROLE_SOURCE_KEYS.map((key) => (
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
    gap: 8,
    marginBottom: 14,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
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
