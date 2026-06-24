import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import { useAppTranslation } from '../i18n/useAppTranslation';
import {
  LITURGICAL_TEXT_SECTION_ORDER,
  type LiturgicalTextCategory,
} from '../lib/liturgical/liturgicalTexts';
import { colors } from '../theme/tokens';

export type LiturgicalTextCategoryFilter = LiturgicalTextCategory | 'all';

type Props = {
  value: LiturgicalTextCategoryFilter;
  onChange: (value: LiturgicalTextCategoryFilter) => void;
  availableCategories: LiturgicalTextCategory[];
  isDark: boolean;
};

const A11Y_KEYS: Record<LiturgicalTextCategory, string> = {
  troparion: 'readings.troparion',
  kontakion: 'readings.kontakion',
  prokeimenon: 'readings.prokeimenon',
  alleluia: 'readings.alleluia',
  epistle: 'readings.epistle',
  gospel: 'readings.gospel',
  communion: 'readings.communion',
};

const SHORT_LABEL_KEYS: Record<LiturgicalTextCategory, string> = {
  troparion: 'readings.troparion',
  kontakion: 'readings.kontakion',
  prokeimenon: 'readings.prokeimenon',
  alleluia: 'readings.alleluia',
  epistle: 'readings.epistle',
  gospel: 'readings.gospel',
  communion: 'readings.communion',
};

function orderedCategories(available: LiturgicalTextCategory[]): LiturgicalTextCategory[] {
  const set = new Set(available);
  return LITURGICAL_TEXT_SECTION_ORDER.filter((id) => set.has(id));
}

export function LiturgicalTextsCategoryToggle({
  value,
  onChange,
  availableCategories,
  isDark,
}: Props) {
  const { t } = useAppTranslation();
  const [open, setOpen] = useState(false);
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
  const selectedLabel =
    value === 'all'
      ? t('readings.filterAll')
      : t(SHORT_LABEL_KEYS[value]);

  if (categories.length <= 1) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <Pressable
        style={[
          styles.trigger,
          { backgroundColor: surfaceBg, borderColor },
          open ? styles.triggerOpen : null,
        ]}
        onPress={() => setOpen((prev) => !prev)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        {...hoverAccessibilityProps(t('readings.toggleCategory'), { role: 'button' })}
      >
        <Text style={[styles.triggerLabel, { color: textColor }]} numberOfLines={1}>
          {selectedLabel}
        </Text>
        <Feather
          name={open ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={mutedColor}
          style={styles.chevron}
        />
      </Pressable>

      {open ? (
        <View style={[styles.menu, { backgroundColor: surfaceBg, borderColor }]}>
          {categoryIds.map((id) => {
            const selected = value === id;
            const optionLabel = id === 'all' ? t('readings.filterAll') : t(SHORT_LABEL_KEYS[id]);
            const a11yLabel = id === 'all' ? t('readings.filterAll') : t(A11Y_KEYS[id]);
            return (
              <Pressable
                key={id}
                style={({ hovered, pressed }) => [
                  styles.menuItem,
                  selected ? styles.menuItemSelected : null,
                  !selected && hovered ? styles.menuItemHover : null,
                  !selected && pressed ? styles.menuItemPressed : null,
                ]}
                onPress={() => {
                  onChange(id);
                  setOpen(false);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                {...hoverAccessibilityProps(a11yLabel, { role: 'button' })}
              >
                <Text style={[styles.menuItemLabel, { color: selected ? '#ffffff' : textColor }]}>
                  {optionLabel}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    minWidth: 108,
    maxWidth: 132,
    position: 'relative',
    zIndex: 999,
  },
  trigger: {
    height: 28,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
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
  chevron: {
    lineHeight: 12,
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
    zIndex: 2000,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
  },
  menuItem: {
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  menuItemSelected: {
    backgroundColor: colors.accentWine,
  },
  menuItemHover: {
    backgroundColor: 'rgba(139,46,60,0.12)',
  },
  menuItemPressed: {
    backgroundColor: 'rgba(139,46,60,0.18)',
  },
  menuItemLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
