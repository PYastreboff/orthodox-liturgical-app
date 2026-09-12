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
  const indexKey = `${calendar}:${year}`;
  const [yearIndexState, setYearIndexState] = useState<{
    key: string;
    index: CalendarSearchResult[];
  }>({ key: indexKey, index: [] });

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.length < 2) return;

    let cancelled = false;

    loadCalendarSearchIndex(calendar, year).then((index) => {
      if (!cancelled) {
        setYearIndexState({ key: indexKey, index });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [calendar, debouncedQuery, indexKey, year]);

  const cachedDays = useMemo(
    () => getCachedDaysForCalendar(calendar),
    [calendar],
  );

  const cachedResults = useMemo(() => {
    if (debouncedQuery.length < 2) return [];
    return searchCachedCalendarIndex(cachedDays, debouncedQuery, filter, lang);
  }, [cachedDays, debouncedQuery, filter, lang]);

  const results = useMemo(() => {
    if (debouncedQuery.length < 2) return [];

    const yearIndex = yearIndexState.key === indexKey ? yearIndexState.index : [];
    const merged = searchCalendarIndex(yearIndex, debouncedQuery, filter, 40, lang);
    if (merged.length > 0) return merged;

    return cachedResults;
  }, [cachedResults, debouncedQuery, filter, lang, yearIndexState, indexKey]);

  const showMinCharsHint = query.trim().length > 0 && query.trim().length < 2;
  const effectiveLoadingYear =
    debouncedQuery.length >= 2 ? yearIndexState.key !== indexKey : false;
  const showNoResults =
    debouncedQuery.length >= 2 && !effectiveLoadingYear && results.length === 0;

  return {
    query,
    setQuery,
    filter,
    setFilter,
    results,
    loadingYear: effectiveLoadingYear,
    showMinCharsHint,
    showNoResults,
    clear: () => setQuery(''),
  };
}
