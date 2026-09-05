import { fromDayIso, toDayIso } from '../calendar/localDate';
import { getAppWebBaseUrl } from './shareBaseUrl';

/** Civil day from `?date=YYYY-MM-DD` (web query or deep link). */
export function parseDayIsoFromQueryParam(value: string | string[] | null | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || typeof raw !== 'string') return null;
  const day = fromDayIso(raw.trim());
  return day ? toDayIso(day) : null;
}

function hasWebBrowserApis(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.location !== 'undefined' &&
    typeof window.history !== 'undefined'
  );
}

export function readDayIsoFromWebLocation(): string | null {
  if (!hasWebBrowserApis()) return null;
  return parseDayIsoFromQueryParam(new URLSearchParams(window.location.search).get('date'));
}

/** @see getAppWebBaseUrl in ./shareBaseUrl */
export { getAppWebBaseUrl } from './shareBaseUrl';

export function buildDayShareUrl(dayIso: string): string {
  const base = getAppWebBaseUrl();
  const url = new URL(base);
  url.searchParams.set('date', dayIso);
  return url.toString();
}

export function syncDayQueryParamOnWeb(dayIso: string): void {
  if (!hasWebBrowserApis()) return;
  const url = new URL(window.location.href);
  if (url.searchParams.get('date') === dayIso) return;
  url.searchParams.set('date', dayIso);
  window.history.replaceState({}, '', url.toString());
}

export type DayShareTextInput = {
  dayIso: string;
  dayTitle: string;
  dateLabel: string;
  fastLabel: string;
  feastHighlight?: string | null;
};

function normalizeShareLine(value: string): string {
  return value.trim().toLowerCase();
}

/** Share body without the URL — used when the platform attaches the link separately. */
export function buildDayShareBody(input: DayShareTextInput, appName: string): string {
  const lines = [appName, input.dayTitle, input.dateLabel, input.fastLabel];
  const highlight = input.feastHighlight?.trim();
  if (
    highlight &&
    normalizeShareLine(highlight) !== normalizeShareLine(input.dayTitle)
  ) {
    lines.push(highlight);
  }
  return lines.join('\n');
}

export function buildDayShareMessage(input: DayShareTextInput, appName: string): string {
  return `${buildDayShareBody(input, appName)}\n${buildDayShareUrl(input.dayIso)}`;
}
