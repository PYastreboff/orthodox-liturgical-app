/**
 * Extra Lenten recipes inspired by Marilena’s Kitchen Greek Lent roundup.
 * Food photos adapted from Marilena’s Kitchen; kitchen notes are original
 * OrthoDaily text (not scraped recipe copy). Adjust to taste and your
 * parish’s fasting practice.
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

export const MARILENA_EXTRA_RECIPES: readonly FastingRecipe[] = [
  R({
    id: 'lagana',
    level: 'wine_oil',
    category: 'bread',
    difficulty: 'medium',
    prepMinutes: 20,
    cookMinutes: 25,
    servings: 8,
    servingSize: L('1 piece (~80 g)', '1 кусок (~80 г)', '1 κομμάτι (~80 γρ.)'),
    title: L('Lagana (Lenten flatbread)', 'Лагана (постный хлеб)', 'Λαγάνα'),
    summary: L(
      'Sesame-topped flatbread baked for Clean Monday — soft inside, crisp edges.',
      'Плоский хлеб с кунжутом к Чистому понедельнику — мягкий внутри, с хрустящей корочкой.',
      'Πλατύ ψωμί με σουσάμι για την Καθαρά Δευτέρα — μαλακό μέσα, τραγανή κρούστα.',
    ),
    ingredients: lines(
      [
        '500 g bread flour',
        '1 packet (7 g) instant yeast',
        '1 tsp sugar or honey',
        '1½ tsp salt',
        '3 tbsp olive oil, plus more for brushing',
        '300–320 ml warm water',
        '2–3 tbsp sesame seeds',
      ],
      [
        '500 г муки',
        '1 пакетик (7 г) сухих дрожжей',
        '1 ч.л. сахара или мёда',
        '1½ ч.л. соли',
        '3 ст.л. оливкового масла (+ для смазки)',
        '300–320 мл тёплой воды',
        '2–3 ст.л. кунжута',
      ],
      [
        '500 γρ. αλεύρι για ψωμί',
        '1 φακελάκι (7 γρ.) ξηρή μαγιά',
        '1 κ.γ. ζάχαρη ή μέλι',
        '1½ κ.γ. αλάτι',
        '3 κ.σ. ελαιόλαδο (+ για άλειμμα)',
        '300–320 ml χλιαρό νερό',
        '2–3 κ.σ. σουσάμι',
      ],
    ),
    steps: lines(
      [
        'Mix flour, yeast, sugar, and salt. Add oil and enough warm water to form a soft dough.',
        'Knead 8–10 minutes until smooth. Cover and rise 45–60 minutes until doubled.',
        'Oil a baking sheet. Pat dough into a large oval ~1–1.5 cm thick. Dimple with fingertips; brush with oil; sprinkle sesame.',
        'Bake at 200°C / 400°F for 20–25 minutes until golden. Cool slightly; tear and share.',
      ],
      [
        'Смешайте муку, дрожжи, сахар, соль. Добавьте масло и воду до мягкого теста.',
        'Месите 8–10 мин. Накройте; поднимите 45–60 мин.',
        'Смажьте противень. Раскатайте овал ~1–1,5 см. Сделайте углубления пальцами; смажьте маслом; посыпьте кунжутом.',
        'Пеките при 200°C 20–25 мин до золотистого. Слегка остудите.',
      ],
      [
        'Ανακατέψτε αλεύρι, μαγιά, ζάχαρη, αλάτι. Προσθέστε λάδι και αρκετό νερό για μαλακή ζύμη.',
        'Ζυμώστε 8–10 λεπτά. Σκεπάστε· φουσκώστε 45–60 λεπτά.',
        'Λαδώστε ταψί. Απλώστε οβάλ ~1–1,5 εκ. Πατήστε με τα δάχτυλα· λαδώστε· σουσάμι.',
        'Ψήστε στους 200°C για 20–25 λεπτά μέχρι χρυσαφί. Κρυώστε λίγο.',
      ],
    ),
    tips: lines(
      [
        'Best the day it is baked; toast leftovers lightly.',
        'On stricter days, reduce oil and skip the brush — texture will be denser.',
      ],
      [
        'Лучше в день выпечки; остатки слегка подсушите.',
        'В строгий пост — меньше масла, без смазки сверху.',
      ],
      [
        'Καλύτερη την ημέρα ψησίματος· τα περισσεύματα ελαφρώς φρυγανίστε.',
        'Σε αυστηρή νηστεία, λιγότερο λάδι χωρίς άλειμμα.',
      ],
    ),
  }),

  R({
    id: 'marinated-olives',
    level: 'wine_oil',
    category: 'side',
    difficulty: 'easy',
    prepMinutes: 10,
    cookMinutes: 0,
    servings: 6,
    servingSize: L('~60 g olives', '~60 г оливок', '~60 γρ. ελιές'),
    title: L('Marinated olive medley', 'Маринованные оливки', 'Μαριναρισμένες ελιές'),
    summary: L(
      'Mixed olives with citrus, garlic, and herbs — a ready meze for fasting tables.',
      'Ассорти оливок с цитрусом, чесноком и травами — готовая закуска к посту.',
      'Μείγμα ελιών με εσπεριδοειδή, σκόρδο και βότανα — έτοιμο μεζέ για νηστεία.',
    ),
    ingredients: lines(
      [
        '400 g mixed olives (green and black), drained',
        '3 tbsp olive oil',
        '1 garlic clove, thinly sliced',
        'Zest of ½ orange or lemon',
        '1 tsp dried oregano',
        'Pinch of chili flakes (optional)',
        'Fresh thyme or rosemary sprig (optional)',
      ],
      [
        '400 г смешанных оливок, без жидкости',
        '3 ст.л. оливкового масла',
        '1 зубчик чеснока, тонкими ломтиками',
        'Цедра ½ апельсина или лимона',
        '1 ч.л. орегано',
        'Щепотка хлопьев чили (по желанию)',
        'Веточка тимьяна или розмарина (по желанию)',
      ],
      [
        '400 γρ. ανάμεικτες ελιές, στραγγισμένες',
        '3 κ.σ. ελαιόλαδο',
        '1 σκελίδα σκόρδο σε λεπτές φέτες',
        'Ξύσμα ½ πορτοκαλιού ή λεμονιού',
        '1 κ.γ. ρίγανη',
        'Πιτσίλισμα καυτερή πιπεριά (προαιρετικά)',
        'Κλωνάρι θυμάρι ή δεντρολίβανο (προαιρετικά)',
      ],
    ),
    steps: lines(
      [
        'Rinse olives briefly if very salty; pat dry.',
        'Toss with oil, garlic, zest, oregano, chili, and herbs.',
        'Marinate at room temperature 30 minutes, or refrigerate overnight.',
        'Bring to room temperature before serving with bread or lagana.',
      ],
      [
        'При необходимости быстро промойте оливки; обсушите.',
        'Смешайте с маслом, чесноком, цедрой, орегано, чили и травами.',
        'Маринуйте 30 мин при комнатной температуре или ночь в холодильнике.',
        'Перед подачей дайте согреться; подавайте с хлебом.',
      ],
      [
        'Αν είναι πολύ αλμυρές, ξεπλύνετε ελαφρά· στεγνώστε.',
        'Ανακατέψτε με λάδι, σκόρδο, ξύσμα, ρίγανη, πιπεριά και βότανα.',
        'Μαρινάρετε 30 λεπτά σε θερμοκρασία δωματίου ή μια νύχτα στο ψυγείο.',
        'Σερβίρετε σε θερμοκρασία δωματίου με ψωμί ή λαγάνα.',
      ],
    ),
    tips: lines(
      [
        'Keeps refrigerated up to a week; top up with a little oil if needed.',
        'Skip garlic for a milder jar.',
      ],
      [
        'В холодильнике до недели; при необходимости добавьте масло.',
        'Без чеснока — более мягкий вкус.',
      ],
      [
        'Διατηρείται στο ψυγείο έως μία εβδομάδα.',
        'Χωρίς σκόρδο για πιο ήπια γεύση.',
      ],
    ),
  }),

  R({
    id: 'skordalia',
    level: 'wine_oil',
    category: 'side',
    difficulty: 'easy',
    prepMinutes: 15,
    cookMinutes: 20,
    servings: 6,
    servingSize: L('~80 g', '~80 г', '~80 γρ.'),
    title: L('Skordalia (garlic potato spread)', 'Скордалия (чесночный соус)', 'Σκορδαλιά'),
    summary: L(
      'Punchy garlic mashed with potato and olive oil — classic with fried vegetables or bread.',
      'Острый чесночный соус на картофеле с маслом — классика к овощам и хлебу.',
      'Έντονο σκόρδο με πατάτα και ελαιόλαδο — κλασικό με λαχανικά ή ψωμί.',
    ),
    ingredients: lines(
      [
        '500 g potatoes, peeled',
        '3–5 garlic cloves (to taste)',
        '80–100 ml olive oil',
        '2–3 tbsp lemon juice or wine vinegar',
        'Salt',
        '2–4 tbsp cold water as needed',
      ],
      [
        '500 г картофеля',
        '3–5 зубчиков чеснока',
        '80–100 мл оливкового масла',
        '2–3 ст.л. лимонного сока или уксуса',
        'Соль',
        '2–4 ст.л. холодной воды по необходимости',
      ],
      [
        '500 γρ. πατάτες',
        '3–5 σκελίδες σκόρδο',
        '80–100 ml ελαιόλαδο',
        '2–3 κ.σ. χυμό λεμονιού ή ξίδι',
        'Αλάτι',
        '2–4 κ.σ. κρύο νερό αν χρειαστεί',
      ],
    ),
    steps: lines(
      [
        'Boil potatoes in salted water until tender; drain well.',
        'Mash or rice while hot. Pound or mince garlic with a pinch of salt to a paste.',
        'Beat garlic into potatoes. Stream in oil and lemon/vinegar, alternating with cold water until creamy.',
        'Taste for salt and sharpness. Serve cool or room temperature.',
      ],
      [
        'Отварите картофель в подсоленной воде; хорошо слейте.',
        'Разомните горячим. Чеснок разотрите с солью в пасту.',
        'Вмешайте чеснок. Вливайте масло и лимон/уксус, чередуя с холодной водой до кремовости.',
        'Попробуйте на соль и остроту. Подавайте остывшим.',
      ],
      [
        'Βράστε τις πατάτες· στραγγίστε καλά.',
        'Πολτοποιήστε ζεστές. Λιώστε το σκόρδο με αλάτι σε πάστα.',
        'Ανακατέψτε το σκόρδο. Προσθέστε λάδι και λεμόνι/ξίδι εναλλάξ με κρύο νερό μέχρι κρεμώδες.',
        'Δοκιμάστε αλάτι και οξύτητα. Σερβίρετε κρύο ή χλιαρό.',
      ],
    ),
    tips: lines(
      [
        'Start with fewer garlic cloves — you can always add more.',
        'Some families use soaked stale bread instead of potato.',
      ],
      [
        'Начните с меньшего количества чеснока — всегда можно добавить.',
        'Иногда вместо картофеля берут размоченный чёрствый хлеб.',
      ],
      [
        'Ξεκινήστε με λιγότερο σκόρδο.',
        'Ορισμένοι χρησιμοποιούν μουσκεμένο μπαγιάτικο ψωμί αντί πατάτας.',
      ],
    ),
  }),

  R({
    id: 'pickled-vegetables',
    level: 'strict',
    category: 'side',
    difficulty: 'easy',
    prepMinutes: 20,
    cookMinutes: 5,
    servings: 8,
    servingSize: L('~80 g', '~80 г', '~80 γρ.'),
    title: L('Quick pickled vegetables', 'Быстрые маринованные овощи', 'Γρήγορα τουρσί λαχανικά'),
    summary: L(
      'Crunchy vinegar pickles ready in hours — oil-free for strict fasting days.',
      'Хрустящий уксусный маринад за несколько часов — без масла для строгого поста.',
      'Τραγανό τουρσί με ξίδι σε λίγες ώρες — χωρίς λάδι για αυστηρή νηστεία.',
    ),
    ingredients: lines(
      [
        '4 cups mixed vegetables (carrot, cucumber, cauliflower, peppers), cut into sticks or florets',
        '1 cup (240 ml) white wine vinegar or apple cider vinegar',
        '1 cup (240 ml) water',
        '1–2 tbsp sugar or honey (optional)',
        '1½ tsp salt',
        '2 garlic cloves, smashed',
        '1 tsp mustard seeds or peppercorns',
        'Optional: dill sprigs, bay leaf',
      ],
      [
        '4 стакана овощей (морковь, огурец, цветная капуста, перец)',
        '1 стакан (240 мл) уксуса',
        '1 стакан (240 мл) воды',
        '1–2 ст.л. сахара или мёда (по желанию)',
        '1½ ч.л. соли',
        '2 зубчика чеснока',
        '1 ч.л. горчичных зёрен или перца горошком',
        'По желанию: укроп, лавровый лист',
      ],
      [
        '4 φλ. λαχανικά (καρότο, αγγούρι, κουνουπίδι, πιπεριές)',
        '1 φλ. (240 ml) ξίδι',
        '1 φλ. (240 ml) νερό',
        '1–2 κ.σ. ζάχαρη ή μέλι (προαιρετικά)',
        '1½ κ.γ. αλάτι',
        '2 σκελίδες σκόρδο',
        '1 κ.γ. σπόροι μουστάρδας ή πιπέρι',
        'Προαιρετικά: άνηθος, δάφνη',
      ],
    ),
    steps: lines(
      [
        'Pack vegetables into clean jars with garlic and spices.',
        'Boil vinegar, water, salt, and sugar until dissolved. Pour hot brine over vegetables to cover.',
        'Cool, then refrigerate at least 4 hours (better overnight).',
        'Keep chilled up to 2 weeks.',
      ],
      [
        'Уложите овощи в чистые банки с чесноком и специями.',
        'Вскипятите уксус, воду, соль и сахар. Залейте овощи горячим маринадом.',
        'Остудите; в холодильник минимум на 4 часа (лучше на ночь).',
        'Храните в холоде до 2 недель.',
      ],
      [
        'Βάλτε τα λαχανικά σε καθαρά βάζα με σκόρδο και μπαχαρικά.',
        'Βράστε ξίδι, νερό, αλάτι, ζάχαρη. Περιχύστε ζεστό.',
        'Κρυώστε· ψυγείο τουλάχιστον 4 ώρες (καλύτερα μια νύχτα).',
        'Διατηρείται στο ψυγείο έως 2 εβδομάδες.',
      ],
    ),
    tips: lines(
      [
        'Slice vegetables thinly so they pickle faster.',
        'On wine-and-oil days, finish with a drizzle of olive oil at the table.',
      ],
      [
        'Режьте тоньше — быстрее промаринуются.',
        'В дни с маслом можно сбрызнуть оливковым маслом при подаче.',
      ],
      [
        'Κόψτε λεπτά για πιο γρήγορο τουρσί.',
        'Σε ημέρες με λάδι, ραντίστε ελαιόλαδο στο σερβίρισμα.',
      ],
    ),
  }),

  R({
    id: 'santorini-fava',
    level: 'wine_oil',
    category: 'side',
    difficulty: 'easy',
    prepMinutes: 10,
    cookMinutes: 40,
    servings: 6,
    servingSize: L('~100 g', '~100 г', '~100 γρ.'),
    title: L('Santorini fava (yellow split-pea spread)', 'Санторини-фава', 'Φάβα Σαντορίνης'),
    summary: L(
      'Silky yellow split peas with lemon and onion — a classic Greek meze bowl.',
      'Нежное пюре из жёлтого гороха с лимоном и луком — классический греческий мезе.',
      'Βελούδινη φάβα με λεμόνι και κρεμμύδι — κλασικό ελληνικό μεζέ.',
    ),
    ingredients: lines(
      [
        '250 g yellow split peas (fava), rinsed',
        '1 onion, chopped',
        '1 bay leaf',
        '~800 ml water',
        '3–4 tbsp olive oil',
        'Juice of ½–1 lemon',
        'Salt and pepper',
        'To serve: sliced red onion, capers, extra oil',
      ],
      [
        '250 г жёлтого колотого гороха, промытого',
        '1 луковица, нарезанная',
        '1 лавровый лист',
        '~800 мл воды',
        '3–4 ст.л. оливкового масла',
        'Сок ½–1 лимона',
        'Соль и перец',
        'К подаче: красный лук, каперсы, масло',
      ],
      [
        '250 γρ. κίτρινη φάβα, ξεπλυμένη',
        '1 κρεμμύδι ψιλοκομμένο',
        '1 φύλλο δάφνης',
        '~800 ml νερό',
        '3–4 κ.σ. ελαιόλαδο',
        'Χυμός ½–1 λεμονιού',
        'Αλάτι και πιπέρι',
        'Για σερβίρισμα: κρεμμύδι, κάπαρη, λάδι',
      ],
    ),
    steps: lines(
      [
        'Simmer split peas with onion, bay leaf, and water until very soft (30–40 minutes), skimming foam.',
        'Remove bay leaf. Mash or blend until smooth; add water if too thick.',
        'Stir in olive oil, lemon, salt, and pepper. Rest 10 minutes to thicken.',
        'Serve warm or room temperature topped with onion, capers, and oil.',
      ],
      [
        'Варите горох с луком, лавром и водой до мягкости 30–40 мин, снимая пену.',
        'Уберите лавр. Разомните или взбейте; при необходимости добавьте воду.',
        'Вмешайте масло, лимон, соль, перец. Дайте постоять 10 мин.',
        'Подавайте тёплым с луком, каперсами и маслом.',
      ],
      [
        'Σιγοβράστε τη φάβα με κρεμμύδι, δάφνη και νερό 30–40 λεπτά μέχρι να λιώσει.',
        'Βγάλτε τη δάφνη. Πολτοποιήστε· προσθέστε νερό αν χρειαστεί.',
        'Προσθέστε λάδι, λεμόνι, αλάτι, πιπέρι. Αφήστε 10 λεπτά.',
        'Σερβίρετε χλιαρή με κρεμμύδι, κάπαρη και λάδι.',
      ],
    ),
    tips: lines(
      [
        'True Santorini fava is a specific pea; ordinary yellow split peas work well at home.',
        'For strict days, mash without oil and dress with lemon only.',
      ],
      [
        'Настоящая санторинская фава — особый горох; обычный жёлтый тоже хорош.',
        'В строгий пост — без масла, только лимон.',
      ],
      [
        'Η αυθεντική φάβα Σαντορίνης είναι ειδική· η κοινή κίτρινη δουλεύει στο σπίτι.',
        'Σε αυστηρή νηστεία, χωρίς λάδι — μόνο λεμόνι.',
      ],
    ),
  }),

  R({
    id: 'taramosalata',
    level: 'fish',
    category: 'side',
    difficulty: 'easy',
    prepMinutes: 15,
    cookMinutes: 0,
    servings: 6,
    servingSize: L('~60 g', '~60 г', '~60 γρ.'),
    title: L('Taramosalata (fish-roe spread)', 'Тарамасалата', 'Ταραμοσαλάτα'),
    summary: L(
      'Creamy pink meze of cured fish roe whipped with bread or potato — for fish days.',
      'Нежная розовая закуска из икры с хлебом или картофелем — для рыбных дней.',
      'Κρεμώδες ροζ μεζέ από αυγοτάραχο με ψωμί ή πατάτα — για ημέρες ψαριού.',
    ),
    ingredients: lines(
      [
        '100–120 g white tarama (cured fish roe)',
        '2 thick slices stale white bread, crusts removed, soaked and squeezed',
        'OR 1 medium boiled potato, mashed',
        '120–150 ml olive oil',
        'Juice of 1 lemon (to taste)',
        '2–3 tbsp cold water as needed',
        'Optional: grated onion (well drained)',
      ],
      [
        '100–120 г белой тарамы (солёной икры)',
        '2 ломтика чёрствого белого хлеба без корок, размоченных и отжатых',
        'ИЛИ 1 варёный картофель, размятый',
        '120–150 мл оливкового масла',
        'Сок 1 лимона',
        '2–3 ст.л. холодной воды по необходимости',
        'По желанию: тёртый лук (хорошо отжатый)',
      ],
      [
        '100–120 γρ. λευκή ταραμά',
        '2 φέτες μπαγιάτικο ψωμί χωρίς κόρα, μουσκεμένο και στύψιμο',
        'Ή 1 βραστή πατάτα πολτοποιημένη',
        '120–150 ml ελαιόλαδο',
        'Χυμός 1 λεμονιού',
        '2–3 κ.σ. κρύο νερό αν χρειαστεί',
        'Προαιρετικά: τριμμένο κρεμμύδι (στραγγισμένο)',
      ],
    ),
    steps: lines(
      [
        'Blend or mash tarama with bread (or potato) until smooth.',
        'Stream in olive oil while whisking or blending; add lemon gradually.',
        'Thin with cold water to a soft spread. Taste — it should be bright, not overly salty.',
        'Chill 30 minutes. Serve with bread, lagana, or crudités.',
      ],
      [
        'Взбейте тараму с хлебом (или картофелем) до гладкости.',
        'Вливайте масло, постепенно добавляя лимон.',
        'Разбавьте холодной водой до мягкой пасты. Попробуйте — должна быть яркой, не слишком солёной.',
        'Охладите 30 мин. Подавайте с хлебом или овощами.',
      ],
      [
        'Χτυπήστε την ταραμά με ψωμί (ή πατάτα) μέχρι λείο.',
        'Προσθέστε λάδι σταδιακά· μετά λεμόνι.',
        'Αραιώστε με κρύο νερό. Δοκιμάστε — φωτεινό, όχι υπερβολικά αλμυρό.',
        'Κρυώστε 30 λεπτά. Σερβίρετε με ψωμί ή λαχανικά.',
      ],
    ),
    tips: lines(
      [
        'White tarama is milder than pink; both work — start with less and adjust.',
        'Only for days when fish (and often fish products) are allowed.',
      ],
      [
        'Белая тарама мягче розовой; начните с меньшего количества.',
        'Только в дни, когда разрешена рыба (и рыбные продукты).',
      ],
      [
        'Η λευκή ταραμά είναι πιο ήπια· ξεκινήστε με λιγότερη.',
        'Μόνο σε ημέρες που επιτρέπεται ψάρι.',
      ],
    ),
    notes: L(
      'Confirm with your parish whether fish roe is permitted on fish days.',
      'Уточните у духовника, разрешена ли икра в рыбные дни.',
      'Ρωτήστε στην ενορία σας αν επιτρέπεται το αυγοτάραχο τις ημέρες ψαριού.',
    ),
  }),

  R({
    id: 'dolmades',
    level: 'wine_oil',
    category: 'main',
    difficulty: 'hard',
    prepMinutes: 45,
    cookMinutes: 50,
    servings: 6,
    servingSize: L('4–5 pieces', '4–5 шт.', '4–5 τεμ.'),
    title: L('Dolmades (rice-stuffed grape leaves)', 'Долмадес (голубцы в виноградных листьях)', 'Ντολμάδες'),
    summary: L(
      'Grape leaves rolled around herbed rice — lemony, soft, and made for sharing.',
      'Виноградные листья с рисом и травами — с лимоном, мягкие, к общей трапезе.',
      'Αμπελόφυλλα με ρύζι και μυρωδικά — λεμονάτα, μαλακά, για μοίρασμα.',
    ),
    ingredients: lines(
      [
        '1 jar grape leaves in brine (~40–50 leaves), rinsed',
        '200 g short-grain rice, rinsed',
        '1 large onion, finely chopped',
        '½ cup chopped fresh dill and parsley',
        '4–5 tbsp olive oil, divided',
        'Juice of 1–2 lemons',
        'Salt and pepper',
        '~500 ml water or light vegetable broth',
      ],
      [
        '1 банка виноградных листьев (~40–50 шт.), промытых',
        '200 г круглозёрного риса, промытого',
        '1 крупная луковица, мелко',
        '½ стакана укропа и петрушки',
        '4–5 ст.л. оливкового масла',
        'Сок 1–2 лимонов',
        'Соль и перец',
        '~500 мл воды или овощного бульона',
      ],
      [
        '1 βαζάκι αμπελόφυλλα (~40–50), ξεπλυμένα',
        '200 γρ. ρύζι γλασέ, ξεπλυμένο',
        '1 μεγάλο κρεμμύδι ψιλοκομμένο',
        '½ φλ. άνηθος και μαϊντανός',
        '4–5 κ.σ. ελαιόλαδο',
        'Χυμός 1–2 λεμονιών',
        'Αλάτι και πιπέρι',
        '~500 ml νερό ή ζωμός λαχανικών',
      ],
    ),
    steps: lines(
      [
        'Sauté onion in 2 tbsp oil until soft. Stir in rice 1–2 minutes; add herbs, salt, pepper, and half the lemon. Cool slightly.',
        'Place a leaf vein-side up. Add ~1 tsp filling near the stem; fold sides and roll snugly.',
        'Line a pot with torn leaves. Pack rolls seam-side down in layers. Add remaining oil, lemon, and enough liquid to barely cover.',
        'Weight with a plate. Simmer gently 40–50 minutes until rice is tender. Rest 15 minutes before serving.',
      ],
      [
        'Обжарьте лук в 2 ст.л. масла. Добавьте рис на 1–2 мин; травы, соль, перец, половину лимона. Остудите.',
        'Лист жилками вверх. ~1 ч.л. начинки у черенка; заверните бока и сверните.',
        'Выложите дно кастрюли обрезками листьев. Уложите рулеты швом вниз. Добавьте остальное масло, лимон и жидкость едва покрыть.',
        'Прижмите тарелкой. Томите 40–50 мин. Дайте постоять 15 мин.',
      ],
      [
        'Σοτάρετε κρεμμύδι σε 2 κ.σ. λάδι. Ρύζι 1–2 λεπτά· μυρωδικά, αλάτι, πιπέρι, μισό λεμόνι. Κρυώστε.',
        'Φύλλο με τις φλέβες πάνω. ~1 κ.γ. γέμιση· διπλώστε και τυλίξτε.',
        'Στρώστε τον πάτο με φύλλα. Βάλτε τους ντολμάδες με την ένωση κάτω. Προσθέστε λάδι, λεμόνι και υγρό να τους καλύψει ελαφρά.',
        'Βάλτε πιάτο από πάνω. Σιγοβράστε 40–50 λεπτά. Αφήστε 15 λεπτά.',
      ],
    ),
    tips: lines(
      [
        'Do not overfill — rice expands as it cooks.',
        'Fresh lemon wedges at the table brighten leftovers.',
      ],
      [
        'Не перекладывайте начинку — рис разбухает.',
        'Дольки лимона к столу освежают остатки.',
      ],
      [
        'Μην παραγεμίζετε — το ρύζι φουσκώνει.',
        'Φέτες λεμονιού στο τραπέζι φωτίζουν τα περισσεύματα.',
      ],
    ),
  }),

  R({
    id: 'skillet-lemon-potatoes',
    level: 'wine_oil',
    category: 'side',
    difficulty: 'easy',
    prepMinutes: 10,
    cookMinutes: 30,
    servings: 4,
    servingSize: L('~200 g', '~200 г', '~200 γρ.'),
    title: L('Skillet lemon potatoes', 'Картофель с лимоном на сковороде', 'Πατάτες λεμονάτες στο τηγάνι'),
    summary: L(
      'Crisp mini potatoes with lemon, parsley, and olive oil — weeknight side in one pan.',
      'Хрустящий мелкий картофель с лимоном, петрушкой и маслом — гарнир на одной сковороде.',
      'Τραγανές μίνι πατάτες με λεμόνι, μαϊντανό και ελαιόλαδο — συνοδευτικό σε ένα τηγάνι.',
    ),
    ingredients: lines(
      [
        '700 g small potatoes, halved if large',
        '3 tbsp olive oil',
        'Juice of 1 lemon',
        '2 garlic cloves, smashed (optional)',
        'Salt and pepper',
        '3 tbsp chopped parsley',
        'Pinch of oregano',
      ],
      [
        '700 г мелкого картофеля',
        '3 ст.л. оливкового масла',
        'Сок 1 лимона',
        '2 зубчика чеснока (по желанию)',
        'Соль и перец',
        '3 ст.л. петрушки',
        'Щепотка орегано',
      ],
      [
        '700 γρ. μικρές πατάτες',
        '3 κ.σ. ελαιόλαδο',
        'Χυμός 1 λεμονιού',
        '2 σκελίδες σκόρδο (προαιρετικά)',
        'Αλάτι και πιπέρι',
        '3 κ.σ. μαϊντανός',
        'Πιτσίλισμα ρίγανη',
      ],
    ),
    steps: lines(
      [
        'Heat oil in a wide skillet over medium. Add potatoes cut-side down; season. Cover and cook 12–15 minutes until mostly tender.',
        'Uncover, raise heat a little, and brown 8–10 minutes, shaking occasionally.',
        'Add garlic if using; squeeze in lemon and toss 1–2 minutes.',
        'Off heat, fold in parsley and oregano. Serve hot.',
      ],
      [
        'Разогрейте масло на средней сковороде. Картофель срезом вниз; посолите. Накройте 12–15 мин до мягкости.',
        'Снимите крышку; подрумяньте 8–10 мин, встряхивая.',
        'Добавьте чеснок; влейте лимон, перемешайте 1–2 мин.',
        'Снимите с огня; вмешайте петрушку и орегано.',
      ],
      [
        'Ζεστάνετε λάδι σε φαρδύ τηγάνι. Πατάτες με την κοπή κάτω· αλάτι. Σκεπάστε 12–15 λεπτά.',
        'Ξεσκεπάστε· ροδίστε 8–10 λεπτά.',
        'Προσθέστε σκόρδο· χύστε λεμόνι 1–2 λεπτά.',
        'Εκτός φωτιάς, μαϊντανό και ρίγανη. Σερβίρετε ζεστές.',
      ],
    ),
    tips: lines(
      [
        'Parboil stubborn large potatoes 5 minutes first.',
        'Finish under a broiler for extra crisp if your pan is oven-safe.',
      ],
      [
        'Крупный картофель можно предварительно отварить 5 мин.',
        'Для корочки — под гриль, если сковорода подходит для духовки.',
      ],
      [
        'Μεγάλες πατάτες: προ-βράστε 5 λεπτά.',
        'Για πιο τραγανό, τελειώστε στο γκριλ αν το τηγάνι μπαίνει στον φούρνο.',
      ],
    ),
  }),

  R({
    id: 'lenten-spanakopita',
    level: 'wine_oil',
    category: 'main',
    difficulty: 'medium',
    prepMinutes: 30,
    cookMinutes: 45,
    servings: 8,
    servingSize: L('1 square', '1 кусок', '1 κομμάτι'),
    title: L('Lenten spanakopita (no cheese)', 'Постная спанакопита (без сыра)', 'Νηστίσιμη σπανακόπιτα'),
    summary: L(
      'Phyllo pie of spinach and mixed greens without feta — oil days only.',
      'Пирог из фило со шпинатом и зеленью без брынзы — только в дни с маслом.',
      'Πίτα με φύλλο, σπανάκι και χόρτα χωρίς φέτα — μόνο σε ημέρες με λάδι.',
    ),
    ingredients: lines(
      [
        '500 g spinach or mixed greens, washed and chopped',
        '1 bunch spring onions or 1 onion, chopped',
        '½ cup chopped dill and parsley',
        '4–5 tbsp olive oil, plus more for brushing phyllo',
        'Salt and pepper',
        'Optional: handful of soaked bulgur or rice for body',
        '250–300 g phyllo pastry',
      ],
      [
        '500 г шпината или смешанной зелени',
        '1 пучок зелёного лука или 1 луковица',
        '½ стакана укропа и петрушки',
        '4–5 ст.л. оливкового масла (+ для фило)',
        'Соль и перец',
        'По желанию: горсть размоченной крупы или риса',
        '250–300 г теста фило',
      ],
      [
        '500 γρ. σπανάκι ή χόρτα',
        '1 ματσάκι φρέσκα κρεμμυδάκια ή 1 κρεμμύδι',
        '½ φλ. άνηθος και μαϊντανός',
        '4–5 κ.σ. ελαιόλαδο (+ για τα φύλλα)',
        'Αλάτι και πιπέρι',
        'Προαιρετικά: λίγο μουσκεμένο πλιγούρι ή ρύζι',
        '250–300 γρ. φύλλο κρούστας',
      ],
    ),
    steps: lines(
      [
        'Wilt greens in a dry pan; cool and squeeze dry. Mix with onion, herbs, 2 tbsp oil, salt, pepper (and bulgur if using).',
        'Oil a baking tin. Layer half the phyllo, brushing each sheet lightly with oil.',
        'Spread filling. Cover with remaining phyllo, oiling sheets. Score the top into squares.',
        'Bake at 180°C / 350°F for 40–50 minutes until deep golden. Rest 10 minutes before cutting.',
      ],
      [
        'Припустите зелень на сухой сковороде; остудите и отожмите. Смешайте с луком, травами, 2 ст.л. масла, солью (и крупой).',
        'Смажьте форму. Выложите половину фило, смазывая каждый лист.',
        'Начинку. Накройте остальным фило. Надрежьте верх на квадраты.',
        'Пеките при 180°C 40–50 мин до золотистого. Дайте постоять 10 мин.',
      ],
      [
        'Μαραίνετε τα χόρτα σε στεγνό τηγάνι· στύψτε. Ανακατέψτε με κρεμμύδι, μυρωδικά, 2 κ.σ. λάδι, αλάτι (και πλιγούρι).',
        'Λαδώστε ταψί. Μισά φύλλα με ελαφρύ άλειμμα.',
        'Γέμιση. Υπόλοιπα φύλλα. Χαράξτε τετράγωνα.',
        'Ψήστε στους 180°C 40–50 λεπτά. Αφήστε 10 λεπτά.',
      ],
    ),
    tips: lines(
      [
        'Squeeze greens very dry or the pie turns soggy.',
        'Store-bought phyllo: keep covered with a damp towel while working.',
      ],
      [
        'Хорошо отожмите зелень — иначе пирог размокнет.',
        'Фило накрывайте влажным полотенцем во время сборки.',
      ],
      [
        'Στύψτε καλά τα χόρτα αλλιώς μουλιάζει η πίτα.',
        'Κρατήστε το φύλλο σκεπασμένο με υγρή πετσέτα όσο δουλεύετε.',
      ],
    ),
    notes: L(
      'Traditional spanakopita includes feta; this Lenten version omits dairy.',
      'Классическая спанакопита с брынзой; эта постная — без молочного.',
      'Η παραδοσιακή σπανακόπιτα έχει φέτα· αυτή η νηστίσιμη χωρίς γαλακτοκομικά.',
    ),
  }),

  R({
    id: 'longevity-stew',
    level: 'wine_oil',
    category: 'soup',
    difficulty: 'easy',
    prepMinutes: 15,
    cookMinutes: 45,
    servings: 6,
    servingSize: L('~350 ml', '~350 мл', '~350 ml'),
    title: L('Greek island longevity stew', 'Островное рагу «долголетия»', 'Νησιώτικη σούπα μακροζωίας'),
    summary: L(
      'Ikaria-style beans and greens in a gentle tomato broth — humble, filling Lenten soup.',
      'Бобы и зелень в томатном бульоне по-икарийски — простая сытная постная похлёбка.',
      'Φασόλια και χόρτα σε ντοματένιο ζωμό ικαριώτικου ύφους — απλή χορταστική νηστίσιμη σούπα.',
    ),
    ingredients: lines(
      [
        '250 g dried black-eyed peas or white beans, soaked overnight (or 2 cans, rinsed)',
        '1 onion, chopped',
        '2 carrots, sliced',
        '2 garlic cloves',
        '400 g tomatoes, chopped (or 1 can)',
        '1 bunch greens (chard, spinach, or kale), chopped',
        '3–4 tbsp olive oil',
        '1 tsp oregano',
        'Salt and pepper',
        'Lemon wedges to serve',
      ],
      [
        '250 г сухих бобов (чёрный глаз или белые), замоченных (или 2 банки)',
        '1 луковица',
        '2 моркови',
        '2 зубчика чеснока',
        '400 г помидоров (или 1 банка)',
        '1 пучок зелени (мангольд, шпинат, кале)',
        '3–4 ст.л. оливкового масла',
        '1 ч.л. орегано',
        'Соль и перец',
        'Лимон к подаче',
      ],
      [
        '250 γρ. ξερά μαυρομάτικα ή άσπρα φασόλια, μουσκεμένα (ή 2 κονσέρβες)',
        '1 κρεμμύδι',
        '2 καρότα',
        '2 σκελίδες σκόρδο',
        '400 γρ. ντομάτα (ή 1 κονσέρβα)',
        '1 ματσάκι χόρτα (σέσκουλα, σπανάκι, kale)',
        '3–4 κ.σ. ελαιόλαδο',
        '1 κ.γ. ρίγανη',
        'Αλάτι και πιπέρι',
        'Λεμόνι για σερβίρισμα',
      ],
    ),
    steps: lines(
      [
        'If using dried beans, simmer in fresh water until almost tender; drain. Canned beans: skip ahead.',
        'In a pot, warm oil; soften onion, carrot, and garlic. Add tomatoes and oregano; cook 5 minutes.',
        'Add beans and enough water to cover generously. Simmer 20–30 minutes.',
        'Stir in greens until wilted. Season. Serve with lemon and extra oil if allowed.',
      ],
      [
        'Сухие бобы отварите почти до готовности; слейте. Консервы — сразу дальше.',
        'В кастрюле на масле спассеруйте лук, морковь, чеснок. Добавьте томаты и орегано; 5 мин.',
        'Добавьте бобы и воду с запасом. Варите 20–30 мин.',
        'Вмешайте зелень до мягкости. Приправьте. Подавайте с лимоном.',
      ],
      [
        'Ξερά φασόλια: σχεδόν βράστε· στραγγίστε. Κονσέρβα: συνεχίστε.',
        'Σοτάρετε κρεμμύδι, καρότο, σκόρδο στο λάδι. Ντομάτα και ρίγανη 5 λεπτά.',
        'Προσθέστε φασόλια και αρκετό νερό. Σιγοβράστε 20–30 λεπτά.',
        'Βάλτε τα χόρτα να μαραθούν. Αλάτι. Σερβίρετε με λεμόνι.',
      ],
    ),
    tips: lines(
      [
        'Any sturdy green works — chase what is in season.',
        'For strict days, sauté in water and finish without oil.',
      ],
      [
        'Подойдёт любая плотная зелень по сезону.',
        'В строгий пост — тушите на воде, без масла.',
      ],
      [
        'Όποιο χόρτο της εποχής δουλεύει.',
        'Σε αυστηρή νηστεία, νερό αντί για λάδι.',
      ],
    ),
  }),

  R({
    id: 'paximadia',
    level: 'wine_oil',
    category: 'sweet',
    difficulty: 'medium',
    prepMinutes: 20,
    cookMinutes: 50,
    servings: 24,
    servingSize: L('1 biscuit', '1 печенье', '1 παξιμάδι'),
    title: L('Paximadia (orange almond biscotti)', 'Паксимадья (апельсиново-миндальные)', 'Παξιμάδια αμυγδάλου'),
    summary: L(
      'Twice-baked orange and almond rusks — dunkable Lenten cookies that keep well.',
      'Дважды печёные сухари с апельсином и миндалём — постное печенье, долго хранится.',
      'Διπλοψημένα παξιμάδια με πορτοκάλι και αμύγδαλο — νηστίσιμα μπισκότα που διατηρούνται.',
    ),
    ingredients: lines(
      [
        '300 g flour',
        '100 g sugar',
        '80 ml olive oil',
        'Zest of 1 orange + 3–4 tbsp orange juice',
        '1 tsp baking powder',
        'Pinch of salt',
        '80 g chopped almonds',
        'Optional: ½ tsp cinnamon or vanilla',
      ],
      [
        '300 г муки',
        '100 г сахара',
        '80 мл оливкового масла',
        'Цедра 1 апельсина + 3–4 ст.л. сока',
        '1 ч.л. разрыхлителя',
        'Щепотка соли',
        '80 г рублёного миндаля',
        'По желанию: ½ ч.л. корицы или ванили',
      ],
      [
        '300 γρ. αλεύρι',
        '100 γρ. ζάχαρη',
        '80 ml ελαιόλαδο',
        'Ξύσμα 1 πορτοκαλιού + 3–4 κ.σ. χυμό',
        '1 κ.γ. baking powder',
        'Πιτσίλισμα αλάτι',
        '80 γρ. ψιλοκομμένα αμύγδαλα',
        'Προαιρετικά: ½ κ.γ. κανέλα ή βανίλια',
      ],
    ),
    steps: lines(
      [
        'Mix dry ingredients and almonds. Stir in oil, zest, and enough juice to form a soft dough.',
        'Shape into 2 logs on a lined tray. Bake at 180°C / 350°F for 25–30 minutes until set and pale gold.',
        'Cool 10 minutes. Slice into 1–1.5 cm pieces on the diagonal.',
        'Lay flat; bake 12–15 minutes more, flipping once, until dry and crisp. Cool completely.',
      ],
      [
        'Смешайте сухие продукты и миндаль. Добавьте масло, цедру и сок до мягкого теста.',
        'Сформуйте 2 батона. Пеките при 180°C 25–30 мин до светло-золотистого.',
        'Остудите 10 мин. Нарежьте наискосок ломтиками 1–1,5 см.',
        'Выложите плашмя; допеките 12–15 мин, перевернув. Полностью остудите.',
      ],
      [
        'Ανακατέψτε στερεά και αμύγδαλα. Προσθέστε λάδι, ξύσμα και χυμό μέχρι μαλακή ζύμη.',
        'Κάντε 2 ρολά. Ψήστε στους 180°C 25–30 λεπτά.',
        'Κρυώστε 10 λεπτά. Κόψτε λοξά σε φέτες 1–1,5 εκ.',
        'Ξαναψήστε 12–15 λεπτά γυρίζοντας μία φορά μέχρι τραγανά. Κρυώστε τελείως.',
      ],
    ),
    tips: lines(
      [
        'Store airtight up to 2 weeks — ideal for dunking in herbal tea.',
        'On stricter days, swap oil for orange juice and a spoon of tahini if nuts/seeds are allowed.',
      ],
      [
        'В закрытой банке до 2 недель — хорошо макать в травяной чай.',
        'В строгий пост — вместо масла сок и ложка тахини, если семена разрешены.',
      ],
      [
        'Σε κλειστό δοχείο έως 2 εβδομάδες — ιδανικά με τσάι.',
        'Σε αυστηρή νηστεία, χυμός αντί λαδιού και λίγο ταχίνι αν επιτρέπονται οι σπόροι.',
      ],
    ),
  }),
];
