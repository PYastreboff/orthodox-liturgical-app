import type { OrthocalDay } from '../api/orthocal';
import { annunciationFeastNameFromOrthocal } from '../liturgical/liturgicalDayTitle';
import type { PlainDate } from './julianGregorian';
import {
  gregorianCalendarToJulianDayNumber,
  gregorianPlainToJulianPlain,
  julianCalendarToGregorian,
  julianCalendarToJulianDayNumber,
} from './julianGregorian';
import type { PrimaryCalendar } from './dateDisplay';
import { formatGregorianReadable, formatJulianReadable } from './formatDate';
import { appearanceLiturgicalPlainDate, civilPlainDateFromLocal } from './liturgicalCalendar';
import { orthodoxPaschaJdn } from './pascha';
import { isWeeklyFastDay } from './weeklyFast';

export type LiturgicalDayAppearance = {
  /** Liturgical palette key (for debugging / future pack mapping). */
  key: string;
  /** Linear gradient: top/leading → bottom/trailing. */
  gradient: [string, string];
  /** Primary text on the cell. */
  foreground: string;
  /** Julian date line, e.g. "Thursday 14th May". */
  subtitle: string;
  /** Civil Gregorian line (smaller UI), e.g. "Wednesday 1st May 2026". */
  gregorianSubtitle: string;
  /** Short rubric label. */
  label: string;
};

function jdnForJulian(y: number, m: number, d: number): number {
  return julianCalendarToJulianDayNumber(y, m, d);
}

/** Fixed feast/fast date on the active church calendar (Julian or Gregorian components). */
function jdnForLiturgicalFixedDate(
  liturgical: PlainDate,
  calendar: PrimaryCalendar,
  month: number,
  day: number,
): number {
  if (calendar === 'gregorian') {
    return gregorianCalendarToJulianDayNumber(liturgical.year, month, day);
  }
  return jdnForJulian(liturgical.year, month, day);
}

/** Weekday from Julian day number: 0 = Sunday … 6 = Saturday. */
function weekdayFromJdn(jdn: number): number {
  return (jdn + 1) % 7;
}

function sameLiturgicalDate(a: PlainDate, b: PlainDate): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

/** Blue vestments — Annunciation and other Theotokos great feasts. */
export function annunciationAppearanceFields(
  subtitle: string,
  gregorianSubtitle: string,
): Pick<LiturgicalDayAppearance, 'key' | 'gradient' | 'foreground' | 'label' | 'subtitle' | 'gregorianSubtitle'> {
  return {
    key: 'annunciation',
    gradient: ['#355a8a', '#1c2f4a'],
    foreground: '#eef4ff',
    subtitle,
    gregorianSubtitle,
    label: 'Annunciation',
  };
}

function isAnnunciationLiturgicalDate(liturgical: PlainDate): boolean {
  return liturgical.month === 3 && liturgical.day === 25;
}

type AppearancePreset = Pick<
  LiturgicalDayAppearance,
  'key' | 'gradient' | 'foreground' | 'label'
>;

const THEOTOKOS_BLUE_GRADIENT = ['#355a8a', '#1c2f4a'] as [string, string];
const THEOTOKOS_BLUE_FG = '#eef4ff';
const PENTECOST_GREEN_GRADIENT = ['#dce8dc', '#3d7350'] as [string, string];
const PENTECOST_GREEN_FG = '#1e1a16';
const LORD_GOLD_GRADIENT = ['#f2efe6', '#c6a86a'] as [string, string];
const LORD_GOLD_FG = '#1e1a16';
const WHITE_FEAST_GRADIENT = ['#fffdf6', '#f2d58c'] as [string, string];
const WHITE_FEAST_FG = '#1e1a16';
const RED_FAST_GRADIENT = ['#8b2838', '#4a1420'] as [string, string];
const RED_FAST_FG = '#fff5f5';
const LENT_BLACK_GRADIENT = ['#2a2826', '#0a0a0a'] as [string, string];
const LENT_BLACK_FG = '#f2ebe2';
const LENT_PURPLE_GRADIENT = ['#352040', '#140a1c'] as [string, string];
const LENT_PURPLE_FG = '#f3ecfc';

function appearanceFromPreset(
  preset: AppearancePreset,
  subtitle: string,
  gregorianSubtitle: string,
): LiturgicalDayAppearance {
  return { ...preset, subtitle, gregorianSubtitle };
}

/** Blue — Theotokos feasts (St John the Evangelist Orthodox Church guide). */
export function theotokosAppearanceFields(
  key: string,
  label: string,
  subtitle: string,
  gregorianSubtitle: string,
): LiturgicalDayAppearance {
  return appearanceFromPreset(
    {
      key,
      gradient: THEOTOKOS_BLUE_GRADIENT,
      foreground: THEOTOKOS_BLUE_FG,
      label,
    },
    subtitle,
    gregorianSubtitle,
  );
}

/** Green — Pentecost season, Holy Spirit, and related commemorations. */
export function pentecostSeasonAppearanceFields(
  key: string,
  label: string,
  subtitle: string,
  gregorianSubtitle: string,
): LiturgicalDayAppearance {
  return appearanceFromPreset(
    {
      key,
      gradient: PENTECOST_GREEN_GRADIENT,
      foreground: PENTECOST_GREEN_FG,
      label,
    },
    subtitle,
    gregorianSubtitle,
  );
}

/** Gold — general Lord feasts, All Saints Sundays, apostles (ROCOR). */
export function lordFeastAppearanceFields(
  key: string,
  label: string,
  subtitle: string,
  gregorianSubtitle: string,
): LiturgicalDayAppearance {
  return appearanceFromPreset(
    {
      key,
      gradient: LORD_GOLD_GRADIENT,
      foreground: LORD_GOLD_FG,
      label,
    },
    subtitle,
    gregorianSubtitle,
  );
}

/** White — Pascha season, Nativity, Theophany, Transfiguration, Ascension (ROCOR). */
export function whiteFeastAppearanceFields(
  key: string,
  label: string,
  subtitle: string,
  gregorianSubtitle: string,
): LiturgicalDayAppearance {
  return appearanceFromPreset(
    {
      key,
      gradient: WHITE_FEAST_GRADIENT,
      foreground: WHITE_FEAST_FG,
      label,
    },
    subtitle,
    gregorianSubtitle,
  );
}

/** Red — Cross feasts and other explicitly “blood-red” commemorations. */
export function redFeastAppearanceFields(
  key: string,
  label: string,
  subtitle: string,
  gregorianSubtitle: string,
): LiturgicalDayAppearance {
  return appearanceFromPreset(
    {
      key,
      gradient: RED_FAST_GRADIENT,
      foreground: RED_FAST_FG,
      label,
    },
    subtitle,
    gregorianSubtitle,
  );
}

/** Black — Great Lent weekdays (ROCOR Europe handbook). */
export function lentBlackAppearanceFields(
  subtitle: string,
  gregorianSubtitle: string,
): LiturgicalDayAppearance {
  return appearanceFromPreset(
    {
      key: 'great_lent',
      gradient: LENT_BLACK_GRADIENT,
      foreground: LENT_BLACK_FG,
      label: 'Great Lent',
    },
    subtitle,
    gregorianSubtitle,
  );
}

/** Purple — Great Lent Sundays and Saturdays (ROCOR). */
export function lentPurpleAppearanceFields(
  key: 'lent_sunday' | 'lent_saturday',
  label: string,
  subtitle: string,
  gregorianSubtitle: string,
): LiturgicalDayAppearance {
  return appearanceFromPreset(
    {
      key,
      gradient: LENT_PURPLE_GRADIENT,
      foreground: LENT_PURPLE_FG,
      label,
    },
    subtitle,
    gregorianSubtitle,
  );
}

/** Red — Nativity, Dormition, and Apostles fast seasons (ROCOR). */
export function redFastSeasonAppearanceFields(
  key: string,
  label: string,
  subtitle: string,
  gregorianSubtitle: string,
): LiturgicalDayAppearance {
  return redFeastAppearanceFields(key, label, subtitle, gregorianSubtitle);
}

/** @deprecated Use redFeastAppearanceFields. */
export function redFastAppearanceFields(
  key: string,
  label: string,
  subtitle: string,
  gregorianSubtitle: string,
): LiturgicalDayAppearance {
  return redFeastAppearanceFields(key, label, subtitle, gregorianSubtitle);
}

/** Red — Exaltation of the Cross and other Cross feasts. */
export function crossFeastAppearanceFields(
  key: string,
  label: string,
  subtitle: string,
  gregorianSubtitle: string,
): LiturgicalDayAppearance {
  return redFeastAppearanceFields(key, label, subtitle, gregorianSubtitle);
}

/** @deprecated Use lordFeastAppearanceFields or crossFeastAppearanceFields. */
export function martyrFeastAppearanceFields(
  key: string,
  label: string,
  subtitle: string,
  gregorianSubtitle: string,
): LiturgicalDayAppearance {
  return lordFeastAppearanceFields(key, label, subtitle, gregorianSubtitle);
}

function orthocalFeastHaystack(day: OrthocalDay): string {
  return [...(day.feasts ?? []), day.summary_title, ...(day.titles ?? [])]
    .filter(Boolean)
    .join(' ');
}

/** Override computed appearance when orthocal names a feast we model locally. */
export function applyOrthocalFeastAppearance(
  appearance: LiturgicalDayAppearance,
  day: OrthocalDay,
): LiturgicalDayAppearance {
  const haystack = orthocalFeastHaystack(day);
  const { subtitle, gregorianSubtitle } = appearance;

  if (/\ball saints of russia\b/i.test(haystack)) {
    return lordFeastAppearanceFields(
      'all_saints_russia',
      'All Saints of Russia',
      subtitle,
      gregorianSubtitle,
    );
  }
  if (/\bascension\b/i.test(haystack) && !/\bleavetaking\b/i.test(haystack)) {
    return whiteFeastAppearanceFields('ascension', 'Ascension', subtitle, gregorianSubtitle);
  }
  if (/\bleavetaking of ascension\b/i.test(haystack)) {
    return whiteFeastAppearanceFields(
      'ascension_leavetaking',
      'Leavetaking of Ascension',
      subtitle,
      gregorianSubtitle,
    );
  }
  if (/\bholy spirit\b|\bday of (?:the )?holy spirit\b/i.test(haystack)) {
    return pentecostSeasonAppearanceFields(
      'holy_spirit',
      'Day of the Holy Spirit',
      subtitle,
      gregorianSubtitle,
    );
  }
  if (/\bthird day of (?:the )?trinity\b|\bholy trinity\b/i.test(haystack)) {
    return pentecostSeasonAppearanceFields(
      'trinity_day',
      'Trinity Day',
      subtitle,
      gregorianSubtitle,
    );
  }
  if (/\bpeter and paul\b|\bapostles peter\b|\bleaders of the apostles\b/i.test(haystack)) {
    return lordFeastAppearanceFields(
      'peter_and_paul',
      'Saints Peter and Paul',
      subtitle,
      gregorianSubtitle,
    );
  }
  if (/\bnativity of (?:the )?(?:holy )?theotokos\b/i.test(haystack)) {
    return theotokosAppearanceFields(
      'nativity_theotokos',
      'Nativity of the Theotokos',
      subtitle,
      gregorianSubtitle,
    );
  }
  if (/\bpresentation of (?:the )?lord\b|\bmeeting of (?:the )?lord\b/i.test(haystack)) {
    return theotokosAppearanceFields(
      'presentation',
      'Presentation of the Lord',
      subtitle,
      gregorianSubtitle,
    );
  }

  return appearance;
}

export function applyAnnunciationAppearance(
  appearance: LiturgicalDayAppearance,
): LiturgicalDayAppearance {
  return {
    ...appearance,
    ...annunciationAppearanceFields(appearance.subtitle, appearance.gregorianSubtitle),
  };
}

/**
 * Approximate liturgical colours for the Russian Orthodox **Julian** calendar,
 * relative to Pascha and a few fixed feasts.
 */
export function getLiturgicalDayAppearance(
  liturgical: PlainDate,
  jdn: number,
  /** Civil (Gregorian) weekday for the day being viewed — used for Wed/Fri fast styling. */
  civilWeekday: number,
  liturgicalCalendar: PrimaryCalendar = 'julian',
): LiturgicalDayAppearance {
  const y = liturgical.year;
  const pascha = orthodoxPaschaJdn(y);
  const cleanMonday = pascha - 48;
  const palmSunday = pascha - 7;
  const greatFriday = pascha - 2;
  const holySaturday = pascha - 1;
  const brightEnd = pascha + 7;
  const pentecost = pascha + 49;
  const ascension = pascha + 39;
  const ascensionLeavetaking = pascha + 40;
  const holySpiritMonday = pascha + 50;
  const allSaintsSunday = pascha + 56;
  const allSaintsRussiaSunday = pascha + 63;
  const apostlesFastMonday = pascha + 57;
  const peterAndPaul = jdnForLiturgicalFixedDate(liturgical, liturgicalCalendar, 6, 29);

  const wd = weekdayFromJdn(jdn);

  const inHolyWeek = jdn > palmSunday && jdn < greatFriday;
  const inBrightWeek = jdn >= pascha && jdn <= brightEnd;
  const inGreatLent = jdn >= cleanMonday && jdn < palmSunday;
  const inApostlesFast = jdn >= apostlesFastMonday && jdn < peterAndPaul;

  const aug1 = jdnForJulian(y, 8, 1);
  const aug14 = jdnForJulian(y, 8, 14);
  const inDormitionFast = jdn >= aug1 && jdn <= aug14;

  const nov15 = jdnForJulian(y, 11, 15);
  const dec24 = jdnForJulian(y, 12, 24);
  const inNativityFast = jdn >= nov15 && jdn <= dec24;

  const nativity = { year: y, month: 12, day: 25 } satisfies PlainDate;
  const theophany = { year: y, month: 1, day: 6 } satisfies PlainDate;
  const presentation = { year: y, month: 2, day: 2 } satisfies PlainDate;
  const nativityTheotokos = { year: y, month: 9, day: 8 } satisfies PlainDate;
  const transfiguration = { year: y, month: 8, day: 6 } satisfies PlainDate;
  const dormition = { year: y, month: 8, day: 15 } satisfies PlainDate;
  const elevationCross = { year: y, month: 9, day: 14 } satisfies PlainDate;

  const g = julianCalendarToGregorian(liturgical.year, liturgical.month, liturgical.day);
  const subtitle = formatJulianReadable(liturgical, true);
  const gregorianSubtitle = formatGregorianReadable(g, true);

  const baseSunday: LiturgicalDayAppearance = {
    key: 'sunday',
    gradient: ['#f7f1e4', '#d9c49a'],
    foreground: '#1e1a16',
    subtitle,
    gregorianSubtitle,
    label: 'Sunday',
  };

  const baseSaturday: LiturgicalDayAppearance = {
    key: 'saturday',
    gradient: ['#ebe4dc', '#b9aa96'],
    foreground: '#1e1a16',
    subtitle,
    gregorianSubtitle,
    label: 'Saturday',
  };

  const baseWeekday: LiturgicalDayAppearance = {
    key: 'weekday',
    gradient: ['#e8e4dd', '#bfb4a2'],
    foreground: '#1e1a16',
    subtitle,
    gregorianSubtitle,
    label: 'Weekday',
  };

  if (jdn === palmSunday) {
    return {
      key: 'palm_sunday',
      gradient: ['#e8f4e6', '#3d7350'],
      foreground: '#1e1a16',
      subtitle,
      gregorianSubtitle,
      label: 'Palm Sunday',
    };
  }

  /** Annunciation (25 Mar) keeps Theotokos blue even in Great Lent or Holy Week. */
  if (isAnnunciationLiturgicalDate(liturgical)) {
    return annunciationAppearanceFields(subtitle, gregorianSubtitle);
  }

  if (inHolyWeek) {
    return {
      key: 'holy_week',
      gradient: LENT_BLACK_GRADIENT,
      foreground: LENT_BLACK_FG,
      subtitle,
      gregorianSubtitle,
      label: 'Holy Week',
    };
  }

  if (jdn === greatFriday) {
    return {
      key: 'great_friday',
      gradient: ['#2a2826', '#0a0a0a'],
      foreground: '#f2ebe2',
      subtitle,
      gregorianSubtitle,
      label: 'Great and Holy Friday',
    };
  }

  if (jdn === holySaturday) {
    return {
      key: 'holy_saturday',
      gradient: ['#121010', '#f0ebe3'],
      foreground: '#1e1a16',
      subtitle,
      gregorianSubtitle,
      label: 'Great and Holy Saturday',
    };
  }

  if (jdn === pascha) {
    return {
      key: 'pascha',
      gradient: ['#fffdf6', '#f2d58c'],
      foreground: '#1e1a16',
      subtitle,
    gregorianSubtitle,
      label: 'Pascha',
    };
  }

  if (inBrightWeek) {
    return {
      key: 'bright_week',
      gradient: ['#fff9ec', '#e8c97a'],
      foreground: '#1e1a16',
      subtitle,
    gregorianSubtitle,
      label: 'Bright Week',
    };
  }

  if (jdn === pentecost) {
    return {
      key: 'pentecost',
      gradient: ['#ffb38a', '#8c2a18'],
      foreground: '#fffaf6',
      subtitle,
    gregorianSubtitle,
      label: 'Pentecost',
    };
  }

  if (jdn === ascension) {
    return whiteFeastAppearanceFields('ascension', 'Ascension', subtitle, gregorianSubtitle);
  }

  if (jdn === ascensionLeavetaking) {
    return whiteFeastAppearanceFields(
      'ascension_leavetaking',
      'Leavetaking of Ascension',
      subtitle,
      gregorianSubtitle,
    );
  }

  if (jdn === holySpiritMonday) {
    return pentecostSeasonAppearanceFields(
      'holy_spirit',
      'Day of the Holy Spirit',
      subtitle,
      gregorianSubtitle,
    );
  }

  if (jdn > pentecost && jdn < allSaintsSunday) {
    return pentecostSeasonAppearanceFields(
      'pentecost_season',
      'Pentecost season',
      subtitle,
      gregorianSubtitle,
    );
  }

  if (jdn === allSaintsSunday) {
    return lordFeastAppearanceFields('all_saints', 'All Saints', subtitle, gregorianSubtitle);
  }

  if (jdn === allSaintsRussiaSunday) {
    return lordFeastAppearanceFields(
      'all_saints_russia',
      'All Saints of Russia',
      subtitle,
      gregorianSubtitle,
    );
  }

  if (sameLiturgicalDate(liturgical, nativity)) {
    return whiteFeastAppearanceFields('nativity', 'Nativity', subtitle, gregorianSubtitle);
  }

  if (sameLiturgicalDate(liturgical, theophany)) {
    return whiteFeastAppearanceFields('theophany', 'Theophany', subtitle, gregorianSubtitle);
  }

  if (sameLiturgicalDate(liturgical, transfiguration)) {
    return whiteFeastAppearanceFields(
      'transfiguration',
      'Transfiguration',
      subtitle,
      gregorianSubtitle,
    );
  }

  if (sameLiturgicalDate(liturgical, dormition)) {
    return {
      key: 'dormition',
      gradient: ['#3a5680', '#1a2538'],
      foreground: '#f0f4fc',
      subtitle,
    gregorianSubtitle,
      label: 'Dormition',
    };
  }

  if (sameLiturgicalDate(liturgical, elevationCross)) {
    return crossFeastAppearanceFields(
      'elevation_cross',
      'Elevation of the Cross',
      subtitle,
      gregorianSubtitle,
    );
  }

  if (sameLiturgicalDate(liturgical, presentation)) {
    return theotokosAppearanceFields(
      'presentation',
      'Presentation of the Lord',
      subtitle,
      gregorianSubtitle,
    );
  }

  if (sameLiturgicalDate(liturgical, nativityTheotokos)) {
    return theotokosAppearanceFields(
      'nativity_theotokos',
      'Nativity of the Theotokos',
      subtitle,
      gregorianSubtitle,
    );
  }

  if (jdn === peterAndPaul) {
    return lordFeastAppearanceFields(
      'peter_and_paul',
      'Saints Peter and Paul',
      subtitle,
      gregorianSubtitle,
    );
  }

  if (inDormitionFast) {
    return redFastSeasonAppearanceFields(
      'dormition_fast',
      'Dormition Fast',
      subtitle,
      gregorianSubtitle,
    );
  }

  if (inNativityFast) {
    return redFastSeasonAppearanceFields(
      'nativity_fast',
      'Nativity Fast',
      subtitle,
      gregorianSubtitle,
    );
  }

  if (inApostlesFast) {
    return redFastSeasonAppearanceFields(
      'apostles_fast',
      'Apostles’ Fast',
      subtitle,
      gregorianSubtitle,
    );
  }

  if (inGreatLent) {
    if (wd === 0) {
      return lentPurpleAppearanceFields(
        'lent_sunday',
        'Lent · Sunday',
        subtitle,
        gregorianSubtitle,
      );
    }
    if (wd === 6) {
      return lentPurpleAppearanceFields(
        'lent_saturday',
        'Lent · Saturday',
        subtitle,
        gregorianSubtitle,
      );
    }
    return lentBlackAppearanceFields(subtitle, gregorianSubtitle);
  }

  if (isWeeklyFastDay(jdn, civilWeekday, liturgical)) {
    return {
      key: civilWeekday === 3 ? 'wednesday_fast' : 'friday_fast',
      gradient: ['#dfe3ec', '#9aa8bc'],
      foreground: '#1e1a16',
      subtitle,
      gregorianSubtitle,
      label: civilWeekday === 3 ? 'Wednesday fast' : 'Friday fast',
    };
  }

  if (wd === 0) return baseSunday;
  if (wd === 6) return baseSaturday;
  return baseWeekday;
}

/** Civil date + church calendar → local vestment / season appearance. */
export function getLiturgicalAppearanceForLocalDate(
  d: Date,
  liturgicalCalendar: PrimaryCalendar = 'julian',
  orthocalDay?: OrthocalDay | null,
): LiturgicalDayAppearance {
  const civil = civilPlainDateFromLocal(d);
  const liturgical = appearanceLiturgicalPlainDate(civil, liturgicalCalendar);
  const julian = gregorianPlainToJulianPlain(civil);
  const jdn = julianCalendarToJulianDayNumber(julian.year, julian.month, julian.day);
  let appearance = getLiturgicalDayAppearance(liturgical, jdn, d.getDay(), liturgicalCalendar);
  const civilReadable = formatGregorianReadable(civil, true);
  appearance = {
    ...appearance,
    subtitle: civilReadable,
    gregorianSubtitle: civilReadable,
  };
  if (orthocalDay && annunciationFeastNameFromOrthocal(orthocalDay)) {
    appearance = applyAnnunciationAppearance(appearance);
  }
  if (orthocalDay) {
    appearance = applyOrthocalFeastAppearance(appearance, orthocalDay);
  }
  return appearance;
}
