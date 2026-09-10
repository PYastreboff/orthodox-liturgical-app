import { useCallback, useEffect, useRef, useState } from 'react';
import { PanResponder, type GestureResponderHandlers } from 'react-native';

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
 * Pure RN (no reanimated): the sheet transform is plain state, matching the
 * in-app modal pattern that works on iOS. Attach panHandlers to the sheet;
 * pair scrollable content with SettingsSheetScrollView.
 */
export function useSwipeToDismissSheet(
  onDismiss: () => void,
  visible: boolean,
): SwipeToDismissSheet {
  const onDismissRef = useRef(onDismiss);
  const [translateY, setTranslateY] = useState(0);
  const dragging = useRef(false);
  const finishing = useRef(false);
  const scrollOffsetY = useRef(0);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

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
      setTranslateY(0);
    }
  }, [visible]);

  const panResponderConfig = {
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponderCapture: (_evt: unknown, gesture: { dy: number; dx: number }) => {
      if (finishing.current) return false;
      if (scrollOffsetY.current > 1) return false;
      return isDownwardDismissGesture(gesture.dy, gesture.dx);
    },
    onMoveShouldSetPanResponder: (_evt: unknown, gesture: { dy: number; dx: number }) => {
      if (finishing.current) return false;
      if (scrollOffsetY.current > 1) return false;
      return isDownwardDismissGesture(gesture.dy, gesture.dx);
    },
    onPanResponderGrant: () => {
      dragging.current = true;
    },
    onPanResponderMove: (_evt: unknown, gesture: { dy: number }) => {
      if (!dragging.current) return;
      setTranslateY(Math.max(0, gesture.dy));
    },
    onPanResponderTerminationRequest: () => false,
    onPanResponderRelease: (_evt: unknown, gesture: { dy: number; vy: number }) => {
      dragging.current = false;
      const shouldDismiss =
        gesture.dy > 160 || (gesture.dy > 56 && gesture.vy > 0.45);
      if (shouldDismiss) {
        finishing.current = true;
        onDismissRef.current();
      } else {
        setTranslateY(0);
      }
    },
    onPanResponderTerminate: () => {
      dragging.current = false;
      if (!finishing.current) setTranslateY(0);
    },
  };

  const scrollPanResponderConfig = {
    ...panResponderConfig,
    onStartShouldSetPanResponder: () => false,
  };

  const panHandlers = useRef(PanResponder.create(panResponderConfig)).current.panHandlers;
  const scrollPanHandlers = useRef(
    PanResponder.create(scrollPanResponderConfig),
  ).current.panHandlers;

  return { panHandlers, scrollPanHandlers, translateY, onSheetScroll, resetSheetScroll };
}