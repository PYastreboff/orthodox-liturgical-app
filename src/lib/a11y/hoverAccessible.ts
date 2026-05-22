import { Platform, type AccessibilityRole, type ViewProps } from 'react-native';

/** Shared label for screen readers and web `title` tooltips on hover. */
export function hoverAccessibilityProps(
  label: string,
  options?: { hint?: string; role?: AccessibilityRole },
): Pick<ViewProps, 'accessibilityLabel' | 'accessibilityHint' | 'accessibilityRole' | 'accessible'> & {
  title?: string;
} {
  return {
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: options?.hint,
    accessibilityRole: options?.role ?? 'none',
    ...(Platform.OS === 'web' ? { title: label } : {}),
  };
}
