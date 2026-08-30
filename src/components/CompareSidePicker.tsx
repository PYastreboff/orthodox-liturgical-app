import { Feather } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { HoverPressable } from './HoverPressable';
import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import { useLayoutSafeAreaInsets } from '../hooks/useLayoutSafeAreaInsets';
import { useAppTranslation } from '../i18n/useAppTranslation';
import { segmentedControlTheme } from '../lib/ui/segmentedControlTheme';
import { colors } from '../theme/tokens';
import { SCREEN_BOTTOM_CONTENT_MARGIN } from '../theme/layout';

export type CompareSideOption<T extends string> = {
  value: T;
  label: string;
};

type Side = 'left' | 'right';

type Props<T extends string> = {
  left: T | null;
  right: T | null;
  onChangeLeft: (value: T) => void;
  onChangeRight: (value: T) => void;
  options: CompareSideOption<T>[];
  isDark: boolean;
  /** Expand slots to fill remaining viewport space (side-by-side setup). */
  fill?: boolean;
  /**
   * How fill height is resolved: `flex` fills a flex parent (use with bottom padding on the parent);
   * `measure` sizes from window coordinates (scroll views).
   */
  fillLayout?: 'flex' | 'measure';
  /** Extra space to reserve below the picker (tab bar, scroll padding, etc.). */
  bottomInset?: number;
};

function CompareSlot<T extends string>({
  side,
  value,
  options,
  onChange,
  isDark,
  open,
  onOpen,
  onClose,
  fill,
  inline,
}: {
  side: Side;
  value: T | null;
  options: CompareSideOption<T>[];
  onChange: (value: T) => void;
  isDark: boolean;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  fill?: boolean;
  inline?: boolean;
}) {
  const { t } = useAppTranslation();
  const theme = segmentedControlTheme(isDark);
  const selectedLabel = options.find((option) => option.value === value)?.label;
  const slotBorder = value
    ? theme.chipIdleBorder
    : isDark
      ? 'rgba(255,255,255,0.16)'
      : 'rgba(43,38,35,0.18)';
  const slotBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(43,38,35,0.03)';
  const sideLabel =
    side === 'left' ? t('readings.compareColumnLeft') : t('readings.compareColumnRight');

  return (
    <View
      style={[
        styles.slotWrap,
        fill ? styles.slotWrapFill : null,
        inline ? styles.slotWrapInline : null,
        open ? styles.slotWrapOpen : null,
      ]}
    >
      <HoverPressable
        isDark={isDark}
        baseBackground={slotBg}
        style={[
          styles.slot,
          fill ? styles.slotFill : null,
          inline ? styles.slotInline : null,
          {
            borderColor: slotBorder,
            borderStyle: value ? 'solid' : 'dashed',
          },
          open ? styles.slotOpen : null,
        ]}
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={
          value
            ? `${sideLabel}: ${selectedLabel}`
            : t('readings.compareSelectLanguage')
        }
        {...hoverAccessibilityProps(
          value ? `${sideLabel}: ${selectedLabel}` : t('readings.compareSelectLanguage'),
          { role: 'button' },
        )}
      >
        {value ? (
          <>
            <Text
              style={[
                styles.slotLabel,
                fill ? styles.slotLabelFill : null,
                inline ? styles.slotLabelInline : null,
                { color: theme.chipIdleFg },
              ]}
              numberOfLines={inline ? 1 : 3}
              adjustsFontSizeToFit={inline}
              minimumFontScale={0.75}
            >
              {selectedLabel}
            </Text>
            {inline ? (
              <Feather name="chevron-down" size={14} color={theme.inactiveText} />
            ) : null}
          </>
        ) : (
          <Feather name="plus" size={fill ? 32 : 22} color={theme.inactiveText} />
        )}
      </HoverPressable>

      {open ? (
        <View style={inline ? styles.slotMenuLayerInline : styles.slotMenuLayer}>
          {!inline ? (
            <Pressable
              style={[
                styles.slotMenuBackdrop,
                { backgroundColor: isDark ? 'rgba(0,0,0,0.35)' : 'rgba(43,38,35,0.12)' },
              ]}
              onPress={onClose}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            />
          ) : null}
          <View
            style={[
              styles.menu,
              inline ? styles.menuInline : null,
              {
                backgroundColor: isDark ? colors.darkSurface : colors.card,
                borderColor: theme.chipIdleBorder,
              },
            ]}
          >
            {options.map((option, index) => {
              const selected = value === option.value;
              const isFirst = index === 0;
              const isLast = index === options.length - 1;
              return (
                <HoverPressable
                  key={option.value}
                  isDark={isDark}
                  selected={selected}
                  selectedColor={theme.chipSelectedBg}
                  baseBackground="transparent"
                  style={[
                    styles.menuItem,
                    isFirst ? styles.menuItemFirst : null,
                    isLast ? styles.menuItemLast : null,
                  ]}
                  onPress={() => {
                    onChange(option.value);
                    onClose();
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  {...hoverAccessibilityProps(option.label, { role: 'button' })}
                >
                  <Text
                    style={[
                      styles.menuItemLabel,
                      {
                        color: selected ? theme.chipSelectedFg : theme.chipIdleFg,
                        fontWeight: selected ? '700' : '600',
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </HoverPressable>
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const FILL_BOTTOM_MARGIN = SCREEN_BOTTOM_CONTENT_MARGIN;

export function CompareSidePicker<T extends string>({
  left,
  right,
  onChangeLeft,
  onChangeRight,
  options,
  isDark,
  fill = false,
  fillLayout = 'measure',
  bottomInset,
}: Props<T>) {
  const { height: windowHeight } = useWindowDimensions();
  const insets = useLayoutSafeAreaInsets();
  const theme = segmentedControlTheme(isDark);
  const [openSide, setOpenSide] = useState<Side | null>(null);
  const [fillHeight, setFillHeight] = useState<number | null>(null);
  const wrapRef = useRef<View>(null);
  const measureFill = fill && fillLayout === 'measure';
  const bottomPad = bottomInset ?? insets.bottom + FILL_BOTTOM_MARGIN;
  const inline = !fill && left != null && right != null;

  const remeasureFill = useCallback(() => {
    if (!measureFill) return;
    wrapRef.current?.measureInWindow((_x, y) => {
      setFillHeight(Math.max(220, Math.floor(windowHeight - y - bottomPad)));
    });
  }, [bottomPad, measureFill, windowHeight]);

  useEffect(() => {
    remeasureFill();
  }, [remeasureFill]);

  useEffect(() => {
    if (!measureFill) setFillHeight(null);
  }, [measureFill]);

  return (
    <View
      ref={wrapRef}
      onLayout={remeasureFill}
      style={[
        styles.wrap,
        fill ? styles.wrapFill : null,
        inline ? styles.wrapInline : null,
        measureFill && fillHeight ? { height: fillHeight, minHeight: fillHeight } : null,
        openSide ? styles.wrapOpen : null,
      ]}
    >
      <View style={[styles.row, fill ? styles.rowFill : null, inline ? styles.rowInline : null]}>
        <CompareSlot
          side="left"
          value={left}
          options={options}
          onChange={onChangeLeft}
          isDark={isDark}
          fill={fill}
          inline={inline}
          open={openSide === 'left'}
          onOpen={() => setOpenSide((prev) => (prev === 'left' ? null : 'left'))}
          onClose={() => setOpenSide(null)}
        />
        <View
          style={[
            styles.divider,
            inline ? styles.dividerInline : null,
            { backgroundColor: theme.inactiveText },
          ]}
        />
        <CompareSlot
          side="right"
          value={right}
          options={options}
          onChange={onChangeRight}
          isDark={isDark}
          fill={fill}
          inline={inline}
          open={openSide === 'right'}
          onOpen={() => setOpenSide((prev) => (prev === 'right' ? null : 'right'))}
          onClose={() => setOpenSide(null)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
  wrapFill: {
    flex: 1,
    flexGrow: 1,
    minHeight: 0,
  },
  wrapInline: {
    zIndex: 1,
  },
  wrapOpen: {
    zIndex: 2000,
    elevation: 2000,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
    minHeight: 108,
  },
  rowFill: {
    flex: 1,
    minHeight: 0,
  },
  rowInline: {
    minHeight: 0,
    alignItems: 'center',
  },
  slotWrap: {
    flex: 1,
    minWidth: 0,
    position: 'relative',
  },
  slotWrapFill: {
    minHeight: 0,
    alignSelf: 'stretch',
  },
  slotWrapInline: {
    alignSelf: 'auto',
  },
  slotWrapOpen: {
    zIndex: 3,
  },
  slot: {
    flex: 1,
    minHeight: 108,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth * 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  slotFill: {
    minHeight: 0,
    height: '100%',
  },
  slotInline: {
    flex: 1,
    minHeight: 0,
    height: 36,
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 0,
    paddingHorizontal: 12,
  },
  slotOpen: {
    borderColor: colors.accentWine,
    borderStyle: 'solid',
  },
  slotLabel: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  slotLabelFill: {
    fontSize: 14,
    lineHeight: 19,
    paddingHorizontal: 4,
  },
  slotLabelInline: {
    fontSize: 13,
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    opacity: 0.35,
  },
  dividerInline: {
    alignSelf: 'center',
    height: 20,
  },
  slotMenuLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    zIndex: 2,
  },
  slotMenuLayerInline: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    zIndex: 4,
  },
  slotMenuBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  menu: {
    minWidth: 140,
    width: '100%',
    maxWidth: 260,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 3,
  },
  menuInline: {
    maxWidth: '100%',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  menuItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
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
    fontSize: 14,
    textAlign: 'center',
  },
});
