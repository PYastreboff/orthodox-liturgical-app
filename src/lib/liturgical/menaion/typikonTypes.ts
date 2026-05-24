export type TypikonHymn = {
  type: string;
  echo: number | null;
  titleRu: string | null;
  textRu: string;
};

export type TypikonFeastEntry = {
  titleRu: string;
  rank: string | null;
  feastType: string | null;
  julian: string | null;
  easterDays: number | null;
  hymns: TypikonHymn[];
};

export type TypikonIndex = {
  byJulian: Record<string, TypikonFeastEntry[]>;
  movable: TypikonFeastEntry[];
};
