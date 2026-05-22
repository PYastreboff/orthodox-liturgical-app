import { useEffect, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import { SectionTitleRow } from './SectionTitleRow';
import type { SectionIconName } from './SectionIcon';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

/** Linear expand/collapse — constant speed, no ease-in/out jerk. */
const COLLAPSE_TIMING = {
  duration: 280,
  easing: Easing.linear,
};

type Props = {
  title: string;
  icon: SectionIconName;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
  themeColors: { card: string; border: string; text: string };
  /** Shown in the section header (e.g. compact controls); does not trigger collapse. */
  headerTrailing?: ReactNode;
};

export function CollapsibleSection({
  title,
  icon,
  expanded,
  onToggle,
  children,
  themeColors,
  headerTrailing,
}: Props) {
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
    maxHeight: interpolate(progress.value, [0, 1], [0, 2000]),
    marginTop: interpolate(progress.value, [0, 1], [0, 8]),
    opacity: interpolate(progress.value, [0, 0.15, 1], [0, 1, 1]),
  }));

  return (
    <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
      <View style={styles.sectionHeaderRow}>
        <Pressable
          style={styles.sectionHeaderMain}
          onPress={onToggle}
          {...hoverAccessibilityProps(
            expanded ? `Collapse ${title}` : `Expand ${title}`,
            { role: 'button' },
          )}
          accessibilityState={{ expanded }}
        >
          <SectionTitleRow title={title} icon={icon} color={themeColors.text} />
        </Pressable>
        {headerTrailing ? <View style={styles.headerTrailing}>{headerTrailing}</View> : null}
        <Pressable
          style={styles.sectionChevronWrap}
          onPress={onToggle}
          {...hoverAccessibilityProps(expanded ? 'Collapse section' : 'Expand section', {
            role: 'button',
          })}
          accessibilityState={{ expanded }}
        >
          <Animated.View style={chevronStyle}>
            <Text style={[styles.sectionChevron, { color: themeColors.text }]}>▾</Text>
          </Animated.View>
        </Pressable>
      </View>
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
    alignItems: 'center',
    marginVertical: 4,
    paddingVertical: 4,
    gap: 6,
  },
  sectionHeaderMain: {
    flex: 1,
    minWidth: 0,
  },
  headerTrailing: {
    flexShrink: 0,
  },
  sectionChevronWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sectionChevron: {
    fontSize: 24,
    fontWeight: '700',
  },
  sectionBody: {
    overflow: 'hidden',
  },
});
