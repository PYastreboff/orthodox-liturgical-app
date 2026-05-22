import { useEffect, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { colors } from '../../theme/tokens';

const TRACK_PADDING = 4;

export const SEGMENT_TIMING = {
  duration: 240,
  easing: Easing.bezier(0.42, 0, 0.58, 1),
};

export type SegmentedOption<T extends string> = {
  id: T;
  label: string;
};

export type SegmentRenderContext = {
  inactiveColor: string;
  index: number;
  progress: SharedValue<number>;
};

type Props<T extends string> = {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  isDark: boolean;
  optionStyle?: 'column' | 'row';
  renderLeading?: (option: SegmentedOption<T>, ctx: SegmentRenderContext) => React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function SegmentedPicker<T extends string>({
  options,
  value,
  onChange,
  isDark,
  optionStyle = 'column',
  renderLeading,
  style,
}: Props<T>) {
  const trackBg = isDark ? '#2a2724' : '#ebe6de';
  const inactiveText = isDark ? '#a39e98' : colors.muted;
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.id === value),
  );
  const progress = useSharedValue(selectedIndex);
  const [trackWidth, setTrackWidth] = useState(0);

  const segmentWidth =
    trackWidth > 0 ? (trackWidth - TRACK_PADDING * 2) / options.length : 0;

  useEffect(() => {
    progress.value = withTiming(selectedIndex, SEGMENT_TIMING);
  }, [progress, selectedIndex]);

  const pillStyle = useAnimatedStyle(() => ({
    width: segmentWidth,
    transform: [{ translateX: TRACK_PADDING + progress.value * segmentWidth }],
  }));

  return (
    <View
      style={[styles.track, { backgroundColor: trackBg }, style]}
      onLayout={(event: LayoutChangeEvent) => {
        setTrackWidth(event.nativeEvent.layout.width);
      }}
    >
      {segmentWidth > 0 ? (
        <Animated.View style={[styles.pill, pillStyle]} pointerEvents="none" />
      ) : null}
      {options.map((option, index) => (
        <SegmentOption
          key={option.id}
          option={option}
          index={index}
          progress={progress}
          inactiveText={inactiveText}
          optionStyle={optionStyle}
          onPress={() => onChange(option.id)}
          selected={value === option.id}
          renderLeading={
            renderLeading
              ? renderLeading(option, {
                  inactiveColor: inactiveText,
                  index,
                  progress,
                })
              : null
          }
        />
      ))}
    </View>
  );
}

function SegmentOption<T extends string>({
  option,
  index,
  progress,
  inactiveText,
  optionStyle,
  onPress,
  selected,
  renderLeading,
}: {
  option: SegmentedOption<T>;
  index: number;
  progress: SharedValue<number>;
  inactiveText: string;
  optionStyle: 'column' | 'row';
  onPress: () => void;
  selected: boolean;
  renderLeading: React.ReactNode;
}) {
  const labelStyle = useAnimatedStyle(() => {
    const distance = Math.abs(progress.value - index);
    const blend = Math.max(0, 1 - Math.min(1, distance * 1.4));
    return {
      color: interpolateColor(blend, [0, 1], [inactiveText, '#ffffff']),
    };
  });

  return (
    <Pressable
      style={[
        styles.option,
        optionStyle === 'row' ? styles.optionRow : styles.optionColumn,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      {renderLeading}
      <Animated.Text
        style={[
          optionStyle === 'row' ? styles.optionLabelRow : styles.optionLabel,
          labelStyle,
        ]}
      >
        {option.label}
      </Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: TRACK_PADDING,
    marginHorizontal: 20,
    marginVertical: 12,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 400,
    position: 'relative',
  },
  pill: {
    position: 'absolute',
    top: TRACK_PADDING,
    bottom: TRACK_PADDING,
    left: 0,
    borderRadius: 10,
    backgroundColor: colors.accentWine,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    zIndex: 1,
  },
  optionColumn: {
    gap: 4,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 6,
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  optionLabelRow: {
    fontSize: 13,
    fontWeight: '600',
  },
});
