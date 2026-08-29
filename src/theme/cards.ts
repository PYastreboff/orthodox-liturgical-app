import { Platform, StyleSheet, type ViewStyle } from 'react-native';

import { colors, radii } from './tokens';

/** Soft elevation for home-screen cards — parchment in light, lifted surface in dark. */
export function cardElevation(isDark: boolean, elevated = false): ViewStyle {
  if (Platform.OS === 'ios') {
    return isDark
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: elevated ? 10 : 6 },
          shadowOpacity: elevated ? 0.45 : 0.32,
          shadowRadius: elevated ? 20 : 14,
        }
      : {
          shadowColor: '#1a1612',
          shadowOffset: { width: 0, height: elevated ? 8 : 4 },
          shadowOpacity: elevated ? 0.12 : 0.08,
          shadowRadius: elevated ? 24 : 16,
        };
  }
  if (Platform.OS === 'android') {
    return { elevation: isDark ? (elevated ? 6 : 4) : elevated ? 4 : 3 };
  }
  return isDark
    ? ({
        boxShadow: elevated
          ? '0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)'
          : '0 8px 32px rgba(0,0,0,0.38), 0 0 0 1px rgba(255,255,255,0.04)',
      } as ViewStyle)
    : ({
        boxShadow: elevated
          ? '0 12px 40px rgba(26,22,18,0.12), 0 0 0 1px rgba(30,26,22,0.04)'
          : '0 4px 24px rgba(26,22,18,0.08), 0 0 0 1px rgba(30,26,22,0.04)',
      } as ViewStyle);
}

export function surfaceCard(isDark: boolean, options?: { radius?: number; elevated?: boolean }): ViewStyle {
  const radius = options?.radius ?? radii.xl;
  return {
    borderRadius: radius,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: isDark ? colors.darkSurface : colors.card,
    borderColor: isDark ? colors.darkBorderSubtle : colors.borderSubtle,
    overflow: 'hidden',
    ...cardElevation(isDark, options?.elevated),
  };
}

export function iconBadgeSurface(accentSoft: string): ViewStyle {
  return {
    width: 40,
    height: 40,
    borderRadius: radii.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: accentSoft,
  };
}

export function chipSurface(accentMuted: string, isDark = false): ViewStyle {
  return {
    borderRadius: radii.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: accentMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: isDark ? colors.darkBorderSubtle : colors.borderSubtle,
  };
}

export function tabBarChrome(isDark: boolean): ViewStyle {
  const backgroundColor = isDark ? 'rgba(24, 22, 20, 0.92)' : 'rgba(247, 243, 236, 0.92)';

  return {
    backgroundColor,
    borderRadius: radii.xxl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: isDark ? colors.darkBorderSubtle : colors.borderSubtle,
    overflow: 'hidden',
    ...cardElevation(isDark),
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        } as ViewStyle)
      : null),
  };
}
