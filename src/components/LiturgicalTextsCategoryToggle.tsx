import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import { useAppTranslation } from '../i18n/useAppTranslation';
import {
  LITURGICAL_TEXT_SECTION_ORDER,
  type LiturgicalTextCategory,
  type LiturgicalTextCategoryFilter,
} from '../lib/liturgical/liturgicalTexts';
import { colors } from '../theme/tokens';

type Props = {
  value: LiturgicalTextCategoryFilter;
  onChange: (value: LiturgicalTextCategoryFilter) => void;
  availableCategories: LiturgicalTextCategory[];
  isDark: boolean;
  onOpenChange?: (open: boolean) => void;
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

const MENU_MAX_HEIGHT = 280;
/** Padding + chevron slot (px) beyond label text width at 12px bold. */
const TRIGGER_CHROME_WIDTH = 34;
const MENU_ITEM_HOVER_BG = 'rgba(139,46,60,0.14)';
const MENU_ITEM_PRESSED_BG = 'rgba(139,46,60,0.22)';

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
}: Props) {
  const { t } = useAppTranslation();
  const [open, setOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<LiturgicalTextCategoryFilter | null>(null);

  useEffect(() => {
    onOpenChange?.(open);
  }, [onOpenChange, open]);

  useEffect(() => () => onOpenChange?.(false), [onOpenChange]);
  const surfaceBg = isDark ? '#2a2724' : '#ebe6de';
  const textColor = isDark ? '#e8e3dd' : '#2b2623';
  const mutedColor = isDark ? '#a39e98' : colors.muted;
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(43,38,35,0.12)';
  const categories = useMemo(
    () => orderedCategories(availableCategories),
    [availableCategories],
  );
  const categoryIds = useMemo(
    (): LiturgicalTextCategoryFilter[] => ['all', ...categories],
    [categories],
  );
  const controlWidth = useMemo(() => {
    const labels = categoryIds.map((id) => categoryLabel(id, t));
    const maxLen = Math.max(...labels.map((label) => label.length), 0);
    return Math.max(168, Math.ceil(maxLen * 8) + TRIGGER_CHROME_WIDTH);
  }, [categoryIds, t]);
  const selectedLabel = categoryLabel(value, t);

  if (categories.length <= 1) {
    return null;
  }

  return (
    <View
      style={[
        styles.wrap,
        open ? styles.wrapOpen : null,
        { width: controlWidth },
      ]}
    >
      <Pressable
        style={[
          styles.trigger,
          { backgroundColor: surfaceBg, borderColor },
          open ? styles.triggerOpen : null,
        ]}
        onPress={() => {
          setOpen((prev) => {
            if (prev) setHoveredId(null);
            return !prev;
          });
        }}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        {...hoverAccessibilityProps(t('readings.toggleCategory'), { role: 'button' })}
      >
        <Text style={[styles.triggerLabel, { color: textColor }]} numberOfLines={1}>
          {selectedLabel}
        </Text>
        <View style={styles.chevronWrap}>
          <Feather
            name={open ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={mutedColor}
          />
        </View>
      </Pressable>

      {open ? (
        <View style={[styles.menu, { backgroundColor: surfaceBg, borderColor }]}>
          <ScrollView
            style={[styles.menuScroll, { backgroundColor: surfaceBg }]}
            contentContainerStyle={[styles.menuScrollContent, { backgroundColor: surfaceBg }]}
            keyboardShouldPersistTaps="handled"
            bounces={false}
            nestedScrollEnabled
          >
            {categoryIds.map((id) => {
              const selected = value === id;
              const hovered = hoveredId === id;
              const optionLabel = categoryLabel(id, t);
              return (
                <Pressable
                  key={id}
                  style={({ pressed }) => [
                    styles.menuItem,
                    {
                      backgroundColor: selected
                        ? colors.accentWine
                        : pressed
                          ? MENU_ITEM_PRESSED_BG
                          : hovered
                            ? MENU_ITEM_HOVER_BG
                            : surfaceBg,
                    },
                  ]}
                  onHoverIn={() => setHoveredId(id)}
                  onHoverOut={() => setHoveredId(null)}
                  onPress={() => {
                    onChange(id);
                    setOpen(false);
                    setHoveredId(null);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  {...hoverAccessibilityProps(optionLabel, { role: 'button' })}
                >
                  <Text style={[styles.menuItemLabel, { color: selected ? '#ffffff' : textColor }]}>
                    {optionLabel}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    flexShrink: 0,
    zIndex: 1,
  },
  wrapOpen: {
    zIndex: 2000,
    elevation: 2000,
  },
  trigger: {
    height: 28,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    paddingLeft: 10,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  triggerOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  triggerLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  chevronWrap: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  menu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderWidth: StyleSheet.hairlineWidth,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    overflow: 'hidden',
    zIndex: 2001,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
  },
  menuScroll: {
    maxHeight: MENU_MAX_HEIGHT,
  },
  menuScrollContent: {
    flexGrow: 0,
  },
  menuItem: {
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  menuItemLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
