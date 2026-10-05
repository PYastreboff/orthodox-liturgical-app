import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type ColorValue,
  type ScrollViewProps,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  type NativeGesture,
} from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type AnimatedRef,
  type SharedValue,
} from 'react-native-reanimated';

import { useFluidMotion } from '../../hooks/useFluidMotion';
import { radii } from '../../theme/tokens';

const GESTURES_ENABLED = Platform.OS !== 'web';

type SettingsSheetContextValue = {
  scrollGesture: NativeGesture;
  scrollOffset: SharedValue<number>;
  scrollView: AnimatedRef<Animated.ScrollView>;
};

const SettingsSheetContext = createContext<SettingsSheetContextValue | null>(null);

/**
 * ScrollView for sheet content. Runs simultaneously with the sheet's pan, so a
 * downward drag scrolls the list back to the top first and then pulls the sheet.
 */
export function SettingsSheetScrollView(props: Omit<ScrollViewProps, 'onScroll'>) {
  const ctx = useContext(SettingsSheetContext);
  const fallbackOffset = useSharedValue(0);
  const fallbackScrollView = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = ctx?.scrollOffset ?? fallbackOffset;

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollOffset.set(event.contentOffset.y);
  });

  useEffect(() => {
    scrollOffset.set(0);
    return () => {
      scrollOffset.set(0);
    };
  }, [scrollOffset]);

  const scroll = (
    <Animated.ScrollView
      {...props}
      ref={ctx?.scrollView ?? fallbackScrollView}
      bounces={false}
      overScrollMode="never"
      scrollEventThrottle={16}
      onScroll={onScroll}
    />
  );

  if (!ctx || !GESTURES_ENABLED) return scroll;
  return <GestureDetector gesture={ctx.scrollGesture}>{scroll}</GestureDetector>;
}

type Props = {
  visible: boolean;
  onClose: () => void;
  sheetHeight: number;
  surfaceBg: string;
  borderColor: ColorValue;
  handleColor: string;
  children: ReactNode;
};

/** Bottom sheet chrome: backdrop, drag handle, swipe-down to dismiss. */
export function SettingsSheetFrame({
  visible,
  onClose,
  sheetHeight,
  surfaceBg,
  borderColor,
  handleColor,
  children,
}: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const isPhone = windowWidth < 600;
  const { reduceMotion, spring } = useFluidMotion();

  const translateY = useSharedValue(0);
  const dragBase = useSharedValue(0);
  const scrollOffset = useSharedValue(0);
  const scrollView = useAnimatedRef<Animated.ScrollView>();

  useEffect(() => {
    if (visible) translateY.set(0);
  }, [visible, translateY]);

  const scrollGesture = useMemo(() => Gesture.Native(), []);

  /**
   * Soft boundary past the top: pulling up resists progressively instead of
   * stopping hard (§9). Spring back to 0 releases the captured overshoot.
   */
  const rubberband = (overshoot: number, dimension: number) => {
    'worklet';
    const k = 0.55;
    return (overshoot * dimension * k) / (dimension + k * Math.abs(overshoot));
  };

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY(8)
        .failOffsetX([-24, 24])
        .simultaneousWithExternalGesture(scrollGesture)
        .onStart(() => {
          dragBase.set(0);
        })
        .onUpdate((event) => {
          if (scrollOffset.get() > 0 && translateY.get() === 0) {
            dragBase.set(event.translationY);
            return;
          }
          const raw = event.translationY - dragBase.get();
          const next = raw > 0 ? raw : -rubberband(-raw, sheetHeight);
          translateY.set(next);
          if (next > 0 && scrollOffset.get() > 0) scrollTo(scrollView, 0, 0, false);
        })
        .onEnd((event) => {
          const distance = translateY.get();
          const shouldDismiss =
            distance > Math.min(160, sheetHeight * 0.3) || (distance > 24 && event.velocityY > 900);
          if (shouldDismiss) {
            if (reduceMotion) {
              translateY.set(
                withTiming(sheetHeight + 48, { duration: 150 }, (done) => {
                  if (done) runOnJS(onClose)();
                }),
              );
            } else {
              // Hand off the release velocity so the exit continues the throw (§5).
              translateY.set(
                withSpring(sheetHeight + 48, { ...spring, velocity: event.velocityY }, (done) => {
                  if (done) runOnJS(onClose)();
                }),
              );
            }
          } else if (reduceMotion) {
            translateY.set(withTiming(0, { duration: 150 }));
          } else {
            translateY.set(withSpring(0, { ...spring, velocity: event.velocityY }));
          }
        }),
    [spring, reduceMotion, scrollGesture, dragBase, scrollOffset, translateY, scrollView, sheetHeight, onClose],
  );

  const sheetStyle = useAnimatedStyle(() => {
    const ty = translateY.get();
    // At rest keep an empty transform: on iOS/Fabric a transformed view inside
    // an overflow:hidden parent can get a miscalculated compositing frame.
    return { transform: ty === 0 ? [] : [{ translateY: ty }] };
  });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.get(), [0, sheetHeight], [1, 0], 'clamp'),
  }));

  const contextValue = useMemo(
    () => ({ scrollGesture, scrollOffset, scrollView }),
    [scrollGesture, scrollOffset, scrollView],
  );

  const sheet = (
    <Animated.View
      style={[
        styles.sheet,
        { backgroundColor: surfaceBg, borderColor, height: sheetHeight },
        { bottom: isPhone ? 0 : 24 },
        sheetStyle,
      ]}
    >
      <View style={styles.handleRow}>
        <View style={[styles.handle, { backgroundColor: handleColor }]} />
      </View>
      <SettingsSheetContext.Provider value={contextValue}>{children}</SettingsSheetContext.Provider>
    </Animated.View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.root}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" />
        </Animated.View>
        {GESTURES_ENABLED ? <GestureDetector gesture={panGesture}>{sheet}</GestureDetector> : sheet}
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 24,
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.28,
          shadowRadius: 28,
        }
      : { boxShadow: '0px 12px 28px rgba(0,0,0,0.28)' }),
  },
  handleRow: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 999,
    opacity: 0.45,
  },
});
