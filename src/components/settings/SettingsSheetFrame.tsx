import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type GestureResponderHandlers,
  type ScrollViewProps,
} from 'react-native';

import { useSwipeToDismissSheet } from '../../hooks/useSwipeToDismissSheet';
import { radii } from '../../theme/tokens';

type SettingsSheetContextValue = {
  onSheetScroll: (offsetY: number) => void;
  resetSheetScroll: () => void;
  scrollPanHandlers: GestureResponderHandlers;
  /** False while a downward-at-top drag is being re-routed to sheet dismiss. */
  scrollEnabled: boolean;
  disarmScroll: () => void;
  rearmScroll: () => void;
};

const SettingsSheetContext = createContext<SettingsSheetContextValue | null>(null);

/**
 * ScrollView wired for swipe-to-dismiss when scrolled to the top.
 *
 * A drag on the content starts on the native UIScrollView, which normally wins
 * over the sheet's PanResponder on iOS. When the drag begins at the very top we
 * briefly disable scrolling, the native pan is cancelled, and the gesture flows
 * to the sheet PanResponder (attached here too), so a downward pull from the
 * options dismisses the sheet. Scrolling returns on the next touch or when the
 * content is scrolled down.
 */
export function SettingsSheetScrollView({
  onScroll,
  onScrollBeginDrag,
  ...props
}: ScrollViewProps) {
  const ctx = useContext(SettingsSheetContext);

  useEffect(() => {
    ctx?.resetSheetScroll();
  }, [ctx]);

  return (
    <ScrollView
      {...props}
      {...(ctx?.scrollPanHandlers ?? null)}
      scrollEnabled={ctx?.scrollEnabled ?? true}
      onTouchStart={ctx?.rearmScroll}
      onScrollBeginDrag={(event) => {
        if (event.nativeEvent.contentOffset.y <= 0) ctx?.disarmScroll();
        onScrollBeginDrag?.(event);
      }}
      scrollEventThrottle={16}
      onScroll={(event) => {
        const y = event.nativeEvent.contentOffset.y;
        if (y > 2) ctx?.rearmScroll();
        ctx?.onSheetScroll(y);
        onScroll?.(event);
      }}
    />
  );
}

type Props = {
  visible: boolean;
  onClose: () => void;
  sheetHeight: number;
  surfaceBg: string;
  borderColor: string;
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
  const { panHandlers, scrollPanHandlers, translateY, onSheetScroll, resetSheetScroll } =
    useSwipeToDismissSheet(onClose, visible);

  const { width: windowWidth } = useWindowDimensions();
  const isPhone = windowWidth < 600;

  const [scrollEnabled, setScrollEnabled] = useState(true);
  const disableScroll = useCallback(() => setScrollEnabled(false), []);
  const enableScroll = useCallback(() => setScrollEnabled(true), []);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* Single plain Pressable backdrop — tap anywhere closes, exactly like
          the droplet/category picker modal that works on iOS. */}
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" />
      <View
        style={[
          styles.sheet,
          { backgroundColor: surfaceBg, borderColor, height: sheetHeight },
          { bottom: isPhone ? 0 : 24 },
          translateY > 0 ? { transform: [{ translateY }] } : null,
        ]}
        {...panHandlers}
      >
        <View style={styles.handleRow}>
          <View style={[styles.handle, { backgroundColor: handleColor }]} />
        </View>
        <SettingsSheetContext.Provider
          value={{
            onSheetScroll,
            resetSheetScroll,
            scrollPanHandlers,
            scrollEnabled,
            disarmScroll: disableScroll,
            rearmScroll: enableScroll,
          }}
        >
          {children}
        </SettingsSheetContext.Provider>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    // Plain (non-reanimated) view inside the modal: structurally the same as
    // the working category picker, so hit-testing behaves on iOS.
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