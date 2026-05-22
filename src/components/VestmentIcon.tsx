import type React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { HoverAccessible } from './HoverAccessible';

export type VestmentKind = 'sticharion' | 'orarion' | 'epitrachelion' | 'phelonion' | 'omophorion';

const VESTMENT_META: Record<
  VestmentKind,
  {
    icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
    label: string;
  }
> = {
  sticharion: { icon: 'tshirt-crew-outline', label: 'Sticharion — altar robe' },
  orarion: { icon: 'ray-end', label: 'Orarion — deacon stole' },
  epitrachelion: { icon: 'alpha-e-circle-outline', label: 'Epitrachelion — priest stole' },
  phelonion: { icon: 'coat-rack', label: 'Phelonion — priest outer vestment' },
  omophorion: { icon: 'ellipse-outline', label: 'Omophorion — bishop pall' },
};

const DISPLAY_LABEL: Record<VestmentKind, string> = {
  sticharion: 'Sticharion',
  orarion: 'Orarion',
  epitrachelion: 'Epitrachelion',
  phelonion: 'Phelonion',
  omophorion: 'Omophorion',
};

type Props = {
  kind: VestmentKind;
  color: string;
  size?: number;
};

export function vestmentKindFromLabel(label: string): VestmentKind | null {
  const key = label.toLowerCase() as VestmentKind;
  return DISPLAY_LABEL[key] ? key : null;
}

export function vestmentDisplayLabel(kind: VestmentKind): string {
  return DISPLAY_LABEL[kind];
}

export function VestmentIcon({ kind, color, size = 22 }: Props) {
  const meta = VESTMENT_META[kind];
  return (
    <HoverAccessible label={meta.label} accessibilityRole="image">
      <MaterialCommunityIcons name={meta.icon} size={size} color={color} />
    </HoverAccessible>
  );
}
