import { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import type { TextLanguage } from '../state/PreferencesContext';
import { colors } from '../theme/tokens';

const TIMING = { duration: 200, easing: Easing.bezier(0.42, 0, 0.58, 1) };
const TRACK_PADDING = 2;
const SEGMENTS = 3;

type Props = {
  value: TextLanguage;
  onChange: (value: TextLanguage) => void;
  isDark: boolean;
};

export function ReadingsLanguageToggle({ value, onChange, isDark }: Props) {
  const trackBg = isDark ? '#2a2724' : '#ebe6de';
  const inactiveText = isDark ? '#a39e98' : colors.muted;
  const selectedIndex = value === 'en' ? 0 : 2;
  const progress = useSharedValue(selectedIndex);
  const [trackWidth, setTrackWidth] = useState(0);

  const segmentWidth =
    trackWidth > 0 ? (trackWidth - TRACK_PADDING * 2) / SEGMENTS : 0;

  useEffect(() => {
    progress.value = withTiming(selectedIndex, TIMING);
  }, [progress, selectedIndex]);

  const pillStyle = useAnimatedStyle(() => ({
    width: segmentWidth,
    transform: [{ translateX: TRACK_PADDING + progress.value * segmentWidth }],
  }));

  const enLabelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      Math.max(0, 1 - Math.min(1, Math.abs(progress.value - 0) * 1.4)),
      [0, 1],
      [inactiveText, '#ffffff'],
    ),
  }));

  const csLabelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      Math.max(0, 1 - Math.min(1, Math.abs(progress.value - 2) * 1.4)),
      [0, 1],
      [inactiveText, '#ffffff'],
    ),
  }));

  const toggleLanguage = () => onChange(value === 'en' ? 'chu' : 'en');

  return (
    <View
      style={[styles.track, { backgroundColor: trackBg }]}
      onLayout={(e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width)}
    >
      {segmentWidth > 0 ? (
        <Animated.View style={[styles.pill, pillStyle]} pointerEvents="none" />
      ) : null}

      <Pressable
        style={styles.segment}
        onPress={() => onChange('en')}
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'en' }}
        {...hoverAccessibilityProps('English readings', { role: 'button' })}
      >
        <Animated.Text style={[styles.segmentLabel, enLabelStyle]}>EN</Animated.Text>
      </Pressable>

      <Pressable
        style={styles.segment}
        onPress={toggleLanguage}
        accessibilityRole="button"
        accessibilityLabel={`Switch to ${value === 'en' ? 'Church Slavonic' : 'English'}`}
        {...hoverAccessibilityProps(
          value === 'en' ? 'Switch to Church Slavonic' : 'Switch to English',
          { role: 'button' },
        )}
      >
        <Feather name="repeat" size={13} color={inactiveText} />
      </Pressable>

      <Pressable
        style={styles.segment}
        onPress={() => onChange('chu')}
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'chu' }}
        {...hoverAccessibilityProps('Church Slavonic readings', { role: 'button' })}
      >
        <Animated.Text style={[styles.segmentLabel, csLabelStyle]}>ЧС</Animated.Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: TRACK_PADDING,
    position: 'relative',
    minWidth: 108,
    height: 28,
  },
  pill: {
    position: 'absolute',
    top: TRACK_PADDING,
    bottom: TRACK_PADDING,
    left: 0,
    borderRadius: 6,
    backgroundColor: colors.accentWine,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    minWidth: 32,
  },
  segmentLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
