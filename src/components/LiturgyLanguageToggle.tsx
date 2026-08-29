import { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import { useAppTranslation } from '../i18n/useAppTranslation';
import type { LiturgyDisplayMode, LiturgyTextLang } from '../lib/liturgy/liturgyViewMode';
import { colors } from '../theme/tokens';

const TIMING = { duration: 200, easing: Easing.bezier(0.42, 0, 0.58, 1) };
const TRACK_PADDING = 2;
const SEGMENTS = 4;

type Props = {
  mode: LiturgyDisplayMode;
  onChange: (mode: LiturgyDisplayMode) => void;
  isDark: boolean;
};

function selectedIndexFor(mode: LiturgyDisplayMode): number {
  if (mode.kind === 'compare') return 3;
  if (mode.lang === 'en') return 0;
  if (mode.lang === 'el') return 1;
  return 2;
}

export function LiturgyLanguageToggle({ mode, onChange, isDark }: Props) {
  const { t } = useAppTranslation();
  const trackBg = isDark ? '#2a2724' : '#ebe6de';
  const inactiveText = isDark ? '#a39e98' : colors.muted;
  const selectedIndex = selectedIndexFor(mode);
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
  const ruStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      Math.max(0, 1 - Math.min(1, Math.abs(progress.value - 2) * 1.4)),
      [0, 1],
      [inactiveText, '#ffffff'],
    ),
  }));

  const setSingle = (lang: LiturgyTextLang) => onChange({ kind: 'single', lang });
  const setCompare = () => onChange({ kind: 'compare', left: null, right: null });

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
        onPress={() => setSingle('en')}
        accessibilityRole="button"
        accessibilityState={{ selected: mode.kind === 'single' && mode.lang === 'en' }}
        {...hoverAccessibilityProps(t('liturgy.chrysostom.langEnglish'), { role: 'button' })}
      >
        <Animated.Text style={[styles.segmentLabel, enStyle]}>EN</Animated.Text>
      </Pressable>

      <Pressable
        style={styles.segment}
        onPress={() => setSingle('el')}
        accessibilityRole="button"
        accessibilityState={{ selected: mode.kind === 'single' && mode.lang === 'el' }}
        {...hoverAccessibilityProps(t('liturgy.chrysostom.langGreek'), { role: 'button' })}
      >
        <Animated.Text style={[styles.segmentLabel, elStyle]}>ΕΛ</Animated.Text>
      </Pressable>

      <Pressable
        style={styles.segment}
        onPress={() => setSingle('ru')}
        accessibilityRole="button"
        accessibilityState={{ selected: mode.kind === 'single' && mode.lang === 'ru' }}
        {...hoverAccessibilityProps(t('liturgy.chrysostom.langSlavonic'), { role: 'button' })}
      >
        <Animated.Text style={[styles.segmentLabel, ruStyle]}>ЧС</Animated.Text>
      </Pressable>

      <Pressable
        style={styles.segment}
        onPress={setCompare}
        accessibilityRole="button"
        accessibilityState={{ selected: mode.kind === 'compare' }}
        {...hoverAccessibilityProps(t('liturgy.chrysostom.langCompare'), { role: 'button' })}
      >
        <Feather
          name="columns"
          size={13}
          color={mode.kind === 'compare' ? '#ffffff' : inactiveText}
        />
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
    minWidth: 168,
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
    minWidth: 34,
  },
  segmentLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
