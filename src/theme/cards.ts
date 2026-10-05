import { Platform, type ViewStyle, type ColorValue } from 'react-native';

import { colors, radii } from './tokens';

/** iOS squircle corners; ignored elsewhere. */
export const continuousCorners: ViewStyle =
  Platform.OS === 'ios' ? { borderCurve: 'continuous' } : {};

/**
 * Grouped content sits flat on the grouped background, as in iOS system apps — contrast
 * between surface and background carries the hierarchy, not drop shadows. Only chrome
 * that floats above scrolling content (`elevated`) gets a soft, diffuse ambient shadow,
 * and dark mode relies on lighter surfaces instead.
 */
export function cardElevation(isDark: boolean, elevated = false): ViewStyle {
  if (!elevated || isDark) return {};
  if (Platform.OS === 'ios') {
    return {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
    };
  }
  if (Platform.OS === 'android') {
    return { elevation: 3 };
  }
  return { boxShadow: '0 8px 24px rgba(0,0,0,0.08)' } as ViewStyle;
}

export function surfaceCard(isDark: boolean, options?: { radius?: number; elevated?: boolean }): ViewStyle {
  const radius = options?.radius ?? radii.lg;
  return {
    borderRadius: radius,
    ...continuousCorners,
    backgroundColor: isDark ? colors.darkSurface : colors.card,
    overflow: 'hidden',
    ...cardElevation(isDark, options?.elevated),
  };
}

/** Rounded-square glyph tile, like the icons beside rows in Settings. */
export function iconBadgeSurface(accentSoft: ColorValue): ViewStyle {
  return {
    width: 32,
    height: 32,
    borderRadius: 8,
    ...continuousCorners,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: accentSoft,
  };
}

export function chipSurface(accentMuted: ColorValue, _isDark = false): ViewStyle {
  return {
    borderRadius: radii.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: accentMuted,
  };
}

/** Floating tab bar capsule — translucent material layered over scrolling content. */
export function tabBarChrome(isDark: boolean, reduceTransparency = false): ViewStyle {
  const material = reduceTransparency
    ? isDark
      ? colors.darkSurface
      : colors.card
    : isDark
      ? 'rgba(30, 30, 32, 0.72)'
      : 'rgba(255, 255, 255, 0.72)';
  return {
    backgroundColor: material,
    borderRadius: radii.pill,
    ...continuousCorners,
    borderWidth: Platform.OS === 'web' ? 0.5 : 0.33,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
  };
}

/**
 * Ambient shadow for floating chrome (tab bar, popovers). Apply to an unclipped wrapper —
 * iOS drops shadows on views with `overflow: hidden`.
 */
export function floatingShadow(isDark: boolean): ViewStyle {
  if (Platform.OS === 'ios') {
    return {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.4 : 0.12,
      shadowRadius: 20,
    };
  }
  if (Platform.OS === 'android') return { elevation: 6 };
  return {
    boxShadow: isDark ? '0 6px 24px rgba(0,0,0,0.45)' : '0 6px 24px rgba(0,0,0,0.12)',
  } as ViewStyle;
}
