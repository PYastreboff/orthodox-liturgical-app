import { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { hoverAccessibilityProps } from '../lib/a11y/hoverAccessible';
import { useAppTranslation } from '../i18n/useAppTranslation';
import type { ClergyRole } from '../types/liturgical';
import {
  SERVING_ROLE_ICON_NAMES,
  SERVING_ROLE_IDS,
  SERVING_ROLE_LABEL_KEYS,
} from '../lib/liturgical/servingRoles';
import { colors } from '../theme/tokens';
import { SEGMENTED_PICKER_HORIZONTAL_INSET } from './settings/SegmentedPicker';

const MENU_ITEM_HOVER_BG = 'rgba(139,46,60,0.14)';
const MENU_ITEM_PRESSED_BG = 'rgba(139,46,60,0.22)';

type Props = {
  value: ClergyRole;
  onChange: (value: ClergyRole) => void;
  isDark: boolean;
};

/** Serving-role dropdown for Settings — overlays content instead of expanding the card. */
export function ServingRolePicker({ value, onChange, isDark }: Props) {
  const { t } = useAppTranslation();
  const [open, setOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<ClergyRole | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<View>(null);

  const surfaceBg = isDark ? '#2a2724' : '#ebe6de';
  const textColor = isDark ? '#e8e3dd' : '#2b2623';
  const mutedColor = isDark ? '#a39e98' : colors.muted;
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(43,38,35,0.12)';
  const selectedLabel = t(SERVING_ROLE_LABEL_KEYS[value]);

  const closeMenu = () => {
    setOpen(false);
    setHoveredId(null);
  };

  const openMenu = () => {
    triggerRef.current?.measureInWindow((x, y, w, h) => {
      setMenuPos({ top: y + h + 4, left: x, width: w });
      setOpen(true);
    });
  };

  return (
    <View style={styles.wrap}>
      <View ref={triggerRef} collapsable={false}>
        <Pressable
          style={[styles.trigger, { backgroundColor: surfaceBg, borderColor }]}
          onPress={() => {
            if (open) closeMenu();
            else openMenu();
          }}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          accessibilityLabel={t('settings.servingRole')}
          {...hoverAccessibilityProps(t('settings.servingRole'), { role: 'button' })}
        >
          <MaterialCommunityIcons name={SERVING_ROLE_ICON_NAMES[value]} size={18} color={textColor} />
          <Text style={[styles.triggerLabel, { color: textColor }]} numberOfLines={1}>
            {selectedLabel}
          </Text>
          <View style={styles.chevronWrap}>
            <Feather name={open ? 'chevron-up' : 'chevron-down'} size={16} color={mutedColor} />
          </View>
        </Pressable>
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={closeMenu}>
        <View style={styles.menuRoot} pointerEvents="box-none">
          <Pressable
            style={styles.menuBackdrop}
            onPress={closeMenu}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
          <View
            style={[
              styles.menu,
              {
                top: menuPos.top,
                left: menuPos.left,
                width: menuPos.width,
                backgroundColor: surfaceBg,
                borderColor,
              },
            ]}
          >
            {SERVING_ROLE_IDS.map((id) => {
              const selected = value === id;
              const hovered = hoveredId === id;
              const label = t(SERVING_ROLE_LABEL_KEYS[id]);
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
                    closeMenu();
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  {...hoverAccessibilityProps(label, { role: 'button' })}
                >
                  <MaterialCommunityIcons
                    name={SERVING_ROLE_ICON_NAMES[id]}
                    size={18}
                    color={selected ? '#fff' : textColor}
                  />
                  <Text style={[styles.menuItemLabel, { color: selected ? '#fff' : textColor }]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: SEGMENTED_PICKER_HORIZONTAL_INSET,
    marginVertical: 12,
    alignSelf: 'stretch',
  },
  trigger: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    paddingLeft: 12,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  triggerLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    fontWeight: '600',
  },
  chevronWrap: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  menuRoot: {
    flex: 1,
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  menu: {
    position: 'absolute',
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  menuItemLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
});
