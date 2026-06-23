import type React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import type { FastingFoodKind } from '../i18n/fastingLabels';
import { translate } from '../i18n/translate';
import type { UiLanguage } from '../i18n/types';
import { useAppTranslation } from '../i18n/useAppTranslation';
import {
  FASTING_ALLOWANCE_ICON_SIZE,
  FASTING_OIL_ICON_VISUAL_SCALE,
  FASTING_WINE_ICON_VISUAL_SCALE,
} from './fastingAllowanceIcons';
import { HoverAccessible } from './HoverAccessible';
import { OilDropIcon } from './OilDropIcon';

const FOOD_ICON_META: Record<
  FastingFoodKind,
  {
    icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
    a11yKey: string;
  }
> = {
  all: { icon: 'food-variant', a11yKey: 'fasting.foodAll' },
  plant: { icon: 'leaf', a11yKey: 'fasting.foodPlant' },
  wine: { icon: 'fruit-grapes', a11yKey: 'fasting.foodWine' },
  oil: { icon: 'bottle-tonic-outline', a11yKey: 'fasting.foodOil' },
  fish: { icon: 'fish', a11yKey: 'fasting.foodFish' },
  dairy: { icon: 'cheese', a11yKey: 'fasting.foodDairy' },
  eggs: { icon: 'egg-outline', a11yKey: 'fasting.foodEggs' },
  meat: { icon: 'food-drumstick-outline', a11yKey: 'fasting.foodMeat' },
};

type Props = {
  kind: FastingFoodKind;
  color: string;
  size?: number;
  /** Calendar / hero tooltips — "Fish allowed" instead of the food-list noun. */
  allowedLabel?: boolean;
};

function iconA11yKey(kind: FastingFoodKind, allowedLabel: boolean): string {
  if (allowedLabel && (kind === 'fish' || kind === 'wine' || kind === 'oil')) {
    const keys = {
      fish: 'fasting.exceptionFish',
      wine: 'fasting.exceptionWine',
      oil: 'fasting.exceptionOil',
    } as const;
    return keys[kind];
  }
  return FOOD_ICON_META[kind].a11yKey;
}

function IconSlot({ size, children }: { size: number; children: React.ReactNode }) {
  return (
    <View style={[styles.slot, { width: size, height: size }]}>
      {children}
    </View>
  );
}

export function fastingFoodDisplayLabel(kind: FastingFoodKind, lang: UiLanguage = 'en'): string {
  return translate(lang, FOOD_ICON_META[kind].a11yKey);
}

export function FastingFoodIcon({
  kind,
  color,
  size = FASTING_ALLOWANCE_ICON_SIZE,
  allowedLabel = false,
}: Props) {
  const { t } = useAppTranslation();
  const a11yKey = iconA11yKey(kind, allowedLabel);

  if (kind === 'oil') {
    const oilSize = Math.round(size * FASTING_OIL_ICON_VISUAL_SCALE);
    return (
      <HoverAccessible label={t(a11yKey)} accessibilityRole="image">
        <IconSlot size={size}>
          <OilDropIcon color={color} size={oilSize} />
        </IconSlot>
      </HoverAccessible>
    );
  }

  const glyphSize =
    kind === 'wine' ? Math.round(size * FASTING_WINE_ICON_VISUAL_SCALE) : size;

  return (
    <HoverAccessible label={t(a11yKey)} accessibilityRole="image">
      <IconSlot size={size}>
        <MaterialCommunityIcons name={FOOD_ICON_META[kind].icon} size={glyphSize} color={color} />
      </IconSlot>
    </HoverAccessible>
  );
}

const styles = StyleSheet.create({
  slot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
