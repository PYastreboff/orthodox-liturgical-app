import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { fromDayIso, toDayIso } from '../calendar/localDate';

const DEFAULT_WEB_ORIGIN = 'https://pyastreboff.github.io/orthodox-liturgical-app';

/** Civil day from `?date=YYYY-MM-DD` (web query or deep link). */
export function parseDayIsoFromQueryParam(value: string | string[] | null | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || typeof raw !== 'string') return null;
  const day = fromDayIso(raw.trim());
  return day ? toDayIso(day) : null;
}

export function readDayIsoFromWebLocation(): string | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  return parseDayIsoFromQueryParam(new URLSearchParams(window.location.search).get('date'));
}

/** App root URL for shared links (includes Expo `baseUrl` on web). */
export function getAppWebBaseUrl(): string {
  const basePath = (Constants.expoConfig?.experiments?.baseUrl as string | undefined) ?? '';
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const path = window.location.pathname.replace(/\/$/, '') || basePath.replace(/\/$/, '');
    return `${window.location.origin}${path}`;
  }
  const trimmed = basePath.replace(/\/$/, '');
  return trimmed ? `${DEFAULT_WEB_ORIGIN}${trimmed}` : DEFAULT_WEB_ORIGIN;
}

export function buildDayShareUrl(dayIso: string): string {
  const base = getAppWebBaseUrl();
  const url = new URL(base);
  url.searchParams.set('date', dayIso);
  return url.toString();
}

export function syncDayQueryParamOnWeb(dayIso: string): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
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
