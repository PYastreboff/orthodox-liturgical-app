import { useEffect } from 'react';
import {
  PanResponder,
  useWindowDimensions,
  type GestureResponderHandlers,
  type ViewStyle,
} from 'react-native';
import {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type AnimatedStyle,
} from 'react-native-reanimated';

import { useFluidMotion } from './useFluidMotion';

type SwipeToBack = {
  panHandlers: GestureResponderHandlers;
  animatedStyle: AnimatedStyle<ViewStyle>;
  /** Soft dim over the revealed Today screen — fades out as swipe completes. */
  dimStyle: AnimatedStyle<ViewStyle>;
};

/**
 * Interactive left-edge swipe-back: page follows the finger, then finishes or snaps.
 * Day screen must be transparent so the previous stack screen (Today) shows through.
 */
export function useSwipeToBack(onBack: () => void): SwipeToBack {
  const { width } = useWindowDimensions();
  const widthSv = useSharedValue(width);
  const { reduceMotion, spring } = useFluidMotion();

  useEffect(() => {
    widthSv.value = width;
  }, [width, widthSv]);

  const translateX = useSharedValue(0);
  const dragging = useSharedValue(false);
  const finishing = useSharedValue(false);

  const finishBack = () => {
    finishing.value = false;
    onBack();
  };

  const panHandlers = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gesture) => {
      if (finishing.value) return false;
      const startX = evt.nativeEvent.pageX - gesture.dx;
      if (startX > 36) return false;
      return gesture.dx > 12 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.25;
    },
    onPanResponderGrant: () => {
      dragging.value = true;
    },
    onPanResponderMove: (_evt, gesture) => {
      if (!dragging.value) return;
      translateX.value = Math.max(0, gesture.dx);
    },
    onPanResponderTerminationRequest: () => false,
    onPanResponderRelease: (_evt, gesture) => {
      dragging.value = false;
      const w = widthSv.value;
      const shouldBack = gesture.dx > w * 0.28 || (gesture.dx > 48 && gesture.vx > 0.45);
      if (shouldBack) {
        finishing.value = true;
        if (reduceMotion) {
          translateX.value = withTiming(w, { duration: 120 }, (done) => {
            if (done) runOnJS(finishBack)();
          });
        } else {
          // Hand off the finger's velocity so the finish continues seamlessly (§5).
          translateX.value = withSpring(w, { ...spring, velocity: gesture.vx }, (done) => {
            if (done) runOnJS(finishBack)();
          });
        }
      } else if (reduceMotion) {
        translateX.value = withTiming(0, { duration: 120 });
      } else {
        // Snap back carrying the release velocity — reversals stay continuous.
        translateX.value = withSpring(0, { ...spring, velocity: gesture.vx });
      }
    },
    onPanResponderTerminate: () => {
      dragging.value = false;
      if (!finishing.value) {
        translateX.value = reduceMotion
          ? withTiming(0, { duration: 120 })
          : withSpring(0, { ...spring });
      }
    },
  }).panHandlers;

  const animatedStyle = useAnimatedStyle(() => {
    const tx = translateX.value;
    // At rest (tx = 0) return an EMPTY transform: on iOS/Fabric a transformed
    // Animated.View inside an overflow:hidden parent gets a compositing container
    // whose frame is miscalculated, clipping its children (the page header).
    return {
      transform: tx === 0 ? [] : [{ translateX: tx }],
    };
  });

  const dimStyle = useAnimatedStyle(() => {
    const w = Math.max(widthSv.value, 1);
    const progress = Math.min(1, Math.max(0, translateX.value / w));
    // Blur Today in proportion to how much is still covered; clears as swipe finishes.
    return {
      opacity: 1 - progress,
    };
  });

  return { panHandlers, animatedStyle, dimStyle };
}
