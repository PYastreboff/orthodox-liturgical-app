import { Pressable, StyleSheet, Text, View, type PressableProps } from 'react-native';

import { usePhoneLayout } from '../../hooks/usePhoneLayout';
import { SECTION_CARD_PADDING, SECTION_CARD_PADDING_PHONE } from '../../theme/layout';
import { colors } from '../../theme/tokens';

type Props = Omit<PressableProps, 'style'> & {
  label: string;
  hint?: string;
  trailing?: React.ReactNode;
  isDark: boolean;
  showDivider?: boolean;
};

export function SettingsRow({
  label,
  hint,
  trailing,
  isDark,
  showDivider = true,
  ...rest
}: Props) {
  const phoneLayout = usePhoneLayout();
  const rowPaddingX = phoneLayout ? SECTION_CARD_PADDING_PHONE : SECTION_CARD_PADDING;
  const labelColor = isDark ? colors.darkInk : colors.ink;
  const hintColor = isDark ? '#a39e98' : colors.muted;
  const divider = isDark ? colors.darkBorder : colors.border;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { paddingHorizontal: rowPaddingX },
        showDivider ? { ...styles.rowDivider, borderBottomColor: divider } : undefined,
        pressed ? styles.rowPressed : undefined,
      ]}
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
    paddingVertical: 14,
    minHeight: 52,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowPressed: {
    opacity: 0.72,
  },
  labelWrap: {
    flex: 1,
    paddingRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  trailing: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
