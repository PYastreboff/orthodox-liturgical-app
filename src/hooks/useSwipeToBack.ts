import { useCallback, useEffect, useRef } from 'react';
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
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  useEffect(() => {
    widthSv.value = width;
  }, [width, widthSv]);

  const translateX = useSharedValue(0);
  const dragging = useRef(false);
  const finishing = useRef(false);

  const finishBack = useCallback(() => {
    finishing.current = false;
    translateX.value = 0;
    onBackRef.current();
  }, [translateX]);

  const panHandlers = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gesture) => {
        if (finishing.current) return false;
        const startX = evt.nativeEvent.pageX - gesture.dx;
        if (startX > 36) return false;
        return gesture.dx > 12 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.25;
      },
      onPanResponderGrant: () => {
        dragging.current = true;
      },
      onPanResponderMove: (_evt, gesture) => {
        if (!dragging.current) return;
        translateX.value = Math.max(0, gesture.dx);
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderRelease: (_evt, gesture) => {
        dragging.current = false;
        const w = widthSv.value;
        const shouldBack = gesture.dx > w * 0.28 || (gesture.dx > 48 && gesture.vx > 0.45);
        if (shouldBack) {
          finishing.current = true;
          translateX.value = withTiming(w, { duration: 200 }, (done) => {
            if (done) runOnJS(finishBack)();
          });
        } else {
          translateX.value = withSpring(0, { damping: 22, stiffness: 260, mass: 0.9 });
        }
      },
      onPanResponderTerminate: () => {
        dragging.current = false;
        if (!finishing.current) {
          translateX.value = withSpring(0, { damping: 22, stiffness: 260, mass: 0.9 });
        }
      },
    }),
  ).current.panHandlers;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

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
