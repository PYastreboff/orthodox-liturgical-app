import type { LiturgicalDayAppearance } from '../calendar/dayAppearance';

export type LiturgicalSwatchKey =
  | 'gold'
  | 'white'
  | 'blue'
  | 'red'
  | 'green'
  | 'black'
  | 'purple';

/** Vestment colours per the ROCOR Europe Liturgical Handbook. */
export function liturgicalSwatchKey(appearance: LiturgicalDayAppearance): LiturgicalSwatchKey {
  const key = appearance.key;
  const label = appearance.label.toLowerCase();

  if (key === 'pascha' || label.includes('pascha')) return 'white';
  if (key === 'bright_week' || key === 'holy_saturday') return 'white';
  if (key === 'ascension' || key === 'ascension_leavetaking' || label.includes('ascension')) {
    return 'white';
  }
  if (key === 'circumcision' || label.includes('circumcision')) return 'white';
  if (key === 'theophany' || label.includes('theophany')) return 'white';
  if (key === 'transfiguration' || label.includes('transfiguration')) return 'white';
  if (
    key === 'nativity_john_baptist' ||
    key === 'beheading_john_baptist' ||
    label.includes('john the baptist') ||
    label.includes('beheading of st john') ||
    label.includes('beheading of the forerunner')
  ) {
    return 'red';
  }

  if (
    key === 'nativity' ||
    (label.includes('nativity') &&
      !label.includes('theotokos') &&
      !label.includes('fast') &&
      !label.includes('john'))
  ) {
    return 'white';
  }

  if (key === 'great_friday' || label.includes('holy friday')) return 'black';
  if (key === 'holy_week') return 'black';
  if (key === 'great_lent') return 'black';
  if (key === 'lent_sunday' || key === 'lent_saturday') return 'purple';
  if (key === 'apostles_fast' || key === 'nativity_fast' || key === 'dormition_fast') {
    return 'purple';
  }
  if (
    key === 'apostles_fast_sunday' ||
    key === 'nativity_fast_sunday' ||
    key === 'dormition_fast_sunday'
  ) {
    return 'red';
  }

  if (key === 'annunciation' || label.includes('annunciation')) return 'blue';
  if (
    key === 'dormition' ||
    key === 'nativity_theotokos' ||
    key === 'presentation' ||
    key === 'entry_theotokos' ||
    key === 'pokrov' ||
    label.includes('theotokos') ||
    label.includes('pokrov') ||
    label.includes('entry of the') ||
    label.includes('presentation of the lord') ||
    label.includes('meeting of the lord')
  ) {
    return 'blue';
  }

  if (key === 'palm_sunday' || label.includes('palm')) return 'green';
  if (key === 'pentecost' || label.includes('pentecost')) return 'green';
  if (key === 'holy_spirit' || key === 'pentecost_season' || key === 'trinity_day') return 'green';
  if (label.includes('holy spirit') || label.includes('trinity day')) return 'green';

  if (key === 'all_saints' || key === 'all_saints_russia') return 'gold';
  if (key === 'peter_and_paul' || label.includes('peter and paul')) return 'gold';

  if (key === 'elevation_cross' || (label.includes('cross') && !label.includes('sunday'))) {
    return 'red';
  }

  if (key === 'wednesday_fast' || key === 'friday_fast') return 'purple';

  if (key === 'sunday' || key === 'saturday' || key === 'weekday') return 'gold';

  return 'gold';
}
