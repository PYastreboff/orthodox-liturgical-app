import { useNavigationState } from "expo-router/react-navigation";

/**
 * True when the Today (home) tab is the active main tab.
 *
 * Reads the live navigation state (instead of expo-router's `useSegments`) and
 * recurses into the `(tabs)` navigator, so it reports the correct value both
 * from the tabs layout (`_layout.tsx`, where the nearest state is the root
 * stack whose active route is `(tabs)`) and from components rendered inside the
 * tabs navigator (whose nearest state is the tabs state with an `index` route).
 */
export function useIsTodayHomeTab(): boolean {
  return useNavigationState((state) => isTodayTabActive(state));
}

function isTodayTabActive(state: unknown): boolean {
  if (!state || typeof state !== 'object') return false;
  const s = state as { routes?: { name?: string; state?: unknown }[]; index?: number };
  if (!Array.isArray(s.routes)) return false;
  const active = s.routes[Math.max(0, s.index ?? 0)];
  if (!active) return false;
  if (active.name === 'index') return true;
  if (active.state) return isTodayTabActive(active.state);
  return false;
}
