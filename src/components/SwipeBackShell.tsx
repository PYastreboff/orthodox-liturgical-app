import { Platform, StyleSheet, View, type ViewProps } from 'react-native';
import Animated from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

import { useSwipeToBack } from '../hooks/useSwipeToBack';
import { useResolvedColorScheme } from '../theme/useResolvedColorScheme';

type Props = {
  onBack: () => void;
  children: React.ReactNode;
  /** Blur the screen underneath (Today day sections). */
  blurReveal?: boolean;
  /** Disable the left-edge swipe entirely (e.g. screens that dismiss downward). */
  edgeSwipeBack?: boolean;
  style?: ViewProps['style'];
};

/**
 * Left-edge interactive swipe-back — page follows the finger toward the back button side.
 */
export function SwipeBackShell({
  onBack,
  children,
  blurReveal = false,
  edgeSwipeBack = true,
  style,
}: Props) {
  const isDark = useResolvedColorScheme() === 'dark';
  const { panHandlers, animatedStyle, dimStyle } = useSwipeToBack(onBack);

  return (
    <View style={[styles.shell, style]}>
      {blurReveal ? (
        <Animated.View style={[styles.blurWrap, dimStyle, { pointerEvents: 'none' }]}>
          <BlurView
            intensity={Platform.OS === 'ios' ? 48 : 70}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
            {...(Platform.OS === 'android'
              ? ({ experimentalBlurMethod: 'dimezisBlurView' } as const)
              : null)}
          />
        </Animated.View>
      ) : null}
      <Animated.View
        style={[styles.page, edgeSwipeBack ? animatedStyle : null, style]}
        {...(edgeSwipeBack ? panHandlers : null)}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  blurWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  page: {
    flex: 1,
    // iOS/Fabric bug: boxShadow + overflow:hidden + transform (this Animated.View
    // is transformed during the swipe) clips/occludes child views on iOS — the back
    // button and header were being chopped. The edge shadow is cosmetic; drop it there.
    ...(Platform.OS === 'ios' ? null : { boxShadow: '-2px 0px 10px rgba(0,0,0,0.18)' }),
  },
});
