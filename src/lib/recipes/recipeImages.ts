import type { ImageSourcePropType } from 'react-native';

/**
 * Recipe photos live in the GitHub repo (`assets/recipes/{id}.jpg`).
 * They load at runtime over the network so they are not packed into the app binary.
 *
 * Primary (GitHub raw — live as soon as files are on `main`):
 *   https://raw.githubusercontent.com/PYastreboff/orthodox-liturgical-app/main/assets/recipes/{id}.jpg
 *
 * Override with EXPO_PUBLIC_RECIPE_IMAGE_BASE if needed.
 */
const DEFAULT_BASE =
  'https://raw.githubusercontent.com/PYastreboff/orthodox-liturgical-app/main/assets/recipes';

const JSDELIVR_BASE =
  'https://cdn.jsdelivr.net/gh/PYastreboff/orthodox-liturgical-app@main/assets/recipes';

const RECIPE_IMAGE_BASE =
  (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_RECIPE_IMAGE_BASE?.trim()) ||
  DEFAULT_BASE;

/** Recipe ids that have a matching `{id}.jpg` in assets/recipes. */
const RECIPE_IMAGE_IDS = new Set([
  'oat-porridge',
  'hummus',
  'lentil-soup',
  'bean-stew',
  'cabbage-salad',
  'potato-hash',
  'fruit-compote',
  'buckwheat',
  'herbal-tea',
  'smoothie-bowl',
  'vegetable-laksa',
  'beet-bean-salad',
  'spinach-rice',
  'chickpea-soup',
  'mushroom-barley',
  'stuffed-peppers',
  'split-pea-porridge',
  'lenten-borscht',
  'tomato-orzo',
  'banana-oat-cookies',
  'palikaria',
  'gigantes-plaki',
  'briam',
  'fasolatha',
  'semolina-halva',
  'artichoke-stew',
  'black-eyed-spinach',
  'brownie-baked-oatmeal',
  'berry-orange-smoothie',
  'apple-oatmeal-muffins',
  'greek-potato-salad',
  'red-cabbage-apple',
  'spinach-strawberry-salad',
  'maroulosalata',
  'quinoa-chickpea-salad',
  'squash-couscous-salad',
  'mung-bean-soup',
  'black-eyed-kale-soup',
  'green-beans-potatoes',
  'herbed-orzo-chickpeas',
  'roasted-cauliflower',
  'beans-and-rice',
  'eggplant-potato-bake',
  'stuffed-eggplant',
  'youvetsi-chickpeas',
  'sweet-potato-quesadilla',
  'vegan-chili',
  'stuffed-calamari',
  'octopus-pasta',
  'shrimp-rice',
  'calamari-rice',
  'eggplant-blt',
  'chickpea-wraps',
  'lentil-bulgur-wraps',
  'dandelion-toast',
  'horta',
  'oatmeal-cups',
  'stuffed-dates',
  'vegan-rizogalo',
  'date-cake',
  'chocolate-blueberry-cake',
  'chocolate-strawberry-cookies',
  'chocolate-orange-cake',
  'vegan-apple-cake',
  'vegan-banana-bread',
  'tahini-cookies',
  'lagana',
  'marinated-olives',
  'skordalia',
  'pickled-vegetables',
  'santorini-fava',
  'taramosalata',
  'dolmades',
  'skillet-lemon-potatoes',
  'lenten-spanakopita',
  'longevity-stew',
  'paximadia',
]);

export function recipeImageUri(recipeId: string): string | null {
  if (!RECIPE_IMAGE_IDS.has(recipeId)) return null;
  return `${RECIPE_IMAGE_BASE.replace(/\/$/, '')}/${recipeId}.jpg`;
}

/** Alternate host when the primary CDN misses a newly pushed file. */
export function recipeImageUriFallback(recipeId: string): string | null {
  if (!RECIPE_IMAGE_IDS.has(recipeId)) return null;
  const override =
    typeof process !== 'undefined' && process.env.EXPO_PUBLIC_RECIPE_IMAGE_BASE?.trim();
  if (override) return null;
  return `${JSDELIVR_BASE}/${recipeId}.jpg`;
}

export function recipeImageSource(recipeId: string): ImageSourcePropType | null {
  const uri = recipeImageUri(recipeId);
  return uri ? { uri } : null;
}
