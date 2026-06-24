import { useEffect, useMemo, useState } from 'react';
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
import {
  LITURGICAL_TEXT_SECTION_ORDER,
  type LiturgicalTextCategory,
} from '../lib/liturgical/liturgicalTexts';
import { colors } from '../theme/tokens';

const TIMING = { duration: 200, easing: Easing.bezier(0.42, 0, 0.58, 1) };
const TRACK_PADDING = 2;

export type LiturgicalTextCategoryFilter = LiturgicalTextCategory | 'all';

type Props = {
  value: LiturgicalTextCategoryFilter;
  onChange: (value: LiturgicalTextCategoryFilter) => void;
  availableCategories: LiturgicalTextCategory[];
  isDark: boolean;
};

const A11Y_KEYS: Record<LiturgicalTextCategory, string> = {
  troparion: 'readings.troparion',
  kontakion: 'readings.kontakion',
  prokeimenon: 'readings.prokeimenon',
  alleluia: 'readings.alleluia',
  epistle: 'readings.epistle',
  gospel: 'readings.gospel',
  communion: 'readings.communion',
};

const SHORT_LABEL_KEYS: Record<LiturgicalTextCategory, string> = {
  troparion: 'readings.shortTroparion',
  kontakion: 'readings.shortKontakion',
  prokeimenon: 'readings.shortProkeimenon',
  alleluia: 'readings.shortAlleluia',
  epistle: 'readings.shortEpistle',
  gospel: 'readings.shortGospel',
  communion: 'readings.shortCommunion',
};

function orderedCategories(available: LiturgicalTextCategory[]): LiturgicalTextCategory[] {
  const set = new Set(available);
  return LITURGICAL_TEXT_SECTION_ORDER.filter((id) => set.has(id));
}

export function LiturgicalTextsCategoryToggle({
  value,
  onChange,
  availableCategories,
  isDark,
}: Props) {
  const { t } = useAppTranslation();
  const trackBg = isDark ? '#2a2724' : '#ebe6de';
  const inactiveText = isDark ? '#a39e98' : colors.muted;
  const categories = useMemo(
    () => orderedCategories(availableCategories),
    [availableCategories],
  );
  const segmentIds = useMemo(
    (): LiturgicalTextCategoryFilter[] => ['all', ...categories],
    [categories],
  );
  const selectedIndex = Math.max(0, segmentIds.indexOf(value));
  const progress = useSharedValue(selectedIndex);
  const [trackWidth, setTrackWidth] = useState(0);
  const segmentCount = segmentIds.length;

  const segmentWidth =
    trackWidth > 0 && segmentCount > 0
      ? (trackWidth - TRACK_PADDING * 2) / segmentCount
      : 0;

  useEffect(() => {
    progress.value = withTiming(selectedIndex, TIMING);
  }, [progress, selectedIndex]);

  const pillStyle = useAnimatedStyle(() => ({
    width: segmentWidth,
    transform: [{ translateX: TRACK_PADDING + progress.value * segmentWidth }],
  }));

  const allLabelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      Math.max(0, 1 - Math.min(1, Math.abs(progress.value - 0) * 1.4)),
      [0, 1],
      [inactiveText, '#ffffff'],
    ),
  }));

  if (categories.length <= 1) {
    return null;
  }

  return (
    <View
      style={[styles.track, { backgroundColor: trackBg }]}
      onLayout={(e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width)}
      accessibilityRole="tablist"
      accessibilityLabel={t('readings.toggleCategory')}
    >
      {segmentWidth > 0 ? (
        <Animated.View style={[styles.pill, pillStyle]} pointerEvents="none" />
      ) : null}

      <Pressable
        style={styles.segment}
        onPress={() => onChange('all')}
        accessibilityRole="tab"
        accessibilityState={{ selected: value === 'all' }}
        {...hoverAccessibilityProps(t('readings.filterAll'), { role: 'button' })}
      >
        <Animated.Text style={[styles.segmentLabel, allLabelStyle]}>
          {t('readings.filterAll')}
        </Animated.Text>
      </Pressable>

      {categories.map((category) => {
        const selected = value === category;
        const shortLabel = t(SHORT_LABEL_KEYS[category]);
        return (
          <Pressable
            key={category}
            style={styles.segment}
            onPress={() => onChange(category)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            {...hoverAccessibilityProps(t(A11Y_KEYS[category]), { role: 'button' })}
          >
            <Text
              style={[
                styles.segmentLabel,
                { color: selected ? '#ffffff' : inactiveText },
              ]}
            >
              {shortLabel}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: TRACK_PADDING,
    position: 'relative',
    height: 28,
    flexShrink: 1,
    maxWidth: '100%',
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
    minWidth: 28,
    paddingHorizontal: 2,
  },
  segmentLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
