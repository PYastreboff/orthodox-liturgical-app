import { localizeLectionaryTitle } from './lectionaryTitles';
import { translate } from './translate';
import type { UiLanguage } from './types';

import type { CalendarDayInfo } from '../lib/liturgical/calendarDayInfo';

/**
 * Exact Orthocal English feast / day titles → i18n key.
 * Matching is case-insensitive and hyphen-normalized (see normalizeTitleKey).
 */
const FEAST_KEY_BY_ENGLISH: Record<string, string> = {
  // Pascha / Bright Week
  Pascha: 'appearance.pascha',
  'Holy Pascha': 'appearance.pascha',
  'The Resurrection of our Lord and Savior Jesus Christ': 'appearance.pascha',
  'The Resurrection of our Lord and Saviour Jesus Christ': 'appearance.pascha',
  'Bright Week': 'appearance.bright_week',
  'Bright Monday': 'orthocalFeasts.brightMonday',
  'Bright Tuesday': 'orthocalFeasts.brightTuesday',
  'Bright Wednesday': 'orthocalFeasts.brightWednesday',
  'Bright Thursday': 'orthocalFeasts.brightThursday',
  'Bright Friday': 'orthocalFeasts.brightFriday',
  'Bright Saturday': 'orthocalFeasts.brightSaturday',

  // Holy Week
  'Lazarus Saturday': 'appearance.lazarus_saturday',
  'Palm Sunday': 'orthocalFeasts.palmSunday',
  'Palm Sunday: Entrance of Our Lord into Jerusalem': 'orthocalFeasts.palmSunday',
  'Entry of the Lord into Jerusalem': 'orthocalFeasts.palmSunday',
  'Entrance of Our Lord into Jerusalem': 'orthocalFeasts.palmSunday',
  'Holy Week': 'appearance.holy_week',
  'Great and Holy Monday': 'orthocalFeasts.holyMonday',
  'Holy Monday': 'orthocalFeasts.holyMonday',
  'Great and Holy Tuesday': 'orthocalFeasts.holyTuesday',
  'Holy Tuesday': 'orthocalFeasts.holyTuesday',
  'Great and Holy Wednesday': 'orthocalFeasts.holyWednesday',
  'Holy Wednesday': 'orthocalFeasts.holyWednesday',
  'Great and Holy Thursday': 'orthocalFeasts.holyThursday',
  'Holy Thursday': 'orthocalFeasts.holyThursday',
  'Maundy Thursday': 'orthocalFeasts.holyThursday',
  'Great and Holy Friday': 'orthocalFeasts.holyFriday',
  'Good Friday': 'orthocalFeasts.holyFriday',
  'Great and Holy Saturday': 'orthocalFeasts.holySaturday',
  'Holy Saturday': 'orthocalFeasts.holySaturday',

  // Twelve Great Feasts (+ common Orthocal spellings)
  'Nativity of Christ': 'orthocalFeasts.nativity',
  'The Nativity of Christ': 'orthocalFeasts.nativity',
  Nativity: 'appearance.nativity',
  Theophany: 'orthocalFeasts.theophany',
  'The Baptism of the Lord': 'orthocalFeasts.theophany',
  'Theophany of Our Lord and Savior Jesus Christ': 'orthocalFeasts.theophany',
  'Theophany of Our Lord and Saviour Jesus Christ': 'orthocalFeasts.theophany',
  'Presentation of the Lord': 'orthocalFeasts.presentation',
  'Meeting of the Lord': 'orthocalFeasts.presentation',
  'Meeting of Christ in the Temple': 'orthocalFeasts.presentation',
  'Annunciation of the Theotokos': 'orthocalFeasts.annunciation',
  'Annunciation of the Mother of God': 'orthocalFeasts.annunciation',
  'Annunciation Most Holy Theotokos': 'orthocalFeasts.annunciation',
  'Annunciation of the Most-Holy Theotokos': 'orthocalFeasts.annunciation',
  'Annunciation of the Most Holy Theotokos': 'orthocalFeasts.annunciation',
  Annunciation: 'appearance.annunciation',
  'Transfiguration of the Lord': 'orthocalFeasts.transfiguration',
  'Transfiguration of Our Lord': 'orthocalFeasts.transfiguration',
  'Transfiguration of Our Lord and Savior Jesus Christ': 'orthocalFeasts.transfiguration',
  Transfiguration: 'appearance.transfiguration',
  'Dormition of the Theotokos': 'orthocalFeasts.dormition',
  'Dormition of the Most-Holy Theotokos': 'orthocalFeasts.dormition',
  'Dormition of the Most Holy Theotokos': 'orthocalFeasts.dormition',
  Dormition: 'appearance.dormition',
  'Exaltation of the Cross': 'orthocalFeasts.elevationCross',
  'Elevation of the Cross': 'orthocalFeasts.elevationCross',
  'Exaltation (Elevation) of the Precious Cross': 'orthocalFeasts.elevationCross',
  'Elevation of the Precious Cross': 'orthocalFeasts.elevationCross',
  'Nativity of the Theotokos': 'orthocalFeasts.nativityTheotokos',
  'Nativity of the Most-Holy Theotokos': 'orthocalFeasts.nativityTheotokos',
  'Nativity of the Most Holy Theotokos': 'orthocalFeasts.nativityTheotokos',
  'Entry of the Most Holy Theotokos into the Temple': 'appearance.entry_theotokos',
  'Entry of the Most-Holy Theotokos into the Temple': 'appearance.entry_theotokos',
  'Entrance of the Theotokos into the Temple': 'appearance.entry_theotokos',
  'Entrance of the Most-Holy Theotokos into the Temple': 'appearance.entry_theotokos',
  'Ascension of the Lord': 'orthocalFeasts.ascension',
  'The Ascension of Our Lord': 'orthocalFeasts.ascension',
  'The Ascension of our Lord, God, and Saviour Jesus Christ': 'orthocalFeasts.ascension',
  'The Ascension of our Lord, God, and Savior Jesus Christ': 'orthocalFeasts.ascension',
  Ascension: 'appearance.ascension',
  'Holy Pentecost': 'orthocalFeasts.holyPentecost',
  Pentecost: 'appearance.pentecost',
  'Feast of the Holy Trinity': 'orthocalFeasts.holyTrinity',
  '8th Sunday of Pascha: Feast of the Holy Trinity': 'orthocalFeasts.holyTrinity',

  // Synaxes / John the Baptist / Pokrov / Peter & Paul
  'Synaxis of the Most Holy Theotokos': 'orthocalFeasts.synaxisTheotokos',
  'Synaxis of the Most-Holy Theotokos': 'orthocalFeasts.synaxisTheotokos',
  'Synaxis of the Archangel Michael': 'orthocalFeasts.synaxisMichael',
  'Synaxis of Archangel Michael and the Bodiless Powers': 'orthocalFeasts.synaxisMichael',
  'Synaxis of the Archangel Michael and the Other Bodiless Powers': 'orthocalFeasts.synaxisMichael',
  'Synaxis of St John the Baptist': 'orthocalFeasts.synaxisJohnBaptist',
  'Synaxis of the Holy Glorious Prophet, Forerunner and Baptist John':
    'orthocalFeasts.synaxisJohnBaptist',
  'Nativity of St John the Baptist': 'appearance.nativity_john_baptist',
  'Nativity of the Holy Glorious Prophet, Forerunner, and Baptist John':
    'appearance.nativity_john_baptist',
  'Beheading of St John the Baptist': 'appearance.beheading_john_baptist',
  'Beheading of the Holy Glorious Prophet, Forerunner, and Baptist John':
    'appearance.beheading_john_baptist',
  'Protection of the Most Holy Theotokos': 'appearance.pokrov',
  'Protection of the Theotokos': 'appearance.pokrov',
  'Protection (Pokrov) of the Most-Holy Theotokos': 'appearance.pokrov',
  'Protection (Pokrov) of the Most Holy Theotokos': 'appearance.pokrov',
  'Saints Peter and Paul': 'orthocalFeasts.peterAndPaul',
  'Holy Apostles Peter and Paul': 'orthocalFeasts.peterAndPaul',
  'Circumcision of Our Lord': 'appearance.circumcision',
  'Circumcision of Our Lord Jesus Christ': 'appearance.circumcision',
  'Circumcision of Our Lord; St Basil the Great': 'orthocalFeasts.circumcision',

  // Forefeasts / afterfeasts / leavetakings / eves
  'Forefeast of the Nativity of Christ': 'orthocalFeasts.forefeastNativity',
  'Forefeast of Theophany': 'orthocalFeasts.forefeastTheophany',
  'Forefeast of Annunciation': 'orthocalFeasts.forefeastAnnunciation',
  'Forefeast of Transfiguration': 'orthocalFeasts.forefeastTransfiguration',
  'Forefeast of Dormition': 'orthocalFeasts.forefeastDormition',
  'Forefeast of the Elevation of the Cross': 'orthocalFeasts.forefeastElevationCross',
  'Afterfeast of the Nativity of Christ': 'orthocalFeasts.afterfeastNativity',
  'Afterfeast of Theophany': 'orthocalFeasts.afterfeastTheophany',
  'Afterfeast of Transfiguration': 'orthocalFeasts.afterfeastTransfiguration',
  'Afterfeast of Dormition': 'orthocalFeasts.afterfeastDormition',
  'Afterfeast of the Elevation of the Cross': 'orthocalFeasts.afterfeastElevationCross',
  'Leavetaking of the Nativity of Christ': 'orthocalFeasts.leavetakingNativity',
  'Leavetaking of the Nativity': 'orthocalFeasts.leavetakingNativity',
  'Leavetaking of Theophany': 'orthocalFeasts.leavetakingTheophany',
  'Leavetaking of Ascension': 'orthocalFeasts.leavetakingAscension',
  'Leavetaking of Meeting': 'orthocalFeasts.leavetakingMeeting',
  'Leavetaking of Transfiguration': 'orthocalFeasts.leavetakingTransfiguration',
  'Leavetaking of Dormition': 'orthocalFeasts.leavetakingDormition',
  'Eve of Nativity': 'orthocalFeasts.eveNativity',
  'Eve of the Nativity of Christ': 'orthocalFeasts.eveNativity',
  'Eve of Theophany': 'orthocalFeasts.eveTheophany',
  'Midfeast of Pentecost': 'orthocalFeasts.midfeastPentecost',
  'Day of the Holy Spirit': 'orthocalFeasts.dayOfHolySpirit',
  'Third Day of the Trinity': 'orthocalFeasts.thirdDayOfTrinity',
  'Beginning of the Apostles Fast': 'appearance.apostles_fast',
  'Beginning of the Lenten Triodion': 'orthocalFeasts.beginningTriodion',
  'Beginning of the Pentecostarion': 'orthocalFeasts.beginningPentecostarion',
  'Memorial Saturday': 'orthocalFeasts.memorialSaturday',

  // Triodion Sundays
  'Sunday of Zacchaeus': 'orthocalFeasts.sundayZacchaeus',
  'Sunday of the Publican and the Pharisee': 'orthocalFeasts.sundayPublican',
  'Sunday of the Prodigal Son': 'orthocalFeasts.sundayProdigal',
  'Sunday of Meatfare': 'orthocalFeasts.sundayMeatfare',
  'Sunday of the Last Judgment': 'orthocalFeasts.sundayMeatfare',
  'Sunday of Cheesefare: Expulsion of Adam from Paradise': 'orthocalFeasts.sundayCheesefare',
  'Sunday of Cheesefare': 'orthocalFeasts.sundayCheesefare',
  'Forgiveness Sunday': 'orthocalFeasts.sundayCheesefare',
  'First Sunday of Lent': 'orthocalFeasts.sundayOrthodoxy',
  'Sunday of Orthodoxy': 'orthocalFeasts.sundayOrthodoxy',
  'Second Sunday of Lent': 'orthocalFeasts.sundayGregoryPalamas',
  'Third Sunday of Lent': 'orthocalFeasts.sundayCross',
  'Veneration of the Precious Cross': 'orthocalFeasts.sundayCross',
  'Fourth Sunday of Lent': 'orthocalFeasts.sundayClimacus',
  'Fifth Sunday of Lent': 'orthocalFeasts.sundayMaryEgypt',

  // Pentecostarion Sundays / themes
  'Antipascha: 2nd Sunday of Pascha': 'orthocalFeasts.thomasSunday',
  'St Thomas Sunday': 'orthocalFeasts.thomasSunday',
  'Thomas Sunday': 'orthocalFeasts.thomasSunday',
  '3rd Sunday of Pascha': 'orthocalFeasts.myrrhbearers',
  'Myrrhbearing Women': 'orthocalFeasts.myrrhbearers',
  'Sunday of the Myrrhbearing Women': 'orthocalFeasts.myrrhbearers',
  '4th Sunday of Pascha': 'orthocalFeasts.paralytic',
  Paralytic: 'orthocalFeasts.paralytic',
  'Sunday of the Paralytic': 'orthocalFeasts.paralytic',
  '5th Sunday of Pascha': 'orthocalFeasts.samaritanWoman',
  'Samaritan Woman': 'orthocalFeasts.samaritanWoman',
  'Sunday of the Samaritan Woman': 'orthocalFeasts.samaritanWoman',
  '6th Sunday of Pascha': 'orthocalFeasts.blindMan',
  'Blind Man': 'orthocalFeasts.blindMan',
  'Sunday of the Blind Man': 'orthocalFeasts.blindMan',
  '1st Sunday after Pentecost': 'appearance.all_saints',
  'All Saints': 'appearance.all_saints',
  '2nd Sunday after Pentecost': 'appearance.all_saints_russia',
  'All Saints of America, All Saints of Russia': 'appearance.all_saints_russia',
  'All Saints of Russia': 'appearance.all_saints_russia',

  // Common saints / icons (high-visibility commemorations)
  'St Nicholas the Wonderworker, Abp. of Myra in Lycia': 'orthocalFeasts.nicholasWonderworker',
  'Saint Nicholas the Wonderworker': 'orthocalFeasts.nicholasWonderworker',
  'St Nicholas the Wonderworker': 'orthocalFeasts.nicholasWonderworker',
  'Holy Greatmartyr, Victorybearer and Wonderworker George': 'orthocalFeasts.georgeVictorybearer',
  'Greatmartyr George': 'orthocalFeasts.georgeVictorybearer',
  'Greatmartyr Demetrius': 'orthocalFeasts.demetrius',
  'Holy Greatmartyr Demetrius the Myrrh-gusher of Thessalonica': 'orthocalFeasts.demetrius',
  'Rt. Blv. Great Prince Alexander Nevsky': 'orthocalFeasts.alexanderNevsky',
  'Holy Forty Martyrs of Sebaste': 'orthocalFeasts.fortyMartyrsSebaste',
  'Image of Christ Not Made by Hands': 'orthocalFeasts.imageNotMadeByHands',
  'Vladimir Icon': 'orthocalFeasts.vladimirIcon',
  'Vladimir Icon of the Most-Holy Theotokos': 'orthocalFeasts.vladimirIcon',
  'Martyrs Boris and Gleb, Passionbearers': 'orthocalFeasts.borisAndGleb',
  'SS Cyril and Methodius, Apostles to the Slavs': 'orthocalFeasts.cyrilMethodius',
  'Repose Ven. Herman of Alaska, Wonderworker of All America': 'orthocalFeasts.hermanAlaska',
  '3rd Finding of the Head of St John the Baptist': 'orthocalFeasts.thirdFindingHeadJohn',
  'Procession of the Lifegiving Cross': 'orthocalFeasts.processionLifegivingCross',
  'Procession of the Life-giving Cross': 'orthocalFeasts.processionLifegivingCross',
  'Leavetaking of Pentecost': 'orthocalFeasts.leavetakingPentecost',
  'Begin Dormition Fast': 'orthocalFeasts.beginDormitionFast',
  'Beginning of the Dormition Fast': 'orthocalFeasts.beginDormitionFast',
  'Synaxis of the Holy Unmercenaries': 'orthocalFeasts.synaxisUnmercenaries',
  'SS Constantine and Helen, Equals-to-the-Apostles': 'orthocalFeasts.constantineHelen',
  'Saints Constantine and Helen, Equals-to-the-Apostles':
    'orthocalFeasts.constantineHelen',
  'The Shepherds who saw the Lord': 'orthocalFeasts.shepherds',
  'The Veneration of the Magi': 'orthocalFeasts.venerationMagi',
  'Saturday after Theophany': 'orthocalFeasts.saturdayAfterTheophany',
  'Sunday after Theophany': 'orthocalFeasts.sundayAfterTheophany',
  'Saturday after the Nativity': 'orthocalFeasts.saturdayAfterNativity',
  'Sunday after the Nativity': 'orthocalFeasts.sundayAfterNativity',
  'Forefeast of Nativity': 'orthocalFeasts.forefeastNativity',
  'Leavetaking of Annunciation': 'orthocalFeasts.leavetakingAnnunciation',
  'Afterfeast of the Transfiguration': 'orthocalFeasts.afterfeastTransfiguration',
  'Synaxis of Archangel Gabriel': 'orthocalFeasts.synaxisGabriel',
  'Synaxis of the Archangel Gabriel': 'orthocalFeasts.synaxisGabriel',
  'Presanctified Liturgy': 'typikon.presanctified',
  'Leavetaking of Mid-Pentecost': 'orthocalFeasts.leavetakingMidPentecost',
  'Leavetaking Exaltation': 'orthocalFeasts.leavetakingElevationCross',
  'Day of Rejoicing (Radonitsa)': 'orthocalFeasts.radonitsa',
  'Tikhvin Icon': 'orthocalFeasts.tikhvinIcon',
  'Tikhvin Icon of the Most-Holy Theotokos': 'orthocalFeasts.tikhvinIcon',
  'Church New Year': 'orthocalFeasts.churchNewYear',
  'Begin Nativity Fast': 'orthocalFeasts.beginNativityFast',
  'Forefeast of Entry': 'orthocalFeasts.forefeastEntry',
  'Leavetaking of the Entry': 'orthocalFeasts.leavetakingEntry',
  'Sunday of the Forefathers': 'orthocalFeasts.sundayForefathers',
  'Fathers of the 1st Six Ecumenical Councils': 'orthocalFeasts.fathersSixCouncils',
  'Fathers of the Seventh Ecumenical Council': 'orthocalFeasts.fathersSeventhCouncil',
  'Commemoration of the First Ecumenical Council (325)': 'orthocalFeasts.councilNicea',
  'Commemoration of the Second Ecumenical Council (381).': 'orthocalFeasts.councilConstantinople',
  'Commemoration of the Third Ecumenical Council (431)': 'orthocalFeasts.councilEphesus',
  'Commemoration of the Apparition of the Sign of the Precious Cross over Jerusalem in 351 AD':
    'orthocalFeasts.crossApparitionJerusalem',
  'Commemoration of an Uncondemning Monk': 'orthocalFeasts.uncondemningMonk',
  'Synaxis of Serbian Hierarchs': 'orthocalFeasts.synaxisSerbianHierarchs',
  'Seven Sleepers of Ephesus': 'orthocalFeasts.sevenSleepersEphesus',
  'Seven Hieromartyrs of Cherson': 'orthocalFeasts.sevenHieromartyrsCherson',
  'Leavetaking of Pascha': 'orthocalFeasts.leavetakingPascha',
  'Forefeast of Ascension': 'orthocalFeasts.forefeastAscension',
  'Blessed Princess Olga': 'orthocalFeasts.princessOlga',
  'Ven. Anthony of the Kiev Caves': 'orthocalFeasts.anthonyKievCaves',

  // Seasons / weekday shells
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

/** Drop trailing year / note parentheses for feast lookup. */
function stripTrailingNotes(text: string): string {
  return text
    .replace(/\s*\([^)]*(?:\d|BC|AD|ca\.|c\.)[^)]*\)\s*$/gi, '')
    .replace(/[.;,\s]+$/g, '')
    .trim();
}

/** Normalize Orthocal title for lookup (case, hyphens, spelling variants). */
function normalizeTitleKey(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[’‘ʻʼ]/g, "'")
    .replace(/[‐‑‒–—−]/g, '-')
    .replace(/\bsaviour\b/g, 'savior')
    .replace(/\bmost-holy\b/g, 'most holy')
    .replace(/\blife-giving\b/g, 'lifegiving')
    .replace(/\bgreat-martyrs?\b/g, (m) => (m.endsWith('s') ? 'greatmartyrs' : 'greatmartyr'))
    .replace(/\bequals-to-the-apostles\b/g, 'equal-to-the-apostles')
    .replace(/\bof the\b/g, 'of ')
    .replace(/\s+/g, ' ');
}

const FEAST_KEY_BY_NORMALIZED: Record<string, string> = {};
for (const [english, key] of Object.entries(FEAST_KEY_BY_ENGLISH)) {
  FEAST_KEY_BY_NORMALIZED[normalizeTitleKey(english)] = key;
}

/** Longer feast keys first — used for prefix / contains matching. */
const FEAST_LOOKUP_ENTRIES = Object.entries(FEAST_KEY_BY_NORMALIZED).sort(
  (a, b) => b[0].length - a[0].length,
);

type HonorificRule = { pattern: RegExp; replacement: string };

const ABBREV = '(?=\\s|$|,|;|:)';

const HONORIFIC_RULES: Record<Exclude<UiLanguage, 'en'>, HonorificRule[]> = {
  ru: [
    { pattern: /\bOur Father among the Saints\b/gi, replacement: 'Свт.' },
    { pattern: /\bOur Venerable Father\b/gi, replacement: 'Преп.' },
    { pattern: /\bOur Holy Fathers?\b/gi, replacement: 'Свв. отцы' },
    { pattern: /\bOur Holy Mothers?\b/gi, replacement: 'Свв. жены' },
    { pattern: /\bOur Holy Mother\b/gi, replacement: 'Прп.' },
    { pattern: /\bOur Holy Father\b/gi, replacement: 'Свт.' },
    { pattern: /\bHoly Equals-to-the-Apostles\b/gi, replacement: 'Св. равноап.' },
    { pattern: /\bEquals?-to-the-Apostles\b/gi, replacement: 'Равноап.' },
    { pattern: /\bHoly Great-?martyrs\b/gi, replacement: 'Св. вмчч.' },
    { pattern: /\bHoly Great-?martyr\b/gi, replacement: 'Св. вмч.' },
    { pattern: /\bGreat-?martyrs\b/gi, replacement: 'Вмчч.' },
    { pattern: /\bGreat-?martyr\b/gi, replacement: 'Вмч.' },
    { pattern: /\bNew Confessor\s*\/\s*Hieromartyr\b/gi, replacement: 'Новосщмч.' },
    { pattern: /\bHieromartyr\b/gi, replacement: 'Сщмч.' },
    { pattern: /\bHoly New Martyr\b/gi, replacement: 'Св. новомч.' },
    { pattern: /\bNew Martyr\b/gi, replacement: 'Новомч.' },
    { pattern: /\bNew Confessor\b/gi, replacement: 'Новоисп.' },
    { pattern: /\bHoly Martyrs\b/gi, replacement: 'Св. мученики' },
    { pattern: /\bHoly Martyr\b/gi, replacement: 'Св. мч.' },
    { pattern: /\bMartyrs\b/gi, replacement: 'Мученики' },
    { pattern: /\bMartyr\b/gi, replacement: 'Мч.' },
    { pattern: /\bPassionbearers?\b/gi, replacement: 'Страстотерпцы' },
    { pattern: /\bWonderworker\b/gi, replacement: 'Чудотворец' },
    { pattern: /\bVictorybearer\b/gi, replacement: 'Победоносец' },
    { pattern: /\bMyrrh-?gusher\b/gi, replacement: 'Мироточивый' },
    { pattern: /\bUnmercenaries\b/gi, replacement: 'Бессребреники' },
    { pattern: /\bUnmercenary\b/gi, replacement: 'Бессребреник' },
    { pattern: /\bBodiless Powers\b/gi, replacement: 'бесплотных сил' },
    { pattern: /\bthe Newly Appeared\b/gi, replacement: 'Новоявленный' },
    { pattern: /\bNewly Appeared\b/gi, replacement: 'Новоявленный' },
    { pattern: /\bRepose of\b/gi, replacement: 'Преставление' },
    { pattern: /\bRepose\b/gi, replacement: 'Преставление' },
    { pattern: /\bCommemoration of\b/gi, replacement: 'Память' },
    { pattern: /\bCommemoration\b/gi, replacement: 'Память' },
    { pattern: /\bFool-for-Christ\b/gi, replacement: 'Юродивый' },
    { pattern: /\bFool for Christ\b/gi, replacement: 'Юродивый' },
    { pattern: /\bBl\.\b/g, replacement: 'Блж.' },
    { pattern: /\bBlessed\b/gi, replacement: 'Блж.' },
    { pattern: /\bGerontissa\b/gi, replacement: 'Игуменья' },
    { pattern: /\bHieromonk\b/gi, replacement: 'Иером.' },
    { pattern: /\bArchimandrite\b/gi, replacement: 'Архим.' },
    { pattern: /\bPrincess\b/gi, replacement: 'кнж.' },
    { pattern: /\bMaiden\b/gi, replacement: 'Дева' },
    { pattern: /\bEcumenical Council\b/gi, replacement: 'Вселенский собор' },
    { pattern: /\bUncondemning Monk\b/gi, replacement: 'монаха без осуждения' },
    { pattern: /\bSerbian Hierarchs\b/gi, replacement: 'Сербских архиереев' },
    { pattern: /\bSeven Sleepers\b/gi, replacement: 'Семь отроков' },
    { pattern: /\bSeven Hieromartyrs\b/gi, replacement: 'Семь сщмч.' },
    { pattern: /\bEthiopian Eunuch\b/gi, replacement: 'Ефиопский евнух' },
    { pattern: /\bQueen Candace\b/gi, replacement: 'царицы Кандаки' },
    { pattern: /\bForefeast\b/gi, replacement: 'Предпразднство' },
    { pattern: /\bAfterfeast\b/gi, replacement: 'Попразднство' },
    { pattern: /\bLeavetaking\b/gi, replacement: 'Отдание' },
    { pattern: /\bMid-Pentecost\b/gi, replacement: 'Преполовения Пятидесятницы' },
    { pattern: /\bExaltation\b/gi, replacement: 'Воздвижения Креста' },
    { pattern: /\bEntry\b/gi, replacement: 'Введения' },
    { pattern: /\bForefathers\b/gi, replacement: 'отец' },
    { pattern: /\bPresanctified Liturgy\b/gi, replacement: 'Преждеосвященная литургия' },
    { pattern: /\bCheesefare\b/gi, replacement: 'Сыропустной седмицы' },
    { pattern: /\bRadonitsa\b/gi, replacement: 'Радоница' },
    { pattern: /\bTheologian\b/gi, replacement: 'Богослов' },
    { pattern: /\bMelodist\b/gi, replacement: 'Сладкопевец' },
    { pattern: /\bChoirmaster\b/gi, replacement: 'Доместик' },
    { pattern: /\bEmpress\b/gi, replacement: 'царица' },
    { pattern: /\b[Ee]nlightener\b/g, replacement: 'просветитель' },
    { pattern: /\bRelics of\b/gi, replacement: 'Мощи' },
    { pattern: /\bTranslation of the Relics\b/gi, replacement: 'Перенесение мощей' },
    { pattern: new RegExp(`\\bTrans\\. Rel\\. Ven\\.${ABBREV}`, 'gi'), replacement: 'Перен. мощей прп.' },
    { pattern: new RegExp(`\\bTrans\\. Rel\\.${ABBREV}`, 'gi'), replacement: 'Перен. мощей' },
    { pattern: /\bRight-believing\b/gi, replacement: 'Благв.' },
    { pattern: new RegExp(`\\bRt\\. Blv\\.${ABBREV}`, 'gi'), replacement: 'Благв.' },
    { pattern: /\bRighteous\b/gi, replacement: 'Прав.' },
    { pattern: /\bConfessor\b/gi, replacement: 'Исп.' },
    { pattern: /\bHierarch\b/gi, replacement: 'Свт.' },
    { pattern: new RegExp(`\\bAbp\\.${ABBREV}`, 'gi'), replacement: 'архиеп.' },
    { pattern: /\bArchbishop\b/gi, replacement: 'Архиеп.' },
    { pattern: /\bApostles\b/gi, replacement: 'Апостолы' },
    { pattern: /\bApostle\b/gi, replacement: 'Ап.' },
    { pattern: /\bProphet\b/gi, replacement: 'Прор.' },
    { pattern: /\bForerunner\b/gi, replacement: 'Предтеча' },
    { pattern: /\bTheotokos\b/gi, replacement: 'Богородицы' },
    { pattern: /\bLife-?giving\b/gi, replacement: 'Животворящего' },
    { pattern: /\band Companions\b/gi, replacement: 'и с ним' },
    { pattern: /\bCompanions\b/gi, replacement: 'и с ним' },
    { pattern: /\bMiracle of\b/gi, replacement: 'Чудо' },
    { pattern: /\bthe Great\b/gi, replacement: 'Великий' },
    { pattern: /\bthe New\b/gi, replacement: 'Новый' },
    { pattern: /\bVenerable\b/gi, replacement: 'Преп.' },
    { pattern: new RegExp(`\\bVen\\.${ABBREV}`, 'gi'), replacement: 'Преп.' },
    { pattern: /\bSS\b/g, replacement: 'Свв.' },
    { pattern: /\bSaint\b/gi, replacement: 'Св.' },
    { pattern: new RegExp(`\\bSt\\.${ABBREV}`, 'gi'), replacement: 'Св.' },
    { pattern: /\bSt\b(?=\s+[A-ZА-ЯЁ])/g, replacement: 'Св.' },
    { pattern: /\bHoly\b/gi, replacement: 'Св.' },
    { pattern: /\bpatriarch\b/gi, replacement: 'патр.' },
    { pattern: /\b[Bb]ishop\b/g, replacement: 'еп.' },
    { pattern: /\bmetropolitan\b/gi, replacement: 'митр.' },
    { pattern: /\b[Aa]bbot\b/g, replacement: 'игумен' },
    { pattern: /\bMonastery\b/gi, replacement: 'монастыря' },
    { pattern: /\bpriest\b/gi, replacement: 'свящ.' },
    { pattern: /\bdeacon\b/gi, replacement: 'диак.' },
    { pattern: /\bof the Seventy\b/gi, replacement: 'из 70' },
    { pattern: /\bparents of\b/gi, replacement: 'родители' },
    { pattern: /\btheir mother\b/gi, replacement: 'их мать' },
    { pattern: /\btheir teacher\b/gi, replacement: 'их учитель' },
    { pattern: /\bat Sofia\b/gi, replacement: 'в Софии' },
    { pattern: /\bof Constantinople\b/gi, replacement: 'Константинопольского' },
    { pattern: /\bof Myra in Lycia\b/gi, replacement: 'Мир Ликийских' },
    { pattern: /\bAbbot of Sinai\b/gi, replacement: 'игумен Синайский' },
    { pattern: /\bof Rhodes\b/gi, replacement: 'Родосский' },
    { pattern: /\bof Japan\b/gi, replacement: 'Японский' },
    { pattern: /\bof Moscow\b/gi, replacement: 'Московский' },
    { pattern: /\bof Egypt\b/gi, replacement: 'Египетский' },
  ],
  el: [
    { pattern: /\bOur Father among the Saints\b/gi, replacement: 'Ἐν Ἁγίοις Πατὴρ ἡμῶν' },
    { pattern: /\bOur Venerable Father\b/gi, replacement: 'Ὅσ.' },
    { pattern: /\bOur Holy Fathers?\b/gi, replacement: 'Ἅγ. Πατέρες' },
    { pattern: /\bOur Holy Mothers?\b/gi, replacement: 'Ἅγιες Μητέρες' },
    { pattern: /\bOur Holy Mother\b/gi, replacement: 'Ὁσία' },
    { pattern: /\bOur Holy Father\b/gi, replacement: 'Ἅγ.' },
    { pattern: /\bHoly Equals-to-the-Apostles\b/gi, replacement: 'Ἱσαπόστολος' },
    { pattern: /\bEquals?-to-the-Apostles\b/gi, replacement: 'Ἱσαπόστολος' },
    { pattern: /\bHoly Great-?martyrs\b/gi, replacement: 'Ἅγ. Μεγαλομάρτυρες' },
    { pattern: /\bHoly Great-?martyr\b/gi, replacement: 'Ἅγ. Μεγαλομάρτυς' },
    { pattern: /\bGreat-?martyrs\b/gi, replacement: 'Μεγαλομάρτυρες' },
    { pattern: /\bGreat-?martyr\b/gi, replacement: 'Μεγαλομάρτυς' },
    { pattern: /\bNew Confessor\s*\/\s*Hieromartyr\b/gi, replacement: 'Νεομάρτυς Ἱερομάρτυς' },
    { pattern: /\bHieromartyr\b/gi, replacement: 'Ἱερομάρτυς' },
    { pattern: /\bHoly New Martyr\b/gi, replacement: 'Ἅγ. Νεομάρτυς' },
    { pattern: /\bNew Martyr\b/gi, replacement: 'Νεομάρτυς' },
    { pattern: /\bNew Confessor\b/gi, replacement: 'Νεομολογητής' },
    { pattern: /\bHoly Martyrs\b/gi, replacement: 'Ἅγιοι Μάρτυρες' },
    { pattern: /\bHoly Martyr\b/gi, replacement: 'Ἅγ. Μάρτυς' },
    { pattern: /\bMartyrs\b/gi, replacement: 'Μάρτυρες' },
    { pattern: /\bMartyr\b/gi, replacement: 'Μάρτυς' },
    { pattern: /\bPassionbearers?\b/gi, replacement: 'Πασιφόροι' },
    { pattern: /\bWonderworker\b/gi, replacement: 'Θαυματουργός' },
    { pattern: /\bVictorybearer\b/gi, replacement: 'Τροπαιοφόρος' },
    { pattern: /\bMyrrh-?gusher\b/gi, replacement: 'Μυροβλύτης' },
    { pattern: /\bUnmercenaries\b/gi, replacement: 'Ανάργυροι' },
    { pattern: /\bUnmercenary\b/gi, replacement: 'Ανάργυρος' },
    { pattern: /\bBodiless Powers\b/gi, replacement: 'Ασωμάτων Δυνάμεων' },
    { pattern: /\bthe Newly Appeared\b/gi, replacement: 'Νεοφανής' },
    { pattern: /\bNewly Appeared\b/gi, replacement: 'Νεοφανής' },
    { pattern: /\bRepose of\b/gi, replacement: 'Κοίμησις' },
    { pattern: /\bRepose\b/gi, replacement: 'Κοίμησις' },
    { pattern: /\bCommemoration of\b/gi, replacement: 'Μνήμη' },
    { pattern: /\bCommemoration\b/gi, replacement: 'Μνήμη' },
    { pattern: /\bFool-for-Christ\b/gi, replacement: 'Δια Χριστόν Σαλός' },
    { pattern: /\bFool for Christ\b/gi, replacement: 'Δια Χριστόν Σαλός' },
    { pattern: /\bBl\.\b/g, replacement: 'Μακ.' },
    { pattern: /\bBlessed\b/gi, replacement: 'Μακ.' },
    { pattern: /\bGerontissa\b/gi, replacement: 'Γερόντισσα' },
    { pattern: /\bHieromonk\b/gi, replacement: 'Ιερομ.' },
    { pattern: /\bArchimandrite\b/gi, replacement: 'Αρχιμ.' },
    { pattern: /\bPrincess\b/gi, replacement: 'πριγκ.' },
    { pattern: /\bMaiden\b/gi, replacement: 'Παρθένος' },
    { pattern: /\bEcumenical Council\b/gi, replacement: 'Οικουμενική Σύνοδος' },
    { pattern: /\bUncondemning Monk\b/gi, replacement: 'μοναχού χωρίς κατάκριση' },
    { pattern: /\bSerbian Hierarchs\b/gi, replacement: 'Σερβικών Ιεραρχών' },
    { pattern: /\bSeven Sleepers\b/gi, replacement: 'Επτά Παίδων' },
    { pattern: /\bSeven Hieromartyrs\b/gi, replacement: 'Επτά Ιερομαρτύρων' },
    { pattern: /\bEthiopian Eunuch\b/gi, replacement: 'Αιθίοπας ευνούχος' },
    { pattern: /\bQueen Candace\b/gi, replacement: 'βασίλισσας Κανδάκης' },
    { pattern: /\bForefeast\b/gi, replacement: 'Προεόρτια' },
    { pattern: /\bAfterfeast\b/gi, replacement: 'Μεθεόρτια' },
    { pattern: /\bLeavetaking\b/gi, replacement: 'Απόδοση' },
    { pattern: /\bMid-Pentecost\b/gi, replacement: 'Μεσοπεντηκοστής' },
    { pattern: /\bExaltation\b/gi, replacement: 'Υψώσεως του Σταυρού' },
    { pattern: /\bEntry\b/gi, replacement: 'Εισόδου' },
    { pattern: /\bForefathers\b/gi, replacement: 'Προπατόρων' },
    { pattern: /\bPresanctified Liturgy\b/gi, replacement: 'Προηγιασμένη Λειτουργία' },
    { pattern: /\bCheesefare\b/gi, replacement: 'Τυροφάγου' },
    { pattern: /\bRadonitsa\b/gi, replacement: 'Ραντιτσά' },
    { pattern: /\bTheologian\b/gi, replacement: 'Θεολόγος' },
    { pattern: /\bMelodist\b/gi, replacement: 'Μελωδός' },
    { pattern: /\bChoirmaster\b/gi, replacement: 'Δομέστικος' },
    { pattern: /\bEmpress\b/gi, replacement: 'Αυτοκράτειρα' },
    { pattern: /\b[Ee]nlightener\b/g, replacement: 'φωτιστής' },
    { pattern: /\bRelics of\b/gi, replacement: 'Λείψανα' },
    { pattern: /\bTranslation of the Relics\b/gi, replacement: 'Μετάθεσις λειψάνων' },
    { pattern: new RegExp(`\\bTrans\\. Rel\\. Ven\\.${ABBREV}`, 'gi'), replacement: 'Μετάθεσις λειψάνων ὁσ.' },
    { pattern: new RegExp(`\\bTrans\\. Rel\\.${ABBREV}`, 'gi'), replacement: 'Μετάθεσις λειψάνων' },
    { pattern: /\bRight-believing\b/gi, replacement: 'Ευσεβής' },
    { pattern: new RegExp(`\\bRt\\. Blv\\.${ABBREV}`, 'gi'), replacement: 'Ευσεβής' },
    { pattern: /\bRighteous\b/gi, replacement: 'Δίκαιος' },
    { pattern: /\bConfessor\b/gi, replacement: 'Ὁμολογητής' },
    { pattern: /\bHierarch\b/gi, replacement: 'Ἱεράρχης' },
    { pattern: new RegExp(`\\bAbp\\.${ABBREV}`, 'gi'), replacement: 'αρχιεπ.' },
    { pattern: /\bArchbishop\b/gi, replacement: 'Αρχιεπίσκοπος' },
    { pattern: /\bApostles\b/gi, replacement: 'Απόστολοι' },
    { pattern: /\bApostle\b/gi, replacement: 'Απόσ.' },
    { pattern: /\bProphet\b/gi, replacement: 'Προφ.' },
    { pattern: /\bForerunner\b/gi, replacement: 'Πρόδρομος' },
    { pattern: /\bTheotokos\b/gi, replacement: 'Θεοτόκου' },
    { pattern: /\bLife-?giving\b/gi, replacement: 'Ζωοποιού' },
    { pattern: /\band Companions\b/gi, replacement: 'και οι συν αυτώ' },
    { pattern: /\bCompanions\b/gi, replacement: 'και οι συν αυτώ' },
    { pattern: /\bMiracle of\b/gi, replacement: 'Θαύμα' },
    { pattern: /\bthe Great\b/gi, replacement: 'ο Μέγας' },
    { pattern: /\bthe New\b/gi, replacement: 'ο Νέος' },
    { pattern: /\bVenerable\b/gi, replacement: 'Όσιος' },
    { pattern: new RegExp(`\\bVen\\.${ABBREV}`, 'gi'), replacement: 'Όσ.' },
    { pattern: /\bSS\b/g, replacement: 'Ἅγ.' },
    { pattern: /\bSaint\b/gi, replacement: 'Ἅγ.' },
    { pattern: new RegExp(`\\bSt\\.${ABBREV}`, 'gi'), replacement: 'Ἅγ.' },
    { pattern: /\bSt\b(?=\s+[A-ZΑ-Ω])/g, replacement: 'Ἅγ.' },
    { pattern: /\bHoly\b/gi, replacement: 'Ἅγ.' },
    { pattern: /\bpatriarch\b/gi, replacement: 'πατρ.' },
    { pattern: /\b[Bb]ishop\b/g, replacement: 'επ.' },
    { pattern: /\bmetropolitan\b/gi, replacement: 'μητρ.' },
    { pattern: /\b[Aa]bbot\b/g, replacement: 'ἡγούμενος' },
    { pattern: /\bMonastery\b/gi, replacement: 'μονής' },
    { pattern: /\bpriest\b/gi, replacement: 'ιερ.' },
    { pattern: /\bdeacon\b/gi, replacement: 'διάκ.' },
    { pattern: /\bof the Seventy\b/gi, replacement: 'τῶν 70' },
    { pattern: /\bparents of\b/gi, replacement: 'γονείς' },
    { pattern: /\btheir mother\b/gi, replacement: 'η μητέρα τους' },
    { pattern: /\btheir teacher\b/gi, replacement: 'ο διδάσκαλός τους' },
    { pattern: /\bat Sofia\b/gi, replacement: 'Σοφίας' },
    { pattern: /\bof Constantinople\b/gi, replacement: 'Κωνσταντινουπόλεως' },
    { pattern: /\bof Myra in Lycia\b/gi, replacement: 'Μύρων τῆς Λυκίας' },
    { pattern: /\bAbbot of Sinai\b/gi, replacement: 'ἡγούμενος τοῦ Σινᾶ' },
    { pattern: /\bof Rhodes\b/gi, replacement: 'της Ρόδου' },
    { pattern: /\bof Japan\b/gi, replacement: 'της Ιαπωνίας' },
    { pattern: /\bof Moscow\b/gi, replacement: 'Μόσχας' },
    { pattern: /\bof Egypt\b/gi, replacement: 'της Αιγύπτου' },
  ],
};

/** Given-name display replacements after honorific rewrite (word-boundary). */
const GIVEN_NAME_DISPLAY: Record<Exclude<UiLanguage, 'en'>, Array<[RegExp, string]>> = {
  ru: [
    [/\bNicholas\b/gi, 'Николай'],
    [/\bNicolas\b/gi, 'Николай'],
    [/\bGeorge\b/gi, 'Георгий'],
    [/\bJohn\b/gi, 'Иоанн'],
    [/\bMary\b/gi, 'Мария'],
    [/\bMichael\b/gi, 'Михаил'],
    [/\bBasil\b/gi, 'Василий'],
    [/\bAndrew\b/gi, 'Андрей'],
    [/\bPeter\b/gi, 'Пётр'],
    [/\bPaul\b/gi, 'Павел'],
    [/\bSergius\b/gi, 'Сергий'],
    [/\bSergei\b/gi, 'Сергий'],
    [/\bDemetrius\b/gi, 'Димитрий'],
    [/\bDmitri\b/gi, 'Димитрий'],
    [/\bAnthony\b/gi, 'Антоний'],
    [/\bTheodore\b/gi, 'Феодор'],
    [/\bTheodora\b/gi, 'Феодора'],
    [/\bTimothy\b/gi, 'Тимофей'],
    [/\bLuke\b/gi, 'Лука'],
    [/\bMark\b/gi, 'Марк'],
    [/\bMatthew\b/gi, 'Матфей'],
    [/\bJames\b/gi, 'Иаков'],
    [/\bJoseph\b/gi, 'Иосиф'],
    [/\bStephen\b/gi, 'Стефан'],
    [/\bCatherine\b/gi, 'Екатерина'],
    [/\bBarbara\b/gi, 'Варвара'],
    [/\bHerman\b/gi, 'Герман'],
    [/\bAlexander\b/gi, 'Александр'],
    [/\bGregory\b/gi, 'Григорий'],
    [/\bPalamas\b/gi, 'Палама'],
    [/\bClimacus\b/gi, 'Лествичник'],
    [/\bEphraim\b/gi, 'Ефрем'],
    [/\bCyril\b/gi, 'Кирилл'],
    [/\bMethodius\b/gi, 'Мефодий'],
    [/\bBoris\b/gi, 'Борис'],
    [/\bGleb\b/gi, 'Глеб'],
    [/\bConstantine\b/gi, 'Константин'],
    [/\bHelen\b/gi, 'Елена'],
    [/\bHelena\b/gi, 'Елена'],
    [/\bTikhon\b/gi, 'Тихон'],
    [/\bAthanasius\b/gi, 'Афанасий'],
    [/\bMaximus\b/gi, 'Максим'],
    [/\bHilarion\b/gi, 'Иларион'],
    [/\bIsaac\b/gi, 'Исаак'],
    [/\bRomanos\b/gi, 'Роман'],
    [/\bRomanus\b/gi, 'Роман'],
    [/\bPoemen\b/gi, 'Пимен'],
    [/\bPhanurius\b/gi, 'Фанурий'],
    [/\bBartholomew\b/gi, 'Варфоломей'],
    [/\bTitus\b/gi, 'Тит'],
    [/\bAnanias\b/gi, 'Анания'],
    [/\bAlaska\b/gi, 'Аляскинский'],
    [/\bThessalonica\b/gi, 'Фессалоникийский'],
    [/\bThessalonika\b/gi, 'Фессалоникийский'],
    [/\bSinai\b/gi, 'Синайский'],
    [/\bEgypt\b/gi, 'Египетская'],
    [/\bNazianzus\b/gi, 'Назианзин'],
    [/\bHaralambos\b/gi, 'Харлампий'],
    [/\bScholastica\b/gi, 'Схоластика'],
    [/\bBenedict\b/gi, 'Бенедикт'],
    [/\bQuadratus\b/gi, 'Кодрат'],
    [/\bAnastasia\b/gi, 'Анастасия'],
    [/\bIsidora\b/gi, 'Исидора'],
    [/\bSimon\b/gi, 'Симон'],
    [/\bMaximovitch\b/gi, 'Максимович'],
    [/\bArsenios\b/gi, 'Арсений'],
    [/\bArsenius\b/gi, 'Арсений'],
    [/\bTheophan\b/gi, 'Феофан'],
    [/\bNyssa\b/gi, 'Нисский'],
    [/\bOlga\b/gi, 'Ольга'],
    [/\bGabriel\b/gi, 'Гавриил'],
    [/\bDimitrios\b/gi, 'Димитрий'],
    [/\bMarcella\b/gi, 'Марцелла'],
    [/\bMusa\b/gi, 'Муса'],
    [/\bStudios\b/gi, 'Студий'],
    [/\bVasily\b/gi, 'Василий'],
    [/\bLawrence\b/gi, 'Лаврентий'],
    [/\bAvram\b/gi, 'Авраам'],
    [/\bFlorovsky\b/gi, 'Флоровский'],
    [/\bSeraphim\b/gi, 'Серафим'],
    [/\bLazarus\b/gi, 'Лазарь'],
    [/\bGavrilia\b/gi, 'Гавриилия'],
    [/\bKontoglou\b/gi, 'Контоглу'],
    [/\bPhotios\b/gi, 'Фотий'],
    [/\bGeorges\b/gi, 'Жорж'],
    [/\bRose\b/gi, 'Роуз'],
    [/\bMoore\b/gi, 'Мур'],
    [/\bPlatina\b/gi, 'Платина'],
    [/\bKaluga\b/gi, 'Калуга'],
    [/\bSmolensk\b/gi, 'Смоленский'],
    [/\bCherson\b/gi, 'Херсонский'],
    [/\bEphesus\b/gi, 'Эфесский'],
    [/\bCrete\b/gi, 'Критский'],
    [/\bRome\b/gi, 'Римская'],
    [/\bEthiopian\b/gi, 'Ефиопский'],
    [/\bCandace\b/gi, 'Кандакия'],
  ],
  el: [
    [/\bNicholas\b/gi, 'Νικόλαος'],
    [/\bNicolas\b/gi, 'Νικόλαος'],
    [/\bGeorge\b/gi, 'Γεώργιος'],
    [/\bJohn\b/gi, 'Ιωάννης'],
    [/\bMary\b/gi, 'Μαρία'],
    [/\bMichael\b/gi, 'Μιχαήλ'],
    [/\bBasil\b/gi, 'Βασίλειος'],
    [/\bAndrew\b/gi, 'Ανδρέας'],
    [/\bPeter\b/gi, 'Πέτρος'],
    [/\bPaul\b/gi, 'Παύλος'],
    [/\bSergius\b/gi, 'Σέργιος'],
    [/\bSergei\b/gi, 'Σέργιος'],
    [/\bDemetrius\b/gi, 'Δημήτριος'],
    [/\bDmitri\b/gi, 'Δημήτριος'],
    [/\bAnthony\b/gi, 'Αντώνιος'],
    [/\bTheodore\b/gi, 'Θεόδωρος'],
    [/\bTheodora\b/gi, 'Θεοδώρα'],
    [/\bTimothy\b/gi, 'Τιμόθεος'],
    [/\bLuke\b/gi, 'Λουκάς'],
    [/\bMark\b/gi, 'Μάρκος'],
    [/\bMatthew\b/gi, 'Ματθαίος'],
    [/\bJames\b/gi, 'Ιάκωβος'],
    [/\bJoseph\b/gi, 'Ιωσήφ'],
    [/\bStephen\b/gi, 'Στέφανος'],
    [/\bCatherine\b/gi, 'Αικατερίνη'],
    [/\bBarbara\b/gi, 'Βαρβάρα'],
    [/\bHerman\b/gi, 'Γερμανός'],
    [/\bAlexander\b/gi, 'Αλέξανδρος'],
    [/\bGregory\b/gi, 'Γρηγόριος'],
    [/\bPalamas\b/gi, 'Παλαμάς'],
    [/\bClimacus\b/gi, 'της Κλίμακος'],
    [/\bEphraim\b/gi, 'Εφραίμ'],
    [/\bCyril\b/gi, 'Κύριλλος'],
    [/\bMethodius\b/gi, 'Μεθόδιος'],
    [/\bBoris\b/gi, 'Βόρις'],
    [/\bGleb\b/gi, 'Γκλεμπ'],
    [/\bConstantine\b/gi, 'Κωνσταντίνος'],
    [/\bHelen\b/gi, 'Ελένη'],
    [/\bHelena\b/gi, 'Ελένη'],
    [/\bTikhon\b/gi, 'Τύχων'],
    [/\bAthanasius\b/gi, 'Αθανάσιος'],
    [/\bMaximus\b/gi, 'Μάξιμος'],
    [/\bHilarion\b/gi, 'Ιλαρίων'],
    [/\bIsaac\b/gi, 'Ισαάκ'],
    [/\bRomanos\b/gi, 'Ρωμανός'],
    [/\bRomanus\b/gi, 'Ρωμανός'],
    [/\bPoemen\b/gi, 'Ποιμήν'],
    [/\bPhanurius\b/gi, 'Φανούριος'],
    [/\bBartholomew\b/gi, 'Βαρθολομαίος'],
    [/\bTitus\b/gi, 'Τίτος'],
    [/\bAnanias\b/gi, 'Ανανίας'],
    [/\bAlaska\b/gi, 'της Αλάσκας'],
    [/\bThessalonica\b/gi, 'Θεσσαλονίκης'],
    [/\bThessalonika\b/gi, 'Θεσσαλονίκης'],
    [/\bSinai\b/gi, 'του Σινά'],
    [/\bEgypt\b/gi, 'της Αιγύπτου'],
    [/\bNazianzus\b/gi, 'Ναζιανζηνός'],
    [/\bHaralambos\b/gi, 'Χαράλαμπος'],
    [/\bScholastica\b/gi, 'Σχολαστική'],
    [/\bBenedict\b/gi, 'Βενέδικτος'],
    [/\bQuadratus\b/gi, 'Κοδράτος'],
    [/\bAnastasia\b/gi, 'Αναστασία'],
    [/\bIsidora\b/gi, 'Ισιδώρα'],
    [/\bSimon\b/gi, 'Σίμων'],
    [/\bMaximovitch\b/gi, 'Μαξιμόβιτς'],
    [/\bArsenios\b/gi, 'Αρσένιος'],
    [/\bArsenius\b/gi, 'Αρσένιος'],
    [/\bTheophan\b/gi, 'Θεοφάνης'],
    [/\bNyssa\b/gi, 'Νύσσης'],
    [/\bOlga\b/gi, 'Όλγα'],
    [/\bGabriel\b/gi, 'Γαβριήλ'],
    [/\bDimitrios\b/gi, 'Δημήτριος'],
    [/\bMarcella\b/gi, 'Μαρκέλλα'],
    [/\bMusa\b/gi, 'Μούσα'],
    [/\bStudios\b/gi, 'Στουδίου'],
    [/\bVasily\b/gi, 'Βασίλειος'],
    [/\bLawrence\b/gi, 'Λαυρέντιος'],
    [/\bAvram\b/gi, 'Αβραάμ'],
    [/\bFlorovsky\b/gi, 'Φλωρόφσκι'],
    [/\bSeraphim\b/gi, 'Σεραφείμ'],
    [/\bLazarus\b/gi, 'Λάζαρος'],
    [/\bGavrilia\b/gi, 'Γαβριηλία'],
    [/\bKontoglou\b/gi, 'Κοντόγλου'],
    [/\bPhotios\b/gi, 'Φώτιος'],
    [/\bGeorges\b/gi, 'Γεώργιος'],
    [/\bRose\b/gi, 'Ρόουζ'],
    [/\bMoore\b/gi, 'Μουρ'],
    [/\bPlatina\b/gi, 'Πλατίνα'],
    [/\bKaluga\b/gi, 'Καλούγκα'],
    [/\bSmolensk\b/gi, 'Σμολενσκ'],
    [/\bCherson\b/gi, 'Χερσώνος'],
    [/\bEphesus\b/gi, 'Εφέσου'],
    [/\bCrete\b/gi, 'Κρήτης'],
    [/\bRome\b/gi, 'Ρώμης'],
    [/\bEthiopian\b/gi, 'Αιθίοπας'],
    [/\bCandace\b/gi, 'Κανδάκης'],
  ],
};

/** Leftover English liturgical phrases after honorifics / given names. */
const RESIDUAL_PHRASES: Record<Exclude<UiLanguage, 'en'>, Array<[RegExp, string]>> = {
  ru: [
    [/\bof the Kiev Caves\b/gi, 'Киево-Печерский'],
    [/\bthe Kiev Caves\b/gi, 'Киево-Печерский'],
    [/\bKiev Caves\b/gi, 'Киево-Печерский'],
    [/\bthe Recluse\b/gi, 'Затворник'],
    [/\bthe Fool\b/gi, 'Юродивый'],
    [/\bthe Zealot\b/gi, 'Зилот'],
    [/\bsister of\b/gi, 'сестра'],
    [/\bbrother of\b/gi, 'брат'],
    [/\bThe Placing of the Precious Robe of the Lord in Moscow\b/gi, 'Положение ризы Господней в Москве'],
    [/\bPrecious Robe of the Lord\b/gi, 'ризы Господней'],
    [/\bApostles of the 70\b/gi, 'Апостолы из 70'],
    [/\bof the 70\b/gi, 'из 70'],
    [/\bof Sicily\b/gi, 'Сицилийский'],
    [/\bof Prusa\b/gi, 'Прусский'],
    [/\bof Tobolsk\b/gi, 'Тобольский'],
    [/\bof Italy\b/gi, 'Италийский'],
    [/\bof Cappadocia\b/gi, 'Каппадокийский'],
    [/\bof Armenia\b/gi, 'Армянский'],
    [/\bof Nikopolis\b/gi, 'Никопольский'],
    [/\bin Moscow\b/gi, 'в Москве'],
    [/\bin Armenia\b/gi, 'в Армении'],
    [/\bNinety-nine Fathers\b/gi, 'Девяносто девять отцов'],
    [/\bat Kaluga\b/gi, 'в Калуге'],
    [/\bover Jerusalem\b/gi, 'над Иерусалимом'],
    [/\bSign of the Precious Cross\b/gi, 'Знамения Честного Креста'],
    [/\bFr\b/g, 'свящ.'],
    [/\bOC\b/g, 'ст. ст.'],
    [/\bdate unknown\b/gi, 'дата неизвестна'],
    [/\band\b/g, 'и'],
    [/\bof\b/gi, ''],
    [/\bthe\b/gi, ''],
    [/\ban\b/gi, ''],
  ],
  el: [
    [/\bof the Kiev Caves\b/gi, 'των Σπηλαίων του Κιέβου'],
    [/\bthe Kiev Caves\b/gi, 'των Σπηλαίων του Κιέβου'],
    [/\bKiev Caves\b/gi, 'των Σπηλαίων του Κιέβου'],
    [/\bthe Recluse\b/gi, 'ο Έγκλειστος'],
    [/\bthe Fool\b/gi, 'ο Σαλός'],
    [/\bthe Zealot\b/gi, 'ο Ζηλωτής'],
    [/\bsister of\b/gi, 'αδελφή'],
    [/\bbrother of\b/gi, 'αδελφός'],
    [/\bThe Placing of the Precious Robe of the Lord in Moscow\b/gi, 'Κατάθεσις της Τιμίας Εσθήτος του Κυρίου στη Μόσχα'],
    [/\bPrecious Robe of the Lord\b/gi, 'Τιμίας Εσθήτος του Κυρίου'],
    [/\bApostles of the 70\b/gi, 'Απόστολοι των 70'],
    [/\bof the 70\b/gi, 'των 70'],
    [/\bof Sicily\b/gi, 'της Σικελίας'],
    [/\bof Prusa\b/gi, 'της Προύσης'],
    [/\bof Tobolsk\b/gi, 'του Τομπόλσκ'],
    [/\bof Italy\b/gi, 'της Ιταλίας'],
    [/\bof Cappadocia\b/gi, 'της Καππαδοκίας'],
    [/\bof Armenia\b/gi, 'της Αρμενίας'],
    [/\bof Nikopolis\b/gi, 'της Νικοπόλεως'],
    [/\bin Moscow\b/gi, 'στη Μόσχα'],
    [/\bin Armenia\b/gi, 'στην Αρμενία'],
    [/\bNinety-nine Fathers\b/gi, 'ενενήκοντα εννέα Πατέρες'],
    [/\bat Kaluga\b/gi, 'Καλούγκα'],
    [/\bover Jerusalem\b/gi, 'επάνω από την Ιερουσαλήμ'],
    [/\bSign of the Precious Cross\b/gi, 'Σημείου του Τιμίου Σταυρού'],
    [/\bFr\b/g, 'ιερ.'],
    [/\bOC\b/g, 'π. ημ.'],
    [/\bdate unknown\b/gi, 'άγνωστη ημερομηνία'],
    [/\band\b/g, 'και'],
    [/\bof\b/gi, ''],
    [/\bthe\b/gi, ''],
    [/\ban\b/gi, ''],
  ],
};

function translateHonorifics(text: string, lang: UiLanguage): string {
  if (lang === 'en') return text;
  let out = text;
  for (const { pattern, replacement } of HONORIFIC_RULES[lang]) {
    out = out.replace(pattern, replacement);
  }
  for (const [pattern, replacement] of GIVEN_NAME_DISPLAY[lang]) {
    out = out.replace(pattern, replacement);
  }
  for (const [pattern, replacement] of RESIDUAL_PHRASES[lang]) {
    out = out.replace(pattern, replacement);
  }
  return out.replace(/\s{2,}/g, ' ').trim();
}

function resolveFeastKey(text: string): string | null {
  const cleaned = stripTrailingNotes(text);
  const norm = normalizeTitleKey(cleaned);
  const exact = FEAST_KEY_BY_NORMALIZED[norm];
  if (exact) return exact;

  // Prefix match for longer known titles (skip short shells like "Sunday").
  for (const [englishNorm, key] of FEAST_LOOKUP_ENTRIES) {
    if (englishNorm.length < 12) continue;
    if (
      norm === englishNorm ||
      norm.startsWith(`${englishNorm} `) ||
      norm.startsWith(`${englishNorm},`) ||
      norm.startsWith(`${englishNorm};`) ||
      norm.startsWith(`${englishNorm}.`) ||
      norm.startsWith(`${englishNorm}:`)
    ) {
      return key;
    }
  }
  return null;
}

function translateExactFeast(text: string, lang: UiLanguage): string | null {
  const key = resolveFeastKey(text);
  if (!key) return null;
  const translated = translate(lang, key);
  if (translated !== key) return translated;
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

function localizeSingleOrthocalSegment(text: string, lang: UiLanguage): string {
  const exact = translateExactFeast(text, lang);
  if (exact) return exact;

  const lectionary = localizeLectionaryTitle(text, lang, (part, partLang) => {
    const partExact = translateExactFeast(part, partLang);
    if (partExact) return partExact;
    return translateHonorifics(part, partLang);
  });
  if (lectionary) return lectionary;

  return translateHonorifics(text, lang);
}

/** Localize orthocal feast / saint name for display (canonical source stays English). */
export function localizeOrthocalText(text: string, lang: UiLanguage): string {
  if (lang === 'en' || !text.trim()) return text;

  // Compound Orthocal lines: "Feast; Saint" or "Leavetaking / Forefeast"
  const slashParts = text.split(/\s*\/\s*/).filter(Boolean);
  if (slashParts.length > 1) {
    return slashParts.map((part) => localizeSingleOrthocalSegment(part.trim(), lang)).join(' / ');
  }

  const parts = text.split(/\s*;\s*/).filter(Boolean);
  if (parts.length > 1) {
    return parts.map((part) => localizeSingleOrthocalSegment(part.trim(), lang)).join('; ');
  }

  return localizeSingleOrthocalSegment(text, lang);
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
