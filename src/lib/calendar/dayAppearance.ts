import type { PlainDate } from './julianGregorian';
import {
  gregorianPlainToJulianPlain,
  julianCalendarToGregorian,
  julianCalendarToJulianDayNumber,
} from './julianGregorian';
import { formatGregorianReadable, formatJulianReadable } from './formatDate';
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

/** Weekday from Julian date: 0 = Sunday … 6 = Saturday (local civil calendar bridge). */
function weekdayFromJulian(j: PlainDate): number {
  const g = julianCalendarToGregorian(j.year, j.month, j.day);
  return new Date(g.year, g.month - 1, g.day).getDay();
}

function sameJulian(a: PlainDate, b: PlainDate): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

/**
 * Approximate liturgical colours for the Russian Orthodox **Julian** calendar,
 * relative to Pascha and a few fixed feasts. Replace with SQLite pack data when available.
 */
export function getLiturgicalDayAppearance(julian: PlainDate, jdn: number): LiturgicalDayAppearance {
  const y = julian.year;
  const pascha = orthodoxPaschaJdn(y);
  const cleanMonday = pascha - 48;
  const palmSunday = pascha - 7;
  const holySaturday = pascha - 1;
  const brightEnd = pascha + 7;
  const pentecost = pascha + 49;
  const allSaintsSunday = pascha + 56;
  const apostlesFastMonday = pascha + 57;
  const stPeter = jdnForJulian(y, 6, 29);

  const wd = weekdayFromJulian(julian);

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

  const g = julianCalendarToGregorian(julian.year, julian.month, julian.day);
  const subtitle = formatJulianReadable(julian, true);
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

  if (sameJulian(julian, nativity)) {
    return {
      key: 'nativity',
      gradient: ['#fff9f0', '#d8b892'],
      foreground: '#1e1a16',
      subtitle,
    gregorianSubtitle,
      label: 'Nativity',
    };
  }

  if (sameJulian(julian, theophany)) {
    return {
      key: 'theophany',
      gradient: ['#3d5a80', '#1a2a40'],
      foreground: '#f2f7ff',
      subtitle,
    gregorianSubtitle,
      label: 'Theophany',
    };
  }

  if (sameJulian(julian, annunciation)) {
    return {
      key: 'annunciation',
      gradient: ['#355a8a', '#1c2f4a'],
      foreground: '#eef4ff',
      subtitle,
    gregorianSubtitle,
      label: 'Annunciation',
    };
  }

  if (sameJulian(julian, transfiguration)) {
    return {
      key: 'transfiguration',
      gradient: ['#f6f0e4', '#d4b56a'],
      foreground: '#1e1a16',
      subtitle,
    gregorianSubtitle,
      label: 'Transfiguration',
    };
  }

  if (sameJulian(julian, dormition)) {
    return {
      key: 'dormition',
      gradient: ['#3a5680', '#1a2538'],
      foreground: '#f0f4fc',
      subtitle,
    gregorianSubtitle,
      label: 'Dormition',
    };
  }

  if (sameJulian(julian, elevationCross)) {
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

  if (isWeeklyFastDay(jdn, wd, y)) {
    return {
      key: wd === 3 ? 'wednesday_fast' : 'friday_fast',
      gradient: ['#dfe3ec', '#9aa8bc'],
      foreground: '#1e1a16',
      subtitle,
      gregorianSubtitle,
      label: wd === 3 ? 'Wednesday fast' : 'Friday fast',
    };
  }

  if (wd === 0) return baseSunday;
  if (wd === 6) return baseSaturday;
  return baseWeekday;
}

/** Convenience: civil `Date` (local) → appearance from its Julian liturgical date. */
export function getLiturgicalAppearanceForLocalDate(d: Date): LiturgicalDayAppearance {
  const g: PlainDate = { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
  const julian = gregorianPlainToJulianPlain(g);
  const jdn = julianCalendarToJulianDayNumber(julian.year, julian.month, julian.day);
  return getLiturgicalDayAppearance(julian, jdn);
}
