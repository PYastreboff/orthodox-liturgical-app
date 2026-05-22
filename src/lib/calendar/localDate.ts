export function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

/** Civil calendar day as YYYY-MM-DD (local timezone). */
export function toDayIso(date: Date): string {
  const d = startOfLocalDay(date);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function fromDayIso(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const day = Number(match[3]);
  if (m < 1 || m > 12 || day < 1 || day > 31) return null;
  return startOfLocalDay(new Date(y, m - 1, day));
}
