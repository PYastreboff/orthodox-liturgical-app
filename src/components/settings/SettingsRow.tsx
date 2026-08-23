import { Pressable, StyleSheet, Text, View, type PressableProps } from 'react-native';

import { colors } from '../../theme/tokens';
import { SEGMENTED_PICKER_HORIZONTAL_INSET } from './SegmentedPicker';

type Props = Omit<PressableProps, 'style'> & {
  label: string;
  hint?: string;
  trailing?: React.ReactNode;
  isDark: boolean;
  showDivider?: boolean;
};

/** Label + hint row with trailing control — matches Legal / SettingsLinkRow type. */
export function SettingsRow({
  label,
  hint,
  trailing,
  isDark,
  showDivider = true,
  ...rest
}: Props) {
  const labelColor = isDark ? colors.darkInk : colors.ink;
  const hintColor = isDark ? '#a39e98' : colors.muted;
  const divider = isDark ? colors.darkBorder : colors.border;
  const interactive = rest.onPress != null;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        showDivider ? { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: divider } : null,
        interactive && pressed ? styles.rowPressed : null,
      ]}
      disabled={!interactive}
      {...rest}
    >
      <View style={styles.labelWrap}>
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        {hint ? <Text style={[styles.hint, { color: hintColor }]}>{hint}</Text> : null}
      </View>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: SEGMENTED_PICKER_HORIZONTAL_INSET + 4,
    minHeight: 52,
    gap: 12,
  },
  rowPressed: {
    opacity: 0.72,
  },
  labelWrap: {
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
  trailing: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
