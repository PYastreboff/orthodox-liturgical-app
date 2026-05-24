/** English troparion/kontakion for principal feasts (OCA-style translations). */
export type MajorFeastHymnEn = {
  troparion?: { tone: number; text: string };
  kontakion?: { tone: number; text: string };
};

const BY_JULIAN: Record<string, MajorFeastHymnEn> = {
  '01-06': {
    troparion: {
      tone: 1,
      text:
        'When Thou, O Lord, wast baptized in the Jordan, the worship of the Trinity was made manifest; for the voice of the Father bare witness to Thee, calling Thee His beloved Son, and the Spirit in the form of a dove confirmed the certainty of the word. O Christ our God, Who hast appeared and enlightened the world, glory to Thee.',
    },
    kontakion: {
      tone: 4,
      text:
        'Thou hast appeared today to the world, and Thy light, O Lord, hath been signed upon us who with understanding chant unto Thee: Thou hast come and appeared, O Light unapproachable.',
    },
  },
  '03-25': {
    troparion: {
      tone: 4,
      text:
        'Today is the fountainhead of our salvation, and the revelation of the mystery from all ages. For the Son of God becometh the Son of the Virgin, and Gabriel announceth the glad tidings of grace. Wherefore, we also cry out with him to the Mother of God: Rejoice, thou who art full of grace, the Lord is with thee.',
    },
    kontakion: {
      tone: 8,
      text:
        'To thee, the Champion Leader, we thy servants dedicate a feast of victory and of thanksgiving, as ones rescued out of sufferings, O Theotokos; but as thou art one with might which is invincible, from all dangers that can be do thou deliver us, that we may cry to thee: Rejoice, thou Bride unwedded.',
    },
  },
  '08-06': {
    troparion: {
      tone: 7,
      text:
        'Thou wast transfigured on the mount, O Christ God, revealing Thy glory to Thy disciples as far as they could bear it. Let Thine everlasting light shine upon us sinners through the prayers of the Mother of God. O Giver of light, glory to Thee.',
    },
    kontakion: {
      tone: 7,
      text:
        'Thou wast transfigured on the mountain, O Christ our God, and Thy disciples beheld Thy glory as far as they could bear it, that when they should see Thee crucified they might know that Thy suffering was voluntary, and might proclaim unto the world that Thou art of a truth the Effulgence of the Father.',
    },
  },
  '08-15': {
    troparion: {
      tone: 1,
      text:
        'In giving birth thou didst preserve thy virginity, and in thy falling asleep thou didst not forsake the world, O Theotokos. Thou wast translated to life, O Mother of life, and by thy supplications dost thou deliver our souls from death.',
    },
    kontakion: {
      tone: 2,
      text:
        'The grave and death could not hold the Theotokos, who is ever watchful in her prayers and in whose intercessions lies unfailing hope. For as the Mother of Life she was translated to life by Him Who dwelt in her ever-virgin womb.',
    },
  },
  '09-08': {
    troparion: {
      tone: 4,
      text:
        'Thy nativity, O Theotokos, hath proclaimed joy to all the universe. For from thee did shine forth the Sun of righteousness, Christ our God, annulling the curse and bestowing the blessing, abolishing death and granting us life everlasting.',
    },
    kontakion: {
      tone: 4,
      text:
        'By thy nativity, O most pure Virgin, Joachim and Anna are freed from barrenness; Adam and Eve from the corruption of death. And we, thy people, freed from the guilt of sin, celebrate and sing to thee: The barren woman giveth birth to the Theotokos, the nourisher of our life.',
    },
  },
  '09-14': {
    troparion: {
      tone: 1,
      text:
        'O Lord, save Thy people and bless Thine inheritance; grant victory to Orthodox Christians over their adversaries, and by virtue of Thy Cross preserve Thy habitation.',
    },
    kontakion: {
      tone: 4,
      text:
        'As Thou wast voluntarily crucified in the flesh, grant mercy to those who cry to Thee: O Good One, Thy Cross is the boast of the faithful, the strength of kings, the support of the righteous, the glory of angels, and the scourge of demons.',
    },
  },
  '12-25': {
    troparion: {
      tone: 4,
      text:
        'Thy Nativity, O Christ our God, hath shone to the world the light of wisdom; for therein those who worshipped the stars were taught by a star to worship Thee, the Sun of righteousness, and to know Thee, the Dayspring from on high. O Lord, glory to Thee.',
    },
    kontakion: {
      tone: 3,
      text:
        'Today the Virgin giveth birth unto the Transcendent One, and the earth offereth a cave to the Unapproachable One. Angels with shepherds give glory, and magi journey with a star. For unto us is born a young Child, God before the ages.',
    },
  },
};

const BY_APPEARANCE: Record<string, MajorFeastHymnEn> = {
  pascha: {
    troparion: {
      tone: 5,
      text:
        'Christ is risen from the dead, trampling down death by death, and upon those in the tombs bestowing life.',
    },
    kontakion: {
      tone: 8,
      text:
        'Though Thou didst descend into the grave, O Immortal One, yet didst Thou destroy the power of hell, and didst rise again as Conqueror, O Christ God, saying to the myrrh-bearing women: Rejoice! and to Thy Apostles: Peace! and to us: Thy resurrection, O Lord, is the life of the world.',
    },
  },
};

export function majorFeastHymnsEn(
  julianMonthDay: string | undefined,
  appearanceKey: string | undefined,
): MajorFeastHymnEn | null {
  if (julianMonthDay && BY_JULIAN[julianMonthDay]) return BY_JULIAN[julianMonthDay];
  if (appearanceKey && BY_APPEARANCE[appearanceKey]) return BY_APPEARANCE[appearanceKey];
  return null;
}
