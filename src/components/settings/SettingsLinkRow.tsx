import { Feather } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { hoverAccessibilityProps } from '../../lib/a11y/hoverAccessible';
import { useVestmentAccent } from '../../state/VestmentAccentContext';
import { cardElevation, iconBadgeSurface } from '../../theme/cards';
import { colors, radii } from '../../theme/tokens';

const ROW_PADDING_H = 16;
const ICON_BADGE_SIZE = 40;
const ROW_GAP = 14;
const DIVIDER_INSET = ROW_PADDING_H + ICON_BADGE_SIZE + ROW_GAP;

type Props = {
  isDark: boolean;
  /** Feather icon on the left (ignored when `leading` is set). */
  icon?: keyof typeof Feather.glyphMap;
  /** Custom leading icon (e.g. MaterialCommunityIcons). */
  leading?: ReactNode;
  label: string;
  hint?: string;
  onPress?: () => void;
  /** Replaces default chevron / value trailing. */
  trailing?: ReactNode;
  /** Short current value shown before chevron (picker rows). */
  valueLabel?: string;
  /** Defaults to chevron-right (in-app). Use external-link for web URLs. */
  trailingIcon?: keyof typeof Feather.glyphMap;
  showDivider?: boolean;
};

/** Unified settings list row — icon, title, hint, optional trailing control. */
export function SettingsLinkRow({
  isDark,
  icon,
  leading,
  label,
  hint,
  onPress,
  trailing,
  valueLabel,
  trailingIcon = 'chevron-right',
  showDivider = false,
}: Props) {
  const mutedColor = isDark ? '#a39e98' : colors.muted;
  const vestmentAccent = useVestmentAccent();
  const iconColor = vestmentAccent.accent;
  const interactive = onPress != null && trailing == null;

  const leadingNode =
    leading ??
    (icon ? <Feather name={icon} size={18} color={iconColor} /> : null);
  const leadingWrapped = leadingNode ? (
    <View style={iconBadgeSurface(vestmentAccent.accentSoft)}>{leadingNode}</View>
  ) : null;

  const trailingNode =
    trailing ??
    (valueLabel || interactive ? (
      <View style={styles.trailingWrap}>
        {valueLabel ? (
          <Text style={[styles.valueLabel, { color: mutedColor }]} numberOfLines={1}>
            {valueLabel}
          </Text>
        ) : null}
        {interactive ? (
          <Feather
            name={trailingIcon}
            size={trailingIcon === 'external-link' ? 16 : 18}
            color={mutedColor}
          />
        ) : null}
      </View>
    ) : null);

  const content = (
    <>
      {leadingWrapped}
      <View style={styles.textCol}>
        <Text style={[styles.label, { color: isDark ? colors.darkInk : colors.ink }]}>{label}</Text>
        {hint ? <Text style={[styles.hint, { color: mutedColor }]}>{hint}</Text> : null}
      </View>
      {trailingNode}
    </>
  );

  return (
    <View style={styles.block}>
      {showDivider ? (
        <View
          style={[
            styles.divider,
            { backgroundColor: isDark ? colors.darkBorder : colors.border },
          ]}
        />
      ) : null}
      {interactive ? (
        <Pressable
          style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}
          onPress={onPress}
          {...hoverAccessibilityProps(label, { role: 'button' })}
        >
          {content}
        </Pressable>
      ) : (
        <View style={styles.row}>{content}</View>
      )}
    </View>
  );
}

export const settingsListCard = (isDark: boolean) => ({
  borderRadius: radii.xl,
  borderWidth: StyleSheet.hairlineWidth,
  overflow: 'hidden' as const,
  backgroundColor: isDark ? colors.darkSurface : colors.card,
  borderColor: isDark ? colors.darkBorderSubtle : colors.borderSubtle,
  paddingVertical: 4,
  ...cardElevation(isDark),
});

const styles = StyleSheet.create({
  block: {
    alignSelf: 'stretch',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ROW_GAP,
    paddingVertical: 14,
    paddingHorizontal: ROW_PADDING_H,
    minHeight: 56,
  },
  rowPressed: {
    opacity: 0.88,
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
  trailingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
    maxWidth: '42%',
  },
  valueLabel: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
    flexShrink: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: DIVIDER_INSET,
    marginRight: ROW_PADDING_H,
    opacity: 0.9,
  },
});
