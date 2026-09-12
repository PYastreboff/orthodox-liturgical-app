import { useEffect, useState } from 'react';
import { PanResponder, type GestureResponderHandlers } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

type SwipeToDismissSheet = {
  /** Attach to the sheet surface: claims at touch start via the bubbling phase,
      so plain areas (handle, title, padding) drag-dismiss. */
  panHandlers: GestureResponderHandlers;
  /** Attach to the scrollable content: move-claim only, plus the top-disarm
      bridge, so rows keep scrolling but hand a top-down drag to dismissal. */
  scrollPanHandlers: GestureResponderHandlers;
  translateY: number;
  onSheetScroll: (offsetY: number) => void;
  resetSheetScroll: () => void;
};

function isDownwardDismissGesture(dy: number, dx: number): boolean {
  return dy > 10 && Math.abs(dy) > Math.abs(dx) * 1.15;
}

/**
 * Swipe a bottom sheet downward to dismiss (settings pickers).
 * The sheet transform is plain state (matching the in-app modal pattern that
 * works on iOS); shared values hold transient gesture flags. Attach panHandlers
 * to the sheet; pair scrollable content with SettingsSheetScrollView.
 */
export function useSwipeToDismissSheet(
  onDismiss: () => void,
  visible: boolean,
): SwipeToDismissSheet {
  const [translateY, setTranslateY] = useState(0);
  const dragging = useSharedValue(false);
  const scrollOffsetY = useSharedValue(0);

  const onSheetScroll = (offsetY: number) => {
    scrollOffsetY.value = offsetY;
  };

  const resetSheetScroll = () => {
    scrollOffsetY.value = 0;
  };

  useEffect(() => {
    if (visible) {
      scrollOffsetY.value = 0;
    }
  }, [visible, scrollOffsetY]);

  const panResponderConfig = {
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponderCapture: (_evt: unknown, gesture: { dy: number; dx: number }) => {
      if (scrollOffsetY.value > 1) return false;
      return isDownwardDismissGesture(gesture.dy, gesture.dx);
    },
    onMoveShouldSetPanResponder: (_evt: unknown, gesture: { dy: number; dx: number }) => {
      if (scrollOffsetY.value > 1) return false;
      return isDownwardDismissGesture(gesture.dy, gesture.dx);
    },
    onPanResponderGrant: () => {
      dragging.value = true;
    },
    onPanResponderMove: (_evt: unknown, gesture: { dy: number }) => {
      if (!dragging.value) return;
      setTranslateY(Math.max(0, gesture.dy));
    },
    onPanResponderTerminationRequest: () => false,
    onPanResponderRelease: (_evt: unknown, gesture: { dy: number; vy: number }) => {
      dragging.value = false;
      const shouldDismiss =
        gesture.dy > 160 || (gesture.dy > 56 && gesture.vy > 0.45);
      if (shouldDismiss) {
        onDismiss();
      } else {
        setTranslateY(0);
      }
    },
    onPanResponderTerminate: () => {
      dragging.value = false;
      setTranslateY(0);
    },
  };

  const scrollPanResponderConfig = {
    ...panResponderConfig,
    onStartShouldSetPanResponder: () => false,
  };

  const panHandlers = PanResponder.create(panResponderConfig).panHandlers;
  const scrollPanHandlers = PanResponder.create(scrollPanResponderConfig).panHandlers;

  return {
    panHandlers,
    scrollPanHandlers,
    translateY: visible ? translateY : 0,
    onSheetScroll,
    resetSheetScroll,
  };
}