import { StyleSheet, type ViewStyle } from 'react-native';

import { colors } from '../../theme/tokens';

export type SegmentedControlSize = 'compact' | 'regular';

export type SegmentedControlTheme = {
  chipIdleBg: string;
  chipIdleBorder: string;
  chipIdleFg: string;
  chipSelectedBg: string;
  chipSelectedFg: string;
  menuSelectedBg: string;
  menuHoverLight: string;
  menuPressedLight: string;
  /** @deprecated use chip theme fields */
  trackBg: string;
  trackBorder: string;
  pillBg: string;
  pillShadow: ViewStyle;
  activeText: string;
  inactiveText: string;
};

const SIZE_STYLES: Record<
  SegmentedControlSize,
  { fontSize: number; letterSpacing: number; padH: number; padV: number }
> = {
  compact: { fontSize: 11, letterSpacing: 0.3, padH: 10, padV: 6 },
  regular: { fontSize: 13, letterSpacing: 0.2, padH: 14, padV: 8 },
};

export function segmentedControlSizeStyle(size: SegmentedControlSize) {
  return SIZE_STYLES[size];
}

export function segmentedControlTheme(isDark: boolean): SegmentedControlTheme {
  const chipSelectedBg = colors.accentWine;
  const chipSelectedFg = '#ffffff';
  const chipIdleBg = isDark ? 'rgba(255,255,255,0.04)' : colors.card;
  const chipIdleBorder = isDark ? colors.darkBorderSubtle : colors.borderSubtle;

  return {
    chipIdleBg,
    chipIdleBorder,
    chipIdleFg: isDark ? colors.darkInk : colors.ink,
    chipSelectedBg,
    chipSelectedFg,
    menuSelectedBg: isDark ? 'rgba(139,46,60,0.22)' : colors.accentWineSoft,
    menuHoverLight: 'rgba(30, 26, 22, 0.06)',
    menuPressedLight: 'rgba(30, 26, 22, 0.1)',
    trackBg: chipIdleBg,
    trackBorder: chipIdleBorder,
    pillBg: chipSelectedBg,
    pillShadow: {} as ViewStyle,
    activeText: isDark ? colors.darkInk : colors.ink,
    inactiveText: isDark ? '#a39e98' : colors.muted,
  };
}

export function chipRowStyle(options?: { fullWidth?: boolean }): ViewStyle {
  return {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    alignSelf: options?.fullWidth ? 'stretch' : 'flex-start',
    ...(options?.fullWidth ? { width: '100%' } : {}),
  };
}

export function chipStyle(
  theme: SegmentedControlTheme,
  size: SegmentedControlSize,
  selected: boolean,
  options?: { fullWidth?: boolean; accent?: { fg: string; bg: string; border: string } },
): ViewStyle {
  const { padH, padV } = SIZE_STYLES[size];
  const accent = options?.accent;
  return {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: padH,
    paddingVertical: padV,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: selected ? accent?.bg ?? theme.chipSelectedBg : theme.chipIdleBg,
    borderColor: selected ? accent?.border ?? theme.chipSelectedBg : theme.chipIdleBorder,
    ...(options?.fullWidth ? { flex: 1, minWidth: 0 } : null),
  };
}
