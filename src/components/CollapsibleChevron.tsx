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
  style?: StyleProp<ViewStyle>;
};

/** ▾ rotated: right (collapsed) → down (expanded). */
export function CollapsibleChevron({ expanded, color, size = 24, style }: Props) {
  const progress = useSharedValue(expanded ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(expanded ? 1 : 0, CHEVRON_TIMING);
  }, [expanded, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(progress.value, [0, 1], [-90, 0])}deg` }],
  }));

  return (
    <Animated.View style={[styles.wrap, style, animatedStyle]}>
      <Text style={[styles.glyph, { color, fontSize: size, lineHeight: size + 2 }]}>▾</Text>
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
