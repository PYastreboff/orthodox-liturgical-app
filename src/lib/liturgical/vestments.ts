import type { VestmentKind } from '../../components/VestmentIcon';
import { vestmentDisplayLabel } from '../../components/VestmentIcon';
import type { LiturgicalDayAppearance } from '../calendar/dayAppearance';
import type { ClergyRole } from '../../types/liturgical';

export type VestmentSwatch = {
  name: string;
  pillBg: string;
  pillText: string;
};

export type VestmentLine = {
  kind: VestmentKind;
  label: string;
  value: string;
  pillBg: string;
  pillText: string;
};

const SWATCH = {
  gold: { name: 'Gold', pillBg: '#b08d57', pillText: '#1e1a16' },
  white: { name: 'White', pillBg: '#f0ebe3', pillText: '#1e1a16' },
  blue: { name: 'Blue', pillBg: '#2f4a6f', pillText: '#ffffff' },
  red: { name: 'Red', pillBg: '#8b2e3c', pillText: '#ffffff' },
  green: { name: 'Green', pillBg: '#2d5a3e', pillText: '#ffffff' },
  dark: { name: 'Dark', pillBg: '#1f2433', pillText: '#ffffff' },
  purple: { name: 'Purple', pillBg: '#5c3d6e', pillText: '#ffffff' },
} as const satisfies Record<string, VestmentSwatch>;

/** Liturgical colour of the day for sticharion and matching vestments. */
export function liturgicalVestmentColor(appearance: LiturgicalDayAppearance): VestmentSwatch {
  const key = appearance.key;
  const label = appearance.label.toLowerCase();

  if (key === 'theophany' || label.includes('theophany')) return SWATCH.blue;
  if (key === 'pascha' || label.includes('pascha')) return SWATCH.white;
  if (key === 'bright_week') return SWATCH.white;
  if (key === 'pentecost' || label.includes('pentecost')) return SWATCH.green;
  if (key === 'elevation_cross' || label.includes('cross')) return SWATCH.red;
  if (key === 'holy_week' || key === 'great_lent' || key.includes('lent')) return SWATCH.purple;
  if (key.includes('fast')) return SWATCH.dark;
  if (
    key === 'nativity' ||
    key === 'annunciation' ||
    key === 'transfiguration' ||
    key === 'dormition' ||
    key === 'all_saints' ||
    key === 'sunday'
  ) {
    return SWATCH.gold;
  }

  return SWATCH.gold;
}

function bishopOmophorion(appearance: LiturgicalDayAppearance, liturgical: VestmentSwatch): VestmentSwatch {
  if (
    appearance.key === 'pascha' ||
    appearance.key === 'bright_week' ||
    appearance.key === 'sunday' ||
    appearance.label.includes('Pascha')
  ) {
    return SWATCH.white;
  }
  return liturgical;
}

function line(kind: VestmentKind, swatch: VestmentSwatch): VestmentLine {
  return {
    kind,
    label: vestmentDisplayLabel(kind),
    value: swatch.name,
    pillBg: swatch.pillBg,
    pillText: swatch.pillText,
  };
}

/** Role-specific vestment rows for the Today tab. Laypeople have no altar vestments. */
export function vestmentGuidanceForRole(
  role: ClergyRole,
  appearance: LiturgicalDayAppearance,
): VestmentLine[] | null {
  if (role === 'layperson') return null;

  const liturgical = liturgicalVestmentColor(appearance);

  switch (role) {
    case 'altar_server':
      return [line('sticharion', liturgical)];
    case 'deacon':
      return [line('sticharion', liturgical), line('orarion', liturgical)];
    case 'priest':
      return [
        line('sticharion', liturgical),
        line('epitrachelion', liturgical),
        line('phelonion', liturgical),
      ];
    case 'bishop': {
      const omophorion = bishopOmophorion(appearance, liturgical);
      return [
        line('sticharion', liturgical),
        line('epitrachelion', liturgical),
        line('phelonion', liturgical),
        line('omophorion', omophorion),
      ];
    }
    default:
      return null;
  }
}
