import { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import { useAppTranslation } from '../i18n/useAppTranslation';
import type { BibleTextLang } from '../lib/bible/bibleTranslation';
import { colors } from '../theme/tokens';

const TIMING = { duration: 200, easing: Easing.bezier(0.42, 0, 0.58, 1) };
const TRACK_PADDING = 2;
const SEGMENTS = 3;

type Props = {
  value: BibleTextLang;
  onChange: (value: BibleTextLang) => void;
  isDark: boolean;
};

function selectedIndexFor(value: BibleTextLang): number {
  if (value === 'en') return 0;
  if (value === 'el') return 1;
  return 2;
}

export function BibleTranslationToggle({ value, onChange, isDark }: Props) {
  const { t } = useAppTranslation();
  const trackBg = isDark ? '#2a2724' : '#ebe6de';
  const inactiveText = isDark ? '#a39e98' : colors.muted;
  const selectedIndex = selectedIndexFor(value);
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

  const enStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      Math.max(0, 1 - Math.min(1, Math.abs(progress.value - 0) * 1.4)),
      [0, 1],
      [inactiveText, '#ffffff'],
    ),
  }));

  const elStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      Math.max(0, 1 - Math.min(1, Math.abs(progress.value - 1) * 1.4)),
      [0, 1],
      [inactiveText, '#ffffff'],
    ),
  }));

  const chuStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      Math.max(0, 1 - Math.min(1, Math.abs(progress.value - 2) * 1.4)),
      [0, 1],
      [inactiveText, '#ffffff'],
    ),
  }));

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
        {...hoverAccessibilityProps(t('bible.langEnglish'), { role: 'button' })}
      >
        <Animated.Text style={[styles.segmentLabel, enStyle]}>EN</Animated.Text>
      </Pressable>

      <Pressable
        style={styles.segment}
        onPress={() => onChange('el')}
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'el' }}
        {...hoverAccessibilityProps(t('bible.langGreek'), { role: 'button' })}
      >
        <Animated.Text style={[styles.segmentLabel, elStyle]}>ΕΛ</Animated.Text>
      </Pressable>

      <Pressable
        style={styles.segment}
        onPress={() => onChange('chu')}
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'chu' }}
        {...hoverAccessibilityProps(t('bible.langSlavonic'), { role: 'button' })}
      >
        <Animated.Text style={[styles.segmentLabel, chuStyle]}>ЧС</Animated.Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: TRACK_PADDING,
    position: 'relative',
    minWidth: 132,
    height: 32,
    alignSelf: 'flex-start',
  },
  pill: {
    position: 'absolute',
    top: TRACK_PADDING,
    bottom: TRACK_PADDING,
    left: 0,
    borderRadius: 8,
    backgroundColor: colors.accentWine,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    minWidth: 36,
  },
  segmentLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
