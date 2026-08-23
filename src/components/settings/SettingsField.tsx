import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/tokens';
import { SEGMENTED_PICKER_HORIZONTAL_INSET } from './SegmentedPicker';

type Props = {
  label: string;
  hint?: string;
  isDark: boolean;
  children: ReactNode;
  showDivider?: boolean;
};

/**
 * Label + hint above a control — same typography as Legal / SettingsLinkRow.
 */
export function SettingsField({
  label,
  hint,
  isDark,
  children,
  showDivider = true,
}: Props) {
  const labelColor = isDark ? colors.darkInk : colors.ink;
  const hintColor = isDark ? '#a39e98' : colors.muted;
  const divider = isDark ? colors.darkBorder : colors.border;

  return (
    <View
      style={[
        styles.wrap,
        showDivider ? { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: divider } : null,
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        {hint ? <Text style={[styles.hint, { color: hintColor }]}>{hint}</Text> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: SEGMENTED_PICKER_HORIZONTAL_INSET,
    paddingTop: 12,
    paddingBottom: 4,
  },
  header: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  hint: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 3,
  },
});
