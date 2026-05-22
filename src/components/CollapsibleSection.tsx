import { useEffect, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

/** Single easing curve for expand/collapse — smooth, even motion start to finish. */
const COLLAPSE_TIMING = {
  duration: 380,
  easing: Easing.bezier(0.42, 0, 0.58, 1),
};

type Props = {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
  themeColors: { card: string; border: string; text: string };
};

export function CollapsibleSection({ title, expanded, onToggle, children, themeColors }: Props) {
  const progress = useSharedValue(expanded ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(expanded ? 1 : 0, COLLAPSE_TIMING);
  }, [expanded, progress]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(progress.value, [0, 1], [0, 180])}deg`,
      },
    ],
  }));

  const bodyStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    maxHeight: interpolate(progress.value, [0, 1], [0, 2000]),
    marginTop: interpolate(progress.value, [0, 1], [0, 8]),
  }));

  return (
    <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
      <Pressable style={styles.sectionHeaderRow} onPress={onToggle}>
        <Text style={[styles.cardLabel, { color: themeColors.text }]}>{title}</Text>
        <Animated.View style={[styles.sectionChevronWrap, chevronStyle]}>
          <Text style={[styles.sectionChevron, { color: themeColors.text }]}>▾</Text>
        </Animated.View>
      </Pressable>
      <Animated.View style={[styles.sectionBody, bodyStyle]} pointerEvents={expanded ? 'auto' : 'none'}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
    paddingVertical: 4,
  },
  sectionChevronWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionChevron: {
    fontSize: 24,
    fontWeight: '700',
  },
  sectionBody: {
    overflow: 'hidden',
  },
  cardLabel: {
    fontSize: 20,
    letterSpacing: 0.2,
    fontWeight: '700',
  },
});
