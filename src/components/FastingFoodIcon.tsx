import type React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import type { FastingFoodKind } from '../i18n/fastingLabels';
import { translate } from '../i18n/translate';
import type { UiLanguage } from '../i18n/types';
import { useAppTranslation } from '../i18n/useAppTranslation';
import { HoverAccessible } from './HoverAccessible';

const FOOD_ICON_META: Record<
  FastingFoodKind,
  {
    icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
    a11yKey: string;
  }
> = {
  all: { icon: 'food-variant', a11yKey: 'fasting.foodAll' },
  plant: { icon: 'leaf', a11yKey: 'fasting.foodPlant' },
  wine: { icon: 'glass-wine', a11yKey: 'fasting.foodWine' },
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
};

export function fastingFoodDisplayLabel(kind: FastingFoodKind, lang: UiLanguage = 'en'): string {
  return translate(lang, FOOD_ICON_META[kind].a11yKey);
}

export function FastingFoodIcon({ kind, color, size = 20 }: Props) {
  const { t } = useAppTranslation();
  const meta = FOOD_ICON_META[kind];
  return (
    <HoverAccessible label={t(meta.a11yKey)} accessibilityRole="image">
      <MaterialCommunityIcons name={meta.icon} size={size} color={color} />
    </HoverAccessible>
  );
}
