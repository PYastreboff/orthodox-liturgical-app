import { useLayoutSafeAreaInsets } from './useLayoutSafeAreaInsets';
import { useTabHeaderShown } from './useTabHeaderShown';

/** Insets for scroll content — backgrounds extend edge-to-edge behind notch / home bar. */
export function useScreenSafePadding() {
  const insets = useLayoutSafeAreaInsets();
  const showTabHeader = useTabHeaderShown();

  return {
    paddingTop: showTabHeader ? 0 : insets.top,
    paddingLeft: insets.left,
    paddingRight: insets.right,
  };
}
