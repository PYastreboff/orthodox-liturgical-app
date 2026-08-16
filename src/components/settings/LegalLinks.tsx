import { Feather } from '@expo/vector-icons';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useAppTranslation } from '../../i18n/useAppTranslation';
import { hoverAccessibilityProps } from '../../lib/a11y/hoverAccessible';
import { SUPPORT_URL } from '../../lib/legal/urls';
import { SEGMENTED_PICKER_HORIZONTAL_INSET } from './SegmentedPicker';
import { colors } from '../../theme/tokens';

type Props = {
  isDark: boolean;
};

export function LegalLinks({ isDark }: Props) {
  const { t } = useAppTranslation();
  const router = useRouter();
  const mutedColor = isDark ? '#a39e98' : colors.muted;

  return (
    <View style={styles.wrap}>
      <Pressable
        style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}
        onPress={() => router.push('/privacy')}
        {...hoverAccessibilityProps(t('settings.privacyPolicyLink'), { role: 'link' })}
      >
        <Feather name="shield" size={18} color={isDark ? colors.tabActiveDark : colors.accentWine} />
        <View style={styles.textCol}>
          <Text style={[styles.label, { color: isDark ? colors.darkInk : colors.ink }]}>
            {t('settings.privacyPolicyLink')}
          </Text>
          <Text style={[styles.hint, { color: mutedColor }]}>{t('settings.privacyPolicyHint')}</Text>
        </View>
        <Feather name="chevron-right" size={18} color={mutedColor} />
      </Pressable>

      <View style={[styles.divider, { backgroundColor: isDark ? colors.darkBorder : colors.border }]} />

      <Pressable
        style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}
        onPress={() => Linking.openURL(SUPPORT_URL)}
        {...hoverAccessibilityProps(t('settings.supportLink'), { role: 'link' })}
      >
        <Feather name="life-buoy" size={18} color={isDark ? colors.tabActiveDark : colors.accentWine} />
        <View style={styles.textCol}>
          <Text style={[styles.label, { color: isDark ? colors.darkInk : colors.ink }]}>
            {t('settings.supportLink')}
          </Text>
          <Text style={[styles.hint, { color: mutedColor }]}>{t('settings.supportHint')}</Text>
        </View>
        <Feather name="external-link" size={16} color={mutedColor} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: SEGMENTED_PICKER_HORIZONTAL_INSET,
    marginVertical: 4,
    alignSelf: 'stretch',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  rowPressed: {
    opacity: 0.72,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  hint: {
    fontSize: 12,
    lineHeight: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
    opacity: 0.9,
  },
});
