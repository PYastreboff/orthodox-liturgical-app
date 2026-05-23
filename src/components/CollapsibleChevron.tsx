import { useEffect } from 'react';
import { StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const CHEVRON_TIMING = {
  duration: 280,
  easing: Easing.linear,
};

type Props = {
  expanded: boolean;
  color: string;
  size?: number;
  /** Touch target / centering box (defaults to size + 10). */
  boxSize?: number;
  style?: StyleProp<ViewStyle>;
};

/** ▾ rotated: right (collapsed) → down (expanded). */
export function CollapsibleChevron({ expanded, color, size = 24, boxSize, style }: Props) {
  const box = boxSize ?? size + 10;
  const progress = useSharedValue(expanded ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(expanded ? 1 : 0, CHEVRON_TIMING);
  }, [expanded, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(progress.value, [0, 1], [-90, 0])}deg` }],
  }));

  return (
    <Animated.View style={[styles.wrap, { width: box, height: box }, style, animatedStyle]}>
      <Text style={[styles.glyph, { color, fontSize: size, lineHeight: size }]}>▾</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    fontWeight: '700',
    textAlign: 'center',
  },
});
