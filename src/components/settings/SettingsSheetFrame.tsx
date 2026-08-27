import { type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { useSwipeToDismissSheet } from '../../hooks/useSwipeToDismissSheet';

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
  const { panHandlers, sheetStyle, backdropStyle } = useSwipeToDismissSheet(onClose, visible);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View
          style={[styles.backdrop, backdropStyle]}
          pointerEvents="none"
        />
        <Pressable style={styles.backdropTap} onPress={onClose} accessibilityElementsHidden />
        <Animated.View
          style={[
            styles.sheet,
            sheetStyle,
            { backgroundColor: surfaceBg, borderColor, height: sheetHeight },
          ]}
        >
          <View style={styles.handleRow} {...panHandlers}>
            <View style={[styles.handle, { backgroundColor: handleColor }]} />
          </View>
          {children}
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
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
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
