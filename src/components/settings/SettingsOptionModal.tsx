import { Feather } from '@expo/vector-icons';
import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

const SELECTED_FG = '#fff';

function tintLeading(node: ReactNode, selected: boolean): ReactNode {
  if (!selected || !isValidElement(node)) return node;
  return cloneElement(node as ReactElement<{ color?: string }>, { color: SELECTED_FG });
}

import { hoverAccessibilityProps } from '../../lib/a11y/hoverAccessible';
import { colors } from '../../theme/tokens';

export type SettingsOption<T extends string> = {
  id: T;
  label: string;
  leading?: ReactNode;
};

type Props<T extends string> = {
  visible: boolean;
  title: string;
  options: readonly SettingsOption<T>[];
  value: T;
  onSelect: (value: T) => void;
  onClose: () => void;
  isDark: boolean;
};

/** Bottom sheet for choosing one of several settings values. */
export function SettingsOptionModal<T extends string>({
  visible,
  title,
  options,
  value,
  onSelect,
  onClose,
  isDark,
}: Props<T>) {
  const surfaceBg = isDark ? '#2a2724' : '#ebe6de';
  const textColor = isDark ? '#e8e3dd' : '#2b2623';
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(43,38,35,0.12)';
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const sheetHeight = Math.round(windowHeight * (windowWidth < 600 ? 2 / 3 : 0.6));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityElementsHidden />
        <View style={[styles.sheet, { backgroundColor: surfaceBg, borderColor, height: sheetHeight }]}>
          <Text style={[styles.title, { color: textColor }]}>{title}</Text>
          <ScrollView
            style={styles.optionsScroll}
            contentContainerStyle={styles.optionsContent}
            keyboardShouldPersistTaps="handled"
          >
          {options.map((option) => {
            const selected = option.id === value;
            return (
              <Pressable
                key={option.id}
                style={({ pressed }) => [
                  styles.option,
                  {
                    backgroundColor: selected
                      ? colors.accentWine
                      : pressed
                        ? 'rgba(139,46,60,0.14)'
                        : 'transparent',
                  },
                ]}
                onPress={() => {
                  onSelect(option.id);
                  onClose();
                }}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                {...hoverAccessibilityProps(option.label, { role: 'button' })}
              >
                {option.leading ? (
                  <View style={styles.leading}>{tintLeading(option.leading, selected)}</View>
                ) : null}
                <Text
                  style={[styles.optionLabel, { color: selected ? SELECTED_FG : textColor }]}
                  numberOfLines={2}
                >
                  {option.label}
                </Text>
                {selected ? (
                  <Feather name="check" size={18} color={SELECTED_FG} />
                ) : (
                  <View style={styles.checkPlaceholder} />
                )}
              </Pressable>
            );
          })}
          </ScrollView>
        </View>
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
  optionsScroll: {
    flex: 1,
  },
  optionsContent: {
    paddingBottom: 12,
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 56,
  },
  leading: {
    width: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 21,
  },
  checkPlaceholder: {
    width: 18,
  },
});
