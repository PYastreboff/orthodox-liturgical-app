import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import type { PrimaryCalendar } from '../calendar/dateDisplay';
import { getLiturgicalAppearanceForLocalDate } from '../calendar/dayAppearance';
import { civilPlainDateFromLocal } from '../calendar/liturgicalCalendar';
import { startOfLocalDay, toDayIso } from '../calendar/localDate';
import { isWeeklyFastForCivilDate } from '../calendar/weeklyFast';
import {
  fetchOrthocalDay,
  loadOrthocalDayFromPersistentCache,
  type OrthocalDay,
} from '../api/orthocal';
import { isOrthocalFastDay } from '../../i18n/fastingLabels';
import { translate } from '../../i18n/translate';
import type { UiLanguage } from '../../i18n/types';
import { hasMorningLiturgy, isPresanctifiedDay } from '../liturgical/dayServices';
import { personalDaysOnCivilDate, type PersonalDay } from '../personalDays';

const ID_PREFIX = 'orthodaily:';
const SCHEDULE_DAYS = 14;

/** Discrete reminder kinds the user can toggle in Settings. */
export type NotificationReminderKind =
  | 'fasting'
  | 'liturgy'
  | 'vespers'
  | 'presanctified'
  | 'personal_day_eve';

type ChannelDef = {
  id: string;
  nameKey: string;
};

const CHANNELS: Record<NotificationReminderKind, ChannelDef> = {
  fasting: { id: 'orthodaily-fasting', nameKey: 'notifications.channelFasting' },
  liturgy: { id: 'orthodaily-liturgy', nameKey: 'notifications.channelLiturgy' },
  vespers: { id: 'orthodaily-vespers', nameKey: 'notifications.channelVespers' },
  presanctified: {
    id: 'orthodaily-presanctified',
    nameKey: 'notifications.channelPresanctified',
  },
  personal_day_eve: {
    id: 'orthodaily-personal-day-eve',
    nameKey: 'notifications.channelPersonalDayEve',
  },
};

const TIMES: Record<NotificationReminderKind, { hour: number; minute: number }> = {
  fasting: { hour: 6, minute: 30 },
  liturgy: { hour: 7, minute: 0 },
  vespers: { hour: 16, minute: 0 },
  presanctified: { hour: 16, minute: 30 },
  personal_day_eve: { hour: 18, minute: 0 },
};

export type ReminderPrefs = {
  notifyFastingReminder: boolean;
  notifyLiturgyMorning: boolean;
  notifyVespersEve: boolean;
  notifyPresanctified: boolean;
  personalDays: PersonalDay[];
  primaryCalendar: PrimaryCalendar;
  uiLanguage: UiLanguage;
};

export function supportsLocalNotifications(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

function addLocalDays(date: Date, days: number): Date {
  const next = startOfLocalDay(date);
  next.setDate(next.getDate() + days);
  return next;
}

function atLocalTime(day: Date, hour: number, minute: number): Date {
  const d = startOfLocalDay(day);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function anyReminderEnabled(prefs: ReminderPrefs): boolean {
  return (
    prefs.notifyFastingReminder ||
    prefs.notifyLiturgyMorning ||
    prefs.notifyVespersEve ||
    prefs.notifyPresanctified ||
    prefs.personalDays.some((day) => day.remindEve)
  );
}

async function ensureAndroidChannels(lang: UiLanguage): Promise<void> {
  if (Platform.OS !== 'android') return;
  for (const kind of Object.keys(CHANNELS) as NotificationReminderKind[]) {
    const channel = CHANNELS[kind];
    await Notifications.setNotificationChannelAsync(channel.id, {
      name: translate(lang, channel.nameKey),
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250],
      lightColor: '#6b2d3c',
    });
  }
}

/** Ask for permission when the user turns a reminder on. */
export async function requestNotificationPermissions(
  lang: UiLanguage = 'en',
): Promise<boolean> {
  if (!supportsLocalNotifications()) return false;
  await ensureAndroidChannels(lang);
  const current = await Notifications.getPermissionsAsync();
  if (current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }
  const asked = await Notifications.requestPermissionsAsync();
  return Boolean(
    asked.granted || asked.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL,
  );
}

async function cancelOurScheduled(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((item) => item.identifier.startsWith(ID_PREFIX))
      .map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)),
  );
}

async function resolveOrthocalDay(
  calendar: PrimaryCalendar,
  civil: ReturnType<typeof civilPlainDateFromLocal>,
): Promise<OrthocalDay | null> {
  const cached = await loadOrthocalDayFromPersistentCache(calendar, civil);
  if (cached) return cached;
  try {
    return await fetchOrthocalDay(calendar, civil);
  } catch {
    return null;
  }
}

function fastingBody(day: OrthocalDay | null, appearanceKey: string, lang: UiLanguage): string {
  if (appearanceKey === 'great_friday') {
    return translate(lang, 'notifications.fastingBodyGreatFriday');
  }
  if (day?.fast_level_desc?.trim()) {
    return translate(lang, 'notifications.fastingBodyRule', {
      rule: day.fast_level_desc.trim(),
    });
  }
  return translate(lang, 'notifications.fastingBodyGeneric');
}

async function scheduleOne(
  kind: NotificationReminderKind,
  day: Date,
  now: Date,
  title: string,
  body: string,
): Promise<void> {
  const { hour, minute } = TIMES[kind];
  const when = atLocalTime(day, hour, minute);
  if (when.getTime() <= now.getTime()) return;

  const iso = toDayIso(day);
  await Notifications.scheduleNotificationAsync({
    identifier: `${ID_PREFIX}${kind}:${iso}`,
    content: {
      title,
      body,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: when,
      ...(Platform.OS === 'android' ? { channelId: CHANNELS[kind].id } : null),
    },
  });
}

/**
 * Cancel and re-schedule local reminders for the next two weeks.
 * Safe no-op on web and when all toggles are off.
 */
export async function syncLiturgicalReminders(prefs: ReminderPrefs): Promise<void> {
  if (!supportsLocalNotifications()) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  await cancelOurScheduled();

  if (!anyReminderEnabled(prefs)) {
    return;
  }

  const permitted = await requestNotificationPermissions(prefs.uiLanguage);
  if (!permitted) return;

  await ensureAndroidChannels(prefs.uiLanguage);
  const now = new Date();
  const today = startOfLocalDay(now);
  const lang = prefs.uiLanguage;

  for (let offset = 0; offset < SCHEDULE_DAYS; offset += 1) {
    const day = addLocalDays(today, offset);
    const tomorrow = addLocalDays(day, 1);
    const civil = civilPlainDateFromLocal(day);
    const appearance = getLiturgicalAppearanceForLocalDate(day, prefs.primaryCalendar);
    const orthocal = await resolveOrthocalDay(prefs.primaryCalendar, civil);
    const weekday = orthocal?.weekday ?? day.getDay();
    const feastLevel = orthocal?.feast_level;
    const weeklyFast = isWeeklyFastForCivilDate(civil);
    const isFast = isOrthocalFastDay(orthocal, appearance.key, weeklyFast);
    const liturgyMorning = hasMorningLiturgy(appearance.key, weekday, feastLevel);
    const presanctified = isPresanctifiedDay(appearance.key, feastLevel, weekday);

    const tomorrowAppearance = getLiturgicalAppearanceForLocalDate(
      tomorrow,
      prefs.primaryCalendar,
    );
    const tomorrowOrthocal = await resolveOrthocalDay(
      prefs.primaryCalendar,
      civilPlainDateFromLocal(tomorrow),
    );
    const eveVespers = hasMorningLiturgy(
      tomorrowAppearance.key,
      tomorrowOrthocal?.weekday ?? tomorrow.getDay(),
      tomorrowOrthocal?.feast_level,
    );

    if (prefs.notifyFastingReminder && isFast) {
      await scheduleOne(
        'fasting',
        day,
        now,
        translate(lang, 'notifications.fastingTitle'),
        fastingBody(orthocal, appearance.key, lang),
      );
    }

    if (prefs.notifyLiturgyMorning && liturgyMorning) {
      await scheduleOne(
        'liturgy',
        day,
        now,
        translate(lang, 'notifications.liturgyTitle'),
        translate(lang, 'notifications.liturgyBody'),
      );
    }

    if (prefs.notifyVespersEve && eveVespers && !presanctified) {
      await scheduleOne(
        'vespers',
        day,
        now,
        translate(lang, 'notifications.vespersTitle'),
        translate(lang, 'notifications.vespersBody'),
      );
    }

    if (prefs.notifyPresanctified && presanctified) {
      await scheduleOne(
        'presanctified',
        day,
        now,
        translate(lang, 'notifications.presanctifiedTitle'),
        translate(lang, 'notifications.presanctifiedBody'),
      );
    }

    const tomorrowPersonalDays = personalDaysOnCivilDate(
      prefs.personalDays,
      tomorrow,
    ).filter((day) => day.remindEve);
    for (const personalDay of tomorrowPersonalDays) {
      await scheduleOne(
        'personal_day_eve',
        day,
        now,
        translate(lang, 'notifications.personalDayEveTitle'),
        translate(lang, 'notifications.personalDayEveBody', {
          title: personalDay.title,
        }),
      );
    }
  }
}
