import type { OrthocalDay } from '../api/orthocal';
import type { LiturgicalDayAppearance } from '../calendar/dayAppearance';
import type { PlainDate } from '../calendar/julianGregorian';
import { translate } from '../../i18n/translate';
import type { UiLanguage } from '../../i18n/types';

/**
 * Services on this calendar day only:
 * - Morning Liturgy on Sundays and feast days
 * - Vespers / Vigil in the afternoon when tomorrow is a Sunday or feast
 */

export type ServiceKind =
  | 'great_vespers'
  | 'vespers'
  | 'vigil'
  | 'bridegroom'
  | 'paschal_matins'
  | 'royal_hours'
  | 'liturgy_chrysostom'
  | 'liturgy_basil'
  | 'liturgy_presanctified';

export type ServiceCategory = 'vespers' | 'matins' | 'hours' | 'liturgy' | 'other';

export type ServiceSlot = 'morning' | 'afternoon' | 'evening';

export type DayServiceItem = {
  kind: ServiceKind;
  category: ServiceCategory;
  slot: ServiceSlot;
  titleKey: string;
  slotKey: string;
};

export type DayServicesData = {
  items: DayServiceItem[];
  footnoteKey: string;
};

export type DayServicesNeighbor = {
  appearance: LiturgicalDayAppearance;
  feastLevel?: number;
  weekday?: number;
};

const KIND_META: Record<ServiceKind, { category: ServiceCategory; titleKey: string }> = {
  great_vespers: { category: 'vespers', titleKey: 'services.kind.greatVespers' },
  vespers: { category: 'vespers', titleKey: 'services.kind.vespers' },
  vigil: { category: 'vespers', titleKey: 'services.kind.vigil' },
  bridegroom: { category: 'matins', titleKey: 'services.kind.bridegroom' },
  paschal_matins: { category: 'matins', titleKey: 'services.kind.paschalMatins' },
  royal_hours: { category: 'hours', titleKey: 'services.kind.royalHours' },
  liturgy_chrysostom: { category: 'liturgy', titleKey: 'services.kind.liturgyChrysostom' },
  liturgy_basil: { category: 'liturgy', titleKey: 'services.kind.liturgyBasil' },
  liturgy_presanctified: { category: 'liturgy', titleKey: 'services.kind.liturgyPresanctified' },
};

const SLOT_KEYS: Record<ServiceSlot, string> = {
  morning: 'services.slot.morning',
  afternoon: 'services.slot.afternoon',
  evening: 'services.slot.evening',
};

function item(kind: ServiceKind, slot: ServiceSlot): DayServiceItem {
  const meta = KIND_META[kind];
  return {
    kind,
    category: meta.category,
    slot,
    titleKey: meta.titleKey,
    slotKey: SLOT_KEYS[slot],
  };
}

function isBasilLiturgyDay(appearanceKey: string, liturgical: PlainDate): boolean {
  if (appearanceKey === 'lent_sunday') return true;
  if (appearanceKey === 'holy_saturday') return true;
  if (liturgical.month === 1 && liturgical.day === 1) return true;
  if (liturgical.month === 12 && liturgical.day === 24) return true;
  if (liturgical.month === 1 && liturgical.day === 5) return true;
  return false;
}

function isHolyThursday(appearanceKey: string, paschaDistance: number | undefined): boolean {
  if (paschaDistance === -3) return true;
  return appearanceKey === 'holy_week' && paschaDistance === -3;
}

function isPresanctifiedDay(
  appearanceKey: string,
  feastLevel: number | undefined,
  weekday: number | undefined,
): boolean {
  if (feastLevel === 1) return true;
  if (appearanceKey !== 'great_lent') return false;
  return weekday === 3 || weekday === 5;
}

function isVigilRank(feastLevel: number | undefined): boolean {
  return typeof feastLevel === 'number' && feastLevel >= 5;
}

function isSunday(appearanceKey: string, weekday: number | undefined): boolean {
  if (weekday === 0) return true;
  return (
    appearanceKey === 'sunday' ||
    appearanceKey === 'lent_sunday' ||
    appearanceKey === 'palm_sunday' ||
    appearanceKey === 'pascha' ||
    appearanceKey === 'pentecost' ||
    appearanceKey === 'all_saints' ||
    appearanceKey === 'all_saints_russia'
  );
}

function isNamedFeastDay(appearanceKey: string): boolean {
  return (
    appearanceKey === 'nativity' ||
    appearanceKey === 'theophany' ||
    appearanceKey === 'annunciation' ||
    appearanceKey === 'dormition' ||
    appearanceKey === 'palm_sunday' ||
    appearanceKey === 'lazarus_saturday' ||
    appearanceKey === 'circumcision' ||
    appearanceKey === 'nativity_theotokos' ||
    appearanceKey === 'nativity_john_baptist'
  );
}

/** Days that normally have a morning Divine Liturgy. */
export function hasMorningLiturgy(
  appearanceKey: string,
  weekday: number | undefined,
  feastLevel: number | undefined,
): boolean {
  if (appearanceKey === 'great_friday') return false;
  if (feastLevel === -1) return false;
  if (isSunday(appearanceKey, weekday)) return true;
  if (isVigilRank(feastLevel)) return true;
  if (isNamedFeastDay(appearanceKey)) return true;
  if (appearanceKey === 'holy_saturday') return true;
  if (appearanceKey === 'bright_week') return true;
  return false;
}

function morningLiturgyKind(args: {
  appearanceKey: string;
  liturgical: PlainDate;
  paschaDistance: number | undefined;
}): ServiceKind {
  const { appearanceKey, liturgical, paschaDistance } = args;
  if (isHolyThursday(appearanceKey, paschaDistance) || isBasilLiturgyDay(appearanceKey, liturgical)) {
    return 'liturgy_basil';
  }
  return 'liturgy_chrysostom';
}

function tomorrowHasMorningLiturgy(tomorrow: DayServicesNeighbor | null | undefined): boolean {
  if (!tomorrow) return false;
  return hasMorningLiturgy(tomorrow.appearance.key, tomorrow.weekday, tomorrow.feastLevel);
}

function eveServiceForTomorrow(tomorrow: DayServicesNeighbor): ServiceKind {
  if (isVigilRank(tomorrow.feastLevel) || isNamedFeastDay(tomorrow.appearance.key)) {
    return 'vigil';
  }
  if (isSunday(tomorrow.appearance.key, tomorrow.weekday)) {
    return 'great_vespers';
  }
  return 'vespers';
}

/** Bridegroom Matins is served the evenings of Palm Sunday through Holy Tuesday. */
function hasBridegroomEvening(
  appearanceKey: string,
  paschaDistance: number | undefined,
): boolean {
  if (appearanceKey === 'palm_sunday') return true;
  if (appearanceKey !== 'holy_week' || paschaDistance == null) return false;
  // Holy Monday (−6), Tuesday (−5); Wednesday (−4) often still Bridegroom in some places.
  return paschaDistance >= -6 && paschaDistance <= -4;
}

/**
 * Build services that take place on this calendar day.
 */
export function buildDayServices(
  appearance: LiturgicalDayAppearance,
  liturgical: PlainDate,
  day: OrthocalDay | null,
  tomorrow?: DayServicesNeighbor | null,
): DayServicesData {
  const appearanceKey = appearance.key;
  const feastLevel = day?.feast_level;
  const weekday = day?.weekday;
  const paschaDistance = day?.pascha_distance;
  const items: DayServiceItem[] = [];

  // --- Great Friday ---
  if (appearanceKey === 'great_friday') {
    items.push(item('royal_hours', 'morning'), item('vespers', 'afternoon'));
    return { items, footnoteKey: 'services.footnote' };
  }

  // --- Holy Saturday: daytime Vespers + Liturgy of St Basil; Paschal Matins late ---
  if (appearanceKey === 'holy_saturday') {
    items.push(item('vespers', 'morning'), item('liturgy_basil', 'morning'));
    items.push(item('paschal_matins', 'evening'));
    return { items, footnoteKey: 'services.footnote' };
  }

  // --- Holy Thursday ---
  if (isHolyThursday(appearanceKey, paschaDistance)) {
    items.push(item('vespers', 'morning'), item('liturgy_basil', 'morning'));
    return { items, footnoteKey: 'services.footnote' };
  }

  // --- Morning Liturgy (Sundays, feasts, Bright Week, …) ---
  if (hasMorningLiturgy(appearanceKey, weekday, feastLevel)) {
    items.push(
      item(morningLiturgyKind({ appearanceKey, liturgical, paschaDistance }), 'morning'),
    );
  }

  // --- Presanctified this evening ---
  if (isPresanctifiedDay(appearanceKey, feastLevel, weekday)) {
    items.push(item('vespers', 'evening'), item('liturgy_presanctified', 'evening'));
    return { items, footnoteKey: 'services.footnote' };
  }

  // --- Bridegroom Matins this evening (Holy Week) ---
  if (hasBridegroomEvening(appearanceKey, paschaDistance)) {
    items.push(item('bridegroom', 'evening'));
    return { items, footnoteKey: 'services.footnote' };
  }

  // --- Afternoon Vespers / Vigil when tomorrow has morning Liturgy ---
  if (tomorrow && tomorrowHasMorningLiturgy(tomorrow)) {
    items.push(item(eveServiceForTomorrow(tomorrow), 'afternoon'));
  }

  return { items, footnoteKey: 'services.footnote' };
}

export function categoryLabelKey(category: ServiceCategory): string {
  return `services.category.${category}`;
}

export function localizeDayServices(data: DayServicesData, lang: UiLanguage) {
  return {
    items: data.items.map((entry) => ({
      ...entry,
      title: translate(lang, entry.titleKey),
      slotLabel: translate(lang, entry.slotKey),
      categoryLabel: translate(lang, categoryLabelKey(entry.category)),
    })),
    footnote: translate(lang, data.footnoteKey),
  };
}
