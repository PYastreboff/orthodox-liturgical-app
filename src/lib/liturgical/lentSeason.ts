/** True from Clean Monday through Holy Saturday (incl. Lent Sundays/Saturdays). */
export function isGreatLentSeason(appearanceKey: string): boolean {
  return (
    appearanceKey === 'great_lent' ||
    appearanceKey === 'lent_sunday' ||
    appearanceKey === 'lent_saturday' ||
    appearanceKey === 'holy_week' ||
    appearanceKey === 'great_friday' ||
    appearanceKey === 'holy_saturday'
  );
}
