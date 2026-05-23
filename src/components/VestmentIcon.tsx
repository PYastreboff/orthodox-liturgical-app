import type React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { translate } from '../i18n/translate';
import type { UiLanguage } from '../i18n/types';
import { useAppTranslation } from '../i18n/useAppTranslation';
import { HoverAccessible } from './HoverAccessible';

export type VestmentKind = 'sticharion' | 'orarion' | 'epitrachelion' | 'phelonion' | 'omophorion';

const VESTMENT_META: Record<
  VestmentKind,
  {
    icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
    a11yKey: string;
  }
> = {
  sticharion: { icon: 'tshirt-crew-outline', a11yKey: 'vestments.sticharionA11y' },
  orarion: { icon: 'ray-end', a11yKey: 'vestments.orarionA11y' },
  epitrachelion: { icon: 'alpha-e-circle-outline', a11yKey: 'vestments.epitrachelionA11y' },
  phelonion: { icon: 'coat-rack', a11yKey: 'vestments.phelonionA11y' },
  omophorion: { icon: 'ellipse-outline', a11yKey: 'vestments.omophorionA11y' },
};

const DISPLAY_LABEL_KEYS: Record<VestmentKind, string> = {
  sticharion: 'vestments.sticharion',
  orarion: 'vestments.orarion',
  epitrachelion: 'vestments.epitrachelion',
  phelonion: 'vestments.phelonion',
  omophorion: 'vestments.omophorion',
};

type Props = {
  kind: VestmentKind;
  color: string;
  size?: number;
};

export function vestmentDisplayLabel(kind: VestmentKind, lang: UiLanguage = 'en'): string {
  return translate(lang, DISPLAY_LABEL_KEYS[kind]);
}

export function VestmentIcon({ kind, color, size = 22 }: Props) {
  const { t } = useAppTranslation();
  const meta = VESTMENT_META[kind];
  return (
    <HoverAccessible label={t(meta.a11yKey)} accessibilityRole="image">
      <MaterialCommunityIcons name={meta.icon} size={size} color={color} />
    </HoverAccessible>
  );
}
