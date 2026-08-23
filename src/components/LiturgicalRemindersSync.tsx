import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import {
  supportsLocalNotifications,
  syncLiturgicalReminders,
} from '../lib/notifications/liturgicalReminders';
import { usePreferences } from '../state/PreferencesContext';

/** Keeps local fasting / liturgy reminders in sync with Settings (native only). */
export function LiturgicalRemindersSync() {
  const {
    preferencesReady,
    notifyFastingReminder,
    notifyLiturgyMorning,
    notifyVespersEve,
    notifyPresanctified,
    primaryCalendar,
    uiLanguage,
  } = usePreferences();

  useEffect(() => {
    if (!preferencesReady || !supportsLocalNotifications()) return;

    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      void syncLiturgicalReminders({
        notifyFastingReminder,
        notifyLiturgyMorning,
        notifyVespersEve,
        notifyPresanctified,
        primaryCalendar,
        uiLanguage,
      });
    };

    run();

    const onAppState = (state: AppStateStatus) => {
      if (state === 'active') run();
    };
    const sub = AppState.addEventListener('change', onAppState);
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, [
    preferencesReady,
    notifyFastingReminder,
    notifyLiturgyMorning,
    notifyVespersEve,
    notifyPresanctified,
    primaryCalendar,
    uiLanguage,
  ]);

  return null;
}
