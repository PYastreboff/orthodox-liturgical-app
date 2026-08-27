import { dateToJulianPlainDate, julianCalendarToGregorian } from './calendar/julianGregorian';
import type { PrimaryCalendar } from './calendar/dateDisplay';
import { startOfLocalDay } from './calendar/localDate';
import { translate } from '../i18n/translate';
import { intlLocaleForLanguage } from '../i18n/locale';
import type { UiLanguage } from '../i18n/types';

export type PersonalDayKind =
  | 'parish_feast'
  | 'nameday'
  | 'birthday'
  | 'custom_event'
  | 'repose';

/** Calendar marker variant for a repose entry (anniversary vs 40th-day memorial). */
export type PersonalDayDisplayKind = PersonalDayKind | 'repose_fortieth';

export type PersonalDayCalendar = PrimaryCalendar;

export type PersonalDay = {
  id: string;
  kind: PersonalDayKind;
  title: string;
  /** Month/day in `calendar` (not converted until matched to a civil date). */
  month: number;
  day: number;
  calendar: PersonalDayCalendar;
  /** Local notification on the evening before. */
  remindEve: boolean;
  /**
   * Repose only — calendar year of the repose (in `calendar`).
   * Anniversary still recurs by month/day; the 40th day is computed once from this year.
   */
  year?: number;
  /** Repose only — show the one-time 40th-day memorial on the calendar (day of repose = day 1). */
  showFortiethDay?: boolean;
};

export type PersonalDayOccurrence = {
  day: PersonalDay;
  variant: 'default' | 'fortieth';
};

export const MAX_PERSONAL_DAYS = 24;

/** Orthodox 40th-day memorial: repose is day 1, so add 39 civil days. */
export const FORTIETH_DAY_OFFSET = 39;

const KINDS: PersonalDayKind[] = [
  'parish_feast',
  'nameday',
  'birthday',
  'custom_event',
  'repose',
];

const MIN_REPOSE_YEAR = 1800;
const MAX_REPOSE_YEAR = 2100;

export function newPersonalDayId(): string {
  return `pd_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function daysInCalendarMonth(month: number): number {
  return new Date(2024, month, 0).getDate();
}

export function clampPersonalDate(month: number, day: number): { month: number; day: number } {
  const m = Math.min(12, Math.max(1, Math.round(month)));
  const maxDay = daysInCalendarMonth(m);
  const d = Math.min(maxDay, Math.max(1, Math.round(day)));
  return { month: m, day: d };
}

export function clampReposeYear(year: number): number {
  return Math.min(MAX_REPOSE_YEAR, Math.max(MIN_REPOSE_YEAR, Math.round(year)));
}

function parseCalendar(value: unknown): PersonalDayCalendar {
  return value === 'julian' ? 'julian' : 'gregorian';
}

function parseReposeYear(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return clampReposeYear(value);
  }
  return clampReposeYear(new Date().getFullYear());
}

export function parsePersonalDays(raw: unknown): PersonalDay[] {
  if (!Array.isArray(raw)) return [];
  const out: PersonalDay[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const rec = item as Record<string, unknown>;
    if (typeof rec.id !== 'string' || !rec.id.trim()) continue;
    if (!isPersonalDayKind(rec.kind)) continue;
    if (typeof rec.title !== 'string') continue;
    const title = rec.title.trim();
    if (!title) continue;
    if (typeof rec.month !== 'number' || typeof rec.day !== 'number') continue;
    const { month, day } = clampPersonalDate(rec.month, rec.day);
    const kind = rec.kind;
    out.push({
      id: rec.id.trim(),
      kind,
      title,
      month,
      day,
      calendar: parseCalendar(rec.calendar),
      remindEve: rec.remindEve === true,
      ...(kind === 'repose'
        ? {
            year: parseReposeYear(rec.year),
            showFortiethDay: rec.showFortiethDay !== false,
          }
        : null),
    });
    if (out.length >= MAX_PERSONAL_DAYS) break;
  }
  return out;
}

export function gregorianMonthDay(civil: Date): { month: number; day: number } {
  return { month: civil.getMonth() + 1, day: civil.getDate() };
}

function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function addLocalDays(date: Date, days: number): Date {
  const next = startOfLocalDay(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Civil date for a personal month/day in a given calendar year. */
export function civilDateForPersonalDayInYear(day: PersonalDay, year: number): Date {
  if (day.calendar === 'gregorian') {
    return startOfLocalDay(new Date(year, day.month - 1, day.day));
  }
  const g = julianCalendarToGregorian(year, day.month, day.day);
  return startOfLocalDay(new Date(g.year, g.month - 1, g.day));
}

/** One-time 40th-day memorial civil date from the year of repose (repose day = day 1). */
export function fortiethDayCivilDateForRepose(repose: PersonalDay): Date | null {
  if (repose.kind !== 'repose' || repose.year == null) return null;
  return addLocalDays(
    civilDateForPersonalDayInYear(repose, clampReposeYear(repose.year)),
    FORTIETH_DAY_OFFSET,
  );
}

export function personalDaysOnCivilDate(
  days: readonly PersonalDay[],
  civil: Date,
): PersonalDay[] {
  const gregorian = gregorianMonthDay(civil);
  const julian = dateToJulianPlainDate(civil);
  return days.filter((day) => {
    const md = day.calendar === 'julian' ? julian : gregorian;
    return day.month === md.month && day.day === md.day;
  });
}

export function personalDayOccurrencesOnCivilDate(
  days: readonly PersonalDay[],
  civil: Date,
): PersonalDayOccurrence[] {
  const onDay = personalDaysOnCivilDate(days, civil);
  const out: PersonalDayOccurrence[] = onDay.map((day) => ({ day, variant: 'default' }));

  for (const day of days) {
    if (day.kind !== 'repose' || day.showFortiethDay === false) continue;
    const fortieth = fortiethDayCivilDateForRepose(day);
    if (!fortieth || !isSameLocalDay(fortieth, civil)) continue;
    // If the 40th day falls on the same civil calendar day as the anniversary
    // (unusual), still show the fortieth label only when it is not already listed.
    if (onDay.some((entry) => entry.id === day.id)) continue;
    out.push({ day, variant: 'fortieth' });
  }

  return out;
}

export function displayKindForOccurrence(occurrence: PersonalDayOccurrence): PersonalDayDisplayKind {
  if (occurrence.variant === 'fortieth') return 'repose_fortieth';
  return occurrence.day.kind;
}

export function calendarLabelForOccurrence(
  occurrence: PersonalDayOccurrence,
  lang: UiLanguage,
): string {
  if (occurrence.variant === 'fortieth') {
    return translate(lang, 'settings.reposeFortiethCalendarLabel', {
      name: occurrence.day.title,
    });
  }
  return occurrence.day.title;
}

export function formatPersonalDayDate(
  day: Pick<PersonalDay, 'month' | 'day' | 'calendar' | 'year' | 'kind'>,
  lang: UiLanguage,
): string {
  const locale = intlLocaleForLanguage(lang);
  const monthName = new Intl.DateTimeFormat(locale, { month: 'long' }).format(
    new Date(2024, day.month - 1, 1),
  );
  const calendarLabel =
    day.calendar === 'julian'
      ? translate(lang, 'settings.calendarJulian')
      : translate(lang, 'settings.calendarGregorian');
  if (day.kind === 'repose' && day.year != null) {
    return `${day.day} ${monthName} ${day.year} · ${calendarLabel}`;
  }
  return `${day.day} ${monthName} · ${calendarLabel}`;
}

export function formatFortiethDayPreview(
  repose: Pick<PersonalDay, 'month' | 'day' | 'calendar' | 'year'>,
  lang: UiLanguage,
): string {
  const fortieth = fortiethDayCivilDateForRepose({
    id: '',
    kind: 'repose',
    title: '',
    month: repose.month,
    day: repose.day,
    calendar: repose.calendar,
    year: repose.year ?? new Date().getFullYear(),
    remindEve: false,
  });
  if (!fortieth) return '';
  const locale = intlLocaleForLanguage(lang);
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(fortieth);
}

export function isPersonalDayKind(value: unknown): value is PersonalDayKind {
  return typeof value === 'string' && KINDS.includes(value as PersonalDayKind);
}
