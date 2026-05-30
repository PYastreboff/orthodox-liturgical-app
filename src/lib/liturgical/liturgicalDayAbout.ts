import type { OrthocalDay } from '../api/orthocal';
import type { LiturgicalDayAppearance } from '../calendar/dayAppearance';
import { translate } from '../../i18n/translate';
import type { UiLanguage } from '../../i18n/types';
import type { CommemorationEntry } from './commemorations';

const MAJOR_FEAST_BY_APPEARANCE: Record<string, string> = {
  nativity: 'dayAbout.majorFeast.nativity',
  theophany: 'dayAbout.majorFeast.theophany',
  annunciation: 'dayAbout.majorFeast.annunciation',
  palm_sunday: 'dayAbout.majorFeast.palmSunday',
  pascha: 'dayAbout.majorFeast.pascha',
  pentecost: 'dayAbout.majorFeast.pentecost',
  transfiguration: 'dayAbout.majorFeast.transfiguration',
  dormition: 'dayAbout.majorFeast.dormition',
  elevation_cross: 'dayAbout.majorFeast.elevationCross',
};

const MAJOR_FEAST_BY_NAME: { pattern: RegExp; key: string }[] = [
  { pattern: /\bascension\b/i, key: 'dayAbout.majorFeast.ascension' },
  {
    pattern: /\bnativity of (?:the )?(?:holy )?theotokos\b|\bmother of god\b.*\bnativity\b/i,
    key: 'dayAbout.majorFeast.nativityTheotokos',
  },
  {
    pattern: /\bpeter and paul\b|\bapostles peter\b|\bleaders of the apostles\b/i,
    key: 'dayAbout.majorFeast.peterAndPaul',
  },
  {
    pattern: /\bpresentation of (?:the )?(?:lord|christ)\b|\bmeeting of (?:the )?lord\b/i,
    key: 'dayAbout.majorFeast.presentation',
  },
  {
    pattern: /\bexaltation of (?:the )?(?:holy )?cross\b|\belevation of (?:the )?cross\b/i,
    key: 'dayAbout.majorFeast.elevationCross',
  },
];

const SEASON_BY_APPEARANCE: Record<string, string> = {
  bright_week: 'dayAbout.season.brightWeek',
  holy_week: 'dayAbout.season.holyWeek',
  great_friday: 'dayAbout.season.greatFriday',
  holy_saturday: 'dayAbout.season.holySaturday',
  great_lent: 'dayAbout.season.greatLent',
  lent_sunday: 'dayAbout.season.lentSunday',
  lent_saturday: 'dayAbout.season.lentSaturday',
  dormition_fast: 'dayAbout.season.dormitionFast',
  nativity_fast: 'dayAbout.season.nativityFast',
  apostles_fast: 'dayAbout.season.apostlesFast',
  wednesday_fast: 'dayAbout.season.wednesdayFast',
  friday_fast: 'dayAbout.season.fridayFast',
  all_saints: 'dayAbout.season.allSaints',
};

function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}

function namesMatch(a: string, b: string): boolean {
  const left = normalizeName(a);
  const right = normalizeName(b);
  if (!left || !right) return false;
  return left === right || left.includes(right) || right.includes(left);
}

function curatedMajorFeastText(
  appearanceKey: string,
  feastTitle: string,
  lang: UiLanguage,
): string | null {
  const byAppearance = MAJOR_FEAST_BY_APPEARANCE[appearanceKey];
  if (byAppearance) return translate(lang, byAppearance);

  for (const { pattern, key } of MAJOR_FEAST_BY_NAME) {
    if (pattern.test(feastTitle)) return translate(lang, key);
  }
  return null;
}

function storyBodyForTitle(
  title: string,
  feasts: CommemorationEntry[],
  saints: CommemorationEntry[],
): string | undefined {
  const trimmed = title.trim();
  if (!trimmed) return undefined;

  for (const entry of feasts) {
    if (namesMatch(entry.name, trimmed) && entry.body?.trim()) {
      return entry.body.trim();
    }
  }
  for (const entry of saints) {
    if (namesMatch(entry.name, trimmed) && entry.body?.trim()) {
      return entry.body.trim();
    }
  }
  return undefined;
}

function leadParagraph(text: string, maxLen = 520): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLen) return normalized;
  const cut = normalized.slice(0, maxLen);
  const lastSentence = cut.lastIndexOf('. ');
  if (lastSentence >= 160) return cut.slice(0, lastSentence + 1);
  return `${cut.trimEnd()}…`;
}

function toneNumber(day: OrthocalDay | null, toneLabel: string): number | null {
  if (day && day.tone >= 1 && day.tone <= 8) return day.tone;
  const match = toneLabel.match(/(\d)/);
  return match ? Number(match[1]) : null;
}

function ordinaryDayText(
  day: OrthocalDay | null,
  appearanceKey: string,
  dayTitle: string,
  toneLabel: string,
  lang: UiLanguage,
): string {
  const seasonKey = SEASON_BY_APPEARANCE[appearanceKey];
  if (seasonKey) {
    return translate(lang, seasonKey, { title: dayTitle, tone: toneLabel });
  }

  const tone = toneNumber(day, toneLabel);
  const isSunday =
    appearanceKey === 'sunday' ||
    appearanceKey === 'lent_sunday' ||
    day?.weekday === 0;

  if (isSunday) {
    return translate(lang, 'dayAbout.ordinary.sunday', {
      title: dayTitle,
      tone: tone ?? toneLabel,
    });
  }

  return translate(lang, 'dayAbout.ordinary.weekday', { title: dayTitle });
}

export function buildLiturgicalDayAbout(input: {
  day: OrthocalDay | null;
  appearance: LiturgicalDayAppearance;
  dayTitle: string;
  feastsHighlightTitle: string;
  isMajorFeastDay: boolean;
  toneLabel: string;
  feasts: CommemorationEntry[];
  saints: CommemorationEntry[];
  lang: UiLanguage;
}): string {
  const {
    day,
    appearance,
    dayTitle,
    feastsHighlightTitle,
    isMajorFeastDay,
    toneLabel,
    feasts,
    saints,
    lang,
  } = input;

  const feastTitle = feastsHighlightTitle.trim() || dayTitle.trim();

  if (isMajorFeastDay) {
    const curated =
      curatedMajorFeastText(appearance.key, feastTitle, lang) ??
      curatedMajorFeastText(appearance.key, dayTitle, lang);
    if (curated) return curated;

    const orthocalStory =
      storyBodyForTitle(feastTitle, feasts, saints) ??
      storyBodyForTitle(dayTitle, feasts, saints);
    if (orthocalStory) return leadParagraph(orthocalStory);

    return translate(lang, 'dayAbout.majorFeast.generic', { title: feastTitle });
  }

  return ordinaryDayText(day, appearance.key, dayTitle, toneLabel, lang);
}
