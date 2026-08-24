import { dateToJulianPlainDate } from './calendar/julianGregorian';
import type { PrimaryCalendar } from './calendar/dateDisplay';
import { translate } from '../i18n/translate';
import { intlLocaleForLanguage } from '../i18n/locale';
import type { UiLanguage } from '../i18n/types';

export type PersonalDayKind = 'parish_feast' | 'nameday' | 'custom_event';
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
};

export const MAX_PERSONAL_DAYS = 24;

const KINDS: PersonalDayKind[] = ['parish_feast', 'nameday', 'custom_event'];

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

function parseCalendar(value: unknown): PersonalDayCalendar {
  return value === 'julian' ? 'julian' : 'gregorian';
}

export function parsePersonalDays(raw: unknown): PersonalDay[] {
  if (!Array.isArray(raw)) return [];
  const out: PersonalDay[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const rec = item as Record<string, unknown>;
    if (typeof rec.id !== 'string' || !rec.id.trim()) continue;
    if (rec.kind !== 'parish_feast' && rec.kind !== 'nameday' && rec.kind !== 'custom_event') continue;
    if (typeof rec.title !== 'string') continue;
    const title = rec.title.trim();
    if (!title) continue;
    if (typeof rec.month !== 'number' || typeof rec.day !== 'number') continue;
    const { month, day } = clampPersonalDate(rec.month, rec.day);
    out.push({
      id: rec.id.trim(),
      kind: rec.kind,
      title,
      month,
      day,
      calendar: parseCalendar(rec.calendar),
      remindEve: rec.remindEve === true,
    });
    if (out.length >= MAX_PERSONAL_DAYS) break;
  }
  return out;
}

export function gregorianMonthDay(civil: Date): { month: number; day: number } {
  return { month: civil.getMonth() + 1, day: civil.getDate() };
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

export function formatPersonalDayDate(
  day: Pick<PersonalDay, 'month' | 'day' | 'calendar'>,
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
  return `${day.day} ${monthName} · ${calendarLabel}`;
}

export function isPersonalDayKind(value: unknown): value is PersonalDayKind {
  return typeof value === 'string' && KINDS.includes(value as PersonalDayKind);
}
