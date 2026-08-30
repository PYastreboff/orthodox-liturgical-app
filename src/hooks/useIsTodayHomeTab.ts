import { useSegments } from 'expo-router';

/** True when the Today tab (home) is the active main tab. */
export function useIsTodayHomeTab(): boolean {
  const segments = useSegments();
  if (segments[0] !== '(tabs)') return false;
  const tab = segments.at(1);
  return tab === undefined || tab === 'index';
}
