import { Feather } from '@expo/vector-icons';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTranslation } from '../../i18n/useAppTranslation';
import { hoverAccessibilityProps } from '../../lib/a11y/hoverAccessible';
import { SEGMENTED_PICKER_HORIZONTAL_INSET } from './SegmentedPicker';
import { colors } from '../../theme/tokens';

const GITHUB_ISSUES_URL =
  'https://github.com/PYastreboff/orthodox-liturgical-app/issues/new';

type Props = {
  isDark: boolean;
};

export function BugReportLink({ isDark }: Props) {
  const { t } = useAppTranslation();
  const mutedColor = isDark ? '#a39e98' : colors.muted;

  const openReportForm = () => Linking.openURL(GITHUB_ISSUES_URL);

  return (
    <View style={styles.wrap}>
      <Pressable
        style={({ pressed }) => [styles.button, pressed ? styles.buttonPressed : null]}
        onPress={openReportForm}
        {...hoverAccessibilityProps(t('settings.bugReportLink'), { role: 'link' })}
      >
        <Feather name="message-circle" size={18} color="#fff" />
        <Text style={styles.buttonLabel}>{t('settings.bugReportLink')}</Text>
        <Feather name="external-link" size={14} color="rgba(255,255,255,0.88)" style={styles.trailingIcon} />
      </Pressable>
      <Text style={[styles.note, { color: mutedColor }]}>{t('settings.bugReportFootnote')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: SEGMENTED_PICKER_HORIZONTAL_INSET,
    marginVertical: 12,
    alignSelf: 'stretch',
    maxWidth: 400,
    gap: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 6,
    alignSelf: 'stretch',
    backgroundColor: colors.accentWine,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonPressed: {
    opacity: 0.72,
  },
  buttonLabel: {
    flex: 1,
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  trailingIcon: {
    flexShrink: 0,
  },
  note: {
    fontSize: 12,
    lineHeight: 17,
    paddingHorizontal: 2,
  },
});
