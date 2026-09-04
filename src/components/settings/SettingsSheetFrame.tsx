import { createContext, useContext, useEffect, type ReactNode } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
} from 'react-native';
import Animated from 'react-native-reanimated';

import { useSwipeToDismissSheet } from '../../hooks/useSwipeToDismissSheet';
import { radii } from '../../theme/tokens';

type SettingsSheetContextValue = {
  onSheetScroll: (offsetY: number) => void;
  resetSheetScroll: () => void;
};

const SettingsSheetContext = createContext<SettingsSheetContextValue | null>(null);

/** ScrollView wired for swipe-to-dismiss when scrolled to the top. */
export function SettingsSheetScrollView({ onScroll, ...props }: ScrollViewProps) {
  const ctx = useContext(SettingsSheetContext);

  useEffect(() => {
    ctx?.resetSheetScroll();
  }, [ctx]);

  return (
    <ScrollView
      {...props}
      scrollEventThrottle={16}
      onScroll={(event) => {
        ctx?.onSheetScroll(event.nativeEvent.contentOffset.y);
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
  const { panHandlers, sheetStyle, backdropStyle, onSheetScroll, resetSheetScroll } =
    useSwipeToDismissSheet(onClose, visible);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View
          style={[styles.backdrop, backdropStyle, { pointerEvents: 'none' }]}
        />
        <Pressable style={styles.backdropTap} onPress={onClose} accessibilityElementsHidden />
        <Animated.View
          style={[
            styles.sheet,
            sheetStyle,
            { backgroundColor: surfaceBg, borderColor, height: sheetHeight },
          ]}
          {...panHandlers}
        >
          <View style={styles.handleRow}>
            <View style={[styles.handle, { backgroundColor: handleColor }]} />
          </View>
          <SettingsSheetContext.Provider value={{ onSheetScroll, resetSheetScroll }}>
            {children}
          </SettingsSheetContext.Provider>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  backdropTap: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
    boxShadow: '0px 12px 28px rgba(0,0,0,0.28)',
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
