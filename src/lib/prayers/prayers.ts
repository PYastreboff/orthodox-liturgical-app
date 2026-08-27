import type { UiLanguage } from '../../i18n/types';

export const PRAYER_IDS = [
  'morning',
  'evening',
  'communion',
  'trisagion',
  'before_meals',
  'jesus',
  'ephraim',
] as const;

export type PrayerId = (typeof PRAYER_IDS)[number];

/** Shown on Today by default; others are opt-in in Settings. */
export const DEFAULT_ENABLED_PRAYERS: readonly PrayerId[] = [
  'morning',
  'evening',
  'communion',
];

export const OPTIONAL_PRAYER_IDS: readonly PrayerId[] = [
  'trisagion',
  'before_meals',
  'jesus',
  'ephraim',
];

export type PrayerContent = {
  title: string;
  /** Short label under the title when collapsed. */
  summary: string;
  paragraphs: string[];
};

export function isPrayerId(value: unknown): value is PrayerId {
  return typeof value === 'string' && (PRAYER_IDS as readonly string[]).includes(value);
}

export function parseEnabledPrayers(raw: unknown): PrayerId[] {
  if (raw === undefined || raw === null) return [...DEFAULT_ENABLED_PRAYERS];
  if (!Array.isArray(raw)) return [...DEFAULT_ENABLED_PRAYERS];
  if (raw.length === 0) return [];
  const next: PrayerId[] = [];
  for (const item of raw) {
    if (isPrayerId(item) && !next.includes(item)) next.push(item);
  }
  return next.length > 0 ? next : [...DEFAULT_ENABLED_PRAYERS];
}

export function prayerTitleKey(id: PrayerId): string {
  return `prayers.${id}.title`;
}

export function prayerSummaryKey(id: PrayerId): string {
  return `prayers.${id}.summary`;
}

/** Resolve ordered paragraphs for a prayer in the UI language. */
export function prayerParagraphs(id: PrayerId, lang: UiLanguage): string[] {
  const pack = PRAYER_BODIES[id];
  return pack[lang] ?? pack.en;
}

const PRAYER_BODIES: Record<PrayerId, Record<UiLanguage, string[]>> = {
  morning: {
    en: [
      'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.',
      'Glory to Thee, our God, glory to Thee.',
      'O Heavenly King, Comforter, Spirit of Truth, Who art everywhere present and fillest all things, Treasury of good things and Giver of life: come and dwell in us, and cleanse us of all impurity, and save our souls, O Good One.',
      'Holy God, Holy Mighty, Holy Immortal, have mercy on us. (thrice)',
      'Glory to the Father, and to the Son, and to the Holy Spirit, both now and ever, and unto the ages of ages. Amen.',
      'O Most Holy Trinity, have mercy on us. O Lord, blot out our sins. O Master, pardon our iniquities. O Holy One, visit and heal our infirmities for Thy name’s sake.',
      'Lord, have mercy. (thrice)',
      'Glory to the Father, and to the Son, and to the Holy Spirit, both now and ever, and unto the ages of ages. Amen.',
      'Our Father, Who art in the heavens, hallowed be Thy name. Thy kingdom come, Thy will be done, on earth as it is in heaven. Give us this day our daily bread, and forgive us our debts, as we forgive our debtors; and lead us not into temptation, but deliver us from the evil one.',
      'Having risen from sleep, we fall down before Thee, O Good One, and cry aloud to Thee, O Mighty One, the angelic hymn: Holy, Holy, Holy art Thou, O God; through the Theotokos, have mercy on us.',
      'Glory to the Father, and to the Son, and to the Holy Spirit.',
      'Having raised me from bed and sleep, O Lord, enlighten my mind and heart, and open my lips that I may praise Thee, O Holy Trinity: Holy, Holy, Holy art Thou, O God; through the Theotokos, have mercy on us.',
      'Both now and ever, and unto the ages of ages. Amen.',
      'Suddenly the Judge shall come, and the deeds of each shall be laid bare; but with fear do we cry at midnight: Holy, Holy, Holy art Thou, O God; through the Theotokos, have mercy on us.',
      'Lord, have mercy. (twelve times)',
      'O Christ our God, Who at all times and in every hour, in heaven and on earth, art worshipped and glorified; Who art long-suffering, plenteous in mercy, most compassionate; Who lovest the righteous and hast mercy on sinners; Who callest all to salvation through the promise of good things to come: do Thou, the same Lord, receive also our prayers at this present hour, and direct our lives according to Thy commandments. Sanctify our souls; purify our bodies; correct our thoughts; cleanse our minds; and deliver us from every sorrow, evil, and pain. Surround us with Thy holy angels, that, guided and guarded by them, we may attain to the unity of the faith and to the knowledge of Thine unapproachable glory; for blessed art Thou unto the ages of ages. Amen.',
    ],
    ru: [
      'Во имя Отца, и Сына, и Святаго Духа. Аминь.',
      'Слава Тебе, Боже наш, слава Тебе.',
      'Царю Небесный, Утешителю, Душе истины, Иже везде сый и вся исполняяй, Сокровище благих и жизни Подателю, прииди и вселися в ны, и очисти ны от всякия скверны, и спаси, Блаже, души наша.',
      'Святый Боже, Святый Крепкий, Святый Безсмертный, помилуй нас. (трижды)',
      'Слава Отцу, и Сыну, и Святому Духу, и ныне и присно, и во веки веков. Аминь.',
      'Пресвятая Троице, помилуй нас; Господи, очисти грехи наша; Владыко, прости беззакония наша; Святый, посети и исцели немощи наша, имене Твоего ради.',
      'Господи, помилуй. (трижды)',
      'Слава Отцу, и Сыну, и Святому Духу, и ныне и присно, и во веки веков. Аминь.',
      'Отче наш, Иже еси на небесех! Да святится имя Твое, да приидет Царствие Твое, да будет воля Твоя, яко на небеси и на земли. Хлеб наш насущный даждь нам днесь; и остави нам долги наша, якоже и мы оставляем должником нашим; и не введи нас во искушение, но избави нас от лукаваго.',
      'От сна восстав, припадаем Ти, Блаже, и ангельский песнь вопием Ти, Сильне: Свят, Свят, Свят еси Боже, Богородицею помилуй нас.',
      'Слава Отцу, и Сыну, и Святому Духу.',
      'От одра и сна воздвигл мя еси, Господи; ум мой просвети и сердце, и устне мои отверзи, во еже пети Тя, Святая Троице: Свят, Свят, Свят еси Боже, Богородицею помилуй нас.',
      'И ныне и присно, и во веки веков. Аминь.',
      'Внезапу Судия приидет, и коегождо деяния обнажатся; но со страхом зовем в полунощи: Свят, Свят, Свят еси Боже, Богородицею помилуй нас.',
      'Господи, помилуй. (двенадцать раз)',
      'Иже на всякое время и на всякий час, на небеси и на земли поклоняемый и славимый, Христе Боже, Долготерпеливе, Многомилостиве, Многоблагоутробне; Иже праведныя любяй и грешныя милуяй; Иже вся зовый ко спасению обещанием благих будущих: Сам, Господи, приими и наша в час сей молитвы, и исправи живот наш к заповедем Твоим. Души наша освяти, телеса очисти, помышления исправи, мысли очисти; и избави нас от всякия скорби, зол и болезней. Огради нас святыми Твоими ангелы, да, ополчением их соблюдаеми и наставляеми, достигнем в соединение веры и в разум неприступныя Твоея славы; яко благословен еси во веки веков. Аминь.',
    ],
    el: [
      'Εἰς τὸ ὄνομα τοῦ Πατρὸς καὶ τοῦ Υἱοῦ καὶ τοῦ Ἁγίου Πνεύματος. Ἀμήν.',
      'Δόξα σοι, ὁ Θεὸς ἡμῶν, δόξα σοι.',
      'Βασιλεῦ οὐράνιε, Παράκλητε, τὸ Πνεῦμα τῆς ἀληθείας, ὁ πανταχοῦ παρὼν καὶ τὰ πάντα πληρῶν, ὁ θησαυρὸς τῶν ἀγαθῶν καὶ ζωῆς χορηγός, ἐλθὲ καὶ σκίνωσον ἐν ἡμῖν, καὶ καθάρισον ἡμᾶς ἀπὸ πάσης κηλίδος, καὶ σῶσον, Ἀγαθέ, τὰς ψυχὰς ἡμῶν.',
      'Ἅγιος ὁ Θεός, Ἅγιος Ἰσχυρός, Ἅγιος Ἀθάνατος, ἐλέησον ἡμᾶς. (τρίς)',
      'Δόξα Πατρὶ καὶ Υἱῷ καὶ Ἁγίῳ Πνεύματι, καὶ νῦν καὶ ἀεὶ καὶ εἰς τοὺς αἰῶνας τῶν αἰώνων. Ἀμήν.',
      'Παναγία Τριάς, ἐλέησον ἡμᾶς. Κύριε, ἱλάσθητι ταῖς ἁμαρτίαις ἡμῶν. Δέσποτα, συγχώρησον τὰς ἀνομίας ἡμῖν. Ἅγιε, ἐπίσκεψαι καὶ ἴασαι τὰς ἀσθενείας ἡμῶν, ἕνεκεν τοῦ ὀνόματός σου.',
      'Κύριε, ἐλέησον. (τρίς)',
      'Δόξα Πατρὶ καὶ Υἱῷ καὶ Ἁγίῳ Πνεύματι, καὶ νῦν καὶ ἀεὶ καὶ εἰς τοὺς αἰῶνας τῶν αἰώνων. Ἀμήν.',
      'Πάτερ ἡμῶν ὁ ἐν τοῖς οὐρανοῖς, ἁγιασθήτω τὸ ὄνομά σου· ἐλθέτω ἡ βασιλεία σου· γενηθήτω τὸ θέλημά σου, ὡς ἐν οὐρανῷ καὶ ἐπὶ τῆς γῆς. Τὸν ἄρτον ἡμῶν τὸν ἐπιούσιον δὸς ἡμῖν σήμερον· καὶ ἄφες ἡμῖν τὰ ὀφειλήματα ἡμῶν, ὡς καὶ ἡμεῖς ἀφίεμεν τοῖς ὀφειλέταις ἡμῶν· καὶ μὴ εἰσενέγκῃς ἡμᾶς εἰς πειρασμόν, ἀλλὰ ῥῦσαι ἡμᾶς ἀπὸ τοῦ πονηροῦ.',
      'Ἐκ τοῦ ὕπνου ἐγερθέντες, προσπίπτομέν σοι, Ἀγαθέ, καὶ βοῶμέν σοι, Δυνατέ, τὸν ἀγγελικὸν ὕμνον· Ἅγιος, Ἅγιος, Ἅγιος εἶ ὁ Θεός· διὰ τῆς Θεοτόκου ἐλέησον ἡμᾶς.',
      'Δόξα Πατρὶ καὶ Υἱῷ καὶ Ἁγίῳ Πνεύματι.',
      'Ἐκ τῆς κλίνης καὶ τοῦ ὕπνου ἐξήγειράς με, Κύριε· φώτισόν μου τὸν νοῦν καὶ τὴν καρδίαν, καὶ τὰ χείλη μου ἄνοιξον εἰς τὸ ὑμνεῖν σε, Ἁγία Τριάς· Ἅγιος, Ἅγιος, Ἅγιος εἶ ὁ Θεός· διὰ τῆς Θεοτόκου ἐλέησον ἡμᾶς.',
      'Καὶ νῦν καὶ ἀεὶ καὶ εἰς τοὺς αἰῶνας τῶν αἰώνων. Ἀμήν.',
      'Ἐξαίφνης ὁ Κριτὴς παρέσται, καὶ ἑκάστου αἱ πράξεις γυμνωθήσονται· ἀλλὰ μετὰ φόβου βοῶμεν ἐν μεσονυκτίῳ· Ἅγιος, Ἅγιος, Ἅγιος εἶ ὁ Θεός· διὰ τῆς Θεοτόκου ἐλέησον ἡμᾶς.',
      'Κύριε, ἐλέησον. (δώδεκα)',
      'Ὁ ἐν παντὶ καιρῷ καὶ πάσῃ ὥρᾳ ἐν οὐρανῷ καὶ ἐπὶ γῆς προσκυνούμενος καὶ δοξαζόμενος Χριστὸς ὁ Θεός, ὁ μακρόθυμος, ὁ πολυέλεος, ὁ πολυεύσπλαγχνος· ὁ τοὺς δικαίους ἀγαπῶν καὶ τοὺς ἁμαρτωλοὺς ἐλεῶν· ὁ πάντας καλῶν εἰς σωτηρίαν διὰ τῆς ἐπαγγελίας τῶν μελλόντων ἀγαθῶν· αὐτός, Κύριε, πρόσδεξαι καὶ τὰς ἡμετέρας ἐν τῇ παρούσῃ ὥρᾳ δεήσεις, καὶ κατεύθυνον τὴν ζωὴν ἡμῶν πρὸς τὰς ἐντολάς σου. Ἁγίασον τὰς ψυχὰς ἡμῶν, καθάρισον τὰ σώματα, διόρθωσον τοὺς λογισμούς, καθάρισον τὰς ἐννοίας· καὶ ῥῦσαι ἡμᾶς ἀπὸ πάσης θλίψεως, κακίας καὶ ὀδύνης. Περίφραξον ἡμᾶς τοῖς ἁγίοις σου ἀγγέλοις, ἵνα τῇ παρεμβολῇ αὐτῶν φρουρούμενοι καὶ ὁδηγούμενοι, καταντήσωμεν εἰς τὴν ἑνότητα τῆς πίστεως καὶ εἰς τὴν ἐπίγνωσιν τῆς ἀπροσίτου σου δόξης· ὅτι εὐλογητὸς εἶ εἰς τοὺς αἰῶνας τῶν αἰώνων. Ἀμήν.',
    ],
  },
  evening: {
    en: [
      'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.',
      'Glory to Thee, our God, glory to Thee.',
      'O Heavenly King, Comforter, Spirit of Truth, Who art everywhere present and fillest all things, Treasury of good things and Giver of life: come and dwell in us, and cleanse us of all impurity, and save our souls, O Good One.',
      'Holy God, Holy Mighty, Holy Immortal, have mercy on us. (thrice)',
      'Glory to the Father, and to the Son, and to the Holy Spirit, both now and ever, and unto the ages of ages. Amen.',
      'O Most Holy Trinity, have mercy on us. O Lord, blot out our sins. O Master, pardon our iniquities. O Holy One, visit and heal our infirmities for Thy name’s sake.',
      'Lord, have mercy. (thrice)',
      'Glory to the Father, and to the Son, and to the Holy Spirit, both now and ever, and unto the ages of ages. Amen.',
      'Our Father, Who art in the heavens, hallowed be Thy name. Thy kingdom come, Thy will be done, on earth as it is in heaven. Give us this day our daily bread, and forgive us our debts, as we forgive our debtors; and lead us not into temptation, but deliver us from the evil one.',
      'O Eternal God, King of every creature, Who hast enabled me to attain to this hour: forgive me the sins which I have committed this day in deed, word, and thought; and cleanse, O Lord, my humble soul from every defilement of flesh and spirit. Grant me, O Lord, to pass the sleep of this night in peace, that rising from my humble bed I may please Thy most holy name all the days of my life, and conquer the fleshly and incorporeal enemies that war against me. Deliver me, O Lord, from vain thoughts that defile me, and from evil desires. For Thine is the kingdom, and the power, and the glory, of the Father, and of the Son, and of the Holy Spirit, now and ever, and unto the ages of ages. Amen.',
      'O Theotokos, Virgin, rejoice; Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, for thou hast borne the Saviour of our souls.',
      'Grant, O Lord, to keep us this night without sin. Blessed art Thou, O Lord, the God of our fathers, and praised and glorified is Thy name unto the ages. Amen.',
      'Lord, have mercy. (thrice)',
      'Glory to the Father, and to the Son, and to the Holy Spirit, both now and ever, and unto the ages of ages. Amen.',
    ],
    ru: [
      'Во имя Отца, и Сына, и Святаго Духа. Аминь.',
      'Слава Тебе, Боже наш, слава Тебе.',
      'Царю Небесный, Утешителю, Душе истины, Иже везде сый и вся исполняяй, Сокровище благих и жизни Подателю, прииди и вселися в ны, и очисти ны от всякия скверны, и спаси, Блаже, души наша.',
      'Святый Боже, Святый Крепкий, Святый Безсмертный, помилуй нас. (трижды)',
      'Слава Отцу, и Сыну, и Святому Духу, и ныне и присно, и во веки веков. Аминь.',
      'Пресвятая Троице, помилуй нас; Господи, очисти грехи наша; Владыко, прости беззакония наша; Святый, посети и исцели немощи наша, имене Твоего ради.',
      'Господи, помилуй. (трижды)',
      'Слава Отцу, и Сыну, и Святому Духу, и ныне и присно, и во веки веков. Аминь.',
      'Отче наш, Иже еси на небесех! Да святится имя Твое, да приидет Царствие Твое, да будет воля Твоя, яко на небеси и на земли. Хлеб наш насущный даждь нам днесь; и остави нам долги наша, якоже и мы оставляем должником нашим; и не введи нас во искушение, но избави нас от лукаваго.',
      'Боже вечный и Царю всякаго создания, сподобивый мя даже в час сей дойти, прости ми грехи, яже сотворих в сей день делом, словом и помышлением, и очисти, Господи, смиренную мою душу от всякия скверны плоти и духа. И даждь ми, Господи, в нощи сей сон прейти в мире, да, восстав от смиреннаго ми ложа, благоугожду пресвятому имени Твоему во вся дни живота моего, и попру плотския и безплотныя враги, борющия мя. И избави мя, Господи, от помышлений суетных, оскверняющих мя, и похотей лукавых. Яко Твое есть Царство, и сила, и слава, Отца и Сына и Святаго Духа, ныне и присно, и во веки веков. Аминь.',
      'Богородице Дево, радуйся, Благодатная Марие, Господь с Тобою; благословена Ты в женах, и благословен плод чрева Твоего, яко Спаса родила еси душ наших.',
      'Сподоби, Господи, в вечер сей без греха сохранитися нам. Благословен еси, Господи, Боже отец наших, и хвально и прославлено имя Твое во веки. Аминь.',
      'Господи, помилуй. (трижды)',
      'Слава Отцу, и Сыну, и Святому Духу, и ныне и присно, и во веки веков. Аминь.',
    ],
    el: [
      'Εἰς τὸ ὄνομα τοῦ Πατρὸς καὶ τοῦ Υἱοῦ καὶ τοῦ Ἁγίου Πνεύματος. Ἀμήν.',
      'Δόξα σοι, ὁ Θεὸς ἡμῶν, δόξα σοι.',
      'Βασιλεῦ οὐράνιε, Παράκλητε, τὸ Πνεῦμα τῆς ἀληθείας, ὁ πανταχοῦ παρὼν καὶ τὰ πάντα πληρῶν, ὁ θησαυρὸς τῶν ἀγαθῶν καὶ ζωῆς χορηγός, ἐλθὲ καὶ σκίνωσον ἐν ἡμῖν, καὶ καθάρισον ἡμᾶς ἀπὸ πάσης κηλίδος, καὶ σῶσον, Ἀγαθέ, τὰς ψυχὰς ἡμῶν.',
      'Ἅγιος ὁ Θεός, Ἅγιος Ἰσχυρός, Ἅγιος Ἀθάνατος, ἐλέησον ἡμᾶς. (τρίς)',
      'Δόξα Πατρὶ καὶ Υἱῷ καὶ Ἁγίῳ Πνεύματι, καὶ νῦν καὶ ἀεὶ καὶ εἰς τοὺς αἰῶνας τῶν αἰώνων. Ἀμήν.',
      'Παναγία Τριάς, ἐλέησον ἡμᾶς. Κύριε, ἱλάσθητι ταῖς ἁμαρτίαις ἡμῶν. Δέσποτα, συγχώρησον τὰς ἀνομίας ἡμῖν. Ἅγιε, ἐπίσκεψαι καὶ ἴασαι τὰς ἀσθενείας ἡμῶν, ἕνεκεν τοῦ ὀνόματός σου.',
      'Κύριε, ἐλέησον. (τρίς)',
      'Δόξα Πατρὶ καὶ Υἱῷ καὶ Ἁγίῳ Πνεύματι, καὶ νῦν καὶ ἀεὶ καὶ εἰς τοὺς αἰῶνας τῶν αἰώνων. Ἀμήν.',
      'Πάτερ ἡμῶν ὁ ἐν τοῖς οὐρανοῖς, ἁγιασθήτω τὸ ὄνομά σου· ἐλθέτω ἡ βασιλεία σου· γενηθήτω τὸ θέλημά σου, ὡς ἐν οὐρανῷ καὶ ἐπὶ τῆς γῆς. Τὸν ἄρτον ἡμῶν τὸν ἐπιούσιον δὸς ἡμῖν σήμερον· καὶ ἄφες ἡμῖν τὰ ὀφειλήματα ἡμῶν, ὡς καὶ ἡμεῖς ἀφίεμεν τοῖς ὀφειλέταις ἡμῶν· καὶ μὴ εἰσενέγκῃς ἡμᾶς εἰς πειρασμόν, ἀλλὰ ῥῦσαι ἡμᾶς ἀπὸ τοῦ πονηροῦ.',
      'Θεὲ αἰώνιε καὶ Βασιλεῦ πάσης κτίσεως, ὁ ἀξιώσας με φθάσαι τὴν ὥραν ταύτην, συγχώρησόν μοι τὰς ἁμαρτίας ἃς ἐποίησα ἐν τῇ ἡμέρᾳ ταύτῃ ἔργῳ, λόγῳ καὶ διανοίᾳ, καὶ καθάρισον, Κύριε, τὴν ταπεινήν μου ψυχὴν ἀπὸ πάσης κηλίδος σαρκὸς καὶ πνεύματος. Καὶ δός μοι, Κύριε, ἐν τῇ νυκτὶ ταύτῃ ὕπνον ἐν εἰρήνῃ διελθεῖν, ἵνα ἐγερθεὶς ἐκ τῆς ταπεινῆς μου κλίνης εὐαρεστήσω τῷ παναγίῳ ὀνόματί σου πάσας τὰς ἡμέρας τῆς ζωῆς μου, καὶ καταπατήσω τοὺς σαρκικοὺς καὶ ἀσωμάτους ἐχθροὺς τοὺς πολεμοῦντάς με. Καὶ ῥῦσαί με, Κύριε, ἀπὸ λογισμῶν ματαίων τῶν μολυνόντων με, καὶ ἀπὸ ἐπιθυμιῶν πονηρῶν. Ὅτι σοῦ ἐστιν ἡ βασιλεία καὶ ἡ δύναμις καὶ ἡ δόξα, τοῦ Πατρὸς καὶ τοῦ Υἱοῦ καὶ τοῦ Ἁγίου Πνεύματος, νῦν καὶ ἀεὶ καὶ εἰς τοὺς αἰῶνας τῶν αἰώνων. Ἀμήν.',
      'Θεοτόκε Παρθένε, χαῖρε, κεχαριτωμένη Μαρία, ὁ Κύριος μετὰ σοῦ· εὐλογημένη σὺ ἐν γυναιξί, καὶ εὐλογημένος ὁ καρπὸς τῆς κοιλίας σου, ὅτι Σωτῆρα ἔτεκες τῶν ψυχῶν ἡμῶν.',
      'Καταξίωσον, Κύριε, ἐν τῇ ἑσπέρᾳ ταύτῃ ἀναμαρτήτους φυλαχθῆναι ἡμᾶς. Εὐλογητὸς εἶ, Κύριε, ὁ Θεὸς τῶν πατέρων ἡμῶν, καὶ αἰνετὸν καὶ δεδοξασμένον τὸ ὄνομά σου εἰς τοὺς αἰῶνας. Ἀμήν.',
      'Κύριε, ἐλέησον. (τρίς)',
      'Δόξα Πατρὶ καὶ Υἱῷ καὶ Ἁγίῳ Πνεύματι, καὶ νῦν καὶ ἀεὶ καὶ εἰς τοὺς αἰῶνας τῶν αἰώνων. Ἀμήν.',
    ],
  },
  communion: {
    en: [
      'I believe, O Lord, and I confess that Thou art truly the Christ, the Son of the living God, Who camest into the world to save sinners, of whom I am first.',
      'I believe also that this is truly Thine own most pure Body, and that this is truly Thine own precious Blood. Therefore, I pray Thee: have mercy upon me, and forgive my transgressions, voluntary and involuntary, in word and deed, known and unknown. And make me worthy without condemnation to partake of Thy most pure Mysteries, for the remission of sins and unto life everlasting. Amen.',
      'Of Thy Mystical Supper, O Son of God, accept me today as a communicant; for I will not speak of Thy Mystery to Thine enemies, neither like Judas will I give Thee a kiss; but like the thief will I confess Thee: Remember me, O Lord, in Thy kingdom.',
      'May the communion of Thy holy Mysteries be neither to my judgment nor to my condemnation, O Lord, but unto the healing of soul and body. Amen.',
      'After Communion:',
      'I thank Thee, O Lord my God, for Thou hast not rejected me, a sinner, but hast made me worthy to be a partaker of Thy holy things. I thank Thee, for Thou hast permitted me, the unworthy, to commune of Thy most pure and heavenly gifts.',
      'O Master Who lovest mankind, Who for our sakes didst die and rise again, and didst bestow upon us these awesome and life-creating Mysteries for the good and sanctification of our souls and bodies: let them be unto healing of soul and body, unto the banishing of every adversary, unto the illumining of the eyes of my heart, unto the peace of spiritual powers, unto faith unashamed, unto love unfeigned, unto the fulfilling of wisdom, unto the observing of Thy commandments, unto the receiving of Thy divine grace, and unto the attaining of Thy kingdom.',
      'Preserved by them in Thy holiness, may I always remember Thy grace and live not unto myself, but unto Thee, our Master and Benefactor. Amen.',
    ],
    ru: [
      'Верую, Господи, и исповедую, яко Ты еси воистину Христос, Сын Бога Живаго, пришедый в мир грешныя спасти, от нихже первый есмь аз.',
      'Еще верую, яко сие есть самое пречистое Тело Твое, и сия есть самая честная Кровь Твоя. Молюся убо Тебе: помилуй мя, и прости ми прегрешения моя, вольная и невольная, яже словом, яже делом, яже ведением и неведением, и сподоби мя неосужденно причаститися пречистых Твоих Таинств, во оставление грехов и в жизнь вечную. Аминь.',
      'Вечери Твоея тайныя днесь, Сыне Божий, причастника мя приими; не бо врагом Твоим тайну повем, ни лобзания Ти дам, яко Иуда, но яко разбойник исповедаю Тя: помяни мя, Господи, во Царствии Твоем.',
      'Да не в суд или во осуждение будет мне причащение святых Твоих Таин, Господи, но во исцеление души и тела. Аминь.',
      'После Причащения:',
      'Благодарю Тя, Господи Боже мой, яко не отринул мя еси грешнаго, но общника мя быти святынь Твоих сподобил еси. Благодарю Тя, яко мене недостойнаго причаститися пречистых Твоих и небесных даров сподобил еси.',
      'Но, Владыко Человеколюбче, умерший нас ради и воскресый, и даровавый нам страшныя сия и животворящия Тайны во благодеяние и освящение душ и телес наших: да будут сия мне во исцеление души же и тела, во отгнание всякаго сопротивнаго, во просвещение очес сердца моего, в мир душевных моих сил, в веру непостыдну, в любовь нелицемерну, во исполнение премудрости, в соблюдение заповедей Твоих, в приложение божественныя Твоея благодати и Царствия Твоего присвоение.',
      'Да во святыни Твоей теми сохраняемь, Твою благодать поминаю всегда, и не себе живу, но Тебе, нашему Владыце и Благодетелю. Аминь.',
    ],
    el: [
      'Πιστεύω, Κύριε, καὶ ὁμολογῶ ὅτι σὺ εἶ ἀληθῶς ὁ Χριστός, ὁ Υἱὸς τοῦ Θεοῦ τοῦ ζῶντος, ὁ ἐλθὼν εἰς τὸν κόσμον ἁμαρτωλοὺς σῶσαι, ὧν πρῶτός εἰμι ἐγώ.',
      'Ἔτι πιστεύω ὅτι τοῦτό ἐστιν αὐτὸ τὸ ἄχραντόν σου Σῶμα, καὶ τοῦτό ἐστιν αὐτὸ τὸ τίμιόν σου Αἷμα. Δέομαι οὖν σου· ἐλέησόν με, καὶ συγχώρησόν μοι τὰ παραπτώματά μου, τὰ ἑκούσια καὶ τὰ ἀκούσια, τὰ ἐν λόγῳ, τὰ ἐν ἔργῳ, τὰ ἐν γνώσει καὶ ἀγνοίᾳ, καὶ ἀξίωσόν με ἀκατακρίτως μετασχεῖν τῶν ἀχράντων σου Μυστηρίων, εἰς ἄφεσιν ἁμαρτιῶν καὶ εἰς ζωὴν αἰώνιον. Ἀμήν.',
      'Τοῦ δείπνου σου τοῦ μυστικοῦ σήμερον, Υἱὲ Θεοῦ, κοινωνόν με παράλαβε· οὐ μὴ γὰρ τοῖς ἐχθροῖς σου τὸ μυστήριον εἴπω, οὐδὲ φίλημά σοι δώσω, καθάπερ ὁ Ἰούδας, ἀλλ’ ὡς ὁ λῃστὴς ὁμολογῶ σοι· μνήσθητί μου, Κύριε, ἐν τῇ βασιλείᾳ σου.',
      'Μὴ εἰς κρῖμα ἢ εἰς κατάκριμα γένοιτό μοι ἡ μετάληψις τῶν ἁγίων σου Μυστηρίων, Κύριε, ἀλλ’ εἰς ἴασιν ψυχῆς καὶ σώματος. Ἀμήν.',
      'Μετὰ τὴν Θείαν Κοινωνίαν:',
      'Εὐχαριστῶ σοι, Κύριε ὁ Θεός μου, ὅτι οὐκ ἀπώσω με τὸν ἁμαρτωλόν, ἀλλὰ κοινωνόν με γενέσθαι τῶν ἁγίων σου ἠξίωσας. Εὐχαριστῶ σοι, ὅτι ἐμὲ τὸν ἀνάξιον μεταλαβεῖν τῶν ἀχράντων καὶ ἐπουρανίων σου δωρεῶν κατηξίωσας.',
      'Ἀλλ’, ὦ Δέσποτα φιλάνθρωπε, ὁ δι’ ἡμᾶς ἀποθανὼν καὶ ἀναστάς, καὶ χαρισάμενος ἡμῖν τὰ φρικτὰ ταῦτα καὶ ζωοποιὰ Μυστήρια εἰς εὐεργεσίαν καὶ ἁγιασμὸν τῶν ψυχῶν καὶ σωμάτων ἡμῶν· γενέσθωσαν ταῦτά μοι εἰς ἴασιν ψυχῆς τε καὶ σώματος, εἰς ἀπελασμὸν παντὸς ἐναντίου, εἰς φωτισμὸν τῶν ὀφθαλμῶν τῆς καρδίας μου, εἰς εἰρήνην τῶν ψυχικῶν μου δυνάμεων, εἰς πίστιν ἀκαταίσχυντον, εἰς ἀγάπην ἀνυπόκριτον, εἰς πλήρωσιν σοφίας, εἰς τήρησιν τῶν ἐντολῶν σου, εἰς προσθήκην τῆς θείας σου χάριτος καὶ τῆς βασιλείας σου οἰκείωσιν.',
      'Ἵνα ἐν τῷ ἁγιασμῷ σου δι’ αὐτῶν φυλαττόμενος, τὴν σὴν χάριν ἀεὶ μνημονεύω, καὶ μὴ ἐμαυτῷ ζῶ, ἀλλὰ σοί, τῷ ἡμετέρῳ Δεσπότῃ καὶ Εὐεργέτῃ. Ἀμήν.',
    ],
  },
  trisagion: {
    en: [
      'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.',
      'Glory to Thee, our God, glory to Thee.',
      'O Heavenly King, Comforter, Spirit of Truth, Who art everywhere present and fillest all things, Treasury of good things and Giver of life: come and dwell in us, and cleanse us of all impurity, and save our souls, O Good One.',
      'Holy God, Holy Mighty, Holy Immortal, have mercy on us. (thrice)',
      'Glory to the Father, and to the Son, and to the Holy Spirit, both now and ever, and unto the ages of ages. Amen.',
      'O Most Holy Trinity, have mercy on us. O Lord, blot out our sins. O Master, pardon our iniquities. O Holy One, visit and heal our infirmities for Thy name’s sake.',
      'Lord, have mercy. (thrice)',
      'Glory to the Father, and to the Son, and to the Holy Spirit, both now and ever, and unto the ages of ages. Amen.',
      'Our Father, Who art in the heavens, hallowed be Thy name. Thy kingdom come, Thy will be done, on earth as it is in heaven. Give us this day our daily bread, and forgive us our debts, as we forgive our debtors; and lead us not into temptation, but deliver us from the evil one.',
    ],
    ru: [
      'Во имя Отца, и Сына, и Святаго Духа. Аминь.',
      'Слава Тебе, Боже наш, слава Тебе.',
      'Царю Небесный, Утешителю, Душе истины, Иже везде сый и вся исполняяй, Сокровище благих и жизни Подателю, прииди и вселися в ны, и очисти ны от всякия скверны, и спаси, Блаже, души наша.',
      'Святый Боже, Святый Крепкий, Святый Безсмертный, помилуй нас. (трижды)',
      'Слава Отцу, и Сыну, и Святому Духу, и ныне и присно, и во веки веков. Аминь.',
      'Пресвятая Троице, помилуй нас; Господи, очисти грехи наша; Владыко, прости беззакония наша; Святый, посети и исцели немощи наша, имене Твоего ради.',
      'Господи, помилуй. (трижды)',
      'Слава Отцу, и Сыну, и Святому Духу, и ныне и присно, и во веки веков. Аминь.',
      'Отче наш, Иже еси на небесех! Да святится имя Твое, да приидет Царствие Твое, да будет воля Твоя, яко на небеси и на земли. Хлеб наш насущный даждь нам днесь; и остави нам долги наша, якоже и мы оставляем должником нашим; и не введи нас во искушение, но избави нас от лукаваго.',
    ],
    el: [
      'Εἰς τὸ ὄνομα τοῦ Πατρὸς καὶ τοῦ Υἱοῦ καὶ τοῦ Ἁγίου Πνεύματος. Ἀμήν.',
      'Δόξα σοι, ὁ Θεὸς ἡμῶν, δόξα σοι.',
      'Βασιλεῦ οὐράνιε, Παράκλητε, τὸ Πνεῦμα τῆς ἀληθείας, ὁ πανταχοῦ παρὼν καὶ τὰ πάντα πληρῶν, ὁ θησαυρὸς τῶν ἀγαθῶν καὶ ζωῆς χορηγός, ἐλθὲ καὶ σκίνωσον ἐν ἡμῖν, καὶ καθάρισον ἡμᾶς ἀπὸ πάσης κηλίδος, καὶ σῶσον, Ἀγαθέ, τὰς ψυχὰς ἡμῶν.',
      'Ἅγιος ὁ Θεός, Ἅγιος Ἰσχυρός, Ἅγιος Ἀθάνατος, ἐλέησον ἡμᾶς. (τρίς)',
      'Δόξα Πατρὶ καὶ Υἱῷ καὶ Ἁγίῳ Πνεύματι, καὶ νῦν καὶ ἀεὶ καὶ εἰς τοὺς αἰῶνας τῶν αἰώνων. Ἀμήν.',
      'Παναγία Τριάς, ἐλέησον ἡμᾶς. Κύριε, ἱλάσθητι ταῖς ἁμαρτίαις ἡμῶν. Δέσποτα, συγχώρησον τὰς ἀνομίας ἡμῖν. Ἅγιε, ἐπίσκεψαι καὶ ἴασαι τὰς ἀσθενείας ἡμῶν, ἕνεκεν τοῦ ὀνόματός σου.',
      'Κύριε, ἐλέησον. (τρίς)',
      'Δόξα Πατρὶ καὶ Υἱῷ καὶ Ἁγίῳ Πνεύματι, καὶ νῦν καὶ ἀεὶ καὶ εἰς τοὺς αἰῶνας τῶν αἰώνων. Ἀμήν.',
      'Πάτερ ἡμῶν ὁ ἐν τοῖς οὐρανοῖς, ἁγιασθήτω τὸ ὄνομά σου· ἐλθέτω ἡ βασιλεία σου· γενηθήτω τὸ θέλημά σου, ὡς ἐν οὐρανῷ καὶ ἐπὶ τῆς γῆς. Τὸν ἄρτον ἡμῶν τὸν ἐπιούσιον δὸς ἡμῖν σήμερον· καὶ ἄφες ἡμῖν τὰ ὀφειλήματα ἡμῶν, ὡς καὶ ἡμεῖς ἀφίεμεν τοῖς ὀφειλέταις ἡμῶν· καὶ μὴ εἰσενέγκῃς ἡμᾶς εἰς πειρασμόν, ἀλλὰ ῥῦσαι ἡμᾶς ἀπὸ τοῦ πονηροῦ.',
    ],
  },
  before_meals: {
    en: [
      'The eyes of all look to Thee with hope, and Thou givest them their food in due season. Thou openest Thy hand and fillest every living thing with Thy favour.',
      'Glory to the Father, and to the Son, and to the Holy Spirit, both now and ever, and unto the ages of ages. Amen.',
      'Lord, have mercy. (thrice)',
      'Christ God, bless the food and drink of Thy servants, for Thou art holy, always, now and ever, and unto the ages of ages. Amen.',
      'After the meal:',
      'We thank Thee, O Christ our God, that Thou hast satisfied us with Thine earthly gifts; deprive us not of Thy heavenly kingdom, but as Thou camest among Thy disciples, O Saviour, and gavest them peace, come also among us and save us.',
    ],
    ru: [
      'Очи всех на Тя, Господи, уповают, и Ты даеши им пищу во благовремении, отверзаеши Ты руку Твою и исполняеши всякое животно благоволения.',
      'Слава Отцу, и Сыну, и Святому Духу, и ныне и присно, и во веки веков. Аминь.',
      'Господи, помилуй. (трижды)',
      'Христе Боже, благослови ястие и питие рабом Твоим, яко свят еси всегда, ныне и присно, и во веки веков. Аминь.',
      'После трапезы:',
      'Благодарим Тя, Христе Боже наш, яко насытил еси нас земных Твоих благ; не лиши нас и Небеснаго Твоего Царствия, но яко посреде учеников Твоих пришел еси, Спасе, мир даяй им, прииди к нам и спаси нас.',
    ],
    el: [
      'Οἱ ὀφθαλμοὶ πάντων εἰς σὲ ἐλπίζουσι, καὶ σὺ δίδως τὴν τροφὴν αὐτῶν ἐν εὐκαιρίᾳ. Ἀνοίγεις σὺ τὴν χεῖρά σου καὶ ἐμπιπλᾷς πᾶν ζῷον εὐδοκίας.',
      'Δόξα Πατρὶ καὶ Υἱῷ καὶ Ἁγίῳ Πνεύματι, καὶ νῦν καὶ ἀεὶ καὶ εἰς τοὺς αἰῶνας τῶν αἰώνων. Ἀμήν.',
      'Κύριε, ἐλέησον. (τρίς)',
      'Χριστὲ ὁ Θεός, εὐλόγησον τὴν βρῶσιν καὶ τὴν πόσιν τῶν δούλων σου, ὅτι ἅγιος εἶ πάντοτε, νῦν καὶ ἀεὶ καὶ εἰς τοὺς αἰῶνας τῶν αἰώνων. Ἀμήν.',
      'Μετὰ τὸ φαγητόν:',
      'Εὐχαριστοῦμέν σοι, Χριστὲ ὁ Θεὸς ἡμῶν, ὅτι ἐνέπλησας ἡμᾶς τῶν ἐπιγείων σου ἀγαθῶν· μὴ στερήσῃς ἡμᾶς καὶ τῆς ἐπουρανίου σου βασιλείας, ἀλλ’ ὡς ἐν μέσῳ τῶν μαθητῶν σου παρεγένου, Σωτήρ, εἰρήνην διδοὺς αὐτοῖς, ἐλθὲ καὶ πρὸς ἡμᾶς καὶ σῶσον ἡμᾶς.',
    ],
  },
  jesus: {
    en: [
      'Lord Jesus Christ, Son of God, have mercy on me, a sinner.',
    ],
    ru: [
      'Господи Иисусе Христе, Сыне Божий, помилуй мя грешнаго.',
    ],
    el: [
      'Κύριε Ἰησοῦ Χριστέ, Υἱὲ τοῦ Θεοῦ, ἐλέησόν με τὸν ἁμαρτωλόν.',
    ],
  },
  ephraim: {
    en: [
      'O Lord and Master of my life, a spirit of idleness, despondency, ambition, and idle talking give me not.',
      'But rather a spirit of chastity, humility, patience, and love bestow upon me Thy servant.',
      'Yea, O Lord King, grant me to see my own failings and not to condemn my brother; for blessed art Thou unto the ages of ages. Amen.',
      '(Commonly used especially during Great Lent, with prostrations according to local custom.)',
    ],
    ru: [
      'Господи и Владыко живота моего, дух праздности, уныния, любоначалия и празднословия не даждь ми.',
      'Дух же целомудрия, смиренномудрия, терпения и любве даруй ми, рабу Твоему.',
      'Ей, Господи Царю, даруй ми зрети моя прегрешения и не осуждати брата моего, яко благословен еси во веки веков. Аминь.',
      '(Обычно читается особенно в Великий пост, с поклонами по местному обычаю.)',
    ],
    el: [
      'Κύριε καὶ Δέσποτα τῆς ζωῆς μου, πνεῦμα ἀργίας, περιεργείας, φιλαρχίας καὶ ἀργολογίας μή μοι δῷς.',
      'Πνεῦμα δὲ σωφροσύνης, ταπεινοφροσύνης, ὑπομονῆς καὶ ἀγάπης χάρισαί μοι τῷ σῷ δούλῳ.',
      'Ναί, Κύριε Βασιλεῦ, δώρησαί μοι τοῦ ὁρᾶν τὰ ἐμὰ πταίσματα, καὶ μὴ κατακρίνειν τὸν ἀδελφόν μου· ὅτι εὐλογητὸς εἶ εἰς τοὺς αἰῶνας τῶν αἰώνων. Ἀμήν.',
      '(Συνηθίζεται ἰδιαιτέρως στὴ Μεγάλη Τεσσαρακοστή, μὲ μετάνοιες κατὰ τὴν τοπικὴ συνήθεια.)',
    ],
  },
};
