import { useState, type ReactNode } from 'react';
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { pressableSurfaceBackground } from '../lib/ui/pressableSurfaceStyle';
import { colors } from '../theme/tokens';

type HoverStyleState = { pressed: boolean; hovered: boolean };

type Props = Omit<PressableProps, 'style' | 'children'> & {
  isDark: boolean;
  selected?: boolean;
  selectedColor?: string;
  baseBackground?: string;
  style?:
    | StyleProp<ViewStyle>
    | ((state: HoverStyleState) => StyleProp<ViewStyle>);
  children: ReactNode | ((state: HoverStyleState) => ReactNode);
};

/** Pressable with web hover tint and consistent pressed feedback. */
export function HoverPressable({
  isDark,
  selected = false,
  selectedColor = colors.accentWine,
  baseBackground = 'transparent',
  style,
  children,
  onHoverIn,
  onHoverOut,
  ...rest
}: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      {...rest}
      onHoverIn={(event) => {
        setHovered(true);
        onHoverIn?.(event);
      }}
      onHoverOut={(event) => {
        setHovered(false);
        onHoverOut?.(event);
      }}
      style={(state) => {
        const hoverState: HoverStyleState = { pressed: state.pressed, hovered };
        const resolvedStyle = typeof style === 'function' ? style(hoverState) : style;
        return [
          resolvedStyle,
          {
            backgroundColor: pressableSurfaceBackground(isDark, {
              selected,
              pressed: state.pressed,
              hovered,
            }, { selectedColor, baseColor: baseBackground }),
          },
        ];
      }}
    >
      {(state) =>
        typeof children === 'function'
          ? children({ pressed: state.pressed, hovered })
          : children
      }
    </Pressable>
  );
}
