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

/** Placeholder cards under the hero while Orthocal day data loads. */
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

  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.55)';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(43,38,35,0.1)';

  return (
    <Animated.View style={[styles.root, pulse]} accessibilityLabel={t('a11y.loading')}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
          <SkeletonBlock height={14} width="42%" isDark={isDark} />
          <SkeletonBlock height={12} width="88%" isDark={isDark} style={styles.gap} />
          <SkeletonBlock height={12} width="70%" isDark={isDark} style={styles.gap} />
          {i === 0 ? (
            <SkeletonBlock height={12} width="55%" isDark={isDark} style={styles.gap} />
          ) : null}
        </View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 10,
    marginBottom: 8,
    marginTop: 2,
  },
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 0,
  },
  block: {
    borderRadius: 6,
  },
  gap: {
    marginTop: 10,
  },
});
