import { useCallback, useEffect, type RefObject } from 'react';
import type { ScrollView } from 'react-native';
import { useScrollToTop } from 'expo-router';

import { tabBarScrollStore } from '../state/tabBarScrollStore';

export type TabScrollSource = RefObject<ScrollView | null>;

/**
 * Wires a tab's `AppScrollView` to the shared tab bar:
 * - reports its vertical scroll offset so the tab bar can shrink when scrolled down
 * - scrolls back to the top when the active tab is tapped again (quick, animated)
 */
export function useTabBarScroll(route: string, ref: TabScrollSource) {
  useScrollToTop(ref);

  const handleScroll = useCallback(
    (event: { nativeEvent: { contentOffset?: { y?: number } } }) => {
      tabBarScrollStore.setOffset(route, event.nativeEvent.contentOffset?.y ?? 0);
    },
    [route],
  );

  useEffect(() => {
    return () => tabBarScrollStore.clear(route);
  }, [route]);

  return handleScroll;
}
