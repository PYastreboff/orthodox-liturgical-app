/**
 * Recipe photos live in the GitHub repo (`assets/recipes/{id}.webp`, generated
 * from the `.jpg` originals by `npm run generate:thumbs`). They load at runtime
 * so they are not packed into the app binary.
 *
 * Primary: WebP from the jsDelivr CDN (long-lived cache). Fallback: the `.jpg`
 * original from GitHub raw, which picks up newly pushed files immediately.
 *
 * Override with EXPO_PUBLIC_RECIPE_IMAGE_BASE if needed.
 */
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/PYastreboff/orthodox-liturgical-app@main/assets/recipes';

const RAW_BASE =
  'https://raw.githubusercontent.com/PYastreboff/orthodox-liturgical-app/main/assets/recipes';

const OVERRIDE_BASE =
  typeof process !== 'undefined'
    ? process.env.EXPO_PUBLIC_RECIPE_IMAGE_BASE?.trim().replace(/\/$/, '')
    : undefined;

/** Recipe ids that have a matching photo in assets/recipes. */
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
  'barley-vegetable-pilaf',
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
  'grilled-vegetable-platter',
  'honey-yogurt-parfait',
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
  'melitzanosalata',
  'pea-mint-soup',
  'red-lentil-dal',
  'rustic-lenten-bread',
  'walnut-halva-bites',
  'kolyva',
  'paximadia',
]);

function photoUris(file: string): string[] {
  if (OVERRIDE_BASE) return [`${OVERRIDE_BASE}/${file}.webp`, `${OVERRIDE_BASE}/${file}.jpg`];
  return [`${CDN_BASE}/${file}.webp`, `${RAW_BASE}/${file}.jpg`];
}

/** Full-size photo candidates for the detail hero, in load order. */
export function recipeImageUris(recipeId: string): string[] {
  return RECIPE_IMAGE_IDS.has(recipeId) ? photoUris(recipeId) : [];
}

/** Thumbnail candidates for list rows, falling back to the full photo. */
export function recipeThumbUris(recipeId: string): string[] {
  if (!RECIPE_IMAGE_IDS.has(recipeId)) return [];
  return [...photoUris(`${recipeId}-thumb`), ...photoUris(recipeId)];
}
