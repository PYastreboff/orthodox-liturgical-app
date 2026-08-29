import { Pressable, StyleSheet, Text, View } from 'react-native';

import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import { colors } from '../theme/tokens';

export type CompareSideOption<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  left: T | null;
  right: T | null;
  onChangeLeft: (value: T) => void;
  onChangeRight: (value: T) => void;
  options: CompareSideOption<T>[];
  leftLabel: string;
  rightLabel: string;
  isDark: boolean;
};

function SideColumn<T extends string>({
  label,
  value,
  onChange,
  options,
  isDark,
}: {
  label: string;
  value: T | null;
  onChange: (value: T) => void;
  options: CompareSideOption<T>[];
  isDark: boolean;
}) {
  const trackBg = isDark ? '#2a2724' : '#ebe6de';
  const inactiveText = isDark ? '#a39e98' : colors.muted;
  const activeBg = colors.accentWine;

  return (
    <View style={styles.column}>
      <Text style={[styles.columnHeading, { color: inactiveText }]}>{label}</Text>
      <View style={[styles.track, { backgroundColor: trackBg }]}>
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <Pressable
              key={option.value}
              style={[styles.segment, selected ? { backgroundColor: activeBg } : null]}
              onPress={() => onChange(option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              {...hoverAccessibilityProps(option.label, { role: 'button' })}
            >
              <Text
                style={[
                  styles.segmentLabel,
                  { color: selected ? '#ffffff' : inactiveText },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function CompareSidePicker<T extends string>({
  left,
  right,
  onChangeLeft,
  onChangeRight,
  options,
  leftLabel,
  rightLabel,
  isDark,
}: Props<T>) {
  return (
    <View style={styles.row}>
      <SideColumn
        label={leftLabel}
        value={left}
        onChange={onChangeLeft}
        options={options}
        isDark={isDark}
      />
      <SideColumn
        label={rightLabel}
        value={right}
        onChange={onChangeRight}
        options={options}
        isDark={isDark}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  column: {
    flex: 1,
    minWidth: 140,
    gap: 6,
  },
  columnHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  track: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    minHeight: 28,
    paddingHorizontal: 6,
  },
  segmentLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
