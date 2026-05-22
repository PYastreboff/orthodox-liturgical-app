import type { ReactNode } from 'react';
import { View, type AccessibilityRole, type StyleProp, type ViewStyle } from 'react-native';

import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';

type Props = {
  label: string;
  hint?: string;
  accessibilityRole?: AccessibilityRole;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

/** Wraps icons and controls with accessibilityLabel and a web hover tooltip (`title`). */
export function HoverAccessible({
  label,
  hint,
  accessibilityRole = 'image',
  style,
  children,
}: Props) {
  return (
    <View style={style} {...hoverAccessibilityProps(label, { hint, role: accessibilityRole })}>
      {children}
    </View>
  );
}
