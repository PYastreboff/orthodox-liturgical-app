import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { HoverPressable } from './HoverPressable';
import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import { useAppTranslation } from '../i18n/useAppTranslation';
import {
  LITURGICAL_TEXT_SECTION_ORDER,
  type LiturgicalTextCategory,
  type LiturgicalTextCategoryFilter,
} from '../lib/liturgical/liturgicalTexts';
import {
  segmentedControlSizeStyle,
  segmentedControlTheme,
  chipStyle,
} from '../lib/ui/segmentedControlTheme';
import { colors } from '../theme/tokens';

type Props = {
  value: LiturgicalTextCategoryFilter;
  onChange: (value: LiturgicalTextCategoryFilter) => void;
  availableCategories: LiturgicalTextCategory[];
  isDark: boolean;
  onOpenChange?: (open: boolean) => void;
  fullWidth?: boolean;
};

const LABEL_KEYS: Record<LiturgicalTextCategory, string> = {
  troparion: 'readings.troparion',
  kontakion: 'readings.kontakion',
  prokeimenon: 'readings.prokeimenon',
  alleluia: 'readings.alleluia',
  epistle: 'readings.epistle',
  gospel: 'readings.gospel',
  communion: 'readings.communion',
};

const MENU_MAX_HEIGHT = 320;
const MENU_ITEM_PAD_V = 12;
const MENU_ITEM_MIN_HEIGHT = 44;
const CHEVRON_WIDTH = 16;
const TRIGGER_GAP = 4;
const MENU_GAP = 6;
const WIDTH_BUFFER = 6;

type MenuAnchor = {
  top: number;
  left: number;
  width: number;
};

function menuWidthForLabels(labelWidths: Record<string, number>): number | undefined {
  const widths = Object.values(labelWidths);
  if (!widths.length) return undefined;
  const maxLabel = Math.max(...widths);
  const { padH } = segmentedControlSizeStyle('regular');
  return Math.ceil(maxLabel + padH * 2 + WIDTH_BUFFER);
}

function triggerWidthForLabels(labelWidths: Record<string, number>): number | undefined {
  const menuWidth = menuWidthForLabels(labelWidths);
  if (!menuWidth) return undefined;
  const { padH } = segmentedControlSizeStyle('regular');
  return Math.ceil(menuWidth + CHEVRON_WIDTH + TRIGGER_GAP + padH * 2);
}

function categoryLabel(
  id: LiturgicalTextCategoryFilter,
  t: (key: string) => string,
): string {
  return id === 'all' ? t('readings.filterAll') : t(LABEL_KEYS[id]);
}

function orderedCategories(available: LiturgicalTextCategory[]): LiturgicalTextCategory[] {
  const set = new Set(available);
  return LITURGICAL_TEXT_SECTION_ORDER.filter((id) => set.has(id));
}

export function LiturgicalTextsCategoryToggle({
  value,
  onChange,
  availableCategories,
  isDark,
  onOpenChange,
  fullWidth = false,
}: Props) {
  const { t } = useAppTranslation();
  const [open, setOpen] = useState(false);
  const [labelWidths, setLabelWidths] = useState<Record<string, number>>({});
  const [anchor, setAnchor] = useState<MenuAnchor | null>(null);
  const triggerRef = useRef<View>(null);
  const theme = segmentedControlTheme(isDark);
  const labelType = segmentedControlSizeStyle('regular');

  useEffect(() => {
    onOpenChange?.(open);
  }, [onOpenChange, open]);

  useEffect(() => () => onOpenChange?.(false), [onOpenChange]);

  const categories = useMemo(
    () => orderedCategories(availableCategories),
    [availableCategories],
  );
  const categoryIds = useMemo(
    (): LiturgicalTextCategoryFilter[] => ['all', ...categories],
    [categories],
  );
  const selectedLabel = categoryLabel(value, t);
  const measuredMenuWidth = useMemo(() => menuWidthForLabels(labelWidths), [labelWidths]);
  const measuredTriggerWidth = useMemo(
    () => triggerWidthForLabels(labelWidths),
    [labelWidths],
  );

  const closeMenu = () => {
    setOpen(false);
    setAnchor(null);
  };

  const toggleMenu = () => {
    if (open) {
      closeMenu();
      return;
    }
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      const resolvedWidth = fullWidth
        ? width
        : Math.max(width, measuredTriggerWidth ?? width, measuredMenuWidth ?? width);
      setAnchor({
        left: x,
        top: y + height + MENU_GAP,
        width: resolvedWidth,
      });
      setOpen(true);
    });
  };

  if (categories.length <= 1) {
    return null;
  }

  const menuPanelWidth = anchor
    ? Math.max(anchor.width, measuredMenuWidth ?? anchor.width)
    : measuredMenuWidth;

  return (
    <>
      <View
        ref={triggerRef}
        style={[
          styles.wrap,
          fullWidth ? styles.wrapFullWidth : null,
          !fullWidth && measuredTriggerWidth ? { width: measuredTriggerWidth } : null,
        ]}
      >
        <View style={[styles.measureSizer, { pointerEvents: 'none' }]} accessibilityElementsHidden>
          {categoryIds.map((id) => (
            <Text
              key={id}
              style={[
                styles.measureLabel,
                { fontSize: labelType.fontSize, letterSpacing: labelType.letterSpacing },
              ]}
              onLayout={(event) => {
                const width = event.nativeEvent.layout.width;
                setLabelWidths((prev) =>
                  prev[id] === width ? prev : { ...prev, [id]: width },
                );
              }}
            >
              {categoryLabel(id, t)}
            </Text>
          ))}
        </View>
        <HoverPressable
          isDark={isDark}
          baseBackground={theme.chipIdleBg}
          style={[styles.trigger, chipStyle(theme, 'regular', false, { fullWidth })]}
          onPress={toggleMenu}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          {...hoverAccessibilityProps(t('readings.toggleCategory'), { role: 'button' })}
        >
          <Text
            style={[
              styles.triggerLabel,
              {
                color: theme.chipIdleFg,
                fontSize: labelType.fontSize,
                letterSpacing: labelType.letterSpacing,
              },
            ]}
            numberOfLines={1}
          >
            {selectedLabel}
          </Text>
          <View style={styles.chevronWrap}>
            <Feather
              name={open ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={theme.inactiveText}
            />
          </View>
        </HoverPressable>
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={closeMenu}>
        <Pressable style={styles.modalBackdrop} onPress={closeMenu} accessibilityElementsHidden />
        {anchor && menuPanelWidth ? (
          <View
            style={[
              styles.menu,
              {
                top: anchor.top,
                left: anchor.left,
                width: menuPanelWidth,
                backgroundColor: isDark ? colors.darkSurface : colors.card,
                borderColor: theme.chipIdleBorder,
              },
            ]}
          >
            <ScrollView
              style={styles.menuScroll}
              contentContainerStyle={styles.menuScrollContent}
              keyboardShouldPersistTaps="handled"
              bounces={false}
              nestedScrollEnabled
            >
              {categoryIds.map((id, index) => {
                const selected = value === id;
                const optionLabel = categoryLabel(id, t);
                const isFirst = index === 0;
                const isLast = index === categoryIds.length - 1;
                return (
                  <HoverPressable
                    key={id}
                    isDark={isDark}
                    selected={selected}
                    selectedColor={theme.chipSelectedBg}
                    baseBackground="transparent"
                    style={[
                      styles.menuItem,
                      { paddingHorizontal: labelType.padH, paddingVertical: MENU_ITEM_PAD_V },
                      isFirst ? styles.menuItemFirst : null,
                      isLast ? styles.menuItemLast : null,
                    ]}
                    onPress={() => {
                      onChange(id);
                      closeMenu();
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    {...hoverAccessibilityProps(optionLabel, { role: 'button' })}
                  >
                    <Text
                      style={[
                        styles.menuItemLabel,
                        {
                          color: selected ? theme.chipSelectedFg : theme.chipIdleFg,
                          fontSize: labelType.fontSize,
                          letterSpacing: labelType.letterSpacing,
                          fontWeight: selected ? '700' : '600',
                        },
                      ]}
                    >
                      {optionLabel}
                    </Text>
                  </HoverPressable>
                );
              })}
            </ScrollView>
          </View>
        ) : null}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexShrink: 0,
    alignSelf: 'flex-start',
  },
  measureSizer: {
    position: 'absolute',
    opacity: 0,
    left: 0,
    top: 0,
    pointerEvents: 'none',
  },
  measureLabel: {
    fontWeight: '700',
    alignSelf: 'flex-start',
  },
  wrapFullWidth: {
    width: '100%',
    alignSelf: 'stretch',
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: TRIGGER_GAP,
    minHeight: 36,
    width: '100%',
  },
  triggerLabel: {
    flex: 1,
    minWidth: 0,
    fontWeight: '700',
  },
  chevronWrap: {
    width: CHEVRON_WIDTH,
    height: CHEVRON_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  menu: {
    position: 'absolute',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    boxShadow: '0px 8px 16px rgba(0,0,0,0.14)',
  },
  menuScroll: {
    maxHeight: MENU_MAX_HEIGHT,
  },
  menuScrollContent: {
    flexGrow: 0,
  },
  menuItem: {
    alignSelf: 'stretch',
    borderRadius: 0,
    minHeight: MENU_ITEM_MIN_HEIGHT,
    justifyContent: 'center',
  },
  menuItemFirst: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  menuItemLast: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  menuItemLabel: {
    textAlign: 'left',
  },
});
