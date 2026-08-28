/**
 * Additional Orthodox-friendly recipes — fasting staples and a few feast-day dishes.
 */
import type {
  FastingRecipe,
  LocalizedLines,
  LocalizedText,
  RecipeCategory,
  RecipeDifficulty,
  RecipeFastLevel,
} from '../../src/lib/recipes/fastingRecipes';

function L(en: string, ru: string, el: string): LocalizedText {
  return { en, ru, el };
}

function lines(en: string[], ru: string[], el: string[]): LocalizedLines {
  return { en, ru, el };
}

function R(input: {
  id: string;
  level: RecipeFastLevel;
  category: RecipeCategory;
  difficulty: RecipeDifficulty;
  prepMinutes: number;
  cookMinutes: number;
  servings: number;
  servingSize: LocalizedText;
  title: LocalizedText;
  summary: LocalizedText;
  ingredients: LocalizedLines;
  steps: LocalizedLines;
  tips: LocalizedLines;
  notes?: LocalizedText;
}): FastingRecipe {
  return input;
}

export const ORTHODOX_EXTRA_RECIPES: FastingRecipe[] = [
  R({
    id: 'melitzanosalata',
    level: 'wine_oil',
    category: 'side',
    difficulty: 'easy',
    prepMinutes: 15,
    cookMinutes: 35,
    servings: 4,
    servingSize: L('½ cup (~120 g)', '½ стакана (~120 г)', '½ φλ. (~120 γρ.)'),
    title: L('Melitzanosalata', 'Баклажанная икра (мелитзаносалата)', 'Μελιτζανοσαλάτα'),
    summary: L(
      'Smoky roasted eggplant mashed with garlic, lemon, and olive oil — a classic Greek fasting spread.',
      'Печёные баклажаны с чесноком, лимоном и оливковым маслом — греческая постная закуска.',
      'Καπνιστή μελιτζάνα με σκόρδο, λεμόνι και ελαιόλαδο — κλασική νηστίσιμη μεζέ.',
    ),
    ingredients: lines(
      [
        '2 large eggplants (~900 g)',
        '3 tbsp olive oil',
        '2 cloves garlic, minced',
        '2 tbsp lemon juice',
        '1 tsp red wine vinegar',
        '½ tsp salt, black pepper',
        '2 tbsp chopped flat-leaf parsley',
      ],
      [
        '2 крупных баклажана (~900 г)',
        '3 ст.л. оливкового масла',
        '2 зубчика чеснока',
        '2 ст.л. лимонного сока',
        '1 ч.л. красного винного уксуса',
        '½ ч.л. соли, перец',
        '2 ст.л. петрушки',
      ],
      [
        '2 μεγάλες μελιτζάνες (~900 γρ.)',
        '3 κ.σ. ελαιόλαδο',
        '2 σκελίδες σκόρδο',
        '2 κ.σ. χυμό λεμονιού',
        '1 κ.γ. ξύδι κρασιού',
        'αλάτι, πιπέρι',
        '2 κ.σ. μαϊντανός',
      ],
    ),
    steps: lines(
      [
        'Prick eggplants; roast at 220°C / 425°F until collapsed and charred, 30–35 minutes. Cool, peel, and drain 10 minutes.',
        'Chop flesh roughly; mash with garlic, lemon, vinegar, oil, salt, and pepper.',
        'Fold in parsley. Rest 20 minutes for flavors to meld. Serve at room temperature with bread.',
      ],
      [
        'Наколите баклажаны; запекайте при 220°C 30–35 мин. Остудите, очистите, дайте стечь 10 мин.',
        'Измельчите мякоть; разомните с чесноком, лимоном, уксусом, маслом, солью и перцем.',
        'Добавьте петрушку. Настойте 20 мин. Подавайте с хлебом.',
      ],
      [
        'Καρφώστε τις μελιτζάνες· ψήστε στους 220°C 30–35 λεπτά. Ξεφλουδίστε και στραγγίξτε.',
        'Λιώστε με σκόρδο, λεμόνι, ξύδι, λάδι, αλάτι και πιπέρι.',
        'Προσθέστε μαϊντανό. Αφήστε 20 λεπτά. Σερβίρετε με ψωμί.',
      ],
    ),
    tips: lines(
      ['Grill over charcoal for the deepest smoke flavor.', 'A little tahini stirred in is common in some parishes’ homes.'],
      ['На углях — самый дымный вкус.', 'Иногда добавляют ложку тахини.'],
      ['Στα κάρβουνα δίνει καπνιστή γεύση.', 'Μπορείτε να προσθέσετε ταχίνι.'],
    ),
  }),
  R({
    id: 'pea-mint-soup',
    level: 'strict',
    category: 'soup',
    difficulty: 'easy',
    prepMinutes: 10,
    cookMinutes: 20,
    servings: 4,
    servingSize: L('1 bowl (~350 ml)', '1 миска (~350 мл)', '1 μπολ (~350 ml)'),
    title: L('Pea & mint soup', 'Гороховый суп с мятой', 'Χορταρόσουπα με αρακά και δυόσμο'),
    summary: L(
      'Bright green split-pea soup finished with fresh mint — light but filling on strict-fast days.',
      'Суп из колотого гороха с мятой — лёгкий и сытный в строгий пост.',
      'Κρεμώδης σούπα αρακά με φρέσκο δυόσμο για αυστηρή νηστεία.',
    ),
    ingredients: lines(
      [
        '1½ cups (300 g) split peas, rinsed',
        '1 onion, diced',
        '1 carrot, diced',
        '6 cups (1.4 L) water or vegetable broth',
        '1 tsp salt, ½ tsp pepper',
        '½ cup (12 g) fresh mint leaves',
        '1 tbsp lemon juice',
      ],
      [
        '1½ стакана (300 г) колотого гороха',
        '1 луковица',
        '1 морковь',
        '1,4 л воды или овощного бульона',
        '1 ч.л. соли, ½ ч.л. перца',
        '½ стакана свежей мяты',
        '1 ст.л. лимонного сока',
      ],
      [
        '1½ φλ. (300 γρ.) κολώνου αρακά',
        '1 κρεμμύδι',
        '1 καρότο',
        '1,4 λ νερό ή ζωμός',
        'αλάτι, πιπέρι',
        '½ φλ. φρέσκος δυόσμος',
        '1 κ.σ. λεμόνι',
      ],
    ),
    steps: lines(
      [
        'Simmer peas, onion, carrot, and water 18–20 minutes until peas break down.',
        'Blend until smooth; return to pot. Stir in chopped mint and lemon juice; adjust salt.',
        'Serve hot; garnish with mint leaves and black pepper.',
      ],
      [
        'Варите горох с овощами 18–20 мин.',
        'Измельчите блендером; добавьте мяту и лимон; посолите.',
        'Подавайте горячим с мятой и перцем.',
      ],
      [
        'Βράστε αρακά με λαχανικά 18–20 λεπτά.',
        'Χτυπήστε στο μπλέντερ· προσθέστε δυόσμο και λεμόνι.',
        'Σερβίρετε ζεστό με φύλλα δυόσμου.',
      ],
    ),
    tips: lines(
      ['Frozen peas: use 4 cups and shorten cooking to 8 minutes.', 'Dill substitutes well if mint is unavailable.'],
      ['Замороженный горох — 4 стакана, варить 8 мин.', 'Укроп тоже подходит.'],
      ['Με κατεψυγμένο αρακά — λιγότερος χρόνος.', 'Άνηθος αντικαθιστά τον δυόσμο.'],
    ),
  }),
  R({
    id: 'barley-vegetable-pilaf',
    level: 'strict',
    category: 'main',
    difficulty: 'easy',
    prepMinutes: 12,
    cookMinutes: 40,
    servings: 4,
    servingSize: L('1 plate (~300 g)', '1 тарелка (~300 г)', '1 πιάτο (~300 γρ.)'),
    title: L('Barley & vegetable pilaf', 'Ячменная плова с овощами', 'Πλιγούρι λαχανικών'),
    summary: L(
      'Pearl barley simmered with onion, carrot, and celery — an old monastic-style one-pot meal.',
      'Ячневая крупа с овощами — простое монастырское блюдо в один горшок.',
      'Κριθαράκι με λαχανικά — απλό μοναστηριακό πιάτο.',
    ),
    ingredients: lines(
      [
        '1 cup (200 g) pearl barley, rinsed',
        '1 onion, chopped',
        '1 carrot, diced',
        '2 celery stalks, diced',
        '2 tbsp olive oil',
        '3 cups (720 ml) water',
        '1 tsp salt, ½ tsp dried thyme',
        '2 tbsp chopped dill or parsley',
      ],
      [
        '1 стакан (200 г) ячневой крупы',
        '1 лук',
        '1 морковь',
        '2 стебля сельдерея',
        '2 ст.л. масла',
        '720 мл воды',
        '1 ч.л. соли, тимьян',
        '2 ст.л. укропа',
      ],
      [
        '1 φλ. (200 γρ.) κριθαράκι',
        '1 κρεμμύδι',
        '1 καρότο',
        '2 σέλινα',
        '2 κ.σ. ελαιόλαδο',
        '720 ml νερό',
        'αλάτι, θυμάρι',
        '2 κ.σ. άνηθος',
      ],
    ),
    steps: lines(
      [
        'Warm oil; sauté onion, carrot, and celery 6 minutes.',
        'Add barley; stir 1 minute. Pour in water, salt, and thyme. Simmer covered 35–40 minutes until tender.',
        'Rest 5 minutes off heat; fluff with fork and fold in herbs.',
      ],
      [
        'Обжарьте овощи на масле 6 мин.',
        'Добавьте крупу, воду, соль, тимьян. Тушите под крышкой 35–40 мин.',
        'Дайте постоять; посыпьте зеленью.',
      ],
      [
        'Σοτάρετε τα λαχανικά 6 λεπτά.',
        'Προσθέστε κριθαράκι, νερό, αλάτι. Σιγοβράστε 35–40 λεπτά.',
        'Ανακατέψτε με άνηθο.',
      ],
    ),
    tips: lines(
      ['Toast barley 2 minutes before adding liquid for nuttier flavor.', 'A splash of lemon at the table brightens the dish.'],
      ['Обжарьте крупу 2 мин для орехового вкуса.', 'Лимон при подаче освежает.'],
      ['Καβουρδίστε το κριθαράκι πριν το νερό.', 'Λεμόνι στο τραπέζι.'],
    ),
  }),
  R({
    id: 'grilled-vegetable-platter',
    level: 'wine_oil',
    category: 'main',
    difficulty: 'easy',
    prepMinutes: 20,
    cookMinutes: 25,
    servings: 4,
    servingSize: L('1 generous plate', '1 большая тарелка', '1 γενναιόδωρο πιάτο'),
    title: L('Grilled vegetable platter', 'Овощи на гриле', 'Ψητά λαχανικά'),
    summary: L(
      'Zucchini, peppers, and mushrooms with olive oil and oregano — perfect when wine and oil are allowed.',
      'Кабачки, перец и грибы с маслом и орегано — для дней с маслом.',
      'Κολοκυθάκια, πιπεριές και μανιτάρια με ελαιόλαδο — για ημέρες με έλαιο.',
    ),
    ingredients: lines(
      [
        '2 zucchini, sliced lengthwise',
        '2 bell peppers, quartered',
        '300 g mushrooms, halved',
        '1 red onion, thick rings',
        '¼ cup (60 ml) olive oil',
        '2 tsp dried oregano',
        '1 tsp salt, pepper',
        '2 tbsp balsamic vinegar (optional)',
      ],
      [
        '2 кабачка',
        '2 болгарских перца',
        '300 г грибов',
        '1 красная луковица',
        '60 мл оливкового масла',
        '2 ч.л. орегано',
        'соль, перец',
        '2 ст.л. бальзамика (по желанию)',
      ],
      [
        '2 κολοκυθάκια',
        '2 πιπεριές',
        '300 γρ. μανιτάρια',
        '1 κρεμμύδι',
        '60 ml ελαιόλαδο',
        '2 κ.γ. ρίγανη',
        'αλάτι, πιπέρι',
        '2 κ.σ. βαλσάμικο (προαιρ.)',
      ],
    ),
    steps: lines(
      [
        'Toss vegetables with oil, oregano, salt, and pepper.',
        'Grill or roast at 220°C / 425°F 20–25 minutes, turning once, until charred at edges.',
        'Arrange on a platter; drizzle vinegar if using. Serve with bread and olives.',
      ],
      [
        'Смешайте овощи с маслом и специями.',
        'Гриль или духовка 220°C 20–25 мин до румянца.',
        'Выложите на блюдо; по желанию — бальзамик. С хлебом и оливками.',
      ],
      [
        'Ανακατέψτε με λάδι και ρίγανη.',
        'Ψήστε στους 220°C 20–25 λεπτά.',
        'Σερβίρετε με ψωμί και ελιές.',
      ],
    ),
    tips: lines(
      ['A grill pan on the stovetop works when outdoor grilling is not possible.', 'Leftovers are excellent in wraps the next day.'],
      ['Сковорода-гриль подойдёт.', 'Остатки — в лаваш на следующий день.'],
      ['Ψηστιέρα στο μάτι είναι εντάξει.', 'Τα υπόλοιπα σε πίτα την επόμενη μέρα.'],
    ),
  }),
  R({
    id: 'lemon-garlic-fish',
    level: 'fish',
    category: 'main',
    difficulty: 'easy',
    prepMinutes: 10,
    cookMinutes: 18,
    servings: 4,
    servingSize: L('1 fillet (~180 g)', '1 филе (~180 г)', '1 φιλέτο (~180 γρ.)'),
    title: L('Baked fish with lemon & garlic', 'Запечённая рыба с лимоном', 'Ψάρι στο φούρνο με λεμόνι'),
    summary: L(
      'Simple oven-baked white fish with olive oil, lemon, and herbs — for fish-allowed fast days.',
      'Простая белая рыба в духовке с лимоном и травами — для дней с рыбой.',
      'Λευκό ψάρι στο φούρνο με λεμόνι — για ημέρες με ψάρι.',
    ),
    ingredients: lines(
      [
        '4 white fish fillets (~700 g total), e.g. cod or haddock',
        '3 tbsp olive oil',
        '3 cloves garlic, sliced',
        '1 lemon, sliced',
        '1 tsp dried oregano',
        '1 tsp salt, pepper',
        '2 tbsp chopped parsley',
      ],
      [
        '4 филе белой рыбы (~700 г)',
        '3 ст.л. оливкового масла',
        '3 зубчика чеснока',
        '1 лимон',
        '1 ч.л. орегано',
        'соль, перец',
        '2 ст.л. петрушки',
      ],
      [
        '4 φιλέτα λευκού ψαριού (~700 γρ.)',
        '3 κ.σ. ελαιόλαδο',
        '3 σκελίδες σκόρδο',
        '1 λεμόνι',
        '1 κ.γ. ρίγανη',
        'αλάτι, πιπέρι',
        '2 κ.σ. μαϊντανός',
      ],
    ),
    steps: lines(
      [
        'Heat oven to 200°C / 400°F. Place fish in an oiled baking dish.',
        'Top with garlic, lemon slices, oil, oregano, salt, and pepper.',
        'Bake 15–18 minutes until fish flakes easily. Garnish with parsley.',
      ],
      [
        'Разогрейте духовку до 200°C. Выложите рыбу в форму.',
        'Сверху — чеснок, лимон, масло, специи.',
        'Запекайте 15–18 мин. Посыпьте петрушкой.',
      ],
      [
        'Θερμάνετε φούρνο στους 200°C.',
        'Βάλτε σκόρδο, λεμόνι, λάδι και ρίγανη.',
        'Ψήστε 15–18 λεπτά. Πασπαλίστε με μαϊντανό.',
      ],
    ),
    tips: lines(
      ['Pat fillets dry for better browning.', 'Serve with horta or a simple salad on the side.'],
      ['Обсушите филе перед запеканием.', 'Подавайте с зеленью или салатом.'],
      ['Στεγνώστε τα φιλέτα.', 'Συνοδεύστε με χόρτα ή σαλάτα.'],
    ),
  }),
  R({
    id: 'rustic-lenten-bread',
    level: 'wine_oil',
    category: 'bread',
    difficulty: 'medium',
    prepMinutes: 25,
    cookMinutes: 35,
    servings: 10,
    servingSize: L('1 thick slice', '1 толстый ломоть', '1 χοντρή φέτα'),
    title: L('Rustic fasting bread', 'Домашний постный хлеб', 'Χωριάτικο νηστίσιμο ψωμί'),
    summary: L(
      'Crusty olive-oil bread for dipping into soup or serving with melitzanosalata.',
      'Хрустящий хлеб на оливковом масле — к супу или икре из баклажанов.',
      'Ψωμί με ελαιόλαδο για να βουτήξετε στη σούπα ή μελιτζανοσαλάτα.',
    ),
    ingredients: lines(
      [
        '3½ cups (420 g) bread flour',
        '1¼ cups (300 ml) warm water',
        '2 tsp instant yeast',
        '2 tsp salt',
        '3 tbsp olive oil',
        '1 tsp sugar (optional, helps rise)',
      ],
      [
        '420 г хлебной муки',
        '300 мл тёплой воды',
        '2 ч.л. сухих дрожжей',
        '2 ч.л. соли',
        '3 ст.л. оливкового масла',
        '1 ч.л. сахара (по желанию)',
      ],
      [
        '420 γρ. αλεύρι για ψωμί',
        '300 ml χλιαρό νερό',
        '2 κ.γ. ξηρή μαγιά',
        '2 κ.γ. αλάτι',
        '3 κ.σ. ελαιόλαδο',
        '1 κ.γ. ζάχαρη (προαιρ.)',
      ],
    ),
    steps: lines(
      [
        'Mix flour, yeast, salt, sugar, water, and 2 tbsp oil into a soft dough; knead 8 minutes.',
        'Rise covered 1 hour until doubled. Shape into a round loaf on an oiled tray; brush with remaining oil.',
        'Bake at 220°C / 425°F 30–35 minutes until hollow-sounding. Cool before slicing.',
      ],
      [
        'Замесите мягкое тесто; месите 8 мин.',
        'Подойдёт 1 час. Сформируйте круг; смажьте маслом.',
        'Выпекайте при 220°C 30–35 мин.',
      ],
      [
        'Ζυμώστε 8 λεπτά.',
        'Αφήστε να διπλασιαστεί 1 ώρα.',
        'Ψήστε στους 220°C 30–35 λεπτά.',
      ],
    ),
    tips: lines(
      ['A Dutch oven gives the best crust if you have one.', 'Freeze half the loaf for another fast week.'],
      ['Горшок для выпечки даёт лучшую корочку.', 'Половину можно заморозить.'],
      ['Χυτή κατσαρόλα για καλύτερη κόρα.', 'Κρατήστε μισό στην κατάψυξη.'],
    ),
  }),
  R({
    id: 'honey-yogurt-parfait',
    level: 'dairy',
    category: 'breakfast',
    difficulty: 'easy',
    prepMinutes: 10,
    cookMinutes: 0,
    servings: 2,
    servingSize: L('1 glass (~250 g)', '1 стакан (~250 г)', '1 ποτήρι (~250 γρ.)'),
    title: L('Honey yogurt parfait', 'Йогурт с мёдом и орехами', 'Γιαούρτι με μέλι και καρύδια'),
    summary: L(
      'Layered yogurt with honey, walnuts, and fruit — for non-fasting mornings after Liturgy.',
      'Йогурт с мёдом, орехами и фруктами — на дни без поста.',
      'Στρωματωτό γιαούρτι με μέλι και καρύδια — για μη νηστίσιμες ημέρες.',
    ),
    ingredients: lines(
      [
        '2 cups (480 g) plain whole-milk yogurt',
        '3 tbsp honey',
        '½ cup (60 g) walnuts, chopped',
        '1 cup mixed berries or sliced banana',
        '½ tsp cinnamon (optional)',
      ],
      [
        '480 г натурального йогурта',
        '3 ст.л. мёда',
        '60 г грецких орехов',
        '1 стакан ягод или банана',
        '½ ч.л. корицы (по желанию)',
      ],
      [
        '480 γρ. γιαούρτι',
        '3 κ.σ. μέλι',
        '60 γρ. καρύδια',
        '1 φλ. μούρα ή μπανάνα',
        '½ κ.γ. κανέλα (προαιρ.)',
      ],
    ),
    steps: lines(
      [
        'Layer yogurt, honey, nuts, and fruit in glasses.',
        'Repeat layers; finish with a drizzle of honey and cinnamon.',
        'Serve immediately or chill up to 2 hours.',
      ],
      [
        'Выложите слоями йогурт, мёд, орехи и фрукты.',
        'Повторите слои; сверху — мёд и корица.',
        'Сразу или охладите до 2 часов.',
      ],
      [
        'Στρώστε σε ποτήρια.',
        'Επαναλάβετε στρώσεις.',
        'Σερβίρετε αμέσως ή κρύο.',
      ],
    ),
    tips: lines(
      ['Use thick Greek yogurt so layers stay distinct.', 'Not for fast days — save for feast or non-fast Sundays.'],
      ['Густой греческий йогурт держит слои.', 'Не для поста — для праздничных дней.'],
      ['Παχύ στραγγιστό γιαούρτι.', 'Όχι για νηστεία.'],
    ),
  }),
  R({
    id: 'lemon-chicken-potatoes',
    level: 'feast',
    category: 'main',
    difficulty: 'medium',
    prepMinutes: 20,
    cookMinutes: 55,
    servings: 6,
    servingSize: L('1 plate (~350 g)', '1 тарелка (~350 г)', '1 πιάτο (~350 γρ.)'),
    title: L('Lemon chicken with potatoes', 'Курица с лимоном и картофелем', 'Κοτόπουλο με λεμόνι και πατάτες'),
    summary: L(
      'Classic Sunday-traybake chicken — for feast days and hospitality after church.',
      'Курица с картофелем и лимоном — для праздничного воскресного стола.',
      'Κοτόπουλο με πατάτες και λεμόνι — για εορταστικό τραπέζι.',
    ),
    ingredients: lines(
      [
        '1 whole chicken cut into pieces (~1.5 kg) or 6 bone-in thighs',
        '1 kg potatoes, quartered',
        '2 lemons, juiced; 1 lemon quartered',
        '4 cloves garlic',
        '⅓ cup (80 ml) olive oil',
        '2 tsp dried oregano',
        '1½ tsp salt, pepper',
      ],
      [
        '1,5 кг курицы по частям или 6 бёдер',
        '1 кг картофеля',
        '2 лимона сок + 1 лимон дольками',
        '4 зубчика чеснока',
        '80 мл оливкового масла',
        '2 ч.л. орегано',
        '1½ ч.л. соли, перец',
      ],
      [
        '1,5 κγ κοτόπουλο',
        '1 κγ πατάτες',
        'χυμός 2 λεμονιών + 1 λεμόνι',
        '4 σκόρδα',
        '80 ml ελαιόλαδο',
        '2 κ.γ. ρίγανη',
        'αλάτι, πιπέρι',
      ],
    ),
    steps: lines(
      [
        'Heat oven to 200°C / 400°F. Toss potatoes with half the oil, salt, and oregano in a large roasting pan.',
        'Nestle chicken among potatoes. Mix remaining oil, lemon juice, garlic, salt, and pepper; pour over. Add lemon quarters.',
        'Roast 50–55 minutes, basting once, until chicken juices run clear and potatoes are golden.',
      ],
      [
        'Разогрейте духовку до 200°C. Смешайте картофель с половиной масла и специй.',
        'Выложите курицу. Полейте смесью сока, масла и чеснока; добавьте дольки лимона.',
        'Запекайте 50–55 мин, поливая один раз.',
      ],
      [
        'Θερμάνετε φούρνο στους 200°C.',
        'Τοποθετήστε κοτόπουλο ανάμεσα στις πατάτες.',
        'Ψήστε 50–55 λεπτά.',
      ],
    ),
    tips: lines(
      ['Rest 10 minutes before serving so juices settle.', 'Pan juices are excellent over rice or bread.'],
      ['Дайте постоять 10 мин перед подачей.', 'Сок из формы — к рису или хлебу.'],
      ['Αφήστε 10 λεπτά πριν κόψετε.', 'Οι χυμοί είναι νόστιμοι με ρύζι.'],
    ),
  }),
  R({
    id: 'walnut-halva-bites',
    level: 'wine_oil',
    category: 'sweet',
    difficulty: 'easy',
    prepMinutes: 10,
    cookMinutes: 15,
    servings: 12,
    servingSize: L('1 piece', '1 кусочек', '1 τεμάχιο'),
    title: L('Walnut halva bites', 'Халва с грецкими орехами', 'Χαλβά με καρύδια'),
    summary: L(
      'Quick semolina halva portioned into walnut-studded bites — a fasting sweet for coffee hour inspiration.',
      'Быстрая манная халва с орехами — постный десерт.',
      'Γρήγορος χαλβάς με καρύδια — νηστίσιμο γλυκό.',
    ),
    ingredients: lines(
      [
        '1 cup (160 g) fine semolina',
        '½ cup (120 ml) olive oil',
        '1 cup (240 ml) water',
        '½ cup (100 g) sugar',
        '½ tsp cinnamon',
        '½ cup (60 g) walnuts, chopped',
        'Pinch of salt',
      ],
      [
        '160 г манной крупы',
        '120 мл оливкового масла',
        '240 мл воды',
        '100 г сахара',
        '½ ч.л. корицы',
        '60 г грецких орехов',
        'щепотка соли',
      ],
      [
        '160 γρ. σιμιγδάλι',
        '120 ml ελαιόλαδο',
        '240 ml νερό',
        '100 γρ. ζάχαρη',
        '½ κ.γ. κανέλα',
        '60 γρ. καρύδια',
        'αλάτι',
      ],
    ),
    steps: lines(
      [
        'Boil water, sugar, salt, and cinnamon 2 minutes.',
        'Toast semolina in oil over medium heat 8–10 minutes until golden and fragrant.',
        'Carefully pour syrup into semolina, stirring until thick. Fold in walnuts; spread in a lined pan. Cool; cut into bites.',
      ],
      [
        'Вскипятите воду с сахаром и корицей.',
        'Обжарьте манку на масле 8–10 мин до золотистого цвета.',
        'Влейте сироп, добавьте орехи, разровняйте. Остудите и нарежьте.',
      ],
      [
        'Βράστε σιρόπι 2 λεπτά.',
        'Καβουρδίστε σιμιγδάλι 8–10 λεπτά.',
        'Προσθέστε καρύδια, κρυώστε και κόψτε.',
      ],
    ),
    tips: lines(
      ['Stand back when adding hot syrup — it steams vigorously.', 'Store covered at room temperature 3 days.'],
      ['Осторожно при вливании сиропа — парит.', 'Храните 3 дня в закрытой посуде.'],
      ['Προσοχή στον ατμό.', 'Διατηρείται 3 μέρες.'],
    ),
  }),
  R({
    id: 'red-lentil-dal',
    level: 'strict',
    category: 'main',
    difficulty: 'easy',
    prepMinutes: 10,
    cookMinutes: 25,
    servings: 4,
    servingSize: L('1 bowl (~300 g)', '1 миска (~300 г)', '1 μπολ (~300 γρ.)'),
    title: L('Red lentil dal', 'Чечевичный дал', 'Ντάλ κόκκινων φακών'),
    summary: L(
      'Spiced red lentils with turmeric and cumin — protein-rich and pantry-friendly for strict fast.',
      'Красная чечевица с куркумой и зирой — сытно в строгий пост.',
      'Κόκκινες φακές με κουρκουμά — πλούσιες σε πρωτεΐνη για αυστηρή νηστεία.',
    ),
    ingredients: lines(
      [
        '1½ cups (300 g) red lentils, rinsed',
        '4 cups (960 ml) water',
        '1 onion, diced',
        '2 cloves garlic, minced',
        '1 tbsp grated ginger',
        '1 tsp turmeric',
        '1 tsp cumin',
        '1 tsp salt',
        '2 tbsp lemon juice',
        '2 tbsp chopped cilantro (optional)',
      ],
      [
        '300 г красной чечевицы',
        '960 мл воды',
        '1 луковица',
        '2 зубчика чеснока',
        '1 ст.л. тёртого имбиря',
        '1 ч.л. куркумы',
        '1 ч.л. зиры',
        '1 ч.л. соли',
        '2 ст.л. лимонного сока',
        'кинза (по желанию)',
      ],
      [
        '300 γρ. κόκκινες φακές',
        '960 ml νερό',
        '1 κρεμμύδι',
        '2 σκόρδα',
        '1 κ.σ. τζίντζερ',
        '1 κ.γ. κουρκουμά',
        '1 κ.γ. κύμινο',
        'αλάτι',
        '2 κ.σ. λεμόνι',
        'κόλιανδρος (προαιρ.)',
      ],
    ),
    steps: lines(
      [
        'Simmer lentils in water with onion, garlic, ginger, turmeric, cumin, and salt 20–25 minutes until creamy.',
        'Stir in lemon juice; mash lightly if you prefer a thicker texture.',
        'Garnish with cilantro. Serve with rice or flatbread.',
      ],
      [
        'Варите чечевицу с овощами и специями 20–25 мин.',
        'Добавьте лимон; при желании слегка разомните.',
        'Посыпьте кинзой. С рисом или лепёшкой.',
      ],
      [
        'Σιγοβράστε 20–25 λεπτά.',
        'Προσθέστε λεμόνι.',
        'Σερβίρετε με ρύζι.',
      ],
    ),
    tips: lines(
      ['A pinch of cayenne adds warmth without breaking the fast.', 'Freezes well for busy Lent weeks.'],
      ['Щепотка перца чили добавит остроты.', 'Хорошо замораживается.'],
      ['Λίγη καγιέν για πικάντικη γεύση.', 'Καταψύχεται καλά.'],
    ),
  }),
];
