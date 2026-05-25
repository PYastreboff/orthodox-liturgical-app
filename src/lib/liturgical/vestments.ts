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
  /** Optional subheading before this row (e.g. Holy Saturday vespers vs liturgy). */
  sectionHeader?: string;
};

export type VestmentGuidance = {
  /** Why this liturgical colour is used today. */
  colorReason: string;
  lines: VestmentLine[];
  footnote: string;
};

const SWATCH_COLOR_KEYS = {
  gold: 'vestments.colorGold',
  white: 'vestments.colorWhite',
  blue: 'vestments.colorBlue',
  red: 'vestments.colorRed',
  green: 'vestments.colorGreen',
  dark: 'vestments.colorDark',
  black: 'vestments.colorBlack',
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
  black: { pillBg: '#121010', pillText: '#ffffff' },
  purple: { pillBg: '#5c3d6e', pillText: '#ffffff' },
} as const satisfies Record<SwatchKey, Omit<VestmentSwatch, 'name'>>;

const REASON_KEY_BY_APPEARANCE: Record<string, string> = {
  pascha: 'vestments.reason.pascha',
  bright_week: 'vestments.reason.brightWeek',
  theophany: 'vestments.reason.theophany',
  annunciation: 'vestments.reason.annunciation',
  dormition: 'vestments.reason.dormition',
  nativity: 'vestments.reason.nativity',
  transfiguration: 'vestments.reason.transfiguration',
  palm_sunday: 'vestments.reason.palmSunday',
  pentecost: 'vestments.reason.pentecost',
  elevation_cross: 'vestments.reason.elevationCross',
  great_friday: 'vestments.reason.greatFriday',
  holy_saturday: 'vestments.reason.holySaturday',
  holy_week: 'vestments.reason.holyWeek',
  great_lent: 'vestments.reason.greatLent',
  lent_sunday: 'vestments.reason.lentSunday',
  lent_saturday: 'vestments.reason.lentSaturday',
  wednesday_fast: 'vestments.reason.wednesdayFast',
  friday_fast: 'vestments.reason.fridayFast',
  sunday: 'vestments.reason.sunday',
  all_saints: 'vestments.reason.allSaints',
};

function localizedSwatch(key: SwatchKey, lang: UiLanguage): VestmentSwatch {
  const base = SWATCH[key];
  return { ...base, name: translate(lang, SWATCH_COLOR_KEYS[key]) };
}

function liturgicalSwatchKey(appearance: LiturgicalDayAppearance): SwatchKey {
  const key = appearance.key;
  const label = appearance.label.toLowerCase();

  if (key === 'theophany' || label.includes('theophany')) return 'blue';
  if (key === 'annunciation' || label.includes('annunciation')) return 'blue';
  if (key === 'dormition') return 'blue';
  if (key === 'pascha' || label.includes('pascha')) return 'white';
  if (key === 'bright_week') return 'white';
  if (key === 'palm_sunday' || label.includes('palm')) return 'green';
  if (key === 'pentecost' || label.includes('pentecost')) return 'green';
  if (key === 'elevation_cross' || label.includes('cross')) return 'red';
  if (key === 'great_friday' || label.includes('holy friday')) return 'black';
  if (key === 'holy_saturday') return 'white';
  if (key === 'holy_week' || key === 'great_lent' || key.includes('lent')) return 'purple';
  if (key.includes('fast')) return 'dark';
  if (key === 'nativity' || key === 'transfiguration' || key === 'all_saints' || key === 'sunday') {
    return 'gold';
  }

  return 'gold';
}

/** Liturgical colour of the day for outer vestments and festal ryassa. */
export function liturgicalVestmentColor(
  appearance: LiturgicalDayAppearance,
  lang: UiLanguage = 'en',
): VestmentSwatch {
  return localizedSwatch(liturgicalSwatchKey(appearance), lang);
}

const REASON_BY_SWATCH: Record<SwatchKey, string> = {
  gold: 'vestments.reason.gold',
  white: 'vestments.reason.white',
  blue: 'vestments.reason.blue',
  red: 'vestments.reason.red',
  green: 'vestments.reason.green',
  dark: 'vestments.reason.dark',
  black: 'vestments.reason.black',
  purple: 'vestments.reason.purple',
};

export function vestmentColorReason(appearance: LiturgicalDayAppearance, lang: UiLanguage): string {
  const reasonKey = REASON_KEY_BY_APPEARANCE[appearance.key];
  if (reasonKey) return translate(lang, reasonKey);
  return translate(lang, REASON_BY_SWATCH[liturgicalSwatchKey(appearance)]);
}

/** Podryasnik (under-cassock) is normally black year-round. */
function podryasnikSwatch(lang: UiLanguage): VestmentSwatch {
  return localizedSwatch('black', lang);
}

/**
 * Ryassa: black on fast weekdays and Good Friday; otherwise often matches the festal liturgical colour.
 */
function ryassaSwatch(appearance: LiturgicalDayAppearance, lang: UiLanguage): VestmentSwatch {
  const key = appearance.key;
  if (
    key === 'great_friday' ||
    key === 'wednesday_fast' ||
    key === 'friday_fast' ||
    key.includes('fast')
  ) {
    return localizedSwatch('black', lang);
  }
  return liturgicalVestmentColor(appearance, lang);
}

function garmentLine(
  kind: VestmentKind,
  swatch: VestmentSwatch,
  lang: UiLanguage,
  sectionHeader?: string,
): VestmentLine {
  return {
    kind,
    label: vestmentDisplayLabel(kind, lang),
    value: swatch.name,
    pillBg: swatch.pillBg,
    pillText: swatch.pillText,
    sectionHeader,
  };
}

function undergarmentLines(
  appearance: LiturgicalDayAppearance,
  lang: UiLanguage,
  sectionHeader?: string,
): VestmentLine[] {
  const podryasnik = podryasnikSwatch(lang);
  const ryassa = ryassaSwatch(appearance, lang);
  return [
    garmentLine('podryasnik', podryasnik, lang, sectionHeader),
    garmentLine('ryassa', ryassa, lang),
  ];
}

function bishopOmophorionSwatch(appearance: LiturgicalDayAppearance, liturgical: VestmentSwatch, lang: UiLanguage): VestmentSwatch {
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

function outerLinesForRole(
  role: ClergyRole,
  liturgical: VestmentSwatch,
  appearance: LiturgicalDayAppearance,
  lang: UiLanguage,
  sectionHeader?: string,
): VestmentLine[] {
  switch (role) {
    case 'reader':
      return [garmentLine('sticharion', liturgical, lang, sectionHeader)];
    case 'altar_server':
      return [garmentLine('sticharion', liturgical, lang, sectionHeader)];
    case 'deacon':
      return [
        garmentLine('sticharion', liturgical, lang, sectionHeader),
        garmentLine('orarion', liturgical, lang),
      ];
    case 'priest':
      return [
        garmentLine('epitrachelion', liturgical, lang, sectionHeader),
        garmentLine('phelonion', liturgical, lang),
      ];
    case 'bishop':
      return [
        garmentLine('epitrachelion', liturgical, lang, sectionHeader),
        garmentLine('phelonion', liturgical, lang),
        garmentLine('omophorion', bishopOmophorionSwatch(appearance, liturgical, lang), lang),
      ];
    default:
      return [];
  }
}

function holySaturdayGuidance(
  role: ClergyRole,
  appearance: LiturgicalDayAppearance,
  lang: UiLanguage,
): VestmentLine[] {
  const black = localizedSwatch('black', lang);
  const white = localizedSwatch('white', lang);
  const vespersHeader = translate(lang, 'vestments.groupHolySaturdayVespers');
  const liturgyHeader = translate(lang, 'vestments.groupHolySaturdayLiturgy');

  if (role === 'layperson') {
    return [
      layLiturgicalColourLine(black, lang, vespersHeader),
      layLiturgicalColourLine(white, lang, liturgyHeader),
      layClothingLine(lang),
    ];
  }

  return [
    garmentLine('podryasnik', black, lang, vespersHeader),
    garmentLine('ryassa', black, lang),
    ...outerLinesForRole(role, black, appearance, lang),
    garmentLine('podryasnik', black, lang, liturgyHeader),
    garmentLine('ryassa', white, lang),
    ...outerLinesForRole(role, white, appearance, lang),
  ];
}

function layLiturgicalColourLine(
  swatch: VestmentSwatch,
  lang: UiLanguage,
  sectionHeader?: string,
): VestmentLine {
  return {
    kind: 'layLiturgicalColour',
    label: translate(lang, 'vestments.layLiturgicalColour'),
    value: swatch.name,
    pillBg: swatch.pillBg,
    pillText: swatch.pillText,
    sectionHeader,
  };
}

function layClothingLine(lang: UiLanguage): VestmentLine {
  return {
    kind: 'layClothing',
    label: translate(lang, 'vestments.layWhatYouWear'),
    value: translate(lang, 'vestments.layWhatYouWearValue'),
    pillBg: SWATCH.dark.pillBg,
    pillText: SWATCH.dark.pillText,
  };
}

function laypersonLines(appearance: LiturgicalDayAppearance, lang: UiLanguage): VestmentLine[] {
  const liturgical = liturgicalVestmentColor(appearance, lang);
  return [layLiturgicalColourLine(liturgical, lang), layClothingLine(lang)];
}

function clergyGuidance(
  role: ClergyRole,
  appearance: LiturgicalDayAppearance,
  lang: UiLanguage,
): VestmentLine[] {
  if (appearance.key === 'holy_saturday') {
    return holySaturdayGuidance(role, appearance, lang);
  }

  const liturgical = liturgicalVestmentColor(appearance, lang);
  const underHeader = translate(lang, 'vestments.groupUndergarments');
  const outerHeader = translate(lang, 'vestments.groupOuter');

  return [
    ...undergarmentLines(appearance, lang, underHeader),
    ...outerLinesForRole(role, liturgical, appearance, lang, outerHeader),
  ];
}

/** Role-specific vestment rows for the Today tab (all roles, including laypeople). */
export function vestmentGuidanceForRole(
  role: ClergyRole,
  appearance: LiturgicalDayAppearance,
  lang: UiLanguage = 'en',
): VestmentGuidance {
  const lines =
    role === 'layperson' ? laypersonLines(appearance, lang) : clergyGuidance(role, appearance, lang);

  return {
    colorReason: vestmentColorReason(appearance, lang),
    lines,
    footnote: translate(lang, role === 'layperson' ? 'vestments.layFootnote' : 'vestments.footnote'),
  };
}
