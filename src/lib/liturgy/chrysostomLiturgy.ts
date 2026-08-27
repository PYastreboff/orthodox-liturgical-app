import type { UiLanguage } from '../../i18n/types';

export const CHRYSOSTOM_SECTION_IDS = [
  'opening',
  'great_litany',
  'antiphons',
  'readings',
  'cherubic',
  'creed',
  'anaphora',
  'communion',
  'dismissal',
] as const;

export type ChrysostomSectionId = (typeof CHRYSOSTOM_SECTION_IDS)[number];

type LocalizedLines = Record<UiLanguage, string[]>;

export type ChrysostomSection = {
  id: ChrysostomSectionId;
  paragraphs: LocalizedLines;
};


function section(
  id: ChrysostomSectionId,
  enLines: string[],
  ruLines: string[],
  elLines: string[],
): ChrysostomSection {
  return { id, paragraphs: { en: enLines, ru: ruLines, el: elLines } };
}

export const CHRYSOSTOM_LITURGY: readonly ChrysostomSection[] = [
  section(
    'opening',
    [
      '(Priest, before the Beautiful Gate:)',
      'Blessed is the Kingdom of the Father, and of the Son, and of the Holy Spirit, now and ever, and unto the ages of ages.',
      'Amen.',
      '(The Litany of Peace and the Antiphons follow. On Sundays and great feasts the choir sings “Through the prayers of the Theotokos, O Savior, save us” and the appointed troparia.)',
    ],
    [
      '(Священник перед царскими вратами:)',
      'Благословенно Царствие Отца и Сына и Святаго Духа, ныне и присно, и во веки веков.',
      'Аминь.',
      '(Далее — Великая ектения и антифоны. В воскресные и праздничные дни поются тропари.)',
    ],
    [
      '(Ιερέας πριν από τις Βασιλικές Πύλες:)',
      'Ευλογημένη η βασιλεία του Πατρός και του Υιού και του Αγίου Πνεύματος, νυνί και αεί και εις τους αιώνας των αιώνων.',
      'Αμήν.',
      '(Ακολουθούν οι ευχές και οι αντίφωνοι.)',
    ],
  ),
  section(
    'great_litany',
    [
      '(Deacon:)',
      'In peace let us pray to the Lord.',
      'For the peace from above, and for the salvation of our souls, let us pray to the Lord.',
      'For the peace of the whole world, the good estate of the holy churches of God, and the union of all, let us pray to the Lord.',
      'For this holy house, and for those who enter it with faith, reverence, and the fear of God, let us pray to the Lord.',
      'For our Archbishop (Name), for the honorable priesthood, the diaconate in Christ, for all the clergy and the people, let us pray to the Lord.',
      'For this city, and for every city and country, and for the faithful who dwell in them, let us pray to the Lord.',
      'For favorable weather, an abundance of the fruits of the earth, and temperate seasons, let us pray to the Lord.',
      'For travelers by land, by sea, and by air; for the sick, the suffering, the captives, and for their salvation, let us pray to the Lord.',
      'For our deliverance from all affliction, wrath, danger, and necessity, let us pray to the Lord.',
      'Help us, save us, have mercy on us, and keep us, O God, by Thy grace.',
      'Calling to remembrance our all-holy, immaculate, most blessed and glorious Lady Theotokos and Ever-Virgin Mary, with all the saints, let us commit ourselves and one another and all our life unto Christ our God.',
      '(People:)',
      'To Thee, O Lord.',
      '(Priest:)',
      'For unto Thee are due all glory, honor, and worship, to the Father, and to the Son, and to the Holy Spirit, now and ever, and unto the ages of ages.',
      'Amen.',
    ],
    [
      '(Диакон:)',
      'Миром Господу помолимся.',
      'О мири свыше и о спасении душ наших, Господу помолимся.',
      'О мире всего мира, благостоянии святых Божиих церквей и соединении всех, Господу помолимся.',
      'О святом храме сем и о входящих в него с верою, благоговением и страхом Божиим, Господу помолимся.',
      'Об архипастыре нашем (имя), о честном пресвитерстве, диаконстве во Христе, о всем клире и народе, Господу помолимся.',
      'О спасении, помощи, милости и покрове их, Господу помолимся.',
      'Помяни, Господи, страну нашу власти и воинство ея.',
      'Спаси, Боже, люди Твоя и благослови достояние Твое.',
      '(Народ:)',
      'Тебе, Господи.',
      '(Священник:)',
      'Яко Тебе подобает всякая слава, честь и поклонение, Отцу и Сыну и Святому Духу, ныне и присно, и во веки веков.',
      'Аминь.',
    ],
    [
      '(Διάκονος:)',
      'Εν ειρήνη του Κυρίου δεηθώμεν.',
      'Υπέρ της ειρήνης της άνωθεν και της σωτηρίας των ψυχών ημών, του Κυρίου δεηθώμεν.',
      'Υπέρ της ειρήνης του σύμπαντος κόσμου, του Κυρίου δεηθώμεν.',
      'Υπέρ του αγίου οίκου τούτου και των εισερχομένων εν αυτώ, του Κυρίου δεηθώμεν.',
      '(Λαός:)',
      'Σοι, Κύριε.',
      '(Ιερέας:)',
      'Ότι σοι πρέπει πάσα δόξα, τιμή και προσκύνησις, τω Πατρί και τω Υιώ και τω Αγίω Πνεύματι, νυνί και αεί και εις τους αιώνας των αιώνων.',
      'Αμήν.',
    ],
  ),
  section(
    'antiphons',
    [
      '(After the Little Entrance, the choir sings “O Son of God, who art risen from the dead, save us who sing to Thee. Alleluia” on Sundays, or the appointed troparia and kontakia of the day.)',
      'Holy God, Holy Mighty, Holy Immortal, have mercy on us. (thrice)',
      'Glory to the Father, and to the Son, and to the Holy Spirit, both now and ever, and unto the ages of ages. Amen.',
      'O Most Holy Trinity, have mercy on us. O Lord, blot out our sins. O Master, pardon our iniquities. O Holy One, visit and heal our infirmities, for Thy name’s sake.',
      'Lord, have mercy. (thrice)',
      'Glory… Both now…',
      'Our Father, who art in heaven…',
      '(The priest exclaims:)',
      'For Thine is the kingdom, and the power, and the glory, of the Father, and of the Son, and of the Holy Spirit, now and ever, and unto the ages of ages.',
      'Amen.',
    ],
    [
      '(После Малого входа поются тропари дня и Трисвятое.)',
      'Святый Боже, Святый Крепкий, Святый Безсмертный, помилуй нас. (трижды)',
      'Слава Отцу, и Сыну, и Святому Духу, и ныне и присно, и во веки веков. Аминь.',
      'Пресвятая Троице, помилуй нас; Господи, очисти грехи наша; Владыко, прости беззакония наша; Святый, посети и исцели немощи наша, имене Твоего ради.',
      'Господи, помилуй. (трижды)',
      'Отче наш…',
      '(Священник:)',
      'Яко Твое есть Царство и сила и слава, Отца и Сына и Святаго Духа, ныне и присно, и во веки веков.',
      'Аминь.',
    ],
    [
      '(Μετά την Μικρή Είσοδο ψάλλεται το Τρισάγιον.)',
      'Άγιος ο Θεός, Άγιος Ισχυρός, Άγιος Αθάνατος, ελέησον ημάς. (τρίς)',
      'Δόξα Πατρί… Και νυνί…',
      'Πάτερ ημών ο εν τοις ουρανοίς…',
      'Ότι σου εστίν η βασιλεία… Αμήν.',
    ],
  ),
  section(
    'readings',
    [
      '(The Epistle and Gospel of the day are proclaimed. The faithful stand for the Holy Gospel.)',
      '(Deacon:)',
      'Wisdom! Let us attend!',
      '(Priest or Deacon:)',
      'The Reading from the Epistle of the holy Apostle (Name) to the…',
      '(After the Epistle:)',
      'Wisdom! Let us attend! Let us worship the Holy Gospel.',
      '(Priest:)',
      'Peace be unto all.',
      '(People:)',
      'And to thy spirit.',
      '(Priest:)',
      'The Reading from the Holy Gospel according to (Name).',
      '(After the Gospel, the sermon may follow, then the Litany of Fervent Supplication and the Litany for the Departed on certain days.)',
    ],
    [
      '(Читаются Апостол и Евангелие дня.)',
      '(Диакон:)',
      'Премудрость! Станем добре!',
      '(Чтение из Послания святого Апостола…)',
      '(После Апостола:)',
      'Премудрость! Станем добре! Поклонимся святому Евангелию.',
      '(Священник:)',
      'Мир всем.',
      '(Народ:)',
      'И духу твоему.',
      '(Чтение от святого Евангелия от…)',
    ],
    [
      '(Αναγινώσκονται οι Απόστολος και το Ευαγγέλιο της ημέρας.)',
      '(Διάκονος:)',
      'Σοφία! Ορθοί!',
      '(Ανάγνωσις εκ του Αγίου Ευαγγελίου κατά…)',
    ],
  ),
  section(
    'cherubic',
    [
      '(The Great Entrance: the holy Gifts are borne in procession.)',
      'Let us who mystically represent the Cherubim, and who sing the thrice-holy hymn to the life-creating Trinity, now lay aside all earthly cares, that we may receive the King of all, who cometh invisibly upborne by the angelic hosts. Alleluia, alleluia, alleluia.',
      '(The Litany of Completion and the Nicene Creed follow.)',
    ],
    [
      '(Великий вход.)',
      'Да молчим, яко да Царя всех предстанем, и Ангельскими невидимо дориносима чинми. Аллилуия.',
      '(Сугубая ектения и Символ веры.)',
    ],
    [
      '(Μεγάλη Είσοδος.)',
      'Οι τα Χερουβίμ μυστικώς εικονίζοντες… νυνί την βασιλείαι πάντων υποδεξώμεθα. Αλληλούια.',
    ],
  ),
  section(
    'creed',
    [
      'I believe in one God, the Father Almighty, Maker of heaven and earth, and of all things visible and invisible.',
      'And in one Lord Jesus Christ, the Son of God, the Only-begotten, begotten of the Father before all ages; Light of Light, true God of true God, begotten, not made, of one essence with the Father, by whom all things were made.',
      'Who for us men and for our salvation came down from heaven, and was incarnate of the Holy Spirit and the Virgin Mary, and became man.',
      'And was crucified also for us under Pontius Pilate, and suffered and was buried.',
      'And the third day He rose again, according to the Scriptures.',
      'And ascended into heaven, and sitteth at the right hand of the Father.',
      'And He shall come again with glory to judge the living and the dead; whose kingdom shall have no end.',
      'And in the Holy Spirit, the Lord, the Giver of life, who proceedeth from the Father, who with the Father and the Son together is worshipped and glorified, who spake by the prophets.',
      'In one holy, catholic, and apostolic Church.',
      'I acknowledge one baptism for the remission of sins.',
      'I look for the resurrection of the dead, and the life of the age to come. Amen.',
    ],
    [
      'Верую во единого Бога Отца, Вседержителя, Творца неба и земли, видимым же всем и невидимым.',
      'И во единого Господа Иисуса Христа, Сына Божия, Единородного, Иже от Отца рожденнаго прежде всех век.',
      'Иже за ны человеки и нашего ради спасения сошедшаго с небес и воплотившагося от Духа Святаго и Марии Девы, и вочеловечшася.',
      'Распятаго же за ны при Понтийстем Пилате, и страдавша, и погребенна.',
      'И воскресшаго в третий день по Писанием.',
      'И возшедшаго на небеса, и седяща одесную Отца.',
      'И паки грядущаго со славою судити живым и мертвым, Егоже Царствию не будет конца.',
      'И в Духа Святаго, Господа, Животворящего, Иже от Отца исходящаго, Иже с Отцем и Сыном спокланяема и сславима.',
      'Во едину святую, соборную и апостольскую Церковь.',
      'Исповедую едино крещение во оставление грехов.',
      'Чаю воскресения мертвых, и жизни будущего века. Аминь.',
    ],
    [
      'Πιστεύω εις ένα Θεόν, Πατέρα, Παντοκράτορα, ποιητήν ουρανού και γης, ορατών τε πάντων και αοράτων.',
      'Και εις ένα Κύριον Ιησούν Χριστόν, τον Υιόν του Θεού τον μονογενή…',
      'Και εις το Πνεύμα το Άγιον, το Κύριον, το ζωοποιόν…',
      'Εις μίαν, αγίαν, καθολικήν και αποστολικήν Εκκλησίαν.',
      'Ομολογώ εν βάπτισμα εις άφεσιν αμαρτιών.',
      'Προσδοκώ ανάστασιν νεκρών και ζωήν του μέλλοντος αιώνος. Αμήν.',
    ],
  ),
  section(
    'anaphora',
    [
      '(Priest, secretly:)',
      'It is meet and right to hymn Thee, to bless Thee, to praise Thee, to give thanks unto Thee, and to worship Thee in every place of Thy dominion; for Thou art God ineffable, beyond comprehension, invisible, beyond understanding, existing forever and always the same.',
      '(Aloud:)',
      'Singing the triumphant hymn, shouting, proclaiming, and saying:',
      '(People:)',
      'Holy, holy, holy, Lord of Sabaoth, heaven and earth are full of Thy glory. Hosanna in the highest. Blessed is He that cometh in the name of the Lord. Hosanna in the highest.',
      '(Priest continues the Eucharistic Canon, commemorating the Mystical Supper:)',
      'Take, eat: this is My Body, which is broken for you for the remission of sins.',
      'Drink of it, all of you: this is My Blood of the new testament, which is shed for you and for many for the remission of sins.',
      '(After the Epiclesis:)',
      'And vouchsafe us, O Master, that with boldness and without condemnation we may dare to call upon Thee, the heavenly God, as Father, and to say:',
      '(People:)',
      'Our Father, who art in heaven…',
    ],
    [
      '(Священник:)',
      'Достойно и праведно есть поклонятися Отцу и Сыну и Святому Духу, Троице единосущной и нераздельной.',
      '(Народ:)',
      'Свят, Свят, Свят Господь Саваоф, исполнь небо и земля славы Твоея. Осанна в вышних.',
      '(Тайная вечеря:)',
      'Приимите, ядите: сие есть Тело Мое, о вас ломаемое во оставление грехов.',
      'Пийте от нея вси: сия есть Кровь Моя Новаго Завета, о вас изливаемая во оставление грехов.',
      '(Отче наш…)',
    ],
    [
      '(Ιερέας:)',
      'Άξιον και δίκαιον εστί σε υμνείν…',
      '(Λαός:)',
      'Άγιος, Άγιος, Άγιος Κύριος Σαβαώθ…',
      '(Λάβετε, φάγετε… Πίετε εξ αυτού πάντες…)',
    ],
  ),
  section(
    'communion',
    [
      '(Priest:)',
      'The holy Things are for the holy.',
      '(People:)',
      'One is Holy, one is Lord, Jesus Christ, to the glory of God the Father. Amen.',
      '(Priest, breaking the Lamb:)',
      'The Lamb of God is broken and distributed; broken, yet not divided; ever eaten, yet never consumed, but sanctifying those who partake thereof.',
      '(Priest:)',
      'Behold the Lamb of God, behold Him who taketh away the sin of the world.',
      '(People:)',
      'Lord, I believe; help Thou mine unbelief.',
      '(Before Communion:)',
      'Of Thy Mystical Supper, O Son of God, accept me today as a communicant; for I will not speak of Thy Mystery to Thine enemies, neither like Judas will I give Thee a kiss; but like the thief will I confess Thee: Remember me, O Lord, in Thy kingdom.',
      '(After Communion, the prayer of thanksgiving and the Dismissal follow.)',
    ],
    [
      '(Священник:)',
      'Святия святым.',
      '(Народ:)',
      'Един Свят, един Господь Иисус Христос, во славу Бога Отца. Аминь.',
      '(Агнец Божий, вземляй грех мира…)',
      '(Вечери Твоея тайныя днесь, Сыне Божий, причастника мя приими…)',
    ],
    [
      '(Ιερέας:)',
      'Τα άγια τοις αγίοις.',
      '(Λαός:)',
      'Είς άγιος, είς Κύριος, Ιησούς Χριστός…',
      '(Ιδε ο Αμνός του Θεού…)',
      '(Του δείπνου σου του μυστικού σήμερον…)',
    ],
  ),
  section(
    'dismissal',
    [
      '(Priest:)',
      'O Lord, who blessest those who bless Thee, and sanctifiest those who put their trust in Thee, preserve Thy people, O Christ our God, bless the crown of the year, and grant unto us Thy rich mercies, at the intercessions of our all-pure Lady Theotokos and Ever-Virgin Mary, and of all Thy saints.',
      '(People:)',
      'Amen.',
      '(Priest:)',
      'Glory to Thee, O Christ our God and our Hope, glory to Thee.',
      '(People:)',
      'Glory to the Father, and to the Son, and to the Holy Spirit, both now and ever, and unto the ages of ages. Amen.',
      'Lord, have mercy. (thrice)',
      'Father (Name), bless.',
      '(Priest gives the dismissal blessing.)',
      '(People:)',
      'Christ is in our midst! — He is and ever shall be.',
    ],
    [
      '(Священник:)',
      'Господи, благословляйи благословляющия Тя, и освящайи на Тя уповающия…',
      '(Народ:)',
      'Аминь.',
      'Слава Тебе, Христе Боже наш, упование наше, слава Тебе.',
      'Господи, помилуй. (трижды)',
      'Отец (имя), благослови.',
      '(Многая лета. Христос посреди нас! — Есть и будет.)',
    ],
    [
      '(Ιερέας:)',
      'Κύριε, ο ευλογών τους ευλογούντάς σε…',
      '(Λαός:)',
      'Αμήν.',
      'Δόξα σοι, Χριστέ ο Θεός ημών…',
      'Κύριε, ελέησον. (τρίς)',
      'Πάτερ (όνομα), ευλόγησον.',
    ],
  ),
];

export function chrysostomParagraphs(id: ChrysostomSectionId, lang: UiLanguage): string[] {
  const section = CHRYSOSTOM_LITURGY.find((s) => s.id === id);
  if (!section) return [];
  return section.paragraphs[lang]?.length
    ? section.paragraphs[lang]
    : section.paragraphs.en;
}

export function chrysostomTitleKey(id: ChrysostomSectionId): string {
  return `liturgy.chrysostom.${id}.title`;
}

export function chrysostomSummaryKey(id: ChrysostomSectionId): string {
  return `liturgy.chrysostom.${id}.summary`;
}
