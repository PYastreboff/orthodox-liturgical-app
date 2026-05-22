import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../../theme/tokens';

const TRACK_WIDTH = 50;
const THUMB_SIZE = 24;
const TRACK_PADDING = 3;
const THUMB_TRAVEL = TRACK_WIDTH - TRACK_PADDING * 2 - THUMB_SIZE;

const TOGGLE_TIMING = {
  duration: 240,
  easing: Easing.bezier(0.42, 0, 0.58, 1),
};

type Props = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  isDark: boolean;
};

/** Custom toggle — avoids system green on iOS/Android Switch. */
export function SettingsSwitch({ value, onValueChange, isDark }: Props) {
  const progress = useSharedValue(value ? 1 : 0);
  const trackOff = isDark ? '#4a4640' : '#d4cfc6';

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, TOGGLE_TIMING);
  }, [progress, value]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [trackOff, colors.accentWine],
    ),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * THUMB_TRAVEL }],
  }));

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      hitSlop={8}
    >
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: 30,
    borderRadius: 15,
    padding: TRACK_PADDING,
    justifyContent: 'center',
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
