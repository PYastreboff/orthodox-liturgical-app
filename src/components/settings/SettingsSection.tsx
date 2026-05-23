import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewProps } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { CollapsibleChevron } from '../CollapsibleChevron';
import { colors } from '../../theme/tokens';

const COLLAPSE_TIMING = {
  duration: 380,
  easing: Easing.bezier(0.42, 0, 0.58, 1),
};

type Props = ViewProps & {
  title: string;
  description?: string;
  children: ReactNode;
  isDark: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
};

export function SettingsSection({
  title,
  description,
  children,
  isDark,
  collapsible = false,
  defaultExpanded = true,
  style,
  ...rest
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const progress = useSharedValue(defaultExpanded ? 1 : 0);
  const cardBg = isDark ? colors.darkSurface : colors.card;
  const border = isDark ? colors.darkBorder : colors.border;
  const titleColor = isDark ? colors.darkInk : colors.ink;
  const descColor = isDark ? '#a39e98' : colors.muted;

  useEffect(() => {
    progress.value = withTiming(expanded ? 1 : 0, COLLAPSE_TIMING);
  }, [expanded, progress]);

  const bodyStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    maxHeight: interpolate(progress.value, [0, 1], [0, 400]),
    marginTop: interpolate(progress.value, [0, 1], [0, 0]),
  }));

  const header = (
    <Pressable
      onPress={collapsible ? () => setExpanded((prev) => !prev) : undefined}
      disabled={!collapsible}
      accessibilityRole={collapsible ? 'button' : undefined}
      accessibilityState={collapsible ? { expanded } : undefined}
      style={styles.headerPressable}
    >
      <View style={styles.headingRow}>
        <Text style={[styles.heading, styles.headingInRow, { color: titleColor }]}>{title}</Text>
        {collapsible ? (
          <CollapsibleChevron expanded={expanded} color={titleColor} size={22} />
        ) : null}
      </View>
      {description && (!collapsible || expanded) ? (
        <Text style={[styles.description, { color: descColor }]}>{description}</Text>
      ) : null}
    </Pressable>
  );

  if (!collapsible) {
    return (
      <View style={[styles.wrap, style]} {...rest}>
        <Text style={[styles.heading, { color: titleColor }]}>{title}</Text>
        {description ? (
          <Text style={[styles.description, { color: descColor }]}>{description}</Text>
        ) : null}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>{children}</View>
      </View>
    );
  }

  return (
    <View style={[styles.wrap, style]} {...rest}>
      {header}
      <Animated.View
        style={[bodyStyle, styles.card, { backgroundColor: cardBg, borderColor: border }]}
        pointerEvents={expanded ? 'auto' : 'none'}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 22,
  },
  headerPressable: {
    marginBottom: 0,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginBottom: 6,
  },
  heading: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  headingInRow: {
    marginBottom: 0,
    flex: 1,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
});
