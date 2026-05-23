import type { PlainDate } from './julianGregorian';
import {
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

/** Weekday for a liturgical plain date: 0 = Sunday … 6 = Saturday. */
function weekdayFromPlain(p: PlainDate): number {
  return new Date(p.year, p.month - 1, p.day).getDay();
}

function sameLiturgicalDate(a: PlainDate, b: PlainDate): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

/**
 * Approximate liturgical colours for the Russian Orthodox **Julian** calendar,
 * relative to Pascha and a few fixed feasts. Replace with SQLite pack data when available.
 */
export function getLiturgicalDayAppearance(
  liturgical: PlainDate,
  jdn: number,
  /** Civil (Gregorian) weekday for the day being viewed — used for Wed/Fri fast styling. */
  civilWeekday: number,
): LiturgicalDayAppearance {
  const y = liturgical.year;
  const pascha = orthodoxPaschaJdn(y);
  const cleanMonday = pascha - 48;
  const palmSunday = pascha - 7;
  const holySaturday = pascha - 1;
  const brightEnd = pascha + 7;
  const pentecost = pascha + 49;
  const allSaintsSunday = pascha + 56;
  const apostlesFastMonday = pascha + 57;
  const stPeter = jdnForJulian(y, 6, 29);

  const wd = weekdayFromPlain(liturgical);

  const inHolyWeek = jdn >= palmSunday && jdn <= holySaturday;
  const inBrightWeek = jdn >= pascha && jdn <= brightEnd;
  const inGreatLent = jdn >= cleanMonday && jdn < palmSunday;
  const inApostlesFast = jdn >= apostlesFastMonday && jdn < stPeter;

  const aug1 = jdnForJulian(y, 8, 1);
  const aug14 = jdnForJulian(y, 8, 14);
  const inDormitionFast = jdn >= aug1 && jdn <= aug14;

  const nov15 = jdnForJulian(y, 11, 15);
  const dec24 = jdnForJulian(y, 12, 24);
  const inNativityFast = jdn >= nov15 && jdn <= dec24;

  const nativity = { year: y, month: 12, day: 25 } satisfies PlainDate;
  const theophany = { year: y, month: 1, day: 6 } satisfies PlainDate;
  const annunciation = { year: y, month: 3, day: 25 } satisfies PlainDate;
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

  if (inHolyWeek) {
    return {
      key: 'holy_week',
      gradient: ['#4a1520', '#120508'],
      foreground: '#fceff2',
      subtitle,
    gregorianSubtitle,
      label: 'Holy Week',
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

  if (jdn === allSaintsSunday) {
    return {
      key: 'all_saints',
      gradient: ['#f2efe6', '#c6a86a'],
      foreground: '#1e1a16',
      subtitle,
    gregorianSubtitle,
      label: 'All Saints',
    };
  }

  if (sameLiturgicalDate(liturgical, nativity)) {
    return {
      key: 'nativity',
      gradient: ['#fff9f0', '#d8b892'],
      foreground: '#1e1a16',
      subtitle,
    gregorianSubtitle,
      label: 'Nativity',
    };
  }

  if (sameLiturgicalDate(liturgical, theophany)) {
    return {
      key: 'theophany',
      gradient: ['#3d5a80', '#1a2a40'],
      foreground: '#f2f7ff',
      subtitle,
    gregorianSubtitle,
      label: 'Theophany',
    };
  }

  if (sameLiturgicalDate(liturgical, annunciation)) {
    return {
      key: 'annunciation',
      gradient: ['#355a8a', '#1c2f4a'],
      foreground: '#eef4ff',
      subtitle,
    gregorianSubtitle,
      label: 'Annunciation',
    };
  }

  if (sameLiturgicalDate(liturgical, transfiguration)) {
    return {
      key: 'transfiguration',
      gradient: ['#f6f0e4', '#d4b56a'],
      foreground: '#1e1a16',
      subtitle,
    gregorianSubtitle,
      label: 'Transfiguration',
    };
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
    return {
      key: 'elevation_cross',
      gradient: ['#4a2a58', '#1a0f24'],
      foreground: '#f6ecff',
      subtitle,
    gregorianSubtitle,
      label: 'Elevation of the Cross',
    };
  }

  if (inDormitionFast) {
    return {
      key: 'dormition_fast',
      gradient: ['#243548', '#0f141f'],
      foreground: '#e8eef8',
      subtitle,
    gregorianSubtitle,
      label: 'Dormition Fast',
    };
  }

  if (inNativityFast) {
    return {
      key: 'nativity_fast',
      gradient: ['#252c44', '#0e111c'],
      foreground: '#e8ecfc',
      subtitle,
    gregorianSubtitle,
      label: 'Nativity Fast',
    };
  }

  if (inApostlesFast) {
    return {
      key: 'apostles_fast',
      gradient: ['#2a2838', '#14121c'],
      foreground: '#ebe8f4',
      subtitle,
    gregorianSubtitle,
      label: 'Apostles’ Fast',
    };
  }

  if (inGreatLent) {
    if (wd === 0) {
      return {
        key: 'lent_sunday',
        gradient: ['#6a3a48', '#2a1218'],
        foreground: '#fdf5f7',
        subtitle,
    gregorianSubtitle,
        label: 'Lent · Sunday',
      };
    }
    if (wd === 6) {
      return {
        key: 'lent_saturday',
        gradient: ['#352040', '#140a1c'],
        foreground: '#f3ecfc',
        subtitle,
    gregorianSubtitle,
        label: 'Lent · Saturday',
      };
    }
    return {
      key: 'great_lent',
      gradient: ['#3d2440', '#150a18'],
      foreground: '#f7eef8',
      subtitle,
    gregorianSubtitle,
      label: 'Great Lent',
    };
  }

  if (isWeeklyFastDay(jdn, civilWeekday, y)) {
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
): LiturgicalDayAppearance {
  const civil = civilPlainDateFromLocal(d);
  const liturgical = appearanceLiturgicalPlainDate(civil, liturgicalCalendar);
  const julian = gregorianPlainToJulianPlain(civil);
  const jdn = julianCalendarToJulianDayNumber(julian.year, julian.month, julian.day);
  const appearance = getLiturgicalDayAppearance(liturgical, jdn, d.getDay());
  const civilReadable = formatGregorianReadable(civil, true);
  return {
    ...appearance,
    subtitle: civilReadable,
    gregorianSubtitle: civilReadable,
  };
}
