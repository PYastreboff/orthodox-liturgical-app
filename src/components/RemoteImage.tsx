import { Image, type ImageStyle } from 'expo-image';
import { useState, type ReactNode } from 'react';
import type { StyleProp } from 'react-native';

type Props = {
  /** Candidate URLs in load order; the next one is tried when a load fails. */
  uris: readonly string[];
  style: StyleProp<ImageStyle>;
  /** Rendered when there are no candidates or every one failed. */
  fallback: ReactNode;
};

/** Remote photo cached in memory and on disk, so it shows instantly and offline once seen. */
export function RemoteImage({ uris, style, fallback }: Props) {
  const first = uris[0] ?? '';
  const [attempt, setAttempt] = useState({ first, index: 0 });
  const index = attempt.first === first ? attempt.index : 0;
  const uri = uris[index];

  if (!uri) return <>{fallback}</>;

  return (
    <Image
      key={uri}
      source={{ uri }}
      style={style}
      contentFit="cover"
      cachePolicy="memory-disk"
      recyclingKey={first}
      transition={150}
      onLoad={() => {
        if (__DEV__) console.log('[RemoteImage] loaded', uri);
      }}
      onError={(event) => {
        if (__DEV__) console.warn('[RemoteImage] failed', uri, event.error);
        setAttempt({ first, index: index + 1 });
      }}
    />
  );
}
