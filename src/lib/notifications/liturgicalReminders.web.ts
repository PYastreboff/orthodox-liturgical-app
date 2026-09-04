export type {
  NotificationReminderKind,
  ReminderPrefs,
  TestNotificationResult,
} from './liturgicalReminders';

export function supportsLocalNotifications(): boolean {
  return false;
}

export async function requestNotificationPermissions(): Promise<boolean> {
  return false;
}

export async function syncLiturgicalReminders(): Promise<void> {}

export async function sendTestNotification(): Promise<'unsupported'> {
  return 'unsupported';
}