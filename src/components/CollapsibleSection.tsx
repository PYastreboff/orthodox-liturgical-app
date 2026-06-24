import { useEffect, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { SECTION_CARD_PADDING, SECTION_CARD_PADDING_PHONE } from '../theme/layout';
import { usePhoneLayout } from '../hooks/usePhoneLayout';
import { useAppTranslation } from '../i18n/useAppTranslation';
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

import { CollapsibleChevron } from './CollapsibleChevron';

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
  /** Raise above sibling sections (e.g. while a dropdown menu is open). */
  elevated?: boolean;
  /** Top of expandable body, left-aligned (e.g. readings category filter). */
  bodyTopLeading?: ReactNode;
  /** Top of expandable body, right-aligned (e.g. readings language toggle). */
  bodyTopTrailing?: ReactNode;
};

export function CollapsibleSection({
  title,
  icon,
  expanded,
  onToggle,
  children,
  themeColors,
  elevated = false,
  bodyTopLeading,
  bodyTopTrailing,
}: Props) {
  const { t } = useAppTranslation();
  const phoneLayout = usePhoneLayout();
  const cardPadding = phoneLayout ? SECTION_CARD_PADDING_PHONE : SECTION_CARD_PADDING;
  const progress = useSharedValue(expanded ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(expanded ? 1 : 0, COLLAPSE_TIMING);
  }, [expanded, progress]);

  const bodyStyle = useAnimatedStyle(() => ({
    maxHeight: interpolate(progress.value, [0, 1], [0, 50000]),
    marginTop: interpolate(progress.value, [0, 1], [0, 8]),
    opacity: interpolate(progress.value, [0, 0.08, 1], [0, 1, 1]),
  }));

  const headerRow = (
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
        <SectionTitleRow
          title={title}
          icon={icon}
          color={themeColors.text}
          titleLines={phoneLayout ? 3 : 2}
        />
      </Pressable>
      <Pressable
        style={styles.sectionChevronWrap}
        onPress={onToggle}
        {...hoverAccessibilityProps(
          expanded ? t('a11y.collapseSection') : t('a11y.expandSection'),
          { role: 'button' },
        )}
        accessibilityState={{ expanded }}
      >
        <CollapsibleChevron expanded={expanded} color={themeColors.text} size={24} />
      </Pressable>
    </View>
  );

  return (
    <View
      style={[
        styles.card,
        elevated ? styles.cardElevated : null,
        { backgroundColor: themeColors.card, borderColor: themeColors.border, padding: cardPadding },
      ]}
    >
      {headerRow}
      <Animated.View style={[styles.sectionBody, bodyStyle]} pointerEvents={expanded ? 'auto' : 'none'}>
        {bodyTopLeading || bodyTopTrailing ? (
          <View
            style={[
              styles.bodyTopRow,
              phoneLayout ? styles.bodyTopRowPhone : styles.bodyTopRowDesktop,
            ]}
          >
            {bodyTopLeading}
            {bodyTopTrailing}
          </View>
        ) : null}
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'visible',
  },
  cardElevated: {
    position: 'relative',
    zIndex: 1000,
    elevation: 1000,
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
  bodyTopRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    position: 'relative',
    zIndex: 20,
    overflow: 'visible',
  },
  bodyTopRowPhone: {
    justifyContent: 'space-between',
  },
  bodyTopRowDesktop: {
    justifyContent: 'flex-end',
  },
  sectionChevronWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sectionBody: {
    overflow: 'visible',
  },
});
