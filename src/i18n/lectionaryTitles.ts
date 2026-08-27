import { translate } from './translate';
import type { UiLanguage } from './types';

const WEEKDAY_KEY: Record<string, string> = {
  sunday: 'weekdaysLong.sunday',
  monday: 'weekdaysLong.monday',
  tuesday: 'weekdaysLong.tuesday',
  wednesday: 'weekdaysLong.wednesday',
  thursday: 'weekdaysLong.thursday',
  friday: 'weekdaysLong.friday',
  saturday: 'weekdaysLong.saturday',
};

const WORD_ORDINAL: Record<string, number> = {
  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
  fifth: 5,
  sixth: 6,
  seventh: 7,
  eighth: 8,
  ninth: 9,
  tenth: 10,
  eleventh: 11,
  twelfth: 12,
  thirteenth: 13,
  fourteenth: 14,
  fifteenth: 15,
  sixteenth: 16,
  seventeenth: 17,
  eighteenth: 18,
  nineteenth: 19,
  twentieth: 20,
  thirtieth: 30,
  fortieth: 40,
};

const WEEKDAY_RE = 'sunday|monday|tuesday|wednesday|thursday|friday|saturday';
const ORDINAL_RE = `${Object.keys(WORD_ORDINAL).join('|')}|\\d+(?:st|nd|rd|th)`;

function parseOrdinal(raw: string): number | null {
  const lower = raw.toLowerCase();
  if (WORD_ORDINAL[lower] != null) return WORD_ORDINAL[lower];
  const m = lower.match(/^(\d+)/);
  return m ? Number(m[1]) : null;
}

function weekdayLabel(lang: UiLanguage, english: string): string {
  const key = WEEKDAY_KEY[english.toLowerCase()];
  if (!key) return english;
  const translated = translate(lang, key);
  return translated === key ? english : translated;
}

function formatWeekOrdinal(lang: UiLanguage, n: number): string {
  if (lang === 'ru') return `${n}-й`;
  if (lang === 'el') return `${n}η`;
  if (n % 10 === 1 && n % 100 !== 11) return `${n}st`;
  if (n % 10 === 2 && n % 100 !== 12) return `${n}nd`;
  if (n % 10 === 3 && n % 100 !== 13) return `${n}rd`;
  return `${n}th`;
}

function formatSundayOrdinal(lang: UiLanguage, n: number): string {
  if (lang === 'ru') return `${n}-е`;
  if (lang === 'el') return `${n}η`;
  return formatWeekOrdinal(lang, n);
}

type LocalizeFeastFn = (text: string, lang: UiLanguage) => string;

/**
 * Translate Orthocal lectionary day titles such as
 * "Thursday of the 13th week after Pentecost".
 * Returns null when the string is not a known lectionary pattern.
 */
export function localizeLectionaryTitle(
  text: string,
  lang: UiLanguage,
  localizeFeast: LocalizeFeastFn,
): string | null {
  if (lang === 'en') return null;
  const trimmed = text.trim().replace(/[.;]+$/g, '');
  if (!trimmed) return null;

  let m: RegExpMatchArray | null;

  m = trimmed.match(
    new RegExp(
      `^(${WEEKDAY_RE})\\s+of\\s+the\\s+(${ORDINAL_RE})\\s+week\\s+after\\s+pentecost$`,
      'i',
    ),
  );
  if (m) {
    const n = parseOrdinal(m[2]!);
    if (n == null) return null;
    return translate(lang, 'lectionary.weekdayOfNthWeekAfterPentecost', {
      weekday: weekdayLabel(lang, m[1]!),
      n: formatWeekOrdinal(lang, n),
    });
  }

  m = trimmed.match(
    new RegExp(
      `^(${WEEKDAY_RE})\\s+of\\s+the\\s+(${ORDINAL_RE})\\s+sunday\\s+after\\s+pentecost$`,
      'i',
    ),
  );
  if (m) {
    const n = parseOrdinal(m[2]!);
    if (n == null) return null;
    return translate(lang, 'lectionary.weekdayOfNthSundayAfterPentecost', {
      weekday: weekdayLabel(lang, m[1]!),
      n: formatWeekOrdinal(lang, n),
    });
  }

  m = trimmed.match(
    new RegExp(
      `^(${WEEKDAY_RE})\\s+of\\s+the\\s+(${ORDINAL_RE})\\s+week\\s+after\\s+pascha$`,
      'i',
    ),
  );
  if (m) {
    const n = parseOrdinal(m[2]!);
    if (n == null) return null;
    return translate(lang, 'lectionary.weekdayOfNthWeekAfterPascha', {
      weekday: weekdayLabel(lang, m[1]!),
      n: formatWeekOrdinal(lang, n),
    });
  }

  m = trimmed.match(
    new RegExp(
      `^(${WEEKDAY_RE})\\s+of\\s+the\\s+(${ORDINAL_RE})\\s+sunday\\s+of\\s+pascha$`,
      'i',
    ),
  );
  if (m) {
    const n = parseOrdinal(m[2]!);
    if (n == null) return null;
    return translate(lang, 'lectionary.weekdayOfNthSundayOfPascha', {
      weekday: weekdayLabel(lang, m[1]!),
      n: formatWeekOrdinal(lang, n),
    });
  }

  m = trimmed.match(new RegExp(`^(${ORDINAL_RE})\\s+sunday\\s+of\\s+pascha$`, 'i'));
  if (m) {
    const n = parseOrdinal(m[1]!);
    if (n == null) return null;
    return translate(lang, 'lectionary.nthSundayOfPascha', {
      n: formatSundayOrdinal(lang, n),
    });
  }

  m = trimmed.match(new RegExp(`^(${ORDINAL_RE})\\s+sunday\\s+after\\s+pentecost$`, 'i'));
  if (m) {
    const n = parseOrdinal(m[1]!);
    if (n == null) return null;
    return translate(lang, 'lectionary.nthSundayAfterPentecost', {
      n: formatSundayOrdinal(lang, n),
    });
  }

  m = trimmed.match(
    new RegExp(
      `^(${WEEKDAY_RE})\\s+of\\s+the\\s+(${ORDINAL_RE})\\s+week\\s+of\\s+(?:great\\s+)?lent$`,
      'i',
    ),
  );
  if (m) {
    const n = parseOrdinal(m[2]!);
    if (n == null) return null;
    return translate(lang, 'lectionary.weekdayOfNthWeekOfLent', {
      weekday: weekdayLabel(lang, m[1]!),
      n: formatWeekOrdinal(lang, n),
    });
  }

  m = trimmed.match(new RegExp(`^(${WEEKDAY_RE})\\s+of\\s+meatfare$`, 'i'));
  if (m) {
    return translate(lang, 'lectionary.weekdayOfMeatfare', {
      weekday: weekdayLabel(lang, m[1]!),
    });
  }

  m = trimmed.match(new RegExp(`^(${WEEKDAY_RE})\\s+of\\s+cheesefare$`, 'i'));
  if (m) {
    return translate(lang, 'lectionary.weekdayOfCheesefare', {
      weekday: weekdayLabel(lang, m[1]!),
    });
  }

  m = trimmed.match(new RegExp(`^(${WEEKDAY_RE})\\s+of\\s+bright\\s+week$`, 'i'));
  if (m) {
    return translate(lang, 'lectionary.weekdayOfBrightWeek', {
      weekday: weekdayLabel(lang, m[1]!),
    });
  }

  m = trimmed.match(new RegExp(`^(${WEEKDAY_RE})\\s+of\\s+holy\\s+week$`, 'i'));
  if (m) {
    return translate(lang, 'lectionary.weekdayOfHolyWeek', {
      weekday: weekdayLabel(lang, m[1]!),
    });
  }

  m = trimmed.match(new RegExp(`^(${WEEKDAY_RE})\\s+after\\s+(.+)$`, 'i'));
  if (m) {
    const feast = localizeFeast(m[2]!.trim(), lang);
    return translate(lang, 'lectionary.weekdayAfterFeast', {
      weekday: weekdayLabel(lang, m[1]!),
      feast,
    });
  }

  m = trimmed.match(new RegExp(`^(${WEEKDAY_RE})\\s+before\\s+(.+)$`, 'i'));
  if (m) {
    const feast = localizeFeast(m[2]!.trim(), lang);
    return translate(lang, 'lectionary.weekdayBeforeFeast', {
      weekday: weekdayLabel(lang, m[1]!),
      feast,
    });
  }

  m = trimmed.match(new RegExp(`^cheesefare\\s+(${WEEKDAY_RE})$`, 'i'));
  if (m) {
    return translate(lang, 'lectionary.cheesefareWeekday', {
      weekday: weekdayLabel(lang, m[1]!),
    });
  }

  m = trimmed.match(new RegExp(`^(${ORDINAL_RE})\\s+saturday\\s+of\\s+lent$`, 'i'));
  if (m) {
    const n = parseOrdinal(m[1]!);
    if (n == null) return null;
    return translate(lang, 'lectionary.nthSaturdayOfLent', {
      n: formatWeekOrdinal(lang, n),
    });
  }

  m = trimmed.match(new RegExp(`^sunday\\s+of\\s+the\\s+forefathers$`, 'i'));
  if (m) {
    return translate(lang, 'orthocalFeasts.sundayForefathers');
  }

  return null;
}
