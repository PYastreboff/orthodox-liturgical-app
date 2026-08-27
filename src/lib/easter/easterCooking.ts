import type { UiLanguage } from '../../i18n/types';
import type {
  FastingRecipe,
  LocalizedLines,
  LocalizedText,
  RecipeCategory,
  RecipeDifficulty,
} from '../recipes/fastingRecipes';
import { recipeTotalMinutes } from '../recipes/fastingRecipes';

export const EASTER_FOOD_IDS = ['pascha', 'kulich', 'tsoureki', 'red_eggs'] as const;

export type EasterFoodId = (typeof EASTER_FOOD_IDS)[number];

export type EasterFood = {
  id: EasterFoodId;
  category: RecipeCategory;
  difficulty: RecipeDifficulty;
  prepMinutes: number;
  cookMinutes: number;
  servings: number;
  servingSize: LocalizedText;
  title: LocalizedText;
  /** Why this food belongs on the Paschal table — shown as recipe notes on the detail page. */
  meaning: LocalizedText;
  summary: LocalizedText;
  ingredients: LocalizedLines;
  steps: LocalizedLines;
  tips?: LocalizedLines;
};

type LocalizedTextInput = Record<UiLanguage, string>;
type LocalizedLinesInput = Record<UiLanguage, string[]>;

export const EASTER_FOODS: readonly EasterFood[] = [
  {
    id: 'pascha',
    category: 'sweet',
    difficulty: 'medium',
    prepMinutes: 45,
    cookMinutes: 0,
    servings: 12,
    servingSize: L('wedge', 'кусок', 'μερίδα'),
    title: L('Pascha (sweet cheese)', 'Пасха (творожная)', 'Πασχαλινό τυρί (Πάσχα)'),
    meaning: L(
      'The white, sweet cheese Pascha recalls the joy of the empty tomb and Christ risen. Its round form and “Christ is Risen” seal point to eternal life breaking through death — the heart of the feast.',
      'Белая сладкая пасха напоминает о пустом гробе и Воскресшем Христе. Круглая форма и печать «Христос Воскресе» — символ жизни, победившей смерть.',
      'Το λευκό, γλυκό τυρί της Πάσχας θυμίζει τον άδειο τάφο και τον Αναστάντα Χριστό. Η στρογγυλή μορφή και το σφράγισμα «Χριστός Ανέστη» δείχνουν τη ζωή που νίκησε τον θάνατο.',
    ),
    summary: L(
      'Rich farmer’s cheese with butter, eggs, and sugar.',
      'Творожная пасха с маслом, яйцами и сахаром.',
      'Τυρί με βούτυρο, αυγά και ζάχαρη.',
    ),
    ingredients: lines(
      [
        '2 lb (900 g) dry farmer’s cheese (tvorog), pressed if very wet',
        '1½ cups (340 g) unsalted butter, softened',
        '1½ cups (300 g) granulated sugar',
        '6 large egg yolks',
        '1 cup (240 ml) heavy cream or sour cream',
        '1 tsp vanilla',
        '½ cup (60 g) raisins or candied peel (optional)',
        'Pinch of salt',
      ],
      [
        '900 г сухого творога (отжать, если влажный)',
        '340 г мягкого сливочного масла',
        '300 г сахара',
        '6 желтков',
        '240 мл сливок или сметаны',
        '1 ч.л. ванили',
        '60 г изюма или цукатов (по желанию)',
        'Щепотка соли',
      ],
      [
        '900 γρ. στεγνό τυρί (αντί για τυρί φάρμας)',
        '340 γρ. μαλακό βούτυρο',
        '300 γρ. ζάχαρη',
        '6 κρόκοι',
        '240 ml κρέμα γάλακτος ή ξινόγαλο',
        '1 κ.γ. βανίλια',
        '60 γρ. σταφίδες (προαιρετικά)',
        'Πρέζα αλάτι',
      ],
    ),
    steps: lines(
      [
        'Press cheese in a cloth if needed; rub through a sieve for a smooth texture.',
        'Cream butter with sugar until pale. Beat in yolks one at a time, then cheese, cream, vanilla, and salt.',
        'Fold in raisins if using. Line a pascha mold (tapered pyramid) with damp cheesecloth.',
        'Fill mold, fold cloth over top, set a light weight on a plate, and chill 24–48 hours.',
        'Unmold carefully; decorate with “XB” (Christ is Risen) or almonds if desired.',
      ],
      [
        'При необходимости отжать творог; протереть через сито.',
        'Взбить масло с сахаром, по одному желтки, затем творог, сливки, ваниль и соль.',
        'Добавить изюм. Выложить в пасхальную форму, выстланную марлей.',
        'Накрыть, поставить груз и охладить 24–48 часов.',
        'Аккуратно выложить; украсить «ХВ» или миндалём.',
      ],
      [
        'Στύψτε το τυρί αν χρειάζεται· περάστε από σίτα.',
        'Χτυπήστε βούτυρο με ζάχαρη, κρόκους έναν έναν, τυρί, κρέμα, βανίλια, αλάτι.',
        'Γεμίστε καλούπι Πάσχας με υγρή πετσέτα.',
        'Βάρος και ψύξη 24–48 ώρες.',
        'Ξεφορμάρετε· διακοσμήστε «ΧΑ».',
      ],
    ),
    tips: lines(
      [
        'Start on Holy Saturday so it is ready after the midnight service.',
        'Some families add a little mastic or saffron for fragrance.',
      ],
      [
        'Готовят в Великую субботу, чтобы к утрене всё было готово.',
        'Иногда добавляют мастику или шафран.',
      ],
      [
        'Ξεκινήστε Μ. Σάββατο για να είναι έτοιμο μετά την Ανάσταση.',
        'Μερικές οικογένειες βάζουν μαστίχα.',
      ],
    ),
  },
  {
    id: 'kulich',
    category: 'bread',
    difficulty: 'medium',
    prepMinutes: 40,
    cookMinutes: 50,
    servings: 10,
    servingSize: L('slice', 'ломтик', 'φέτα'),
    title: L('Kulich', 'Кулич', 'Κουλίτς'),
    meaning: L(
      'The tall, sweet Paschal bread is blessed with the cheese Pascha and red eggs. Its dome shape suggests the church and Christ as the Living Bread — shared after the fast, with joy and “Christ is Risen!”',
      'Высокий сладкий кулич освящают вместе с пасхой и крашенными яйцами. Форма напоминает храм и Христа — Живого Хлеба, которым делятся после поста.',
      'Το ψηλό γλυκό ψωμί ευλογείται με την Πάσχα και τα κόκκινα αυγά. Η κορυφή θυμίζει τον ναό και τον Χριστό — τον Ζωντανό Άρτο.',
    ),
    summary: L(
      'Yeasted bread with eggs, butter, and raisins — baked in a tall cylinder mold.',
      'Дрожжевой кулич с яйцами, маслом и изюмом в высокой форме.',
      'Ζυμωτό ψωμί με αυγά, βούτυρο και σταφίδες σε ψηλό καλούπι.',
    ),
    ingredients: lines(
      [
        '4 cups (520 g) bread flour',
        '½ cup (100 g) sugar',
        '2¼ tsp instant yeast',
        '¾ cup (180 ml) warm milk',
        '4 egg yolks + 1 egg for wash',
        '½ cup (115 g) butter, softened',
        '½ tsp salt',
        '1 tsp vanilla',
        '½ cup (75 g) raisins',
        'Zest of 1 lemon (optional)',
      ],
      [
        '520 г муки',
        '100 г сахара',
        '7 г сухих дрожжей',
        '180 мл тёплого молока',
        '4 желтка + 1 яйцо для смазки',
        '115 г масла',
        '½ ч.л. соли',
        '1 ч.л. ванили',
        '75 г изюма',
        'Цедра лимона (по желанию)',
      ],
      [
        '520 γρ. αλεύρι',
        '100 γρ. ζάχαρη',
        '7 γρ. ξηρή μαγιά',
        '180 ml χλιαρό γάλα',
        '4 κρόκοι + 1 αυγό',
        '115 γρ. βούτυρο',
        '½ κ.γ. αλάτι',
        '1 κ.γ. βανίλια',
        '75 γρ. σταφίδες',
        'Ξύσμα λεμονιού (προαιρ.)',
      ],
    ),
    steps: lines(
      [
        'Mix yeast with warm milk and a spoon of sugar; rest 10 minutes.',
        'Combine flour, sugar, salt; add yolks, butter, vanilla, zest, and yeast milk. Knead 10–12 minutes.',
        'Knead in raisins; first rise until doubled (1–1½ hours).',
        'Shape into buttered tall kulich tins (fill one-third full). Rise until near top.',
        'Brush with beaten egg. Bake at 325°F / 160°C about 45–55 minutes until deep golden.',
        'Cool upright in the tin; wrap in a cloth when fully cool.',
      ],
      [
        'Дрожжи с молоком и сахаром — 10 мин.',
        'Мука, сахар, соль, желтки, масло, ваниль, дрожжевое молоко — месить 10–12 мин.',
        'Изюм, подъём 1–1½ ч.',
        'В смазанные формы на треть, подъём почти до верха.',
        'Смазка яйцом. Выпекать при 160°C 45–55 мин.',
        'Остудить в форме вертикально; завернуть в полотенце.',
      ],
      [
        'Μαγιά με γάλα — 10 λεπτά.',
        'Αλεύρι, ζάχαρη, κρόκοι, βούτυρο, μαγιά — ζύμωση 10–12 λεπτά.',
        'Σταφίδες, πρώτη ζύμωση 1–1½ ώρα.',
        'Σε ψηλά καλούπια, δεύτερη ζύμωση.',
        'Χτυπημένο αυγό. Ψήσιμο 160°C 45–55 λεπτά.',
        'Κρύωμα όρθιο· τύλιγμα σε πετσέτα.',
      ],
    ),
  },
  {
    id: 'tsoureki',
    category: 'bread',
    difficulty: 'medium',
    prepMinutes: 35,
    cookMinutes: 40,
    servings: 10,
    servingSize: L('slice', 'ломтик', 'φέτα'),
    title: L('Tsoureki', 'Цуреки', 'Τσουρέκι'),
    meaning: L(
      'The braided Greek Paschal bread carries the same joy as kulich: life, resurrection, and the breaking of the fast together. The three-strand braid is often read as a sign of the Holy Trinity.',
      'Греческое пасхальное плетёное хлебное — та же радость Воскресения и общая трапеза. Три жгутa часто видят как знак Святой Троицы.',
      'Το πλεγμένο πασχαλινό ψωμί φέρνει τη χαρά της Αναστάσεως. Τα τρία κορδόνια συμβολίζουν την Αγία Τριάδα.',
    ),
    summary: L(
      'Soft, aromatic braided loaf with mahleb and orange — the Greek Paschal table centerpiece.',
      'Мягкий плетёный хлеб с махлебом и апельсином — центр греческого пасхального стола.',
      'Μαλακό πλεγμένο ψωμί με μαχλέπι και πορτοκάλι.',
    ),
    ingredients: lines(
      [
        '4 cups (520 g) bread flour',
        '⅔ cup (130 g) sugar',
        '2 tsp instant yeast',
        '¾ cup (180 ml) warm milk',
        '3 eggs (2 for dough, 1 for wash)',
        '½ cup (115 g) butter, melted and cooled',
        '1 tsp mahleb (ground cherry pits) or 1 tsp vanilla',
        'Zest of 1 orange',
        'Pinch of salt',
        'Red egg for the braid (optional tradition)',
      ],
      [
        '520 г муки',
        '130 г сахара',
        '7 г дрожжей',
        '180 мл тёплого молока',
        '3 яйца',
        '115 г масла',
        '1 ч.л. махлеба или ванили',
        'Цедра апельсина',
        'Соль',
        'Красное яйцо для плетения (традиция)',
      ],
      [
        '520 γρ. αλεύρι',
        '130 γρ. ζάχαρη',
        '7 γρ. μαγιά',
        '180 ml χλιαρό γάλα',
        '3 αυγά',
        '115 γρ. βούτυρο',
        '1 κ.γ. μαχλέπι ή βανίλια',
        'Ξύσμα πορτοκαλιού',
        'Αλάτι',
        'Κόκκινο αυγό (προαιρ.)',
      ],
    ),
    steps: lines(
      [
        'Activate yeast in warm milk with a little sugar.',
        'Mix flour, sugar, salt, zest, mahleb; add eggs, butter, and yeast milk. Knead until smooth and elastic.',
        'Rise until doubled. Divide into 3 ropes, braid, tuck ends under.',
        'Nest a dyed red egg in the braid if you wish. Rise again 45–60 minutes.',
        'Brush with egg wash. Bake at 350°F / 175°C about 35–40 minutes until golden.',
      ],
      [
        'Дрожжи в молоке.',
        'Мука, сахар, махлеб, яйца, масло — месить до эластичности.',
        'Подъём, разделить на 3 жгутa, сплести.',
        'Вложить красное яйцо, второй подъём 45–60 мин.',
        'Смазка, выпекание при 175°C 35–40 мин.',
      ],
      [
        'Μαγιά στο γάλα.',
        'Αλεύρι, μαχλέπι, αυγά, βούτυρο — ζύμωση.',
        'Ζύμωση, πλέξιμο 3 κορδονιών.',
        'Κόκκινο αυγό, δεύτερη ζύμωση.',
        'Ψήσιμο 175°C 35–40 λεπτά.',
      ],
    ),
  },
  {
    id: 'red_eggs',
    category: 'sweet',
    difficulty: 'easy',
    prepMinutes: 10,
    cookMinutes: 35,
    servings: 12,
    servingSize: L('1 egg', '1 яйцо', '1 αυγό'),
    title: L('Red Paschal eggs', 'Красные яйца', 'Κόκκινα πασχαλινά αυγά'),
    meaning: L(
      'The red egg recalls the blood of Christ and the stone rolled from the tomb. At the feast we greet one another: “Christ is Risen!” — and crack eggs together, Christ’s victory over death.',
      'Красное яйцо — Кровь Христова и камень от гроба. На пасхе говорят «Христос Воскресе!» и стукаются яйцами — победа над смертью.',
      'Το κόκκινο αυγό θυμίζει το Αίμα του Χριστού και την πέτρα του τάφου. «Χριστός Ανέστη!» και τσούγκρισμα αυγών.',
    ),
    summary: L(
      'Dyed hard-boiled eggs for the Paschal basket and the traditional egg-tapping game.',
      'Крашеные яйца для пасхальной корзины и «битки» яйцами.',
      'Βαμμένα αυγά για το πασχαλινό καλάθι και το τσούγκρισμα.',
    ),
    ingredients: lines(
      [
        '12 white eggs',
        '4 cups water',
        'Peels from 8–10 yellow onions (or 3 tbsp paprika / beet dye)',
        '2 tbsp white vinegar',
        'Olive oil for polishing (optional)',
      ],
      [
        '12 яиц',
        '1 л воды',
        'Шкурки 8–10 луковиц (или паприка/свёкла)',
        '2 ст.л. уксуса',
        'Масло для блеска (по желанию)',
      ],
      [
        '12 αυγά',
        '1 λίτρο νερό',
        'Φλούδες κρεμμυδιών',
        '2 κ.σ. ξύδι',
        'Ελαιόλαδο (προαιρ.)',
      ],
    ),
    steps: lines(
      [
        'Simmer onion skins in water 20–30 minutes; strain into a deep pot.',
        'Add vinegar. Lower room-temperature eggs; simmer gently 12 minutes.',
        'Cool in the dye for deeper color. Dry and rub with oil if desired.',
        'Pack in the Paschal basket with bread, cheese Pascha, salt, and butter for blessing.',
      ],
      [
        'Варить шкурки 20–30 мин., процедить.',
        'Уксус, яйца, тихое кипение 12 мин.',
        'Охладить в отваре для насыщенного цвета.',
        'В пасхальную корзину с хлебом, пасхой, солью, маслом.',
      ],
      [
        'Βράστε φλούδες 20–30 λεπτά.',
        'Ξύδι, αυγά, ήπιο βράσιμο 12 λεπτά.',
        'Κρύωμα στον χρωματισμό.',
        'Στο πασχαλινό καλάθι για ευλογία.',
      ],
    ),
  },
];

export function easterFoodById(id: string): EasterFood | undefined {
  return EASTER_FOODS.find((food) => food.id === id);
}

export function easterFoodTitle(food: EasterFood, lang: UiLanguage): string {
  return food.title[lang] ?? food.title.en;
}

export function easterFoodMeaning(food: EasterFood, lang: UiLanguage): string {
  return food.meaning[lang] ?? food.meaning.en;
}

export function easterFoodSummary(food: EasterFood, lang: UiLanguage): string {
  return food.summary[lang] ?? food.summary.en;
}

export function easterFoodIngredients(food: EasterFood, lang: UiLanguage): string[] {
  return food.ingredients[lang] ?? food.ingredients.en;
}

export function easterFoodSteps(food: EasterFood, lang: UiLanguage): string[] {
  return food.steps[lang] ?? food.steps.en;
}

export function easterFoodTips(food: EasterFood, lang: UiLanguage): string[] {
  return food.tips?.[lang] ?? food.tips?.en ?? [];
}

function L(en: string, ru: string, el: string): LocalizedTextInput {
  return { en, ru, el };
}

function lines(en: string[], ru: string[], el: string[]): LocalizedLinesInput {
  return { en, ru, el };
}

const EMPTY_LINES: LocalizedLines = { en: [], ru: [], el: [] };

/** Shape Easter foods like fasting recipes so the same list/detail UI can render them. */
export function easterFoodAsRecipe(food: EasterFood): FastingRecipe {
  return {
    id: food.id,
    level: 'feast',
    category: food.category,
    difficulty: food.difficulty,
    prepMinutes: food.prepMinutes,
    cookMinutes: food.cookMinutes,
    servings: food.servings,
    servingSize: food.servingSize,
    title: food.title,
    summary: food.summary,
    ingredients: food.ingredients,
    steps: food.steps,
    tips: food.tips ?? EMPTY_LINES,
    notes: food.meaning,
  };
}

export function easterFoodTotalMinutes(food: EasterFood): number {
  return recipeTotalMinutes(easterFoodAsRecipe(food));
}
