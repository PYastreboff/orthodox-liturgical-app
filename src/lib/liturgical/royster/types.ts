/** Sticheron-style verse pair from the Royster/Ponomar lectionary tables. */
export type RoysterSticheron = {
  tone: number;
  /** Display citation (LXX psalm numbering as in Royster). */
  citation: string;
  /** Optional getBible-style citation for Slavonic psalm lookup. */
  scriptureCitation?: string;
  lines: [string, string];
};

export type RoysterCommunion = {
  citation: string;
  scriptureCitation?: string;
  lines: [string];
  alternate?: {
    citation: string;
    lines: [string];
  };
};

export type RoysterLiturgySequence = {
  prokeimenon: RoysterSticheron;
  alleluia: RoysterSticheron;
  communion: RoysterCommunion;
};

/** 0 = Sunday … 6 = Saturday (orthocal `weekday`). */
export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type ToneNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
