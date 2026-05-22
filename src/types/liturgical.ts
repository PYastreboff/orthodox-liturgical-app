/** Feast / service rank for UI and vestments — extend to match your content pack. */
export type FeastRank =
  | 'ordinary'
  | 'six_stichera'
  | 'doxology'
  | 'polyeleos'
  | 'vigil'
  | 'great_feast';

export type FastingLevel =
  | 'no_fast'
  | 'wine_oil'
  | 'fish'
  | 'strict'
  | 'fast_free_week';

export type ClergyRole = 'layperson' | 'altar_server' | 'deacon' | 'priest' | 'bishop';

export type LiturgicalDaySummary = {
  jurisdictionId: string;
  /** Julian calendar liturgical date (year-month-day as observed by the pack). */
  julianDate: string;
  /** Optional civil / Gregorian label for display. */
  gregorianDisplay?: string;
  tone: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  fasting: FastingLevel;
  feastRank: FeastRank;
  commemorations: string[];
};
