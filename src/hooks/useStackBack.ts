import { useRouter, type Href } from 'expo-router';
import { useCallback } from 'react';

/** Navigate back, or replace with a fallback when there is no stack history. */
export function useStackBack(fallback: Href) {
  const router = useRouter();
  return useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace(fallback);
  }, [fallback, router]);
}
