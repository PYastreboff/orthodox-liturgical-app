import { forwardRef } from 'react';
import { Pressable, type PressableProps, type StyleProp, type View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { PRESS_IN_MS, PRESS_SCALE, UI_SPRING } from '../hooks/useFluidMotion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  /** Pressed scale; cards use the default 0.97, small icon buttons ~0.9. */
  scaleTo?: number;
};

/**
 * Card / button press feedback: shrinks on touch-down (not on release), springs back
 * critically damped and stays interruptible mid-flight. Reduce Motion swaps the scale
 * for a brief dim so feedback stays instant without movement.
 */
export const PressableScale = forwardRef<View, Props>(function PressableScale(
  { style, scaleTo = PRESS_SCALE, onPressIn, onPressOut, disabled, ...rest },
  ref,
) {
  const reduceMotion = useReducedMotion();
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const p = pressed.get();
    if (reduceMotion) return { opacity: 1 - 0.3 * p };
    return { transform: p === 0 ? [] : [{ scale: 1 - (1 - scaleTo) * p }] };
  });

  return (
    <AnimatedPressable
      ref={ref}
      {...rest}
      disabled={disabled}
      onPressIn={(event) => {
        pressed.set(withTiming(1, { duration: PRESS_IN_MS, easing: Easing.out(Easing.quad) }));
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        pressed.set(withSpring(0, UI_SPRING));
        onPressOut?.(event);
      }}
      style={[style, animatedStyle]}
    />
  );
});
