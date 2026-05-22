import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

type Props = {
  index: number;
  progress: SharedValue<number>;
  size?: number;
  inactiveColor: string;
  renderIcon: (color: string) => React.ReactNode;
};

/** Cross-fades inactive → active icon colour as the segment pill slides. */
export function AnimatedSegmentIcon({
  index,
  progress,
  size = 18,
  inactiveColor,
  renderIcon,
}: Props) {
  const activeOpacity = useAnimatedStyle(() => {
    const distance = Math.abs(progress.value - index);
    const blend = Math.max(0, 1 - Math.min(1, distance * 1.4));
    return { opacity: blend };
  });

  const inactiveOpacity = useAnimatedStyle(() => {
    const distance = Math.abs(progress.value - index);
    const blend = Math.max(0, 1 - Math.min(1, distance * 1.4));
    return { opacity: 1 - blend };
  });

  return (
    <View style={[styles.stack, { width: size, height: size }]}>
      <Animated.View style={[styles.layer, inactiveOpacity]}>
        {renderIcon(inactiveColor)}
      </Animated.View>
      <Animated.View style={[styles.layer, activeOpacity]}>
        {renderIcon('#ffffff')}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    position: 'relative',
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
