import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import { radii } from '../theme/tokens';

export type StickySection = {
  id: string;
  label: string;
};

type Props = {
  sections: readonly StickySection[];
  activeId: string | null;
  onSelect: (id: string) => void;
  isDark: boolean;
  accentColor: string;
  accentSoft: string;
};

/** Horizontal chip bar for jumping between long-form devotional sections. */
export function StickySectionPicker({
  sections,
  activeId,
  onSelect,
  isDark,
  accentColor,
  accentSoft,
}: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const chipLayouts = useRef<Record<string, { x: number; width: number }>>({});

  useEffect(() => {
    if (!activeId) return;
    const layout = chipLayouts.current[activeId];
    if (!layout) return;
    scrollRef.current?.scrollTo({
      x: Math.max(0, layout.x - 24),
      animated: true,
    });
  }, [activeId]);

  if (!sections.length) return null;

  const idleBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(43,38,35,0.05)';
  const idleText = isDark ? '#b8b2ab' : '#6b6560';

  return (
    <View style={styles.wrap}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.track}
      >
        {sections.map((section) => {
          const selected = section.id === activeId;
          return (
            <Pressable
              key={section.id}
              onPress={() => onSelect(section.id)}
              onLayout={(event) => {
                const { x, width } = event.nativeEvent.layout;
                chipLayouts.current[section.id] = { x, width };
              }}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: selected ? accentSoft : idleBg,
                  borderColor: selected ? accentColor : 'transparent',
                  opacity: pressed ? 0.82 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              {...hoverAccessibilityProps(section.label, { role: 'button' })}
            >
              <Text
                style={[
                  styles.chipLabel,
                  { color: selected ? accentColor : idleText },
                ]}
                numberOfLines={1}
              >
                {section.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: -4,
  },
  track: {
    gap: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  chip: {
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxWidth: 168,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.15,
  },
});
