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

function SectionGroupSkeleton({
  isDark,
  rowCount,
}: {
  isDark: boolean;
  rowCount: number;
}) {
  return (
    <View style={styles.sectionGroup}>
      <SkeletonBlock height={12} width="28%" isDark={isDark} style={styles.sectionHeader} />
      <View style={[styles.listCard, surfaceCard(isDark, { radius: radii.lg })]}>
        {Array.from({ length: rowCount }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.rowItem,
              index > 0 && {
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(43,38,35,0.08)',
              },
            ]}
          >
            <View style={styles.rowLeft}>
              <SkeletonBlock height={20} width={20} isDark={isDark} />
              <SkeletonBlock height={16} width="45%" isDark={isDark} />
            </View>
            <SkeletonBlock height={14} width={14} isDark={isDark} />
          </View>
        ))}
      </View>
    </View>
  );
}

/** Placeholder matching Gospel Card & Navigation List Sections. */
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
      {/* Gospel Card */}
      <View style={[styles.gospelCard, surfaceCard(isDark, { radius: radii.xxl })]}>
        {/* Card Header Row */}
        <View style={styles.gospelHeader}>
          <View style={styles.gospelHeaderLeft}>
            <SkeletonBlock height={40} width={40} isDark={isDark} style={{ borderRadius: 10 }} />
            <View style={styles.gospelHeaderText}>
              <SkeletonBlock height={11} width="60%" isDark={isDark} />
              <SkeletonBlock height={16} width="85%" isDark={isDark} style={{ marginTop: 4 }} />
            </View>
          </View>
          <SkeletonBlock height={28} width={28} isDark={isDark} style={{ borderRadius: 14 }} />
        </View>

        {/* Card Body */}
        <View style={styles.gospelBody}>
          <SkeletonBlock height={14} width="100%" isDark={isDark} />
          <SkeletonBlock height={14} width="96%" isDark={isDark} style={styles.gapSm} />
          <SkeletonBlock height={14} width="92%" isDark={isDark} style={styles.gapSm} />
          <SkeletonBlock height={14} width="88%" isDark={isDark} style={styles.gapSm} />
          <SkeletonBlock height={14} width="65%" isDark={isDark} style={styles.gapSm} />

          <SkeletonBlock height={12} width="20%" isDark={isDark} style={{ marginTop: 14 }} />
          <SkeletonBlock height={16} width="40%" isDark={isDark} style={{ marginTop: 14 }} />
        </View>
      </View>

      {/* List Sections */}
      <SectionGroupSkeleton isDark={isDark} rowCount={4} />
      <SectionGroupSkeleton isDark={isDark} rowCount={2} />
      <SectionGroupSkeleton isDark={isDark} rowCount={2} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 16,
    marginTop: 12,
    marginBottom: 12,
  },
  gospelCard: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    padding: 16,
  },
  gospelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  gospelHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  gospelHeaderText: {
    flex: 1,
  },
  gospelBody: {
    gap: 2,
  },
  sectionGroup: {
    gap: 8,
  },
  sectionHeader: {
    marginLeft: 4,
  },
  listCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  block: {
    borderRadius: 6,
  },
  gapSm: {
    marginTop: 6,
  },
});