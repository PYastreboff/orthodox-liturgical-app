import { Feather } from '@expo/vector-icons';
import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

const SELECTED_FG = '#fff';

function tintLeading(node: ReactNode, selected: boolean): ReactNode {
  if (!selected || !isValidElement(node)) return node;
  return cloneElement(node as ReactElement<{ color?: string }>, { color: SELECTED_FG });
}

import { hoverAccessibilityProps } from '../../lib/a11y/hoverAccessible';
import type { NotificationReminderKind } from '../../lib/notifications/liturgicalReminders';
import { colors } from '../../theme/tokens';

export type NotificationToggleOption = {
  id: NotificationReminderKind;
  label: string;
  hint: string;
  leading: ReactNode;
  enabled: boolean;
};

type Props = {
  visible: boolean;
  title: string;
  subtitle?: string;
  options: readonly NotificationToggleOption[];
  onToggle: (id: NotificationReminderKind, next: boolean) => void;
  onClose: () => void;
  isDark: boolean;
  footerNote?: string;
  testLabel?: string;
  testHint?: string;
  onTestPress?: () => void;
  testDisabled?: boolean;
};

/** Multi-select notification picker — same sheet pattern as SettingsOptionModal. */
export function SettingsNotificationsModal({
  visible,
  title,
  subtitle,
  options,
  onToggle,
  onClose,
  isDark,
  footerNote,
  testLabel,
  testHint,
  onTestPress,
  testDisabled = false,
}: Props) {
  const surfaceBg = isDark ? '#2a2724' : '#ebe6de';
  const textColor = isDark ? '#e8e3dd' : '#2b2623';
  const mutedColor = isDark ? '#a39e98' : colors.muted;
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(43,38,35,0.12)';
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const sheetHeight = Math.round(windowHeight * (windowWidth < 600 ? 2 / 3 : 0.62));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityElementsHidden />
        <View style={[styles.sheet, { backgroundColor: surfaceBg, borderColor, height: sheetHeight }]}>
          <Text style={[styles.title, { color: textColor }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: mutedColor }]}>{subtitle}</Text>
          ) : null}
          <ScrollView
            style={styles.optionsScroll}
            contentContainerStyle={styles.optionsContent}
            keyboardShouldPersistTaps="handled"
          >
            {options.map((option) => {
              const selected = option.enabled;
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
                  onPress={() => onToggle(option.id, !selected)}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: selected }}
                  {...hoverAccessibilityProps(option.label, { role: 'switch' })}
                >
                  <View style={styles.leading}>{tintLeading(option.leading, selected)}</View>
                  <View style={styles.textCol}>
                    <Text
                      style={[styles.optionLabel, { color: selected ? SELECTED_FG : textColor }]}
                      numberOfLines={2}
                    >
                      {option.label}
                    </Text>
                    <Text
                      style={[styles.optionHint, { color: selected ? 'rgba(255,255,255,0.82)' : mutedColor }]}
                      numberOfLines={2}
                    >
                      {option.hint}
                    </Text>
                  </View>
                  {selected ? (
                    <Feather name="check" size={18} color={SELECTED_FG} />
                  ) : (
                    <View style={styles.checkPlaceholder} />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
          {testLabel && onTestPress ? (
            <Pressable
              onPress={onTestPress}
              disabled={testDisabled}
              style={({ pressed }) => [
                styles.testBtn,
                {
                  borderColor,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(43,38,35,0.05)',
                  opacity: testDisabled ? 0.45 : pressed ? 0.88 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={testLabel}
              accessibilityState={{ disabled: testDisabled }}
              {...hoverAccessibilityProps(testLabel, { role: 'button' })}
            >
              <Feather
                name="bell"
                size={18}
                color={isDark ? colors.tabActiveDark : colors.accentWine}
              />
              <View style={styles.textCol}>
                <Text style={[styles.testLabel, { color: textColor }]}>{testLabel}</Text>
                {testHint ? (
                  <Text style={[styles.testHint, { color: mutedColor }]} numberOfLines={2}>
                    {testHint}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          ) : null}
          {footerNote ? (
            <Text style={[styles.footerNote, { color: mutedColor }]}>{footerNote}</Text>
          ) : null}
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
    paddingBottom: 8,
    flexGrow: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
    minHeight: 56,
  },
  leading: {
    width: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 21,
  },
  optionHint: {
    fontSize: 12,
    lineHeight: 16,
  },
  checkPlaceholder: {
    width: 18,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  testLabel: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  testHint: {
    fontSize: 12,
    lineHeight: 16,
  },
  footerNote: {
    fontSize: 12,
    lineHeight: 16,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 14,
  },
});
