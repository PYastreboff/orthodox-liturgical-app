import { useCallback, useState } from 'react';

/**
 * A user-chosen value that auto-resets to a fresh default whenever a context
 * `signature` changes (derived state — no effect needed). When the signature
 * is unchanged the previous choice is preserved.
 */
export function useValidatedChoice<T>(
  signature: string,
  initial: () => T,
): { value: T; choose: (next: T) => void } {
  const [state, setState] = useState<{ signature: string; value: T }>(() => ({
    signature,
    value: initial(),
  }));

  const value = state.signature === signature ? state.value : initial();
  const choose = useCallback(
    (next: T) => setState({ signature, value: next }),
    [signature],
  );

  return { value, choose };
}