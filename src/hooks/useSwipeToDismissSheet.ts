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

type SwipeToDismissSheet = {
  panHandlers: GestureResponderHandlers;
  sheetStyle: AnimatedStyle<ViewStyle>;
  backdropStyle: AnimatedStyle<ViewStyle>;
};

/**
 * Swipe a bottom sheet downward to dismiss (settings pickers).
 * Attach panHandlers to the drag handle — not the scrollable body.
 */
export function useSwipeToDismissSheet(onDismiss: () => void, visible: boolean): SwipeToDismissSheet {
  const { height: windowHeight } = useWindowDimensions();
  const heightSv = useSharedValue(windowHeight);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    heightSv.value = windowHeight;
  }, [heightSv, windowHeight]);

  const translateY = useSharedValue(0);
  const dragging = useRef(false);
  const finishing = useRef(false);

  useEffect(() => {
    if (visible) {
      finishing.current = false;
      translateY.value = 0;
    }
  }, [translateY, visible]);

  const finishDismiss = useCallback(() => {
    finishing.current = false;
    translateY.value = 0;
    onDismissRef.current();
  }, [translateY]);

  const panHandlers = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gesture) => {
        if (finishing.current) return false;
        return gesture.dy > 10 && Math.abs(gesture.dy) > Math.abs(gesture.dx) * 1.15;
      },
      onPanResponderGrant: () => {
        dragging.current = true;
      },
      onPanResponderMove: (_evt, gesture) => {
        if (!dragging.current) return;
        translateY.value = Math.max(0, gesture.dy);
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderRelease: (_evt, gesture) => {
        dragging.current = false;
        const h = heightSv.value;
        const shouldDismiss = gesture.dy > h * 0.18 || (gesture.dy > 56 && gesture.vy > 0.45);
        if (shouldDismiss) {
          finishing.current = true;
          translateY.value = withTiming(h * 0.55, { duration: 200 }, (done) => {
            if (done) runOnJS(finishDismiss)();
          });
        } else {
          translateY.value = withSpring(0, { damping: 22, stiffness: 260, mass: 0.9 });
        }
      },
      onPanResponderTerminate: () => {
        dragging.current = false;
        if (!finishing.current) {
          translateY.value = withSpring(0, { damping: 22, stiffness: 260, mass: 0.9 });
        }
      },
    }),
  ).current.panHandlers;

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => {
    const h = Math.max(heightSv.value, 1);
    const progress = Math.min(1, Math.max(0, translateY.value / (h * 0.35)));
    return {
      opacity: 1 - progress * 0.55,
    };
  });

  return { panHandlers, sheetStyle, backdropStyle };
}
