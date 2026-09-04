import { type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import {
  chipRowStyle,
  chipStyle,
  segmentedControlSizeStyle,
  segmentedControlTheme,
  type SegmentedControlSize,
} from '../lib/ui/segmentedControlTheme';

export type ChipAccent = { fg: string; bg: string; border: string };

export type SegmentedControlItem<T extends string> = {
  value: T;
  label?: string;
  icon?: ReactNode | ((active: boolean) => ReactNode);
  accessibilityLabel: string;
  /** Optional liturgical colour-code applied to the chip when idle. */
  chipColor?: ChipAccent;
};

type Props<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  segments: SegmentedControlItem<T>[];
  isDark: boolean;
  fullWidth?: boolean;
  size?: SegmentedControlSize;
  /** Horizontal scroll for longer labels (e.g. service names). */
  scrollable?: boolean;
  /** @deprecated chips are always pill-shaped */
  shape?: 'rounded' | 'pill';
};

function ChipRow<T extends string>({
  value,
  onChange,
  segments,
  isDark,
  fullWidth = false,
  size = 'regular',
}: Props<T>) {
  const theme = segmentedControlTheme(isDark);
  const { fontSize, letterSpacing } = segmentedControlSizeStyle(size);

  return (
    <View style={chipRowStyle({ fullWidth })}>
      {segments.map((segment) => {
        const selected = value === segment.value;
        return (
          <Pressable
            key={segment.value}
            style={chipStyle(theme, size, selected, { fullWidth, accent: segment.chipColor })}
            onPress={() => onChange(segment.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            {...hoverAccessibilityProps(segment.accessibilityLabel, { role: 'button' })}
          >
            {segment.icon ? (
              typeof segment.icon === 'function' ? (
                segment.icon(selected)
              ) : (
                segment.icon
              )
            ) : segment.label ? (
              <Text
                style={[
                  styles.chipLabel,
                  {
                    fontSize,
                    letterSpacing,
                    color: selected ? theme.chipSelectedFg : theme.chipIdleFg,
                  },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit={size === 'regular'}
                minimumFontScale={0.85}
              >
                {segment.label}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export function SegmentedControl<T extends string>({
  scrollable = false,
  ...props
}: Props<T>) {
  if (scrollable && !props.fullWidth) {
    const theme = segmentedControlTheme(props.isDark);
    const size = props.size ?? 'regular';
    const { fontSize, letterSpacing } = segmentedControlSizeStyle(size);

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollOuter}
      >
        {props.segments.map((segment) => {
          const selected = props.value === segment.value;
          return (
            <Pressable
              key={segment.value}
              style={chipStyle(theme, size, selected, { accent: segment.chipColor })}
              onPress={() => props.onChange(segment.value)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              {...hoverAccessibilityProps(segment.accessibilityLabel, { role: 'button' })}
            >
              {segment.icon ? (
                typeof segment.icon === 'function' ? (
                  segment.icon(selected)
                ) : (
                  segment.icon
                )
              ) : segment.label ? (
                <Text
                  style={[
                    styles.chipLabel,
                    {
                      fontSize,
                      letterSpacing,
                      color: selected ? theme.chipSelectedFg : theme.chipIdleFg,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {segment.label}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    );
  }

  return <ChipRow {...props} />;
}

/** Separate chips in a row — used for compare column pickers. */
export function StaticSegmentedControl<T extends string>(props: Omit<Props<T>, 'shape' | 'scrollable'>) {
  return <ChipRow {...props} />;
}

const styles = StyleSheet.create({
  scrollOuter: {
    marginHorizontal: -2,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  chipLabel: {
    fontWeight: '600',
  },
});
