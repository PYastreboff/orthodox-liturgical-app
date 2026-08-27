import type { ImageSourcePropType } from 'react-native';

import type { EasterFoodId } from './easterCooking';

/**
 * Easter food photos live in the GitHub repo (`assets/easter/{id}.jpg`).
 * They load at runtime over the network so they are not packed into the app binary.
 *
 * Primary (GitHub raw — live as soon as files are on `main`):
 *   https://raw.githubusercontent.com/PYastreboff/orthodox-liturgical-app/main/assets/easter/{id}.jpg
 *
 * Override with EXPO_PUBLIC_EASTER_IMAGE_BASE if needed.
 */
const DEFAULT_BASE =
  'https://raw.githubusercontent.com/PYastreboff/orthodox-liturgical-app/main/assets/easter';

const JSDELIVR_BASE =
  'https://cdn.jsdelivr.net/gh/PYastreboff/orthodox-liturgical-app@main/assets/easter';

const EASTER_IMAGE_BASE =
  (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_EASTER_IMAGE_BASE?.trim()) ||
  DEFAULT_BASE;

/** Easter food ids that have a matching `{id}.jpg` in assets/easter. */
const EASTER_IMAGE_IDS = new Set<EasterFoodId>(['pascha', 'kulich', 'tsoureki', 'red_eggs']);

export function easterFoodImageUri(id: string): string | null {
  if (!EASTER_IMAGE_IDS.has(id as EasterFoodId)) return null;
  return `${EASTER_IMAGE_BASE.replace(/\/$/, '')}/${id}.jpg`;
}

/** Alternate host when the primary CDN misses a newly pushed file. */
export function easterFoodImageUriFallback(id: string): string | null {
  if (!EASTER_IMAGE_IDS.has(id as EasterFoodId)) return null;
  const override =
    typeof process !== 'undefined' && process.env.EXPO_PUBLIC_EASTER_IMAGE_BASE?.trim();
  if (override) return null;
  return `${JSDELIVR_BASE}/${id}.jpg`;
}

export function easterFoodImageSource(id: string): ImageSourcePropType | null {
  const uri = easterFoodImageUri(id);
  return uri ? { uri } : null;
}
