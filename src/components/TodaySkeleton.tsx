import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useAppTranslation } from '../i18n/useAppTranslation';
import { surfaceCard } from '../theme/cards';
import { radii } from '../theme/tokens';

type Props = {
  isDark: boolean;
};

function SkeletonBlock({
  height,
  width,
  isDark,
  style,
}: {
  height: number;
  width?: number | `${number}%`;
  isDark: boolean;
  style?: object;
}) {
  return (
    <View
      style={[
        styles.block,
        {
          height,
          width: width ?? '100%',
          backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(43,38,35,0.08)',
        },
        style,
      ]}
    />
  );
}

/** Placeholder for the gospel card and tile grid while Orthocal day data loads. */
export function TodaySkeleton({ isDark }: Props) {
  const { t } = useAppTranslation();
  const opacity = useSharedValue(0.55);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [opacity]);

  const pulse = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[styles.root, pulse]} accessibilityLabel={t('a11y.loading')}>
      <View
        style={[
          styles.gospelCard,
          surfaceCard(isDark, { radius: radii.xxl }),
        ]}
      >
        <View style={styles.gospelBody}>
          <SkeletonBlock height={12} width="38%" isDark={isDark} />
          <SkeletonBlock height={16} width="52%" isDark={isDark} style={styles.gapSm} />
          <SkeletonBlock height={14} width="100%" isDark={isDark} style={styles.gap} />
          <SkeletonBlock height={14} width="94%" isDark={isDark} style={styles.gapSm} />
          <SkeletonBlock height={14} width="78%" isDark={isDark} style={styles.gapSm} />
        </View>
      </View>

      <View style={styles.tileGrid}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.tile,
              surfaceCard(isDark, { radius: radii.lg }),
            ]}
          >
            <SkeletonBlock height={40} width={40} isDark={isDark} />
            <SkeletonBlock height={14} width="72%" isDark={isDark} style={styles.gap} />
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 18,
    marginTop: 16,
    marginBottom: 8,
  },
  gospelCard: {
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  gospelBody: {
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  tile: {
    width: '47.8%',
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 16,
    minHeight: 96,
    alignItems: 'center',
    gap: 8,
  },
  block: {
    borderRadius: 8,
  },
  gap: {
    marginTop: 12,
  },
  gapSm: {
    marginTop: 8,
  },
});
