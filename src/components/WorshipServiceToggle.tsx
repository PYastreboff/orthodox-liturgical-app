import { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import { useAppTranslation } from '../i18n/useAppTranslation';
import type { WorshipServiceId } from '../lib/liturgical/worshipNavigation';
import { colors } from '../theme/tokens';

const TIMING = { duration: 200, easing: Easing.bezier(0.42, 0, 0.58, 1) };
const TRACK_PADDING = 2;
const SEGMENTS = 3;

type Props = {
  value: WorshipServiceId;
  onChange: (value: WorshipServiceId) => void;
  isDark: boolean;
  fullWidth?: boolean;
};

export function WorshipServiceToggle({ value, onChange, isDark, fullWidth = false }: Props) {
  const { t } = useAppTranslation();
  const trackBg = isDark ? '#2a2724' : '#ebe6de';
  const inactiveText = isDark ? '#a39e98' : colors.muted;
  const selectedIndex = value === 'vespers' ? 2 : value === 'basil' ? 1 : 0;
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

  const chrysostomStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      Math.max(0, 1 - Math.min(1, Math.abs(progress.value - 0) * 1.4)),
      [0, 1],
      [inactiveText, '#ffffff'],
    ),
  }));

  const basilStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      Math.max(0, 1 - Math.min(1, Math.abs(progress.value - 1) * 1.4)),
      [0, 1],
      [inactiveText, '#ffffff'],
    ),
  }));

  const vespersStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      Math.max(0, 1 - Math.min(1, Math.abs(progress.value - 2) * 1.4)),
      [0, 1],
      [inactiveText, '#ffffff'],
    ),
  }));

  return (
    <View
      style={[styles.track, { backgroundColor: trackBg }, fullWidth && styles.trackFullWidth]}
      onLayout={(e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width)}
    >
      {segmentWidth > 0 ? (
        <Animated.View style={[styles.pill, pillStyle]} pointerEvents="none" />
      ) : null}
      <Pressable
        style={styles.segment}
        onPress={() => onChange('chrysostom')}
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'chrysostom' }}
        {...hoverAccessibilityProps(t('liturgy.worship.serviceChrysostom'), { role: 'button' })}
      >
        <Animated.Text style={[styles.segmentLabel, chrysostomStyle]} numberOfLines={1}>
          {t('liturgy.worship.serviceChrysostom')}
        </Animated.Text>
      </Pressable>
      <Pressable
        style={styles.segment}
        onPress={() => onChange('basil')}
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'basil' }}
        {...hoverAccessibilityProps(t('liturgy.worship.serviceBasil'), { role: 'button' })}
      >
        <Animated.Text style={[styles.segmentLabel, basilStyle]} numberOfLines={1}>
          {t('liturgy.worship.serviceBasil')}
        </Animated.Text>
      </Pressable>
      <Pressable
        style={styles.segment}
        onPress={() => onChange('vespers')}
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'vespers' }}
        {...hoverAccessibilityProps(t('liturgy.worship.serviceVespers'), { role: 'button' })}
      >
        <Animated.Text style={[styles.segmentLabel, vespersStyle]} numberOfLines={1}>
          {t('liturgy.worship.serviceVespers')}
        </Animated.Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    padding: TRACK_PADDING,
    position: 'relative',
    alignSelf: 'flex-start',
  },
  trackFullWidth: {
    alignSelf: 'stretch',
    width: '100%',
  },
  pill: {
    position: 'absolute',
    top: TRACK_PADDING,
    bottom: TRACK_PADDING,
    left: 0,
    borderRadius: 999,
    backgroundColor: colors.accentWine,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    zIndex: 1,
  },
  segmentLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
