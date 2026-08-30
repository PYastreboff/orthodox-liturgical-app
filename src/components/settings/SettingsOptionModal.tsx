import { Feather } from '@expo/vector-icons';
import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { HoverPressable } from '../HoverPressable';
import { hoverAccessibilityProps } from '../../lib/a11y/hoverAccessible';
import { colors } from '../../theme/tokens';
import { SettingsSheetFrame, SettingsSheetScrollView } from './SettingsSheetFrame';

const SELECTED_FG = '#fff';

function tintLeading(node: ReactNode, selected: boolean): ReactNode {
  if (!selected || !isValidElement(node)) return node;
  return cloneElement(node as ReactElement<{ color?: string }>, { color: SELECTED_FG });
}

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
  const surfaceBg = isDark ? colors.darkSurfaceElevated : colors.card;
  const textColor = isDark ? colors.darkInk : colors.ink;
  const borderColor = isDark ? colors.darkBorderSubtle : colors.borderSubtle;
  const handleColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(43,38,35,0.22)';
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const sheetHeight = Math.round(windowHeight * (windowWidth < 600 ? 2 / 3 : 0.6));

  return (
    <SettingsSheetFrame
      visible={visible}
      onClose={onClose}
      sheetHeight={sheetHeight}
      surfaceBg={surfaceBg}
      borderColor={borderColor}
      handleColor={handleColor}
    >
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      <SettingsSheetScrollView
        style={styles.optionsScroll}
        contentContainerStyle={styles.optionsContent}
        keyboardShouldPersistTaps="handled"
      >
        {options.map((option) => {
          const selected = option.id === value;
          return (
            <HoverPressable
              key={option.id}
              isDark={isDark}
              selected={selected}
              style={styles.option}
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
            </HoverPressable>
          );
        })}
      </SettingsSheetScrollView>
    </SettingsSheetFrame>
  );
}

const styles = StyleSheet.create({
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
    paddingTop: 4,
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
