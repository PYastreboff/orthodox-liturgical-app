import type { EasterFoodId } from './easterCooking';

/**
 * Easter food photos live in the GitHub repo (`assets/easter/{id}.webp`,
 * generated from the `.jpg` originals by `npm run generate:thumbs`). They load
 * at runtime so they are not packed into the app binary.
 *
 * Primary: WebP from the jsDelivr CDN. Fallback: the `.jpg` original from GitHub raw.
 *
 * Override with EXPO_PUBLIC_EASTER_IMAGE_BASE if needed.
 */
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/PYastreboff/orthodox-liturgical-app@main/assets/easter';

const RAW_BASE =
  'https://raw.githubusercontent.com/PYastreboff/orthodox-liturgical-app/main/assets/easter';

const OVERRIDE_BASE =
  typeof process !== 'undefined'
    ? process.env.EXPO_PUBLIC_EASTER_IMAGE_BASE?.trim().replace(/\/$/, '')
    : undefined;

/** Easter food ids that have a matching photo in assets/easter. */
const EASTER_IMAGE_IDS = new Set<EasterFoodId>(['pascha', 'kulich', 'tsoureki', 'red_eggs']);

function photoUris(file: string): string[] {
  if (OVERRIDE_BASE) return [`${OVERRIDE_BASE}/${file}.webp`, `${OVERRIDE_BASE}/${file}.jpg`];
  return [`${CDN_BASE}/${file}.webp`, `${RAW_BASE}/${file}.jpg`];
}

/** Full-size photo candidates for the detail hero, in load order. */
export function easterFoodImageUris(id: string): string[] {
  return EASTER_IMAGE_IDS.has(id as EasterFoodId) ? photoUris(id) : [];
}

/** Thumbnail candidates for list rows, falling back to the full photo. */
export function easterFoodThumbUris(id: string): string[] {
  if (!EASTER_IMAGE_IDS.has(id as EasterFoodId)) return [];
  return [...photoUris(`${id}-thumb`), ...photoUris(id)];
}
