/**
 * Tiny external store coordinating each tab's scroll offset with the shared
 * floating tab bar.
 *
 * Screens report their vertical scroll offset (keyed by tab route name) and the
 * tab bar subscribes so it can shrink when the active tab is scrolled down and
 * the user is not actively interacting with the bar.  Using
 * `useSyncExternalStore` keeps scroll-driven updates local to the tab bar
 * instead of re-rendering the whole screen tree on every scroll frame.
 */

type Listener = () => void;

const SCROLL_SHRINK_THRESHOLD = 24;

let offsets: Record<string, number> = {};
let prevOffsets: Record<string, number> = {};
let touchCleared = false;
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) listener();
}

export const tabBarScrollStore = {
  /** Report the vertical scroll offset for a tab route. */
  setOffset(route: string, y: number) {
    if (touchCleared) {
      touchCleared = false;
    }
    if (offsets[route] === y) return;
    prevOffsets[route] = offsets[route] ?? y;
    offsets[route] = y;
    emit();
  },

  /** Forget a tab's offset when its scroll view unmounts. */
  clear(route: string) {
    if (!(route in offsets)) return;
    delete offsets[route];
    delete prevOffsets[route];
    emit();
  },

  /**
   * True when the tab bar should show its shrunk state.
   *
   * Returns false immediately when:
   *  - the user has touched the bar (touchCleared)
   *  - the user is scrolling upward (current offset < previous)
   *
   * Returns true only when offset exceeds the threshold AND the user is
   * scrolling downward (or holding still).
   */
  isScrolledDown(route: string): boolean {
    if (touchCleared) return false;
    const y = offsets[route] ?? 0;
    const prev = prevOffsets[route] ?? y;
    if (y < prev) return false;
    return y > SCROLL_SHRINK_THRESHOLD;
  },

  /** Clear shrink immediately (called on bar touch). */
  touchReset() {
    touchCleared = true;
    emit();
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
