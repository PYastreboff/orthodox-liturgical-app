import { useEffect, useMemo, useState } from 'react';

import type { PrimaryCalendar } from '../lib/calendar/dateDisplay';
import {
  loadCalendarSearchIndex,
  searchCachedCalendarIndex,
  searchCalendarIndex,
  type CalendarSearchFilter,
  type CalendarSearchResult,
} from '../lib/liturgical/calendarSearch';
import {
  getCachedDaysForCalendar,
} from '../lib/liturgical/orthocalMonthCache';
import type { UiLanguage } from '../i18n/types';

export function useCalendarSearch(
  calendar: PrimaryCalendar,
  year: number,
  lang: UiLanguage = 'en',
) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<CalendarSearchFilter>('all');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [yearIndex, setYearIndex] = useState<CalendarSearchResult[]>([]);
  const [loadingYear, setLoadingYear] = useState(false);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    setYearIndex([]);
  }, [calendar, year]);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setLoadingYear(false);
      return;
    }

    let cancelled = false;
    setLoadingYear(true);

    loadCalendarSearchIndex(calendar, year).then((index) => {
      if (!cancelled) {
        setYearIndex(index);
        setLoadingYear(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [calendar, debouncedQuery, year]);

  const cachedDays = useMemo(
    () => getCachedDaysForCalendar(calendar),
    [calendar, debouncedQuery, yearIndex.length],
  );

  const cachedResults = useMemo(() => {
    if (debouncedQuery.length < 2) return [];
    return searchCachedCalendarIndex(cachedDays, debouncedQuery, filter, lang);
  }, [cachedDays, debouncedQuery, filter, lang]);

  const results = useMemo(() => {
    if (debouncedQuery.length < 2) return [];

    const merged = searchCalendarIndex(yearIndex, debouncedQuery, filter, 40, lang);
    if (merged.length > 0) return merged;

    return cachedResults;
  }, [cachedResults, debouncedQuery, filter, lang, yearIndex]);

  const showMinCharsHint = query.trim().length > 0 && query.trim().length < 2;
  const showNoResults = debouncedQuery.length >= 2 && !loadingYear && results.length === 0;

  return {
    query,
    setQuery,
    filter,
    setFilter,
    results,
    loadingYear,
    showMinCharsHint,
    showNoResults,
    clear: () => setQuery(''),
  };
}
