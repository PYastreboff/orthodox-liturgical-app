import type React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { translate } from '../i18n/translate';
import type { UiLanguage } from '../i18n/types';
import { useAppTranslation } from '../i18n/useAppTranslation';
import { HoverAccessible } from './HoverAccessible';
import { SECTION_ICON_SIZE } from './SectionIcon';

/** Slightly smaller than the section title hanger icon. */
const DEFAULT_VESTMENT_ICON_SIZE = SECTION_ICON_SIZE - 4;

export type VestmentKind =
  | 'podryasnik'
  | 'ryassa'
  | 'sticharion'
  | 'orarion'
  | 'epitrachelion'
  | 'phelonion'
  | 'omophorion'
  | 'layAttire';

const VESTMENT_META: Record<
  VestmentKind,
  {
    icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
    a11yKey: string;
  }
> = {
  podryasnik: { icon: 'tshirt-crew-outline', a11yKey: 'vestments.podryasnikA11y' },
  ryassa: { icon: 'tshirt-v-outline', a11yKey: 'vestments.ryassaA11y' },
  sticharion: { icon: 'hanger', a11yKey: 'vestments.sticharionA11y' },
  orarion: { icon: 'ray-end', a11yKey: 'vestments.orarionA11y' },
  epitrachelion: { icon: 'alpha-e-circle-outline', a11yKey: 'vestments.epitrachelionA11y' },
  phelonion: { icon: 'coat-rack', a11yKey: 'vestments.phelonionA11y' },
  omophorion: { icon: 'ellipse-outline', a11yKey: 'vestments.omophorionA11y' },
  layAttire: { icon: 'account-outline', a11yKey: 'vestments.layAttireA11y' },
};

const DISPLAY_LABEL_KEYS: Record<VestmentKind, string> = {
  podryasnik: 'vestments.podryasnik',
  ryassa: 'vestments.ryassa',
  sticharion: 'vestments.sticharion',
  orarion: 'vestments.orarion',
  epitrachelion: 'vestments.epitrachelion',
  phelonion: 'vestments.phelonion',
  omophorion: 'vestments.omophorion',
  layAttire: 'vestments.layLiturgicalColour',
};

type Props = {
  kind: VestmentKind;
  color: string;
  size?: number;
};

export function vestmentDisplayLabel(kind: VestmentKind, lang: UiLanguage = 'en'): string {
  return translate(lang, DISPLAY_LABEL_KEYS[kind]);
}

export function VestmentIcon({ kind, color, size = DEFAULT_VESTMENT_ICON_SIZE }: Props) {
  const { t } = useAppTranslation();
  const meta = VESTMENT_META[kind];
  return (
    <HoverAccessible label={t(meta.a11yKey)} accessibilityRole="image">
      <MaterialCommunityIcons name={meta.icon} size={size} color={color} />
    </HoverAccessible>
  );
}
