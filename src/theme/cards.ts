import { Platform, type ViewStyle } from 'react-native';

/** Soft elevation for home-screen cards — parchment in light, lifted surface in dark. */
export function cardElevation(isDark: boolean): ViewStyle {
  if (Platform.OS === 'ios') {
    return isDark
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.38,
          shadowRadius: 14,
        }
      : {
          shadowColor: '#1e1a16',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.09,
          shadowRadius: 12,
        };
  }
  if (Platform.OS === 'android') {
    return { elevation: isDark ? 4 : 3 };
  }
  return isDark
    ? ({ boxShadow: '0 8px 32px rgba(0,0,0,0.42)' } as ViewStyle)
    : ({ boxShadow: '0 4px 20px rgba(30,26,22,0.09)' } as ViewStyle);
}
