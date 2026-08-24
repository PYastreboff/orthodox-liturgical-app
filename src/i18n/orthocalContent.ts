import { translate } from './translate';
import type { UiLanguage } from './types';

import type { CalendarDayInfo } from '../lib/liturgical/calendarDayInfo';

/** Exact orthocal feast / commemoration titles → i18n key. */
const FEAST_KEY_BY_ENGLISH: Record<string, string> = {
  'Holy Pentecost': 'orthocalFeasts.holyPentecost',
  'Day of the Holy Spirit': 'orthocalFeasts.dayOfHolySpirit',
  'Third Day of the Trinity': 'orthocalFeasts.thirdDayOfTrinity',
  'Leavetaking of Ascension': 'orthocalFeasts.leavetakingAscension',
  'Memorial Saturday': 'orthocalFeasts.memorialSaturday',
  'Feast of the Holy Trinity': 'orthocalFeasts.holyTrinity',
  'Annunciation of the Theotokos': 'orthocalFeasts.annunciation',
  'Annunciation of the Mother of God': 'orthocalFeasts.annunciation',
  'Lazarus Saturday': 'appearance.lazarus_saturday',
  'Palm Sunday': 'orthocalFeasts.palmSunday',
  'Palm Sunday: Entrance of Our Lord into Jerusalem': 'orthocalFeasts.palmSunday',
  'Entry of the Lord into Jerusalem': 'orthocalFeasts.palmSunday',
  'Ascension of the Lord': 'orthocalFeasts.ascension',
  'The Ascension of Our Lord': 'orthocalFeasts.ascension',
  'Nativity of Christ': 'orthocalFeasts.nativity',
  'The Nativity of Christ': 'orthocalFeasts.nativity',
  'Theophany': 'orthocalFeasts.theophany',
  'The Baptism of the Lord': 'orthocalFeasts.theophany',
  'Transfiguration of the Lord': 'orthocalFeasts.transfiguration',
  'Dormition of the Theotokos': 'orthocalFeasts.dormition',
  'Exaltation of the Cross': 'orthocalFeasts.elevationCross',
  'Elevation of the Cross': 'orthocalFeasts.elevationCross',
  'Nativity of the Theotokos': 'orthocalFeasts.nativityTheotokos',
  'Presentation of the Lord': 'orthocalFeasts.presentation',
  'Meeting of the Lord': 'orthocalFeasts.presentation',
  'Saints Peter and Paul': 'orthocalFeasts.peterAndPaul',
  'Holy Apostles Peter and Paul': 'orthocalFeasts.peterAndPaul',
  'Great and Holy Tuesday': 'orthocalFeasts.holyTuesday',
  'Great and Holy Wednesday': 'orthocalFeasts.holyWednesday',
  'Great and Holy Thursday': 'orthocalFeasts.holyThursday',
  'Great and Holy Friday': 'orthocalFeasts.holyFriday',
  'Great and Holy Saturday': 'orthocalFeasts.holySaturday',
  'Protection of the Most Holy Theotokos': 'appearance.pokrov',
  'Protection of the Theotokos': 'appearance.pokrov',
  'Entry of the Most Holy Theotokos into the Temple': 'appearance.entry_theotokos',
  'Entrance of the Theotokos into the Temple': 'appearance.entry_theotokos',
  'Nativity of St John the Baptist': 'appearance.nativity_john_baptist',
  'Nativity of the Holy Glorious Prophet, Forerunner, and Baptist John':
    'appearance.nativity_john_baptist',
  'Beheading of the Holy Glorious Prophet, Forerunner, and Baptist John':
    'appearance.beheading_john_baptist',
  'Beheading of St John the Baptist': 'appearance.beheading_john_baptist',
  'Circumcision of Our Lord': 'appearance.circumcision',
  'Circumcision of Our Lord Jesus Christ': 'appearance.circumcision',
  'Circumcision of Our Lord; St Basil the Great': 'orthocalFeasts.circumcision',
  'Afterfeast of the Nativity of Christ': 'orthocalFeasts.afterfeastNativity',
  'Afterfeast of Theophany': 'orthocalFeasts.afterfeastTheophany',
  'Leavetaking of the Nativity of Christ': 'orthocalFeasts.leavetakingNativity',
  'Leavetaking of Theophany': 'orthocalFeasts.leavetakingTheophany',
  'Beginning of the Apostles Fast': 'appearance.apostles_fast',
  'Synaxis of the Most Holy Theotokos': 'orthocalFeasts.synaxisTheotokos',
  'Synaxis of the Archangel Michael': 'orthocalFeasts.synaxisMichael',
  'Forefeast of the Nativity of Christ': 'orthocalFeasts.forefeastNativity',
  'Forefeast of Theophany': 'orthocalFeasts.forefeastTheophany',
  'Great and Holy Monday': 'orthocalFeasts.holyMonday',
  Pascha: 'appearance.pascha',
  'Holy Pascha': 'appearance.pascha',
  'Bright Week': 'appearance.bright_week',
  Pentecost: 'appearance.pentecost',
  'All Saints': 'appearance.all_saints',
  'All Saints of America, All Saints of Russia': 'appearance.all_saints_russia',
  'All Saints of Russia': 'appearance.all_saints_russia',
  Nativity: 'appearance.nativity',
  Transfiguration: 'appearance.transfiguration',
  Dormition: 'appearance.dormition',
  Annunciation: 'appearance.annunciation',
  'Holy Week': 'appearance.holy_week',
  Sunday: 'appearance.sunday',
  Saturday: 'appearance.saturday',
  Weekday: 'appearance.weekday',
  'Great Lent': 'appearance.great_lent',
  'Lenten Fast': 'appearance.great_lent',
  'Dormition Fast': 'appearance.dormition_fast',
  'Nativity Fast': 'appearance.nativity_fast',
  'Apostles Fast': 'appearance.apostles_fast',
  "Apostles' Fast": 'appearance.apostles_fast',
  'Wednesday fast': 'appearance.wednesday_fast',
  'Friday fast': 'appearance.friday_fast',
};

type HonorificRule = { pattern: RegExp; replacement: string };

const HONORIFIC_RULES: Record<Exclude<UiLanguage, 'en'>, HonorificRule[]> = {
  ru: [
    { pattern: /\bHoly Equals-to-the-Apostles\b/gi, replacement: 'Св. равноап.' },
    { pattern: /\bEqual-to-the-Apostles\b/gi, replacement: 'Равноап.' },
    { pattern: /\bHoly Greatmartyr\b/gi, replacement: 'Св. вмч.' },
    { pattern: /\bGreatmartyr\b/gi, replacement: 'Вмч.' },
    { pattern: /\bHieromartyr\b/gi, replacement: 'Сщмч.' },
    { pattern: /\bHoly New Martyr\b/gi, replacement: 'Св. новомч.' },
    { pattern: /\bNew Martyr\b/gi, replacement: 'Новомч.' },
    { pattern: /\bHoly Martyrs\b/gi, replacement: 'Св. мученики' },
    { pattern: /\bHoly Martyr\b/gi, replacement: 'Св. мч.' },
    { pattern: /\bTrans\. Rel\. Ven\.\b/gi, replacement: 'Перен. мощей прп.' },
    { pattern: /\bTrans\. Rel\.\b/gi, replacement: 'Перен. мощей' },
    { pattern: /\bTranslation of the Relics\b/gi, replacement: 'Перенесение мощей' },
    { pattern: /\bRight-believing\b/gi, replacement: 'Благв.' },
    { pattern: /\bRighteous\b/gi, replacement: 'Прав.' },
    { pattern: /\bConfessor\b/gi, replacement: 'Исп.' },
    { pattern: /\bHierarch\b/gi, replacement: 'Свт.' },
    { pattern: /\bApostles\b/gi, replacement: 'Апостолы' },
    { pattern: /\bApostle\b/gi, replacement: 'Ап.' },
    { pattern: /\bVenerable\b/gi, replacement: 'Преп.' },
    { pattern: /\bVen\.\b/gi, replacement: 'Преп.' },
    { pattern: /\bSaint\b/gi, replacement: 'Св.' },
    { pattern: /\bSt\.\b/gi, replacement: 'Св.' },
    { pattern: /\bHoly\b/gi, replacement: 'Св.' },
    { pattern: /\bbishop\b/gi, replacement: 'еп.' },
    { pattern: /\bmetropolitan\b/gi, replacement: 'митр.' },
    { pattern: /\bpriest\b/gi, replacement: 'свящ.' },
    { pattern: /\bdeacon\b/gi, replacement: 'диак.' },
    { pattern: /\bof the Seventy\b/gi, replacement: 'из 70' },
    { pattern: /\bat Sofia\b/gi, replacement: 'в Софии' },
    { pattern: /\bof Constantinople\b/gi, replacement: 'Константинопольского' },
  ],
  el: [
    { pattern: /\bHoly Equals-to-the-Apostles\b/gi, replacement: 'Ἱσαπόστολος' },
    { pattern: /\bEqual-to-the-Apostles\b/gi, replacement: 'Ἱσαπόστολος' },
    { pattern: /\bHoly Greatmartyr\b/gi, replacement: 'Ἅγ. Μεγαλομάρτυς' },
    { pattern: /\bGreatmartyr\b/gi, replacement: 'Μεγαλομάρτυς' },
    { pattern: /\bHieromartyr\b/gi, replacement: 'Ἱερομάρτυς' },
    { pattern: /\bHoly New Martyr\b/gi, replacement: 'Ἅγ. Νεομάρτυς' },
    { pattern: /\bNew Martyr\b/gi, replacement: 'Νεομάρτυς' },
    { pattern: /\bHoly Martyrs\b/gi, replacement: 'Ἅγιοι Μάρτυρες' },
    { pattern: /\bHoly Martyr\b/gi, replacement: 'Ἅγ. Μάρτυς' },
    { pattern: /\bTrans\. Rel\. Ven\.\b/gi, replacement: 'Μετάθεσις λειψάνων ὁσ.' },
    { pattern: /\bTrans\. Rel\.\b/gi, replacement: 'Μετάθεσις λειψάνων' },
    { pattern: /\bTranslation of the Relics\b/gi, replacement: 'Μετάθεσις λειψάνων' },
    { pattern: /\bRight-believing\b/gi, replacement: 'Ευσεβής' },
    { pattern: /\bRighteous\b/gi, replacement: 'Δίκαιος' },
    { pattern: /\bConfessor\b/gi, replacement: 'Ὁμολογητής' },
    { pattern: /\bHierarch\b/gi, replacement: 'Ἱεράρχης' },
    { pattern: /\bApostles\b/gi, replacement: 'Απόστολοι' },
    { pattern: /\bApostle\b/gi, replacement: 'Απόσ.' },
    { pattern: /\bVenerable\b/gi, replacement: 'Όσιος' },
    { pattern: /\bVen\.\b/gi, replacement: 'Όσ.' },
    { pattern: /\bSaint\b/gi, replacement: 'Ἅγ.' },
    { pattern: /\bSt\.\b/gi, replacement: 'Ἅγ.' },
    { pattern: /\bHoly\b/gi, replacement: 'Ἅγ.' },
    { pattern: /\bbishop\b/gi, replacement: 'επ.' },
    { pattern: /\bmetropolitan\b/gi, replacement: 'μητρ.' },
    { pattern: /\bpriest\b/gi, replacement: 'ιερ.' },
    { pattern: /\bdeacon\b/gi, replacement: 'διάκ.' },
    { pattern: /\bof the Seventy\b/gi, replacement: 'τῶν 70' },
    { pattern: /\bat Sofia\b/gi, replacement: 'Σοφίας' },
    { pattern: /\bof Constantinople\b/gi, replacement: 'Κωνσταντινουπόλεως' },
  ],
};

function translateHonorifics(text: string, lang: UiLanguage): string {
  if (lang === 'en') return text;
  let out = text;
  for (const { pattern, replacement } of HONORIFIC_RULES[lang]) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

function translateExactFeast(text: string, lang: UiLanguage): string | null {
  const trimmed = text.trim();
  const key = FEAST_KEY_BY_ENGLISH[trimmed];
  if (key) {
    const translated = translate(lang, key);
    if (translated !== key) return translated;
  }
  return null;
}

/** Common Orthocal service_notes → i18n keys (English source strings). */
const SERVICE_NOTE_KEY_BY_ENGLISH: Record<string, string> = {
  'wine and oil allowed': 'fasting.exceptionWineOil',
  'fish, wine and oil allowed': 'fasting.exceptionFishWineOil',
  'fish, wine, and oil allowed': 'fasting.exceptionFishWineOil',
  'fish allowed': 'fasting.exceptionFish',
  'no liturgy': 'typikon.noLiturgy',
  'strict fast': 'fasting.levelStrict',
  'total fast': 'fasting.noteGoodFriday',
  'fast free': 'fasting.noFast',
  'fast-free': 'fasting.noFast',
};

function normalizeNoteFragment(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Localize orthocal feast / saint name for display (canonical source stays English). */
export function localizeOrthocalText(text: string, lang: UiLanguage): string {
  if (lang === 'en' || !text.trim()) return text;
  const exact = translateExactFeast(text, lang);
  if (exact) return exact;
  return translateHonorifics(text, lang);
}

/**
 * Localize Orthocal `service_notes` joined into one fasting/day note.
 * Exact phrase map first; otherwise honorific / feast rewrite of the prose.
 */
export function localizeServiceNotes(notes: string[], lang: UiLanguage): string {
  if (!notes.length) return '';
  if (lang === 'en') return notes.join(' ').trim();

  const localizedParts = notes.map((note) => {
    const trimmed = note.trim();
    if (!trimmed) return '';
    const key = SERVICE_NOTE_KEY_BY_ENGLISH[normalizeNoteFragment(trimmed)];
    if (key) {
      const translated = translate(lang, key);
      if (translated !== key) return translated;
    }
    return localizeOrthocalText(trimmed, lang);
  });
  return localizedParts.filter(Boolean).join(' ');
}

export function localizeOrthocalTexts(texts: string[], lang: UiLanguage): string[] {
  return texts.map((t) => localizeOrthocalText(t, lang));
}

export function localizeCalendarDayInfo(
  info: CalendarDayInfo,
  lang: UiLanguage,
): CalendarDayInfo {
  if (lang === 'en') return info;
  return {
    ...info,
    dayTitle: localizeOrthocalText(info.dayTitle, lang),
    feasts: localizeOrthocalTexts(info.feasts, lang),
    saints: localizeOrthocalTexts(info.saints, lang),
    greatFeastNames: localizeOrthocalTexts(info.greatFeastNames, lang),
  };
}

export function localizedAppearanceLabel(
  appearanceKey: string,
  fallback: string,
  lang: UiLanguage,
): string {
  const key = `appearance.${appearanceKey}`;
  const translated = translate(lang, key);
  if (translated !== key) return translated;
  return localizeOrthocalText(fallback, lang);
}

/**
 * English given names → RU/EL forms for calendar search.
 * Matched when the English name appears in the orthocal entry.
 */
const GIVEN_NAME_SEARCH_ALIASES: Record<string, string[]> = {
  nicholas: ['николай', 'николая', 'νικόλαος', 'νικολάου'],
  nicolas: ['николай', 'николая', 'νικόλαος', 'νικολάου'],
  george: ['георгий', 'георгия', 'γεώργιος', 'γεωργίου'],
  john: ['иоанн', 'иоанна', 'ιωάννης', 'ιωάννου'],
  mary: ['мария', 'марии', 'μαρία', 'μαρίας'],
  michael: ['михаил', 'михаила', 'μιχαήλ'],
  basil: ['василий', 'василия', 'βασίλειος', 'βασιλείου'],
  andrew: ['андрея', 'андрей', 'ανδρέας', 'ανδρέου'],
  peter: ['петр', 'пётр', 'петра', 'πέτρος', 'πέτρου'],
  paul: ['павел', 'павла', 'παύλος', 'παύλου'],
  sergius: ['сергий', 'сергия', 'σέργιος'],
  sergei: ['сергий', 'сергия'],
  demetrius: ['димитрий', 'дмитрий', 'δημήτριος', 'δημητρίου'],
  dmitri: ['димитрий', 'дмитрий'],
  anthony: ['антоний', 'антония', 'αντώνιος'],
  theodore: ['феодор', 'феодора', 'θεόδωρος'],
  timothy: ['тимофей', 'τιμόθεος'],
  luke: ['лука', 'λούκας'],
  mark: ['марк', 'μάρκος'],
  matthew: ['матфей', 'ματθαίος'],
  james: ['иаков', 'ιάκωβος'],
  joseph: ['иосиф', 'ιωσήφ'],
  stephen: ['стефан', 'στέφανος'],
  catherine: ['екатерина', 'αικατερίνη'],
  barbara: ['варвара', 'βαρβάρα'],
};

/**
 * Search haystacks for an orthocal name: English, localized display, and
 * common given-name aliases so RU/EL queries can match Latin orthocal text.
 */
export function searchHaystacksForName(name: string, lang: UiLanguage): string[] {
  const haystacks = new Set<string>([name]);
  if (lang !== 'en') {
    const localized = localizeOrthocalText(name, lang);
    if (localized) haystacks.add(localized);
  }

  const lower = name.toLowerCase();
  for (const [en, aliases] of Object.entries(GIVEN_NAME_SEARCH_ALIASES)) {
    if (!aliases.length) continue;
    if (!lower.includes(en)) continue;
    for (const alias of aliases) haystacks.add(alias);
    haystacks.add(`${name} ${aliases.join(' ')}`);
  }

  return [...haystacks];
}
