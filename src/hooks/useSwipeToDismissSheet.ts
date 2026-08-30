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
  onSheetScroll: (offsetY: number) => void;
  resetSheetScroll: () => void;
};

function isDownwardDismissGesture(dy: number, dx: number): boolean {
  return dy > 10 && Math.abs(dy) > Math.abs(dx) * 1.15;
}

/**
 * Swipe a bottom sheet downward to dismiss (settings pickers).
 * Attach panHandlers to the whole sheet; pair scrollable content with SettingsSheetScrollView.
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
  const scrollOffsetY = useRef(0);

  const onSheetScroll = useCallback((offsetY: number) => {
    scrollOffsetY.current = offsetY;
  }, []);

  const resetSheetScroll = useCallback(() => {
    scrollOffsetY.current = 0;
  }, []);

  useEffect(() => {
    if (visible) {
      finishing.current = false;
      scrollOffsetY.current = 0;
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
      onMoveShouldSetPanResponderCapture: (_evt, gesture) => {
        if (finishing.current) return false;
        if (scrollOffsetY.current > 1) return false;
        return isDownwardDismissGesture(gesture.dy, gesture.dx);
      },
      onMoveShouldSetPanResponder: (_evt, gesture) => {
        if (finishing.current) return false;
        return isDownwardDismissGesture(gesture.dy, gesture.dx);
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

  return { panHandlers, sheetStyle, backdropStyle, onSheetScroll, resetSheetScroll };
}
