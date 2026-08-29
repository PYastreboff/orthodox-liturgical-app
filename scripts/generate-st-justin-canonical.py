#!/usr/bin/env python3
"""Extract + translate St Justin Martyr liturgy into aligned EN/EL/Church Slavonic canonical JSON."""
from __future__ import annotations

import json
import re
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parent
PDF = Path('/tmp/st-justin-liturgy.pdf')
PDF_URL = 'https://st-justin-martyr.org/files/LITURGY-for-website.pdf'
EN_OUT = ROOT / 'liturgy-sources' / 'chrysostom-en-st-justin.json'
CANONICAL_OUT = ROOT / 'liturgy-sources' / 'chrysostom-st-justin-canonical.json'

ROLE = re.compile(r'^(Priest|People|Reader|Choir|Deacon)\s*:\s*(.*)$', re.I)

SECTION_TRIGGERS: list[tuple[str, re.Pattern[str]]] = [
    ('opening', re.compile(r'Blessed is the Kingdom', re.I)),
    ('great_litany', re.compile(r'^The Great Litany\s*$', re.I)),
    ('antiphons', re.compile(r'^The First Antiphon\s*$', re.I)),
    ('readings', re.compile(r'^The Epistle\s*$', re.I)),
    ('cherubic', re.compile(r'Let us who mystically represent', re.I)),
    ('creed', re.compile(r'^The Peace\s*$', re.I)),
    ('anaphora', re.compile(r'^The Anaphora\s*$', re.I)),
    ('communion', re.compile(r'^Precommunion Prayers', re.I)),
    ('dismissal', re.compile(r'Let us go forth in peace', re.I)),
]

SKIP = re.compile(
    r'^(THE DIVINE LITURGY|OF\s*$|SAINT JOHN CHRYSOSTOM|Sermon\s*$|Great Entrance\s*$|'
    r'The faithful come forward|All remain standing|\* \(|said reverently|\d+$)',
    re.I,
)

RUBRIC = re.compile(r'\s*\(said reverently[^)]*\)\s*', re.I)

CHOIR_EN = {
    'Amen.': ('ΧΟΡΟΣ: Ἀμήν.', 'Хор: Аминь.'),
    'Amen': ('ΧΟΡΟΣ: Ἀμήν.', 'Хор: Аминь.'),
    'Lord, have mercy.': ('ΧΟΡΟΣ: Κύριε, ἐλέησον.', 'Хор: Господи, помилуй.'),
    'Lord have mercy.': ('ΧΟΡΟΣ: Κύριε, ἐλέησον.', 'Хор: Господи, помилуй.'),
    'Lord have mercy.1': ('ΧΟΡΟΣ: Κύριε, ἐλέησον.', 'Хор: Господи, помилуй.'),
    'Lord, have mercy (thrice).': ('ΧΟΡΟΣ: Κύριε, ἐλέησον (τρίς).', 'Хор: Господи, помилуй (трижды).'),
    'To Thee, O Lord.': ('ΧΟΡΟΣ: Σοί, Κύριε.', 'Хор: Тебе, Господи.'),
    'To thee, O Lord.': ('ΧΟΡΟΣ: Σοί, Κύριε.', 'Хор: Тебе, Господи.'),
    'And with your spirit.': ('ΧΟΡΟΣ: Καὶ μετὰ τοῦ πνεύματός σου.', 'Хор: И со духом Твоим.'),
    'And to your spirit.': ('ΧΟΡΟΣ: Καὶ μετὰ τοῦ πνεύματός σου.', 'Хор: И со духом Твоим.'),
    'And to your spirit . Alleluia! Alleluia! Alleluia! (The reader chants the Alleluia verses.)': (
        'ΑΝΑΓΝΩΣΤΗΣ: Καὶ τῷ πνεύματί σου. Ἀλληλούϊα! Ἀλληλούϊα! Ἀλληλούϊα!',
        'Чтец: И со духом Твоим. Аллилуия! Аллилуия! Аллилуия!',
    ),
    'Grant it, O Lord.': ('ΧΟΡΟΣ: Παράσχοι, Κύριε.', 'Хор: Подай, Господи.'),
    'We lift them up unto the Lord.': ('ΧΟΡΟΣ: Ἔχομεν πρὸς τὸν Κύριον.', 'Хор: Имеем ко Господу.'),
    'A mercy of peace! A sacrifice of praise!': ('ΧΟΡΟΣ: Ἔλεον εἰρήνης, θυσίαν αἰνέσεως.', 'Хор: Милость мира, жертву хваления.'),
    'In the name of the Lord.': ('ΧΟΡΟΣ: Во имя Господне.', 'Хор: Во имя Господне.'),
    'One is Holy, One is the Lord, Jesus Christ, to the glory of God the Father. Amen.': (
        'ΧΟΡΟΣ: Εἷς ἅγιος, εἷς Κύριος, Ἰησοῦς Χριστός, εἰς δόξαν Θεοῦ Πατρός. Ἀμήν.',
        'Хор: Един Свят, Един Господь, Иисус Христос, во славу Бога Отца. Аминь.',
    ),
    'And all mankind.': ('ΧΟΡΟΣ: Καὶ παντὸς ἀνθρωπότητος.', 'Хор: И всего человечества.'),
    'Father, Son, and the Holy Spirit! The Trinity, one in essence, and undivided!': (
        'ΧΟΡΟΣ: Πατὴρ, Υἱὸς καὶ Ἅγιον Πνεῦμα· Τριὰς ὁμοούσιος καὶ ἀδιαίρετος!',
        'Хор: Отец, Сын и Святой Дух! Троица единосущная и нераздельная!',
    ),
}

CREED_EL = [
    'ΧΟΡΟΣ: Πιστεύω εἰς ἕνα Θεόν, Πατέρα, Παντοκράτορα, ποιητὴν οὐρανοῦ καὶ γῆς, ὁρατῶν τε πάντων καὶ ἀοράτων.',
    'ΧΟΡΟΣ: Καὶ εἰς ἕνα Κύριον Ἰησοῦν Χριστόν, τὸν Υἱὸν τοῦ Θεοῦ τὸν μονογενῆ, τὸν ἐκ τοῦ Πατρὸς γεννηθέντα πρὸ πάντων τῶν αἰώνων· φῶς ἐκ φωτός, Θεὸν ἀληθινὸν ἐκ Θεοῦ ἀληθινοῦ, γεννηθέντα οὐ ποιηθέντα, ὁμοούσιον τῷ Πατρί, διʼ οὗ τὰ πάντα ἐγένετο.',
    'ΧΟΡΟΣ: Τὸν διʼ ἡμᾶς τοὺς ἀνθρώπους καὶ διὰ τὴν ἡμετέραν σωτηρίαν κατελθόντα ἐκ τῶν οὐρανῶν καὶ σαρκωθέντα ἐκ Πνεύματος Ἁγίου καὶ Μαρίας τῆς Παρθένου καὶ ἐνανθρωπήσαντα· σταυρωθέντα τε ὑπὲρ ἡμῶν ἐπὶ Ποντίου Πιλάτου, καὶ παθόντα καὶ ταφέντα· καὶ ἀναστάντα τῇ τρίτῃ ἡμέρᾳ κατὰ τὰς Γραφάς· καὶ ἀνελθόντα εἰς τοὺς οὐρανοὺς καὶ καθεζόμενον ἐκ δεξιῶν τοῦ Πατρός· καὶ πάλιν ἐρχόμενον μετὰ δόξης κρῖναι ζῶντας καὶ νεκρούς, οὗ τῆς βασιλείας οὐκ ἔσται τέλος.',
    'ΧΟΡΟΣ: Καὶ εἰς τὸ Πνεῦμα τὸ Ἅγιον, τὸ Κύριον, τὸ ζωοποιόν, τὸ ἐκ τοῦ Πατρὸς ἐκπορευόμενον, τὸ σὺν Πατρὶ καὶ Υἱῷ συμπροσκυνούμενον καὶ συνδοξαζόμενον, τὸ λαλῆσαν διὰ τῶν προφητῶν· εἰς μίαν, ἁγίαν, καθολικὴν καὶ ἀποστολικὴν Ἐκκλησίαν.',
    'ΧΟΡΟΣ: Ὁμολογῶ ἓν βάπτισμα εἰς ἄφεσιν ἁμαρτιῶν.',
    'ΧΟΡΟΣ: Προσδοκῶ ἀνάστασιν νεκρῶν καὶ ζωὴν τοῦ μέλλοντος αἰῶνος. Ἀμήν.',
]

CREED_CHU = [
    'Хор: Верую во едина Бога Отца, Вседержителя, Творца небесе и земли, видимых же и невидимых.',
    'Хор: И во едина Господа Иисуса Христа, Сына Божия, Единороднаго, Рожденнаго от Отца прежде всех век: Света от Света, Бога истинна от Бога истинна, Рожденнаго, не сотвореннаго, единосущна Отцу, Имже вся быша.',
    'Хор: Ради нас человек и ради нашего спасения сшедшаго с небес и воплотившагося от Духа Святаго и Марии Девы, и вочеловечшагося; распята бывшаго за ны при Понтийстем Пилате, и страдавшаго, и погребеннаго; воскресшаго в третий день по Писаниям, и возшедшаго на небеса, и седящаго одесную Отца; и паки грядущаго со славою судити живым и мертвым, Егоже Царствию не будет конца.',
    'Хор: И в Единаго Святаго, Животворящаго и Сущаго Духа, Иже от Отца исходит, Иже с Отцем и Сыном покланяема и сославима, глаголавшаго пророки. И во едину, Святую, Соборную и Апостольскую Церковь.',
    'Хор: Исповедую едино Крещение во оставление грехов.',
    'Хор: Чаю воскресения мертвых, и жизни будущаго века. Аминь.',
]

LORDS_PRAYER_EL = (
    'ΧΟΡΟΣ: Πάτερ ἡμῶν, ὁ ἐν τοῖς οὐρανοῖς, ἁγιασθήτω τὸ ὄνομά σου, ἐλθέτω ἡ βασιλεία σου, '
    'γενηθήτω τὸ θέλημά σου, ὡς ἐν οὐρανῷ καὶ ἐπὶ γῆς. Τὸν ἄρτον ἡμῶν τὸν ἐπιούσιον δὸς ἡμῖν σήμερον, '
    'καὶ ἄφες ἡμῖν τὰ ὀφειλήματα ἡμῶν, ὡς καὶ ἡμεῖς ἀφίεμεν τοῖς ὀφειλέταις ἡμῶν· καὶ μὴ εἰσενέγκῃς ἡμᾶς εἰς πειρασμόν, '
    'ἀλλὰ ῥῦσαι ἡμᾶς ἀπὸ τοῦ πονηροῦ.'
)
LORDS_PRAYER_CHU = (
    'Хор: Отче наш, Иже еси на небесех, да святится имя Твое, да приидет Царствие Твое, да будет воля Твоя, '
    'яко на небеси и на земли. Хлеб наш насущный даждь нам днесь, и остави нам долги наша, якоже и мы оставляем должником нашим; '
    'и не введи нас во искушение, но избави нас от лукаваго.'
)


def to_church_slavonic(text: str) -> str:
    """Normalize generated lines to Church Slavonic orthography and phrasing."""
    if not text:
        return text
    text = text.replace('ё', 'е').replace('Ё', 'Е')
    replacements = [
        ('припадём', 'припадим'),
        ('всё ', 'вся '),
        (' всё', ' вся'),
        ('Им же ', 'Имже '),
        ('единого ', 'едина '),
        ('единого,', 'едина,'),
        ('истинного', 'истинна'),
        ('Рождённого', 'Рожденнаго'),
        ('несотворённого', 'несотвореннаго'),
        ('единосущного', 'единосущна'),
        ('погребённого', 'погребеннаго'),
        ('будущего', 'будущаго'),
        ('мёртвых', 'мертвых'),
        ('мёртвым', 'мертвым'),
        ('воплотившегося', 'воплотившагося'),
        ('сошедшего', 'сшедшаго'),
        ('человековшегося', 'вочеловечшагося'),
        ('пострадавшего', 'страдавшаго'),
        ('воскресшего', 'воскресшаго'),
        ('возшедшего', 'возшедшаго'),
        ('седящего', 'седящаго'),
        ('грядущего', 'грядущаго'),
        ('исходящего', 'исходящаго'),
        ('глаголавшего', 'глаголавшаго'),
        ('Животворящего', 'Животворящаго'),
        ('Кафолической', 'Кафолическую'),
        ('оглашаемые', 'оглашаемии'),
        ('оглашаемых', 'оглашаемых'),
        ('Верные,', 'Вернии,'),
        ('Мудростью вонмём', 'Мудростию вонмите'),
        ('Твое милосердие', 'Твое милосердие'),
    ]
    for old, new in replacements:
        text = text.replace(old, new)
    return text


def clean(text: str) -> str:
    text = re.sub(r'\s+', ' ', text).strip()
    for pat, rep in [
        (r'\bH e lp\b', 'Help'), (r'\bsa v e\b', 'save'), (r'\bh a ve\b', 'have'),
        (r'\bm e r cy\b', 'mercy'), (r'\bkee p\b', 'keep'), (r'\barm ed\b', 'armed'),
        (r'\bA nd\b', 'And'), (r'\bH e\b', 'He'), (r'\bTh e\b', 'The'),
        (r'\b esse nce\b', 'essence'), (r'\bbein g\b', 'being'), (r'\bthin gs\b', 'things'),
        (r'\bw ith\b', 'with'),         (r'\bupborne\b', 'upborne'), (r'\bcomp\s+assion\b', 'compassion'),
        (r'\bsa\s+crifices\b', 'sacrifices'), (r'\btoWorship\b', 'to Worship'),
        (r'\bfight\s+hand\b', 'right hand'), (r'\bwher\s+e\b', 'where'),
        (r'\bha\s+ve\b', 'have'), (r'\bo\s+f\b', 'of'), (r'\bSerap\s+him\b', 'Seraphim'),
        (r'\bhol\s+y\b', 'holy'), (r'\bThy\s+hol\s+y\b', 'Thy holy'),
    ]:
        text = re.sub(pat, rep, text, flags=re.I)
    text = RUBRIC.sub(' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def format_line(role: str | None, speech: str) -> str:
    speech = clean(speech)
    if not speech:
        return ''
    if role and role.lower() == 'people':
        role = 'Choir'
    if role:
        return f'{role.upper()}: {speech}'
    return speech


HEADER_ONLY_TRIGGERS = {
    'great_litany', 'antiphons', 'readings', 'anaphora', 'communion',
}


def is_section_trigger(line: str) -> str | None:
    for section_id, pattern in SECTION_TRIGGERS:
        if pattern.search(line):
            return section_id
    return None


def extract_en() -> dict[str, list[str]]:
    reader = PdfReader(str(PDF))
    raw = '\n'.join(page.extract_text() or '' for page in reader.pages)
    raw = re.sub(r'\n\d+\s*\n', '\n', raw)
    lines = [clean(l) for l in raw.splitlines()]
    lines = [l for l in lines if l and not SKIP.match(l)]

    sections: dict[str, list[str]] = {sid: [] for sid, _ in SECTION_TRIGGERS}
    current = 'opening'
    started = False
    pending_role: str | None = None
    pending_parts: list[str] = []

    def flush():
        nonlocal pending_role, pending_parts
        if not pending_role and not pending_parts:
            return
        formatted = format_line(pending_role, ' '.join(pending_parts))
        if formatted:
            sections[current].append(formatted)
        pending_role = None
        pending_parts = []

    for line in lines:
        if 'blessed is the kingdom' in line.lower() and not started:
            started = True
            flush()
            current = 'opening'
            if not ROLE.match(line):
                line = f'Priest: {line}'
        if not started:
            continue

        trigger = is_section_trigger(line)
        if trigger:
            flush()
            current = trigger
            if trigger in HEADER_ONLY_TRIGGERS:
                continue

        m = ROLE.match(line)
        if m:
            flush()
            pending_role = m.group(1)
            pending_parts = [m.group(2).strip()] if m.group(2).strip() else []
            continue

        if pending_role:
            if ROLE.match(line):
                flush()
                m2 = ROLE.match(line)
                if m2:
                    pending_role = m2.group(1)
                    pending_parts = [m2.group(2).strip()] if m2.group(2).strip() else []
                continue
            pending_parts.append(line)
            continue

        if line and not SKIP.match(line):
            sections[current].append(line)

    flush()
    return sections


def split_role(line: str) -> tuple[str | None, str]:
    m = ROLE.match(line)
    if not m:
        return None, line
    return m.group(1).lower(), m.group(2).strip()


def translate_congregational(speech: str, el_role: str = 'ΛΑΟΣ', chu_role: str = 'Народ') -> tuple[str, str] | None:
    el_prefix = f'{el_role}:'
    chu_prefix = f'{chu_role}:'
    for key, val in CHOIR_EN.items():
        if speech == key or speech.startswith(key):
            el, chu = val
            if el.startswith('ΧΟΡΟΣ:'):
                el = el.replace('ΧΟΡΟΣ:', el_prefix, 1)
            if chu.startswith('Хор:'):
                chu = chu.replace('Хор:', chu_prefix, 1)
            return el, to_church_slavonic(chu)
    if speech.startswith('Amen'):
        return (f'{el_prefix} Ἀμήν.', f'{chu_prefix} Аминь.')
    if 'Lord, have mercy' in speech or 'Lord have mercy' in speech:
        return (f'{el_prefix} Κύριε, ἐλέησον.', f'{chu_prefix} Господи, помилуй.')
    if 'Grant it' in speech or speech.startswith('Grant it'):
        return (f'{el_prefix} Παράσχοι, Κύριε.', f'{chu_prefix} Подай, Господи.')
    if 'Glory to Thee' in speech:
        return (f'{el_prefix} Δόξα Σοι, Κύριε, δόξα Σοι.', f'{chu_prefix} Слава Тебе, Господи, слава Тебе.')
    if 'To Thee, O Lord' in speech or speech.startswith('To Thee, O Lord'):
        return (f'{el_prefix} Σοί, Κύριε.', f'{chu_prefix} Тебе, Господи.')
    if 'And to your spirit' in speech or speech.startswith('And to your spirit'):
        return (f'{el_prefix} Καὶ μετὰ τοῦ πνεύματός σου.', f'{chu_prefix} И со духом Твоим.')
    if 'And with your spirit' in speech or speech.startswith('And with your spirit'):
        return (f'{el_prefix} Καὶ μετὰ τοῦ πνεύματός σου.', f'{chu_prefix} И со духом Твоим.')
    if 'We lift them up unto the Lord' in speech:
        return (f'{el_prefix} Ἔχομεν πρὸς τὸν Κύριον.', f'{chu_prefix} Имеем ко Господу.')
    if 'Come, let us worship' in speech or 'O Come, let us worship' in speech:
        return (
            f'{el_prefix} Δεῦτε, προσκυνήσωμεν καὶ προπέσωμεν Χριστῷ· δεῦτε, μετὰ πίστεως προσέλθωμεν καὶ φιλανθρωπίας πλησθῶμεν, ὅτι Χριστὸς ἐστιν ὁ Υἱὸς τοῦ Θεοῦ.',
            f'{chu_prefix} Приидите, поклонимся и припадим Христу; приидите, с верою приблизимся и исполнимся человеколюбия, яко Христос есть Сын Божий.',
        )
    if 'Holy God' in speech and 'Holy Mighty' in speech:
        return (
            f'{el_prefix} Ἅγιος ὁ Θεός, Ἅγιος ἰσχυρός, Ἅγιος ἀθάνατος, ἐλέησον ἡμᾶς (τρίς).',
            f'{chu_prefix} Святый Боже, Святый Крепкий, Святый Бессмертный, помилуй нас (трижды).',
        )
    if 'Holy! Holy! Holy!' in speech or 'Holy, Holy, Holy' in speech:
        return (
            f'{el_prefix} Ἅγιος, Ἅγιος, Ἅγιος Κύριος Σαβαώθ· πλήρης ὁ οὐρανὸς καὶ ἡ γῆ τῆς δόξης σου· Ὡσαννὰ ἐν τοῖς ὑψίστοις. Εὐλογημένος ὁ ἐρχόμενος ἐν ὀνόματι Κυρίου· Ὡσαννὰ ἐν τοῖς ὑψίστοις.',
            f'{chu_prefix} Свят, Свят, Свят Господь Саваоф; исполнь небо и земля славы Твоея; Осанна в вышних. Благословен Грядый во имя Господне; Осанна в вышних.',
        )
    if 'We hymn Thee' in speech or 'We praise Thee' in speech:
        return (
            f'{el_prefix} Σὲ ὑμνοῦμεν, σὲ εὐλογοῦμεν, σὲ προσκυνοῦμεν, σὲ δοξάζομεν, σοὶ εὐχαριστοῦμεν, διὰ τὸ μέγα σου ἔλεος.',
            f'{chu_prefix} Тебя поём, Тебя благословим, Тебя поклоняемся, Тебя славим, Тебе благодарим, яко велико Твое милосердие.',
        )
    if 'It is truly meet' in speech or 'It is truly meet to' in speech:
        return (
            f'{el_prefix} Ἄξιόν ἐστιν ὡς ἀληθῶς μακαρίζειν σε τὴν Θεοτόκον, τὴν ἀειμακάριστον καὶ παναγίαν καὶ μακαριωτέραν τῶν Χερουβίμ καὶ ἐνδοξοτέραν ἀσυγκρίτως τῶν Σεραφίμ.',
            f'{chu_prefix} Достойно есть яко воистину блажити Тя, Богородицу, присноблаженную и пренепорочную и Матерь Бога нашего.',
        )
    if 'It is meet and right' in speech:
        return (
            f'{el_prefix} Ἄξιον καὶ δίκαιόν ἐστι προσκυνεῖν Πατέρα, Υἱὸν καὶ ἅγιον Πνεῦμα, Τριάδα ὁμοούσιον καὶ ἀδιαίρετον.',
            f'{chu_prefix} Достойно и праведно есть поклонятися Отцу, Сыну и Святому Духу, Троице единосущной и нераздельной.',
        )
    if 'A mercy of peace' in speech:
        return (
            f'{el_prefix} Ἔλεον εἰρήνης, θυσίαν αἰνέσεως.',
            f'{chu_prefix} Милость мира, жертву хваления.',
        )
    if 'Father, Son, and Holy Spirit' in speech and 'Trinity' in speech:
        return (
            f'{el_prefix} Πατὴρ, Υἱὸς καὶ Ἅγιον Πνεῦμα· Τριὰς ὁμοούσιος καὶ ἀδιαίρετος!',
            f'{chu_prefix} Отец, Сын и Святой Дух! Троица единосущная и нераздельная!',
        )
    if 'Father, Son, and the Holy Spirit' in speech:
        return (
            f'{el_prefix} Πατὴρ, Υἱὸς καὶ Ἅγιον Πνεῦμα· Τριὰς ὁμοούσιος καὶ ἀδιαίρετος!',
            f'{chu_prefix} Отец, Сын и Святой Дух! Троица единосущная и нераздельная!',
        )
    if 'We have seen the true Light' in speech:
        return (
            f'{el_prefix} Εἴδομεν τὸ φῶς τὸ ἀληθινόν, ἐλάβομεν Πνεῦμα ἐπουράνιον· εὕρομεν πίστιν Ὀρθοδόξων.',
            f'{chu_prefix} Видехом свет истинный, прияхом Духа небеснаго; обретохом веру православную.',
        )
    if 'In the name of the Lord' in speech:
        return (f'{el_prefix} Во имя Господне.', f'{chu_prefix} Во имя Господне.')
    if 'Alleluia' in speech and len(speech) < 80:
        return (f'{el_prefix} Ἀλληλούϊα!', f'{chu_prefix} Аллилуия!')
    if 'And all mankind' in speech:
        return (f'{el_prefix} Καὶ παντὸς ἀνθρωπότητος.', f'{chu_prefix} И всего человечества.')
    if 'Let our mouths be filled' in speech:
        return (f'{el_prefix} Πληρωθήτω τὸ στόμα ἡμῶν αἰνέσεώς σου, Κύριε.', f'{chu_prefix} Да исполнится уста наша хвалением Твоим, Господи.')
    if 'Blessed be the name of the Lord' in speech:
        return (f'{el_prefix} Благословенно имя Господне.', f'{chu_prefix} Благословенно имя Господне.')
    if 'Glory to the Father' in speech and 'Amen' in speech:
        return (
            f'{el_prefix} Δόξα Πατρὶ καὶ Υἱῷ καὶ Ἁγίῳ Πνεύματι, καὶ νῦν καὶ ἀεὶ καὶ εἰς τοὺς αἰῶνας τῶν αἰώνων. Ἀμήν.',
            f'{chu_prefix} Слава Отцу, и Сыну, и Святому Духу, и ныне и присно и во веки веков. Аминь.',
        )
    return None


NICENE_CREED_EN = re.compile(r'^I believe in one God\b', re.I)
NICENE_CREED_LINE = re.compile(r'^(PEOPLE|CHOIR):\s*I believe in one God\b', re.I)


def translate_line(en: str) -> tuple[str, str]:
    role, speech = split_role(en)
    looked_up = lookup_by_prefix(speech)
    if looked_up:
        return looked_up[0], to_church_slavonic(looked_up[1])

    if role in ('choir', 'people'):
        cong = translate_congregational(
            speech,
            el_role='ΧΟΡΟΣ',
            chu_role='Хор',
        )
        if cong:
            return cong[0], to_church_slavonic(cong[1])

    if role == 'reader':
        if 'And to your spirit' in speech:
            return ('ΑΝΑΓΝΩΣΤΗΣ: Καὶ τῷ πνεύματί σου.', 'Чтец: И со духом Твоим.')
        if 'prokeimenon' in speech.lower():
            return ('ΑΝΑΓΝΩΣΤΗΣ: Τὸ προκείμενον τῷ ἤχῳ τῷ ____.', 'Чтец: Прокимен гласа ____.')
        if 'Epistle' in speech:
            return ('ΑΝΑΓΝΩΣΤΗΣ: Πρὸς ____ ὁ Ἀπόστολος ____.', 'Чтец: Послание святого Апостола ____ к ____.')
        if 'Gospel' in speech:
            return ('ΑΝΑΓΝΩΣΤΗΣ: Τὸ κατὰ ____ Εὐαγγέλιον.', 'Чтец: Евангелие от ____.')

    if role in ('people', 'choir'):
        if speech.startswith('I believe, O Lord'):
            return (
                'ΧΟΡΟΣ: Πιστεύω, Κύριε, καὶ ὁμολογῶ ὅτι σὺ εἶ ἀληθῶς ὁ Χριστός, ὁ Υἱὸς τοῦ Θεοῦ τοῦ ζῶντος.',
                'Хор: Верую, Господи, и исповедую, яко Ты еси воистину Христос, Сын Бога Живаго.',
            )
        if NICENE_CREED_EN.match(speech):
            return ('__CREED_TITLE__', '__CREED_TITLE__')
        if speech.startswith('Our Father'):
            return (LORDS_PRAYER_EL, LORDS_PRAYER_CHU)

    # Priest / default petitions
    return translate_priest(speech, role)


def lookup_by_prefix(speech: str) -> tuple[str, str] | None:
    for prefix, el, ru in PREFIX_TRANSLATIONS:
        if speech.startswith(prefix):
            return (el, ru)
    return None


PREFIX_TRANSLATIONS: list[tuple[str, str, str]] = [
    ('In peace let us pray to the Lord', 'ΙΕΡΕΥΣ: Ἐν εἰρήνῃ τοῦ Κυρίου δεηθῶμεν.', 'Священник: Миром Господу помолимся.'),
    ('O Lord our God, Thy power is beyond compare', 'ΙΕΡΕΥΣ: Κύριε ὁ Θεὸς ἡμῶν, ἡ δύναμίς σου ἀνεκδιήγητος καὶ ἡ δόξα σου ἀκατάληπτος.', 'Священник: Господи Боже наш, сила Твоя неизреченна и слава Твоя непостижима.'),
    ('O Master, Lord our God, who hast appointed in heaven', 'ΙΕΡΕΥΣ: Δέσποτα, Κύριε ὁ Θεὸς ἡμῶν, ὁ καταστήσας ἐν οὐρανῷ τάξεις καὶ στρατιὰς ἀγγέλων.', 'Священник: Владыко, Господи Боже наш, устроивый на небеси чины и воинства ангелов.'),
    ('O holy God: who dost rest in the Saints', 'ΙΕΡΕΥΣ: Ἅγιε ὁ Θεός, ὁ ἐν ἁγίοις ἀναπαυόμενος.', 'Священник: Святый Боже, во святых почивающий.'),
    ('Blessed is He that comes in the name of the Lord', 'ΙΕΡΕΥΣ: Εὐλογημένος ὁ ἐρχόμενος ἐν ὀνόματι Κυρίου.', 'Священник: Благословен Грядый во имя Господне.'),
    ('The reading is from:', 'ΑΝΑΓΝΩΣΤΗΣ: Τὸ ἀνάγνωσμα ἀπό:', 'Чтец: Чтение от:'),
    ('Have mercy on us, O God, according to Thy great mercy, we pray Thee', 'ΙΕΡΕΥΣ: Ἐλέησον ἡμᾶς, ὁ Θεός, κατὰ τὸ πολὺ ἔλεός σου, δεόμεθά σου, εἰσάκουσον καὶ ἐλέησον.', 'Священник: Помилуй нас, Боже, по велицей Твоей милости, молим Тя, услыши и помилуй.'),
    ('Again we pray for those who bear fruit and do good works', 'ΙΕΡΕΥΣ: Πάλιν δεηθῶμεν ὑπὲρ τῶν καρποφορούντων καὶ εὐποιούντων ἐν τῷ ἁγίῳ καὶ πανσεβασμίῳ οἴκῳ τούτῳ.', 'Священник: Паки помолимся о приносящих плоды и добро творящих в святом и всечестном храме сем.'),
    ('O Lord, our God, accept this fervent supplication', 'ΙΕΡΕΥΣ: Κύριε ὁ Θεὸς ἡμῶν, δέξαι τὴν ἐκτενῆ δέησιν τῶν δούλων σου.', 'Священник: Господи Боже наш, приими усердную молитву рабов Твоих.'),
    ('That he will reveal to them the Gospel of righteousness', 'ΙΕΡΕΥΣ: Ὅπως ἀποκαλύψῃ αὐτοῖς τὸ εὐαγγέλιον τῆς δικαιοσύνης.', 'Священник: Да откроет им Евангелие правды.'),
    ('All catechumens depart', 'ΙΕΡΕΥΣ: Πάντες οἱ κατηχούμενοι, ἐξέλθετε.', 'Священник: Вси оглашаемии, изыдите.'),
    ('Help us, save us, and have mercy on us', 'ΙΕΡΕΥΣ: Ἀντίλαβου, σῶσον, ἐλέησον καὶ διαφύλαξον ἡμᾶς, ὁ Θεός, τῇ σῇ χάριτι.', 'Священник: Заступи, спаси, помилуй и сохрани нас, Боже, Твоею благодатию.'),
    ('Wisdom! We thank Thee, O Lord God of hosts', 'ΙΕΡΕΥΣ: Σοφία! Εὐχαριστοῦμέν σοι, Κύριε ὁ Θεὸς τῶν δυνάμεων.', 'Священник: Премудрость! Благодарим Тя, Господи Боже сил.'),
    ('Again and again in peace, let us pray to the Lord', 'ΙΕΡΕΥΣ: Ἔτι καὶ ἔτι ἐν εἰρήνῃ τοῦ Κυρίου δεηθῶμεν.', 'Священник: Паки и паки миром Господу помолимся.'),
    ('Wisdom! Again and oftentimes we fall down before Thee', 'ΙΕΡΕΥΣ: Σοφία! Ἔτι καὶ πολλάκις προπίπτομέν σοι, ὁ φιλάνθρωπε Θεός.', 'Священник: Премудрость! Паки и ныне падше пред Тобою, Боже Человеколюбче.'),
    ('Let us who mystically represent the cherubim', 'ΧΟΡΟΣ: Οἱ τὰ Χερουβὶμ μυστικῶς εἰκονίζοντες καὶ τῇ ζωοποιῷ Τριάδι τὸν Τρισάγιον ὕμνον προσάδοντες.', 'Хор: Яже Херувимы тайно образующе и Животворящей Троице Трисвятую песнь припевающе.'),
    ('For the precious gifts now offered', 'ΙΕΡΕΥΣ: Ὑπὲρ τῶν τιμίων δώρων τῶν προσφερομένων, τοῦ Κυρίου δεηθῶμεν.', 'Священник: О драгоценных Дарах, ныне приносимых, Господу помолимся.'),
    ('That the whole day be perfect, holy, peaceful, and sinless', 'ΙΕΡΕΥΣ: Ἵνα τελειωθῇ ἡ ἡμέρα ἡμῶν ἁγία, εἰρηνικὴ καὶ ἀναμάρτητος, τοῦ Κυρίου αἰτησώμεθα.', 'Священник: Да совершится день наш свят, мирен и безгрешен, Господа просим.'),
    ('An angel of peace, a faithful guide', 'ΙΕΡΕΥΣ: Ἄγγελον εἰρήνης, πιστὸν ὁδηγόν, φύλακα τῶν ψυχῶν καὶ τῶν σωμάτων ἡμῶν, τοῦ Κυρίου αἰτησώμεθα.', 'Священник: Ангела мира, верного наставника, хранителя душ и тел наших, Господа просим.'),
    ('That we may complete the remaining time of our life in peace and repentance, let us pray to the Lord', 'ΙΕΡΕΥΣ: Ἵνα τὸν ὑπόλοιπον χρόνον τῆς ζωῆς ἡμῶν ἐν εἰρήνῃ καὶ μετανοίᾳ τελειώσωμεν, τοῦ Κυρίου δεηθῶμεν.', 'Священник: Да пребывающее время жизни нашей в мире и покаянии скончам, Господу помолимся.'),
    ('O Lord God almighty, who alone art holy', 'ΙΕΡΕΥΣ: Κύριε ὁ Θεὸς ὁ παντοκράτωρ, ὁ μόνος ἅγιος.', 'Священник: Господи Боже Вседержителю, Един Свят.'),
    ('Let us love one another, that with one mind we may confess', 'ΙΕΡΕΥΣ: Ἀγαπήσωμεν ἀλλήλους, ἵνα ὁμοθυμαδὸν ὁμολογήσωμεν.', 'Священник: Возлюбим друг друга, да единомысленно исповем.'),
    ('The doors! The doors! In wisdom, let us attend', 'ΙΕΡΕΥΣ: Αἱ θύραι, αἱ θύραι· ἐν σοφίᾳ προσέχωμεν.', 'Священник: Двери, двери! Мудростию вонмите.'),
    ('It is meet and right to sing of Thee', 'ΙΕΡΕΥΣ: Ἄξιόν ἐστι καὶ δίκαιον ὑμνεῖν σε.', 'Священник: Достойно и праведно есть пети Тя.'),
    ('And likewise, after supper, he took the cup', 'ΙΕΡΕΥΣ: Ὁμοίως μετὰ τὸ δειπνῆσαι, λαβὼν τὸ ποτήριον, λέγων· Πίετε ἐξ αὐτοῦ πάντες.', 'Священник: Подобно и по вечери, взяв чашу, глаголя: Пийте от нея вси.'),
    ('And that which is in this cup, the precious blood of Thy Christ', 'ΙΕΡΕΥΣ: Καὶ τὸ ἐν ταύτῃ, τίμιον Αἷμα τοῦ Χριστοῦ σου.', 'Священник: И яже в ней, драгоценная Кровь Христа Твоего.'),
    ('Making the change by Thy Holy Spirit', 'ΙΕΡΕΥΣ: Μεταβαλὼν τῷ Πνεύματί σου τῷ Ἁγίῳ.', 'Священник: Пременяя Духом Твоим Святым.'),
    ('That they may be to those who partake for the purification of soul', 'ΙΕΡΕΥΣ: Ἵνα εἰς καθαρισμὸν ψυχῆς καὶ ἄφεσιν ἁμαρτιῶν γένηται τοῖς μεταλαμβάνουσιν.', 'Священник: Да будут приемлющим во очищение души и во оставление грехов.'),
    ('For the holy, Prophet, Forerunner, and Baptist John', 'ΙΕΡΕΥΣ: Ὑπὲρ τοῦ ἁγίου Προφήτου, Προδρόμου καὶ Βαπτιστοῦ Ἰωάννου.', 'Священник: О святом Пророке, Предтече и Крестителе Иоанне.'),
    ('Remember, O Lord, the city in which we dwell', 'ΙΕΡΕΥΣ: Μνήσθητι, Κύριε, τῆς πόλεως ταύτης ἐν ᾗ κατοικοῦμεν.', 'Священник: Помяни, Господи, град сей, в котором живем.'),
    ('And with Thy spirit', 'ΧΟΡΟΣ: Καὶ μετὰ τοῦ πνεύματός σου.', 'Хор: И со духом Твоим.'),
    ('Asking that the whole day be perfect, holy, peaceful, and sinless, let us commend', 'ΙΕΡΕΥΣ: Αἰτούμενοι τελεσθῆναι τὴν ἡμέραν ἡμῶν ἁγίαν, εἰρηνικὴν καὶ ἀναμάρτητον, ἑαυτοὺς καὶ ἀλλήλους καὶ πάντα τὸν βίον ἡμῶν Χριστῷ τῷ Θεῷ παραθώμεθα.', 'Священник: Прося да совершится день наш свят, мирен и безгрешен, себе и друг друга и весь живот наш Христу Богу предадим.'),
    ('Peace be unto all!', 'ΙΕΡΕΥΣ: Εἰρήνη πᾶσι.', 'Священник: Мир всем.'),
    ('Bow your heads unto the Lord', 'ΙΕΡΕΥΣ: Κλίνατε τὸν κάραν τῷ Κυρίῳ.', 'Священник: Приклоните главы ваши Господу.'),
    ('We give thanks unto Thee, O King invisible', 'ΙΕΡΕΥΣ: Εὐχαριστοῦμέν σοι, Βασιλεῦ ἀόρατε.', 'Священник: Благодарим Тя, Царю невидимый.'),
    ('Attend, O Lord Jesus Christ our God', 'ΙΕΡΕΥΣ: Πρόσχωμεν, Κύριε Ἰησοῦ Χριστὲ ὁ Θεὸς ἡμῶν.', 'Священник: Вонмите, Господи Иисусе Христе, Боже наш.'),
    ('In the fear of God, and with faith draw near', 'ΙΕΡΕΥΣ: Μετὰ φόβου Θεοῦ καὶ πίστεως προσέλθετε.', 'Священник: Со страхом Божиим и верою приступите.'),
    ('Having beheld the Resurrection of Christ', 'ΙΕΡΕΥΣ: Θεωρήσαντες τὴν Ἀνάστασιν τοῦ Χριστοῦ.', 'Священник: Видевше Воскресение Христово.'),
    ('Be Thou exalted, O God, above the heavens', 'ΙΕΡΕΥΣ: Ὑψώθητι, ὁ Θεός, ὑπὲρ τοὺς οὐρανούς.', 'Священник: Вознесися, Боже, над небеса.'),
    ('O Lord, who blesses those who bless Thee', 'ΙΕΡΕΥΣ: Κύριε, ὁ εὐλογῶν τοὺς εὐλογοῦντάς σε.', 'Священник: Господи, благословляйи благословляющия Тя.'),
    ('The blessing of the Lord be upon you through', 'ΙΕΡΕΥΣ: Εὐλογία Κυρίου ἐφʼ ὑμᾶς, διὰ τῆς αὐτοῦ χάριτος καὶ φιλανθρωπίας.', 'Священник: Благословение Господне на вас, по благодати Его и человеколюбию.'),
    ('(sing the prokeimenon of the day)', 'ΧΟΡΟΣ: (ψάλλουσι τὸ προκείμενον τῆς ἡμέρας.)', 'Хор: (поют прокимен дня.)'),
    ('(sing the second part of the prokeimenon)', 'ΧΟΡΟΣ: (ψάλλουσι τὸ δεύτερον μέρος τοῦ προκειμένου.)', 'Хор: (поют вторую часть прокимена.)'),
    ('(chants the first Alleluia verse of the day.)', 'ΑΝΑΓΝΩΣΤΗΣ: (ψάλλει τὸ πρῶτον Ἀλληλούϊα τῆς ἡμέρας.)', 'Чтец: (поет первое Аллилуия дня.)'),
    ('(chants the second Alleluia verse of the day.)', 'ΑΝΑΓΝΩΣΤΗΣ: (ψάλλει τὸ δεύτερον Ἀλληλούϊα τῆς ἡμέρας.)', 'Чтец: (поет второе Аллилуия дня.)'),
    ('Again we pray for our Metropolitan', 'ΙΕΡΕΥΣ: Πάλιν δεηθῶμεν ὑπὲρ τοῦ Μητροπολίτου ἡμῶν καὶ τοῦ (Ἀρχ)ιεπισκόπου ἡμῶν, τῶν ἱερέων, διακόνων καὶ παντὸς τοῦ κλήρου.', 'Священник: Паки помолимся о Митрополите нашем и об (Арх)иепископе нашем, о священниках, диаконах и всем клире.'),
    ('(All catechumens depart. Depart all catechumens', 'ΙΕΡΕΥΣ: Πάντες οἱ κατηχούμενοι, ἐξέλθετε. Οἱ κατηχούμενοι, ἐξέλθετε. Ἔτι καὶ ἔτι ἐν εἰρήνῃ τοῦ Κυρίου δεηθῶμεν.', 'Священник: Вси оглашаемии, изыдите. Оглашаемии, изыдите. Паки и паки миром Господу помолимся.'),
    ('Unto Thee we commend our whole life and hope, O Master who lovest mankind', 'ΙΕΡΕΥΣ: Σοὶ παραθεμένους τὸν πάντα βίον ἡμῶν καὶ τὴν ἐλπίδα, Δέσποτα φιλάνθρωπε, ἀξίωσον ἡμᾶς μεταλαβεῖν τῶν ἐπουρανίων καὶ φρικτῶν σου Μυστηρίων.', 'Священник: Тебе предавше весь живот наш и упование, Владыко Человеколюбче, сподоби нас причаститися небесных и страшных Таин Твоих.'),
    ('For our Metropolitan', 'ΙΕΡΕΥΣ: Ὑπὲρ τοῦ Μητροπολίτου ἡμῶν, τοῦ (Ἀρχ)ιεπισκόπου ἡμῶν, τοῦ τιμίου πρεσβυτερίου, τῆς ἐν Χριστῷ διακονίας, παντὸς τοῦ κλήρου καὶ τοῦ λαοῦ, τοῦ Κυρίου δεηθῶμεν.', 'Священник: О Митрополите нашем, об (Арх)иепископе нашем, о честном пресвитерстве, о диаконстве во Христе, о всем клире и народе, Господу помолимся.'),
    ('Let us say with all our soul', 'ΙΕΡΕΥΣ: Εἴπωμεν ἐξ ὅλης τῆς ψυχῆς καὶ ἐξ ὅλης τῆς διανοίας ἡμῶν, εἴπωμεν·', 'Священник: Рекнем от всей души и от всего разума нашего, речем:'),
    ('Illumine our hearts', 'ΙΕΡΕΥΣ: Φώτισον, Δέσποτα, ὁ φιλάνθρωπος, τὰς καρδίας ἡμῶν τῷ καθαρῷ φωτὶ τῆς θείας σου γνώσεως.', 'Священник: Просвети, Владыко Человеколюбче, сердца наша чистым светом Божественного Твоего ведения.'),
    ('Wisdom! Let us attend! Let us listen to the holy Gospel', 'ΙΕΡΕΥΣ: Σοφία! Ἀνάσχωμεν! Ἀκροάσωμεν τοῦ ἁγίου Εὐαγγελίου! Εἰρήνη πᾶσι!', 'Священник: Премудрость! Простите! Будем внимать святому Евангелию! Мир всем!'),
    ('The reading from the holy Gospel according to', 'ΙΕΡΕΥΣ: Τὸ κατὰ ____ ἅγιον Εὐαγγέλιον.', 'Священник: Чтение святого Евангелия от святого ____.'),
    ('Let us, the faithful, pray for the catechumens', 'ΙΕΡΕΥΣ: Οἱ πιστοί, δεηθῶμεν ὑπὲρ τῶν κατηχουμένων, ἵνα ὁ Κύριος αὐτοὺς ἐλεήσῃ.', 'Священник: Вернии, помолимся об оглашаемых, да Господь помилует их.'),
    ('Pray to the Lord you catechumens', 'ΙΕΡΕΥΣ: Προσεύξασθε, οἱ κατηχούμενοι, τῷ Κυρίῳ.', 'Священник: Помолитеся Господу, оглашаемии.'),
    ('For Thou art a merciful God and lovest mankind', 'ΙΕΡΕΥΣ: Ὅτι ἐλεήμων εἶ, ὁ Θεός, καὶ φιλάνθρωπος, καὶ σοὶ τὴν δόξαν ἀναπέμπομεν, τῷ Πατρὶ καὶ τῷ Υἱῷ καὶ τῷ Ἁγίῳ Πνεύματι, νῦν καὶ ἀεὶ καὶ εἰς τοὺς αἰῶνας τῶν αἰώνων.', 'Священник: Яко милостив еси Бог и человеколюбец, и Тебе славу возсылаем, Отцу и Сыну и Святому Духу, ныне и присно и во веки веков.'),
    ('And the mercies of our great God and Savior', 'ΙΕΡΕΥΣ: Καὶ τὸ ἔλεος τοῦ μεγάλου καὶ σωτῆρος ἡμῶν Θεοῦ Ἰησοῦ Χριστοῦ μετὰ πάντων ὑμῶν.', 'Священник: И милость великаго Бога и Спасителя нашего Иисуса Христа со всеми вами.'),
    ('Let us go forth in peace', 'ΙΕΡΕΥΣ: Ἐν εἰρήνῃ προέλθωμεν.', 'Священник: С миром изыдите.'),
    ('Glory to Thee, O Christ our God and our Hope', 'ΙΕΡΕΥΣ: Δόξα Σοι, Χριστὲ ὁ Θεὸς ἡμῶν καὶ ἡ ἐλπὶς ἡμῶν, δόξα Σοι!', 'Священник: Слава Тебе, Христе Боже наш и упование наше, слава Тебе!'),
    ('For holy art thou, O our God', 'ΙΕΡΕΥΣ: Ὅτι ἅγιος εἶ, ὁ Θεὸς ἡμῶν, καὶ σοὶ τὴν δόξαν ἀναπέμπομεν, τῷ Πατρὶ καὶ τῷ Υἱῷ καὶ τῷ Ἁγίῳ Πνεύματι, νῦν καὶ ἀεὶ καὶ εἰς τοὺς αἰῶνας τῶν αἰώνων.', 'Священник: Яко свят еси, Боже наш, и Тебе славу возсылаем, Отцу и Сыну и Святому Духу, ныне и присно и во веки веков.'),
    ('Let us attend.', 'ΙΕΡΕΥΣ: Πρόσχωμεν.', 'Священник: Вонмите.'),
    ('Let us attend!', 'ΙΕΡΕΥΣ: Πρόσχωμεν!', 'Священник: Вонмите!'),
    ('Peace be unto you, reader.', 'ΙΕΡΕΥΣ: Εἰρήνη σοι, ἀναγνῶστα.', 'Священник: Мир тебе, чтец.'),
    ('Amen. Wisdom! Let us listen to the Holy Gospel', 'ΙΕΡΕΥΣ: Ἀμήν. Σοφία! Ἀκροάσωμεν τοῦ ἁγίου Εὐαγγελίου. Εἰρήνη πᾶσι.', 'Священник: Аминь. Премудрость! Будем внимать святому Евангелию. Мир всем.'),
    ('The reading from the Holy Gospel', 'ΙΕΡΕΥΣ: Τὸ κατὰ ____ ἅγιον Εὐαγγέλιον.', 'Священник: Чтение святого Евангелия от святого Апостола и Евангелиста ____.'),
    ('Let us all say, with all our soul', 'ΙΕΡΕΥΣ: Εἴπωμεν ἅπαντες ἐξ ὅλης τῆς ψυχῆς καὶ ἐξ ὅλης τῆς διανοίας ἡμῶν, εἴπωμεν·', 'Священник: Рекнем вси от всей души и от всего разума нашего, речем:'),
    ('Have mercy on us, O God, according to Thy great goodness', 'ΙΕΡΕΥΣ: Ἐλέησον ἡμᾶς, ὁ Θεός, κατὰ τὸ πολὺ ἔλεός σου, δεόμεθά σου, εἰσάκουσον καὶ ἐλέησον.', 'Священник: Помилуй нас, Боже, по велицей Твоей милости, молим Тя, услыши и помилуй.'),
    ('Again we pray for mercy, life, peace', 'ΙΕΡΕΥΣ: Πάλιν δεηθῶμεν ὑπὲρ ἐλέους, ζωῆς, εἰρήνης, ὑγείας, σωτηρίας καὶ ἐπισκέψεως τῶν δούλων τοῦ Θεοῦ ____.', 'Священник: Паки помолимся о милости, жизни, мире, здравии, спасении и посещении рабов Божиих ____.'),
    ('Again we pray for those who bring offerings', 'ΙΕΡΕΥΣ: Πάλιν δεηθῶμεν ὑπὲρ τῶν προσφερόντων καὶ εὐποιούντων ἐν τῷ ἁγίῳ καὶ πανσεβασμίῳ οἴκῳ τούτῳ.', 'Священник: Паки помолимся о приносящих и добро творящих в святом и всечестном храме сем.'),
    ('For Thou art a merciful God', 'ΙΕΡΕΥΣ: Ὅτι ἐλεήμων εἶ, ὁ Θεός, καὶ φιλάνθρωπος, καὶ σοὶ τὴν δόξαν ἀναπέμπομεν, τῷ Πατρὶ καὶ τῷ Υἱῷ καὶ τῷ Ἁγίῳ Πνεύματι, νῦν καὶ ἀεὶ καὶ εἰς τοὺς αἰῶνας τῶν αἰώνων.', 'Священник: Яко милостив еси Бог и человеколюбец, и Тебе славу возсылаем, Отцу и Сыну и Святому Духу, ныне и присно и во веки веков.'),
    ('Pray to the Lord, you catechumens.', 'ΙΕΡΕΥΣ: Προσεύξασθε, οἱ κατηχούμενοι, τῷ Κυρίῳ.', 'Священник: Помолитеся Господу, оглашаемии.'),
    ('Let us, the faithful, pray for the catechumens', 'ΙΕΡΕΥΣ: Οἱ πιστοί, δεηθῶμεν ὑπὲρ τῶν κατηχουμένων, ἵνα ὁ Κύριος αὐτοὺς ἐλεήσῃ.', 'Священник: Вернии, помолимся об оглашаемых, да Господь помилует их.'),
    ('That He will teach them the word of truth.', 'ΙΕΡΕΥΣ: Ὅπως διδάξῃ αὐτοὺς τὸν λόγον τῆς ἀληθείας.', 'Священник: Да научит их слову истины.'),
    ('That He will reveal to them the gospel of righteousness.', 'ΙΕΡΕΥΣ: Ὅπως ἀποκαλύψῃ αὐτοῖς τὸ εὐαγγέλιον τῆς δικαιοσύνης.', 'Священник: Да откроет им Евангелие правды.'),
    ('That He will unite them to His Holy, Catholic, and Apostolic Church.', 'ΙΕΡΕΥΣ: Ὅπως ἑνώσῃ αὐτοὺς τῇ ἁγίᾳ, καθολικῇ καὶ ἀποστολικῇ αὐτοῦ Ἐκκλησίᾳ.', 'Священник: Да соединит их со Святою, Кафолическую и Апостольскую Церковию Своею.'),
    ('Help them, save them, have mercy on them, and keep them', 'ΙΕΡΕΥΣ: Ἀντίλαβου αὐτῶν, σῶσον, ἐλέησον καὶ διαφύλαξον αὐτούς, ὁ Θεός, τῇ σῇ χάριτι.', 'Священник: Заступи их, спаси, помилуй и сохрани их, Боже, Твоею благодатию.'),
    ('Bow your heads unto the Lord, you catechumens.', 'ΙΕΡΕΥΣ: Κλίνατε τὰς κεφαλὰς ὑμῶν τῷ Κυρίῳ, οἱ κατηχούμενοι.', 'Священник: Приклоните главы ваши Господу, оглашаемии.'),
    ('That with us they may glorify Thine all-honorable', 'ΙΕΡΕΥΣ: Ὅπως σὺν ἡμῖν δοξάσωσι τὸ παντίμον καὶ μεγαλοπρεπὲς ὄνομά σου, τοῦ Πατρὸς καὶ τοῦ Υἱοῦ καὶ τοῦ Ἁγίου Πνεύματος, νῦν καὶ ἀεὶ καὶ εἰς τοὺς αἰῶνας τῶν αἰώνων.', 'Священник: Да с нами прославят всечестное и великолепное имя Твое, Отца и Сына и Святаго Духа, ныне и присно и во веки веков.'),
    ('All catechumens, depart.', 'ΙΕΡΕΥΣ: Πάντες οἱ κατηχούμενοι, ἐξέλθετε. Οἱ κατηχούμενοι, ἐξέλθετε.', 'Священник: Вси оглашаемии, изыдите. Оглашаемии, изыдите.'),
    ('Wisdom! That guarded always by Thy might', 'ΙΕΡΕΥΣ: Σοφία! Ὅπως ἀεὶ τῇ σῇ δυνάμει φρουρούμενοι, δοξολογῶμέν σοι, τῷ Πατρὶ καὶ τῷ Υἱῷ καὶ τῷ Ἁγίῳ Πνεύματι, νῦν καὶ ἀεὶ καὶ εἰς τοὺς αἰῶνας τῶν αἰώνων.', 'Священник: Премудрость! Да всегда Твоею силою охраняеми, славословим Тя, Отца и Сына и Святаго Духа, ныне и присно и во веки веков.'),
    ('May the Lord God remember all of you Orthodox Christians', 'ΙΕΡΕΥΣ: Μνησθείη ὁ Κύριος ὁ Θεὸς πάντων ὑμῶν τῶν ὀρθοδόξων χριστιανῶν ἐν τῇ αὐτοῦ βασιλείᾳ, πάντοτε, νῦν καὶ ἀεὶ καὶ εἰς τοὺς αἰῶνας τῶν αἰώνων.', 'Священник: Да помянет Господь Бог всех вас православных христиан в Царствии Своем всегда, ныне и присно и во веки веков.'),
    ('Let us complete our prayer unto the Lord.', 'ΙΕΡΕΥΣ: Τὴν προσευχὴν ἡμῶν τῷ Κυρίῳ πληρώσωμεν.', 'Священник: Молитву нашу Господу совершим.'),
    ('For the precious Gifts now offered', 'ΙΕΡΕΥΣ: Ὑπὲρ τῶν τιμίων δώρων τῶν προσφερομένων, τοῦ Κυρίου δεηθῶμεν.', 'Священник: О драгоценных Дарах, ныне приносимых, Господу помолимся.'),
    ('That the whole day may be perfect, holy, peaceful, and sinless, let us ask of the Lord.', 'ΙΕΡΕΥΣ: Ἵνα τελειωθῇ ἡ ἡμέρα ἡμῶν ἁγία, εἰρηνικὴ καὶ ἀναμάρτητος, τοῦ Κυρίου αἰτησώμεθα.', 'Священник: Да совершится день наш свят, мирен и безгрешен, Господа просим.'),
    ('An angel of peace, a faithful guide, a guardian of our souls and bodies, let us ask of the Lord.', 'ΙΕΡΕΥΣ: Ἄγγελον εἰρήνης, πιστὸν ὁδηγόν, φύλακα τῶν ψυχῶν καὶ τῶν σωμάτων ἡμῶν, τοῦ Κυρίου αἰτησώμεθα.', 'Священник: Ангела мира, верного наставника, хранителя душ и тел наших, Господа просим.'),
    ('Pardon and remission of our sins and transgressions, let us ask of the Lord.', 'ΙΕΡΕΥΣ: Ἄφεσιν καὶ ἄνεσιν τῶν ἁμαρτιῶν καὶ τῶν παραπτωμάτων ἡμῶν, τοῦ Κυρίου αἰτησώμεθα.', 'Священник: Оставление и прощение грехов и прегрешений наших, Господа просим.'),
    ('All things that are good and profitable for our souls, and peace for the world, let us ask of the Lord.', 'ΙΕΡΕΥΣ: Πάντα τὰ πρὸς σωτηρίαν ἡμῶν καὶ εἰρήνην τοῦ κόσμου, τοῦ Κυρίου αἰτησώμεθα.', 'Священник: О всяком ко спасению нашему и мире мира, Господа просим.'),
    ('That we may complete the remaining time of our life in peace and repentance, let us ask of the Lord.', 'ΙΕΡΕΥΣ: Ἵνα τὸν ὑπόλοιπον χρόνον τῆς ζωῆς ἡμῶν ἐν εἰρήνῃ καὶ μετανοίᾳ τελειώσωμεν, τοῦ Κυρίου αἰτησώμεθα.', 'Священник: Да пребывающее время жизни нашей в мире и покаянии скончам, Господа просим.'),
    ('A Christian ending to our life: painless, blameless, and peaceful', 'ΙΕΡΕΥΣ: Χριστιανὸν τὸ τέλος τῆς ζωῆς ἡμῶν, ἀνόδυνον, ἀνεπαίδεκτον καὶ εἰρηνικόν, καὶ ἀγαθὴν ἀπολογίαν τὴν ἐπὶ τοῦ φοβεροῦ βήματος τοῦ Χριστοῦ, τοῦ Κυρίου αἰτησώμεθα.', 'Священник: Христианский кончины жизни нашей, безболезненной, непостыдной и мирной, и доброго ответа на страшном суде Христовом, Господа просим.'),
    ('Through the compassions of Thine only-begotten Son with whom Thou art blessed', 'ΙΕΡΕΥΣ: Διὰ τὰ σπλάγχνα τοῦ μονογενοῦς σου Υἱοῦ, μεθʼ οὗ εὐλογητὸς εἶ, σὺν τῷ παναγίῳ καὶ ἀγαθῷ καὶ ζωοποιῷ σου Πνεύματι, νῦν καὶ ἀεὶ καὶ εἰς τοὺς αἰῶνας τῶν αἰώνων.', 'Священник: Щедротами Единороднаго Твоего Сына, с Нимже благословен еси, со всесвятым и благим и Животворящим Твоим Духом, ныне и присно и во веки веков.'),
    ('It is meet and right to worship the Father', 'ΧΟΡΟΣ: Ἄξιον καὶ δίκαιόν ἐστι προσκυνεῖν Πατέρα, Υἱὸν καὶ ἅγιον Πνεῦμα, Τριάδα ὁμοούσιον καὶ ἀδιαίρετον.', 'Хор: Достойно и праведно есть поклонятися Отцу, Сыну и Святому Духу, Троице единосущной и нераздельной.'),
    ('O Lord, who didst send down Thy Most Holy Spirit upon Thine apostles', 'ΙΕΡΕΥΣ: Κύριε, ὁ ἀποστείλας τὸ Πνεῦμά σου τὸ ἅγιον ἐπὶ τοὺς ἀποστόλους σου ἐν τῇ τρίτῃ ὥρᾳ, μὴ ἀποστήσῃς αὐτὸ ἀφʼ ἡμῶν τῶν δεομένων σου.', 'Священник: Господи, пославый Духа Твоего Святаго на апостолы Твоя в третий час, не отступи Его от нас, молящихся Тебе.'),
    ('Again we offer unto Thee this reasonable and bloodless worship', 'ΙΕΡΕΥΣ: Πάλιν προσφέρομέν σοι τὴν λογικὴν ταύτην καὶ ἀναίμακτον λατρείαν, καὶ δεόμεθα καὶ προσευχόμεθα καὶ ἱκετεύομεν· ἐξαπόστειλον τὸ Πνεῦμά σου τὸ ἅγιον ἐφʼ ἡμᾶς καὶ ἐπὶ τὰ προκείμενα Δῶρα ταῦτα.', 'Священник: Паки приносим Ти сию разумную и бескровную службу, и молимся и просим: ниспошли Духа Твоего Святаго на нас и на предлежащия Дары сия.'),
    ('Again we offer unto Thee this reasonable worship for those who have fallen asleep', 'ΙΕΡΕΥΣ: Πάλιν προσφέρομέν σοι τὴν λογικὴν ταύτην λατρείαν ὑπὲρ τῶν ἐν πίστει κεκοιμημένων.', 'Священник: Паки приносим Ти сию разумную службу об усопших в вере.'),
    ('For the holy Prophet, Forerunner, and Baptist John', 'ΙΕΡΕΥΣ: Ὑπὲρ τοῦ ἁγίου Προφήτου, Προδρόμου καὶ Βαπτιστοῦ Ἰωάννου, τῶν ἁγίων ἀποστόλων καὶ πάντων τῶν ἁγίων σου.', 'Священник: О святом Пророке, Предтече и Крестителе Иоанне, святых апостолах и всех святых Твоих.'),
    ('Remember, O Lord, this city in which we dwell', 'ΙΕΡΕΥΣ: Μνήσθητι, Κύριε, τῆς πόλεως ταύτης ἐν ᾗ κατοικοῦμεν καὶ πάσης πόλεως καὶ χώρας καὶ τῶν ἐν πίστει οἰκούντων ἐν αὐταῖς.', 'Священник: Помяни, Господи, град сей, в котором живем, и всякий град и страну и верою живущих в них.'),
    ('And grant that with one mouth and one heart we may glorify', 'ΙΕΡΕΥΣ: Καὶ δὸς ἡμῖν ἐν ἑνὶ στόματι καὶ μιᾷ καρδίᾳ δοξάζειν καὶ αἰνεῖν τὸ παντίμον καὶ μεγαλοπρεπὲς ὄνομά σου, τοῦ Πατρὸς καὶ τοῦ Υἱοῦ καὶ τοῦ Ἁγίου Πνεύματος, νῦν καὶ ἀεὶ καὶ εἰς τοὺς αἰῶνας τῶν αἰώνων.', 'Священник: И дай нам единеми усты и единым сердцем славити и воспевати всечестное имя Твое, Отца и Сына и Святаго Духа, ныне и присно и во веки веков.'),
    ('And the mercies of our Great God and Savior Jesus Christ be with all of you.', 'ΙΕΡΕΥΣ: Καὶ τὸ ἔλεος τοῦ μεγάλου καὶ σωτῆρος ἡμῶν Θεοῦ Ἰησοῦ Χριστοῦ μετὰ πάντων ὑμῶν.', 'Священник: И милость великаго Бога и Спасителя нашего Иисуса Христа со всеми вами.'),
    ('Having remembered all the saints, again and again in peace, let us pray to the Lord.', 'ΙΕΡΕΥΣ: Πάντων τῶν ἁγίων μνημονεύσαντες, ἔτι καὶ ἔτι ἐν εἰρήνῃ τοῦ Κυρίου δεηθῶμεν.', 'Священник: Всех святых помянувше, паки и паки миром Господу помолимся.'),
    ('For the precious Gifts offered and sanctified', 'ΙΕΡΕΥΣ: Ὑπὲρ τῶν τιμίων δώρων τῶν προσφερόντων καὶ ἁγιασθέντων, τοῦ Κυρίου δεηθῶμεν.', 'Священник: О драгоценных Дарах, приносимых и освященных, Господу помолимся.'),
    ('That our God, who loves mankind, receiving them upon His holy', 'ΙΕΡΕΥΣ: Ἵνα ὁ φιλάνθρωπος Θεὸς ἡμῶν, δεξάμενος αὐτὰ ἐπὶ τῷ ἁγίῳ αὐτοῦ θυσιαστηρίῳ, ἀντιπέμψῃ ἡμῖν τὴν θείαν αὐτοῦ χάριν καὶ τὴν δωρεὰν τοῦ ἁγίου Πνεύματος, τοῦ Κυρίου δεηθῶμεν.', 'Священник: Да Бог наш, человеколюбец, приим Дары на святом жертвеннике Своем, ниспошлет нам благодать Свою и дар Святаго Духа, Господу помолимся.'),
    ('Having asked for the unity of the Faith', 'ΙΕΡΕΥΣ: Τῆς ἑνότητος τῆς πίστεως καὶ τῆς κοινωνίας τοῦ ἁγίου Πνεύματος δεηθέντες, ἑαυτοὺς καὶ ἀλλήλους καὶ πάντα τὸν βίον ἡμῶν Χριστῷ τῷ Θεῷ παραθώμεθα.', 'Священник: Единства веры и общения Святаго Духа испросивше, себе и друг друга и весь живот наш Христу Богу предадим.'),
    ('Unto Thee we commend our whole life and our hope', 'ΙΕΡΕΥΣ: Σοὶ παραθεμένους τὸν πάντα βίον ἡμῶν καὶ τὴν ἐλπίδα, Δέσποτα φιλάνθρωπε, ἀξίωσον ἡμᾶς μεταλαβεῖν τῶν ἐπουρανίων καὶ φρικτῶν σου Μυστηρίων.', 'Священник: Тебе предавше весь живот наш и упование, Владыко Человеколюбче, сподоби нас причаститися небесных и страшных Таин Твоих.'),
    ('Through the grace and compassion and love toward mankind of Thine only- begotten Son', 'ΙΕΡΕΥΣ: Διὰ τῆς χάριτος καὶ συμπαθείας καὶ φιλανθρωπίας τοῦ μονογενοῦς σου Υἱοῦ, μεθʼ οὗ εὐλογητὸς εἶ, σὺν τῷ παναγίῳ καὶ ἀγαθῷ καὶ ζωοποιῷ σου Πνεύματι, νῦν καὶ ἀεὶ καὶ εἰς τοὺς αἰῶνας τῶν αἰώνων.', 'Священник: Милостию и состраданием и человеколюбием Единороднаго Твоего Сына, с Нимже благословен еси, со всесвятым и благим и Животворящим Твоим Духом, ныне и присно и во веки веков.'),
    ('Blessed is Our God always, now and ever, and unto ages of ages.', 'ΙΕΡΕΥΣ: Εὐλογητὸς ὁ Θεὸς ἡμῶν πάντοτε, νῦν καὶ ἀεὶ καὶ εἰς τοὺς αἰῶνας τῶν αἰώνων.', 'Священник: Благословен Бог наш всегда, ныне и присно и во веки веков.'),
    ('Asking that the whole day may be perfect, holy, peaceful, and sinless', 'ΙΕΡΕΥΣ: Αἰτούμενοι τελεσθῆναι τὴν ἡμέραν ἡμῶν ἁγίαν, εἰρηνικὴν καὶ ἀναμάρτητον, ἑαυτοὺς καὶ ἀλλήλους καὶ πάντα τὸν βίον ἡμῶν Χριστῷ τῷ Θεῷ παραθώμεθα.', 'Священник: Прося да совершится день наш свят, мирен и безгрешен, себе и друг друга и весь живот наш Христу Богу предадим.'),
    ('O Lord, who blessest those who bless Thee', 'ΙΕΡΕΥΣ: Κύριε, ὁ εὐλογῶν τοὺς εὐλογοῦντάς σε καὶ ἁγιάζων τοὺς ἐπὶ σοὶ πεποιθότας, σῶσον τὸν λαόν σου καὶ εὐλόγησον τὴν κληρονομίαν σου.', 'Священник: Господи, благословляйи благословляющия Тя и освящаий надеющияся на Тя: спаси люди Твоя и благослови достояние Твое.'),
    ('Let us attend! Having partaken of the divine', 'ΙΕΡΕΥΣ: Πρόσχωμεν! Μεταλαβόντες τῶν θείων, ἁγίων, ἀχράντων, ἀθανάτων, ἐπουρανίων καὶ ζωοποιῶν μυστηρίων τοῦ Χριστοῦ, ἀξίως εὐχαριστήσωμεν τῷ Κυρίῳ.', 'Священник: Вонмите! Приобщившись Божественных, святых, чистейших, бессмертных, небесных и животворящих Таин Христовых, достойно возблагодарим Господа.'),
    ('We thank Thee, O Master who lovest mankind', 'ΙΕΡΕΥΣ: Εὐχαριστοῦμέν σοι, Δέσποτα φιλάνθρωπε, εὐεργέτα τῶν ψυχῶν ἡμῶν, ὅτι καὶ ἐν τῇ ἡμέρᾳ ταύτῃ κατηξίωσας ἡμᾶς τῶν ἐπουρανίων καὶ ἀθανάτων σου μυστηρίων.', 'Священник: Благодарим Тя, Владыко Человеколюбче, Благодетелю душ наших, яко и в день сей сподобил еси нас небесных и бессмертных Таин Твоих.'),
    ('For Thou art our sanctification', 'ΙΕΡΕΥΣ: Ὅτι σὺ εἶ ὁ ἁγιασμὸς ἡμῶν, καὶ σοὶ τὴν δόξαν ἀναπέμπομεν, τῷ Πατρὶ καὶ τῷ Υἱῷ καὶ τῷ Ἁγίῳ Πνεύματι, νῦν καὶ ἀεὶ καὶ εἰς τοὺς αἰῶνας τῶν αἰώνων.', 'Священник: Яко Ты еси освящение наше, и Тебе славу возсылаем, Отцу и Сыну и Святому Духу, ныне и присно и во веки веков.'),
    ('The blessing of the Lord be upon you through His grace', 'ΙΕΡΕΥΣ: Εὐλογία Κυρίου ἐφʼ ὑμᾶς, διὰ τῆς αὐτοῦ χάριτος καὶ φιλανθρωπίας, πάντοτε, νῦν καὶ ἀεὶ καὶ εἰς τοὺς αἰῶνας τῶν αἰώνων.', 'Священник: Благословение Господне на вас, по благодати Его и человеколюбию, всегда, ныне и присно и во веки веков.'),
    ('In the fear of God, and with faith and love, draw near!', 'ΙΕΡΕΥΣ: Μετὰ φόβου Θεοῦ καὶ πίστεως καὶ ἀγάπης προσέλθετε!', 'Священник: Со страхом Божиим и верою и любовию приступите!'),
    ('O God, save Thy people, and bless Thine inheritance.', 'ΙΕΡΕΥΣ: Ὁ Θεός, σῶσον τὸν λαόν σου καὶ εὐλόγησον τὴν κληρονομίαν σου.', 'Священник: Боже, спаси люди Твоя и благослови достояние Твое.'),
]


def translate_priest(speech: str, role: str | None) -> tuple[str, str]:
    prefix_el = 'ΙΕΡΕΥΣ' if role == 'priest' else 'ΔΙΑΚΟΝΟΣ'
    prefix_ru = 'Священник' if role == 'priest' else 'Диакон'

    looked_up = lookup_by_prefix(speech)
    if looked_up:
        return looked_up[0], to_church_slavonic(looked_up[1])

    exact = {
        'In peace, let us pray to the Lord.': (
            f'{prefix_el}: Ἐν εἰρήνῃ τοῦ Κυρίου δεηθῶμεν.',
            f'{prefix_ru}: Миром Господу помолимся.',
        ),
        'In peace let us pray to the Lord.': (
            f'{prefix_el}: Ἐν εἰρήνῃ τοῦ Κυρίου δεηθῶμεν.',
            f'{prefix_ru}: Миром Господу помолимся.',
        ),
        'Again and again in peace let us pray to the Lord.': (
            f'{prefix_el}: Ἔτι καὶ ἔτι ἐν εἰρήνῃ τοῦ Κυρίου δεηθῶμεν.',
            f'{prefix_ru}: Паки и паки миром Господу помолимся.',
        ),
        'Again and again in peace, let us pray to the Lord.': (
            f'{prefix_el}: Ἔτι καὶ ἔτι ἐν εἰρήνῃ τοῦ Κυρίου δεηθῶμεν.',
            f'{prefix_ru}: Паки и паки миром Господу помолимся.',
        ),
        'Let us attend! Peace be unto all!': (
            'ΙΕΡΕΥΣ: Πρόσχωμεν! Εἰρήνη πᾶσι.',
            'Священник: Вонмите! Мир всем.',
        ),
        'Wisdom!': ('ΙΕΡΕΥΣ: Σοφία!', 'Священник: Премудрость!'),
        'Wisdom! Let us attend!': ('ΙΕΡΕΥΣ: Σοφία! Ἀνάσχωμεν!', 'Священник: Премудрость! Простите!'),
        'Peace be unto all.': ('ΙΕΡΕΥΣ: Εἰρήνη πᾶσι.', 'Священник: Мир всем.'),
        'Let us love one another, that with one mind we may confess:': (
            'ΙΕΡΕΥΣ: Ἀγαπήσωμεν ἀλλήλους, ἵνα ὁμοθυμαδὸν ὁμολογήσωμεν.',
            'Священник: Возлюбим друг друга, да единомысленно исповем.',
        ),
        'The doors! The doors! In wisdom, let us attend.': (
            'ΙΕΡΕΥΣ: Αἱ θύραι, αἱ θύραι· ἐν σοφίᾳ προσέχωμεν.',
            'Священник: Двери, двери! Мудростию вонмите.',
        ),
        'Let us stand aright! Let us stand with fear! Let us attend, that we may offer the Holy Oblation in peace.': (
            'ΙΕΡΕΥΣ: Στῶμεν καλῶς· στῶμεν μετὰ φόβου· προσέχωμεν τὴν ἁγίαν ἀναφορὰν ἐν εἰρήνῃ προσφέρειν.',
            'Священник: Станем добре, станем со страхом; вонмим, святое возношение в мире приносити.',
        ),
        'Let us lift up our hearts.': ('ΙΕΡΕΥΣ: Ἄνω σχῶμεν τὰς καρδίας.', 'Священник: Имамы сердца на небеса.'),
        'Let us give thanks unto the Lord.': ('ΙΕΡΕΥΣ: Εὐχαριστήσωμεν τῷ Κυρίῳ.', 'Священник: Благодарим Господа.'),
        'Let us depart in peace.': ('ΙΕΡΕΥΣ: Ἐν εἰρήνῃ προέλθωμεν.', 'Священник: С миром изыдите.'),
        'Let us pray to the Lord.': ('ΙΕΡΕΥΣ: Τοῦ Κυρίου δεηθῶμεν.', 'Священник: Господу помолимся.'),
        'Let us bow our heads unto the Lord.': ('ΙΕΡΕΥΣ: Κλίνατε τὸν κάραν τῷ Κυρίῳ.', 'Священник: Приклоните главы ваши Господу.'),
        'Let us attend. The Holy Things are for the holy.': (
            'ΙΕΡΕΥΣ: Πρόσχωμεν. Τὰ ἅγια τοῖς ἁγίοις.',
            'Священник: Вонмите. Святая святым.',
        ),
    }
    if speech in exact:
        el, chu = exact[speech]
        return el, to_church_slavonic(chu)

    # Pattern-based priest petitions
    patterns: list[tuple[re.Pattern[str], str, str]] = [
        (re.compile(r'Blessed is the Kingdom.*', re.I),
         'ΙΕΡΕΥΣ: Εὐλογημένη ἡ βασιλεία τοῦ Πατρὸς καὶ τοῦ Υἱοῦ καὶ τοῦ Ἁγίου Πνεύματος, νῦν καὶ ἀεὶ καὶ εἰς τοὺς αἰῶνας τῶν αἰώνων.',
         'Священник: Благословено Царство Отца и Сына и Святаго Духа, ныне и присно и во веки веков.'),
        (re.compile(r'For the peace from above.*', re.I),
         f'{prefix_el}: Ὑπὲρ τῆς ἄνωθεν εἰρήνης καὶ τῆς σωτηρίας τῶν ψυχῶν ἡμῶν, τοῦ Κυρίου δεηθῶμεν.',
         f'{prefix_ru}: О свышнем мире и спасении душ наших, Господу помолимся.'),
        (re.compile(r'For the peace of the whole world.*', re.I),
         f'{prefix_el}: Ὑπὲρ τῆς εἰρήνης τοῦ σύμπαντος κόσμου, εὐσταθείας τῶν ἁγίων τοῦ Θεοῦ Ἐκκλησιῶν καὶ τῆς τῶν πάντων ἑνώσεως, τοῦ Κυρίου δεηθῶμεν.',
         f'{prefix_ru}: О мире всего мира, благостоянии святых Божиих церквей и соединении всех, Господу помолимся.'),
        (re.compile(r'For this holy house.*', re.I),
         f'{prefix_el}: Ὑπὲρ τοῦ ἁγίου οἴκου τούτου καὶ τῶν μετὰ πίστεως, εὐλαβείας καὶ φόβου Θεοῦ εἰσιόντων ἐν αὐτῷ, τοῦ Κυρίου δεηθῶμεν.',
         f'{prefix_ru}: О святом храме сем и о входящих в онь с верою, благоговением и страхом Божиим, Господу помолимся.'),
        (re.compile(r'For His Beatitude.*Metropolitan.*', re.I),
         f'{prefix_el}: Ὑπὲρ τοῦ Μητροπολίτου ἡμῶν καὶ τοῦ τιμίου πρεσβυτερίου, τῆς ἐν Χριστῷ διακονίας, παντὸς τοῦ κλήρου καὶ τοῦ λαοῦ, τοῦ Κυρίου δεηθῶμεν.',
         f'{prefix_ru}: О блаженнейшем Митрополите нашем и о честном пресвитерстве, о диаконстве во Христе, о всем клире и народе, Господу помолимся.'),
        (re.compile(r'For the President.*', re.I),
         f'{prefix_el}: Ὑπὲρ τοῦ Προέδρου τῆς χώρας ἡμῶν, πάσης ἀρχῆς καὶ ἐξουσίας καὶ τοῦ στρατοῦ ἡμῶν, τοῦ Κυρίου δεηθῶμεν.',
         f'{prefix_ru}: О председателе страны нашей, о всей власти и воинстве, Господу помолимся.'),
        (re.compile(r'For this city.*', re.I),
         f'{prefix_el}: Ὑπὲρ τῆς πόλεως ταύτης, πάσης πόλεως καὶ χώρας καὶ τῶν πίστει οἰκούντων ἐν αὐταῖς, τοῦ Κυρίου δεηθῶμεν.',
         f'{prefix_ru}: О граде сем, о всяком граде и стране и о верою живущих в них, Господу помолимся.'),
        (re.compile(r'For seasonable weather.*', re.I),
         f'{prefix_el}: Ὑπὲρ εὐκρασίας ἀέρων, εὐφορίας τῶν καρπῶν τῆς γῆς καὶ καιρῶν εἰρηνικῶν, τοῦ Κυρίου δεηθῶμεν.',
         f'{prefix_ru}: О благорастворении воздухов, о плодоношении земных и о времени мирном, Господу помолимся.'),
        (re.compile(r'For travelers.*', re.I),
         f'{prefix_el}: Ὑπὲρ πλεόντων, ὁδοιπορούντων, νοσούντων, καμνόντων, αἰχμαλώτων καὶ τῆς σωτηρίας αὐτῶν, τοῦ Κυρίου δεηθῶμεν.',
         f'{prefix_ru}: О плавающих, путешествующих, недугующих, страждущих, плененных и о спасении их, Господу помолимся.'),
        (re.compile(r'For our deliverance from all affliction.*', re.I),
         f'{prefix_el}: Ὑπὲρ τοῦ ῥυσθῆναι ἡμᾶς ἀπὸ πάσης θλίψεως, ὀργῆς, κινδύνου καὶ ἀνάγκης, τοῦ Κυρίου δεηθῶμεν.',
         f'{prefix_ru}: О избавлении нас от всякой скорби, гнева и нужды, Господу помолимся.'),
        (re.compile(r'Help us, save us, have mercy on us.*', re.I),
         f'{prefix_el}: Ἀντίλαβου, σῶσον, ἐλέησον καὶ διαφύλαξον ἡμᾶς, ὁ Θεός, τῇ σῇ χάριτι.',
         f'{prefix_ru}: Заступи, спаси, помилуй и сохрани нас, Боже, Твоею благодатию.'),
        (re.compile(r'Commemorating our most holy.*Theotokos.*', re.I),
         f'{prefix_el}: Τῆς παναγίας, ἀχράντου, ὑπερευλογημένης καὶ ἐνδόξου Δεσποίνης ἡμῶν Θεοτόκου καὶ ἀειπαρθένου Μαρίας μετὰ πάντων τῶν ἁγίων μνημονεύσαντες, ἑαυτοὺς καὶ ἀλλήλους καὶ πάντα τὸν βίον ἡμῶν Χριστῷ τῷ Θεῷ παραθώμεθα.',
         f'{prefix_ru}: Пресвятую, пречистую, преблагословенную Владычицу нашу Богородицу и Приснодеву Марию со всеми святыми помянувше, сами себе и друг друга и весь живот наш Христу Богу предадим.'),
        (re.compile(r'For unto thee are due all glory.*', re.I),
         'ΙΕΡΕΥΣ: Ὅτι πρέπει σοι πᾶσα δόξα, τιμὴ καὶ προσκύνησις, τῷ Πατρὶ καὶ τῷ Υἱῷ καὶ τῷ Ἁγίῳ Πνεύματι, νῦν καὶ ἀεὶ καὶ εἰς τοὺς αἰῶνας τῶν αἰώνων.',
         'Священник: Яко подобает Тебе всякая слава, честь и поклонение, Отцу и Сыну и Святому Духу, ныне и присно и во веки веков.'),
        (re.compile(r'For Thine is the majesty.*', re.I),
         'ΙΕΡΕΥΣ: Ὅτι σὸν τὸ κράτος καὶ σὴ ἡ βασιλεία καὶ ἡ δύναμις καὶ ἡ δόξα, τοῦ Πατρὸς καὶ τοῦ Υἱοῦ καὶ τοῦ Ἁγίου Πνεύματος, νῦν καὶ ἀεὶ καὶ εἰς τοὺς αἰῶνας τῶν αἰώνων.',
         'Священник: Яко Твоя держава и Твое есть Царство и сила и слава, Отца и Сына и Святаго Духа, ныне и присно и во веки веков.'),
        (re.compile(r'For thou art a good God.*', re.I),
         'ΙΕΡΕΥΣ: Ὅτι ἀγαθὸς εἶ καὶ φιλάνθρωπος Θεὸς καὶ σοὶ τὴν δόξαν ἀναπέμπομεν, τῷ Πατρὶ καὶ τῷ Υἱῷ καὶ τῷ Ἁγίῳ Πνεύματι, νῦν καὶ ἀεὶ καὶ εἰς τοὺς αἰῶνας τῶν αἰώνων.',
         'Священник: Яко благ и человеколюбец Бог еси, и Тебе славу возсылаем, Отцу и Сыну и Святому Духу, ныне и присно и во веки веков.'),
        (re.compile(r'The grace of our Lord Jesus Christ.*', re.I),
         'ΙΕΡΕΥΣ: Ἡ χάρις τοῦ Κυρίου ἡμῶν Ἰησοῦ Χριστοῦ καὶ ἡ ἀγάπη τοῦ Θεοῦ καὶ Πατρὸς καὶ ἡ κοινωνία τοῦ Ἁγίου Πνεύματος εἴη μετὰ πάντων ὑμῶν.',
         'Священник: Благодать Господа нашего Иисуса Христа, и любовь Бога и Отца, и причастие Святаго Духа буди со всеми вами.'),
        (re.compile(r'Take! Eat! This is My Body.*', re.I),
         'ΙΕΡΕΥΣ: Λάβετε, φάγετε· τοῦτό μού ἐστι τὸ Σῶμα, τὸ ὑπὲρ ὑμῶν κλώμενον, εἰς ἄφεσιν ἁμαρτιῶν.',
         'Священник: Приимите, ядите, сие есть Тело Мое, за вас ломаемое во оставление грехов.'),
        (re.compile(r'And likewise after supper.*', re.I),
         'ΙΕΡΕΥΣ: Ὁμοίως μετὰ τὸ δειπνῆσαι, λαβὼν τὸ ποτήριον, λέγων· Πίετε ἐξ αὐτοῦ πάντες· τοῦτό μού ἐστι τὸ Αἷμα τῆς Καινῆς Διαθήκης, τὸ ὑπὲρ ὑμῶν καὶ πολλῶν ἐκχυνόμενον, εἰς ἄφεσιν ἁμαρτιῶν.',
         'Священник: Подобно и чашу по вечери, глаголя: Пийте от нея вси, сия есть Кровь Моя Новаго Завета, яже за вы и за многия изливаемая во оставление грехов.'),
        (re.compile(r'Remembering this saving commandment.*', re.I),
         'ΙΕΡΕΥΣ: Τῶν σωτηρίων ταύτην ὑπομνησθέντες ἐντολὴν καὶ πάντα τὰ ὑπὲρ ἡμῶν γεγονότα, σταυρόν, τάφον, τριήμερον ἀνάστασιν, ἀνάληψιν, ἐκ δεξιῶν καθέδραν, δευτέραν καὶ ἐνδόξον παρουσίαν, τὰ σὰ ἐκ τῶν σῶν σοὶ προσφέρομεν κατὰ πάντα καὶ διὰ πάντα.',
         'Священник: Поминающе убо спасительную сию заповедь и вся, яже о нас бывшая: крест, гроб, тридневное воскресение, на небеса восшествие, одесную седение, второе и славное пришествие, Твоя от Твоих Тебе приносяще, о всех и за вся.'),
        (re.compile(r'Our Father.*', re.I), LORDS_PRAYER_EL, LORDS_PRAYER_CHU),
        (re.compile(r'For Thine is the Kingdom.*', re.I),
         'ΙΕΡΕΥΣ: Ὅτι σὸν ἐστὶ τὸ κράτος καὶ ἡ βασιλεία καὶ ἡ δύναμις καὶ ἡ δόξα, τοῦ Πατρὸς καὶ τοῦ Υἱοῦ καὶ τοῦ Ἁγίου Πνεύματος, νῦν καὶ ἀεὶ καὶ εἰς τοὺς αἰῶνας τῶν αἰώνων.',
         'Священник: Яко Твоя есть держава и Царство и сила и слава, Отца и Сына и Святаго Духа, ныне и присно и во веки веков.'),
        (re.compile(r'Glory to Thee, O Christ our God.*', re.I),
         'ΙΕΡΕΥΣ: Δόξα Σοι, Χριστὲ ὁ Θεὸς ἡμῶν, ἡ ἐλπὶς ἡμῶν, δόξα Σοι.',
         'Священник: Слава Тебе, Христе Боже, упование наше, слава Тебе.'),
        (re.compile(r'May He who rose from the dead.*', re.I),
         'ΙΕΡΕΥΣ: Ἀναστὰς ἐκ νεκρῶν, Χριστὸς ὁ ἀληθινὸς Θεὸς ἡμῶν, ταῖς πρεσβείαις τῆς παναγίας, ἀχράντου καὶ ὑπερευλογημένης αὐτοῦ Μητρός, τῶν ἁγίων Ἰωάννου τοῦ Χρυσοστόμου καὶ πάντων τῶν ἁγίων, ἐλεήσαι καὶ σώσαι ἡμᾶς, ὡς ἀγαθὸς καὶ φιλάνθρωπος.',
         'Священник: Воскресый из мертвых, Христос Бог истинный наш, молитвами Пречистыя Своея Матере, святаго Иоанна Златоустаго и всех святых, помилует и спасет нас, яко благ и человеколюбец.'),
    ]
    for pat, el, chu in patterns:
        if pat.search(speech):
            return el, to_church_slavonic(chu)

    # Fallback: keep role prefix, mark untranslated speech minimally
    role_el = prefix_el if role == 'priest' else {'choir': 'ΧΟΡΟΣ', 'reader': 'ΑΝΑΓΝΩΣΤΗΣ', 'people': 'ΧΟΡΟΣ'}.get(role or '', prefix_el)
    role_ru = prefix_ru if role == 'priest' else {'choir': 'Хор', 'reader': 'Чтец', 'people': 'Хор'}.get(role or '', prefix_ru)
    return (f'{role_el}: {speech}', to_church_slavonic(f'{role_ru}: {speech}'))


def expand_creed(lines: list[dict]) -> list[dict]:
    out: list[dict] = []
    for row in lines:
        if NICENE_CREED_LINE.match(row['en']):
            out.append({'en': '__CREED_TITLE__', 'el': '__CREED_TITLE__', 'ru': '__CREED_TITLE__'})
            en_clauses = [
                'CHOIR: I believe in one God, the Father almighty, Maker of heaven and earth, and of all things visible and invisible.',
                'CHOIR: And in one Lord Jesus Christ, the only-begotten Son of God, begotten of the Father before all ages; Light of Light, true God of true God; begotten, not made; of one essence with the Father; by whom all things were made.',
                'CHOIR: Who for us men and for our salvation came down from heaven, and was incarnate of the Holy Spirit and the Virgin Mary, and became man; was crucified for us under Pontius Pilate, and suffered and was buried; rose on the third day according to the Scriptures; ascended into heaven and sits at the right hand of the Father; and shall come again with glory to judge the living and the dead; whose Kingdom shall have no end.',
                'CHOIR: And in the Holy Spirit, the Lord, the Giver of Life, who proceeds from the Father; who with the Father and the Son is worshipped and glorified; who spoke by the prophets. In one, Holy, Catholic, and Apostolic Church.',
                'CHOIR: I acknowledge one baptism for the remission of sins.',
                'CHOIR: I look for the resurrection of the dead, and the life of the world to come. Amen.',
            ]
            for i, en in enumerate(en_clauses):
                out.append({'en': en, 'el': CREED_EL[i], 'ru': CREED_CHU[i]})
            continue
        if re.match(r'^(PEOPLE|CHOIR):\s*Our Father', row['en'], re.I):
            el, ru = LORDS_PRAYER_EL, LORDS_PRAYER_CHU
            out.append({'en': '__LORDS_PRAYER_TITLE__', 'el': '__LORDS_PRAYER_TITLE__', 'ru': '__LORDS_PRAYER_TITLE__'})
            out.append({'en': row['en'], 'el': el, 'ru': ru})
            continue
        out.append(row)
    return out


def build_canonical() -> dict:
    en_sections = extract_en()
    canonical: dict[str, list[dict]] = {}
    for section_id, en_lines in en_sections.items():
        rows: list[dict] = []
        for en in en_lines:
            role, _ = split_role(en)
            if role:
                el, ru = translate_line(en)
                if el == '__CREED_TITLE__':
                    rows.append({'en': en, 'el': '', 'ru': ''})
                    continue
            else:
                el, ru = '', ''
            rows.append({'en': en, 'el': el, 'ru': ru})
        canonical[section_id] = expand_creed(rows)
    return canonical


def main():
    if not PDF.exists():
        import urllib.request
        print(f'Downloading {PDF_URL}')
        urllib.request.urlretrieve(PDF_URL, PDF)

    en_sections = extract_en()
    EN_OUT.write_text(json.dumps(en_sections, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    canonical = build_canonical()
    CANONICAL_OUT.write_text(json.dumps(canonical, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    for sid, rows in canonical.items():
        print(f'{sid}: {len(rows)} lines')
    print(f'Wrote {CANONICAL_OUT}')


if __name__ == '__main__':
    main()
