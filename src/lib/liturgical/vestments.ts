import type { VestmentKind } from '../../components/VestmentIcon';
import { vestmentDisplayLabel } from '../../components/VestmentIcon';
import { translate } from '../../i18n/translate';
import type { UiLanguage } from '../../i18n/types';
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

const SWATCH_COLOR_KEYS = {
  gold: 'vestments.colorGold',
  white: 'vestments.colorWhite',
  blue: 'vestments.colorBlue',
  red: 'vestments.colorRed',
  green: 'vestments.colorGreen',
  dark: 'vestments.colorDark',
  purple: 'vestments.colorPurple',
} as const;

type SwatchKey = keyof typeof SWATCH_COLOR_KEYS;

const SWATCH = {
  gold: { pillBg: '#b08d57', pillText: '#1e1a16' },
  white: { pillBg: '#f0ebe3', pillText: '#1e1a16' },
  blue: { pillBg: '#2f4a6f', pillText: '#ffffff' },
  red: { pillBg: '#8b2e3c', pillText: '#ffffff' },
  green: { pillBg: '#2d5a3e', pillText: '#ffffff' },
  dark: { pillBg: '#1f2433', pillText: '#ffffff' },
  purple: { pillBg: '#5c3d6e', pillText: '#ffffff' },
} as const satisfies Record<SwatchKey, Omit<VestmentSwatch, 'name'>>;

function localizedSwatch(key: SwatchKey, lang: UiLanguage): VestmentSwatch {
  const base = SWATCH[key];
  return { ...base, name: translate(lang, SWATCH_COLOR_KEYS[key]) };
}

/** Liturgical colour of the day for sticharion and matching vestments. */
export function liturgicalVestmentColor(
  appearance: LiturgicalDayAppearance,
  lang: UiLanguage = 'en',
): VestmentSwatch {
  const key = appearance.key;
  const label = appearance.label.toLowerCase();

  if (key === 'theophany' || label.includes('theophany')) return localizedSwatch('blue', lang);
  if (key === 'annunciation') return localizedSwatch('blue', lang);
  if (key === 'dormition') return localizedSwatch('blue', lang);
  if (key === 'pascha' || label.includes('pascha')) return localizedSwatch('white', lang);
  if (key === 'bright_week') return localizedSwatch('white', lang);
  if (key === 'pentecost' || label.includes('pentecost')) return localizedSwatch('green', lang);
  if (key === 'elevation_cross' || label.includes('cross')) return localizedSwatch('red', lang);
  if (key === 'holy_week' || key === 'great_lent' || key.includes('lent')) return localizedSwatch('purple', lang);
  if (key.includes('fast')) return localizedSwatch('dark', lang);
  if (
    key === 'nativity' ||
    key === 'transfiguration' ||
    key === 'all_saints' ||
    key === 'sunday'
  ) {
    return localizedSwatch('gold', lang);
  }

  return localizedSwatch('gold', lang);
}

function bishopOmophorion(
  appearance: LiturgicalDayAppearance,
  liturgical: VestmentSwatch,
  lang: UiLanguage,
): VestmentSwatch {
  if (
    appearance.key === 'pascha' ||
    appearance.key === 'bright_week' ||
    appearance.key === 'sunday' ||
    appearance.label.includes('Pascha')
  ) {
    return localizedSwatch('white', lang);
  }
  return liturgical;
}

function line(kind: VestmentKind, swatch: VestmentSwatch, lang: UiLanguage): VestmentLine {
  return {
    kind,
    label: vestmentDisplayLabel(kind, lang),
    value: swatch.name,
    pillBg: swatch.pillBg,
    pillText: swatch.pillText,
  };
}

/** Role-specific vestment rows for the Today tab. Laypeople have no altar vestments. */
export function vestmentGuidanceForRole(
  role: ClergyRole,
  appearance: LiturgicalDayAppearance,
  lang: UiLanguage = 'en',
): VestmentLine[] | null {
  if (role === 'layperson') return null;

  const liturgical = liturgicalVestmentColor(appearance, lang);

  switch (role) {
    case 'altar_server':
      return [line('sticharion', liturgical, lang)];
    case 'deacon':
      return [line('sticharion', liturgical, lang), line('orarion', liturgical, lang)];
    case 'priest':
      return [
        line('sticharion', liturgical, lang),
        line('epitrachelion', liturgical, lang),
        line('phelonion', liturgical, lang),
      ];
    case 'bishop': {
      const omophorion = bishopOmophorion(appearance, liturgical, lang);
      return [
        line('sticharion', liturgical, lang),
        line('epitrachelion', liturgical, lang),
        line('phelonion', liturgical, lang),
        line('omophorion', omophorion, lang),
      ];
    }
    default:
      return null;
  }
}
