# Notifications

## Scope

**Local notifications only** — `expo-notifications` on **iOS and Android**.

Web: preferences save; **no scheduling**. UI must say phone app only.

## Files

| File | Role |
|------|------|
| `src/lib/notifications/liturgicalReminders.ts` | Core scheduler |
| `src/components/LiturgicalRemindersSync.tsx` | Re-sync when prefs/app foreground |
| `app/_layout.tsx` | Mounts sync component |
| `app.json` | Plugin + Android POST_NOTIFICATIONS |

## Reminder kinds

```typescript
type NotificationReminderKind = 'fasting' | 'liturgy' | 'vespers' | 'presanctified';
```

| Kind | Default time | Logic |
|------|--------------|-------|
| fasting | 06:30 | Fast days (orthocal + weekly) |
| liturgy | 07:00 | Days with morning liturgy |
| vespers | 16:00 | Vespers/vigil expected |
| presanctified | 16:30 | Presanctified evenings |

Times are **hardcoded** in `liturgicalReminders.ts` — custom times not implemented.

## Scheduling

- Window: **14 days** ahead
- ID prefix: `orthodaily:`
- Separate Android notification channels per kind
- Skips entirely when `!supportsLocalNotifications()` (web)
- Uses orthocal cache/API + `dayServices` helpers

## Preferences (PreferencesContext)

- `notifyFastingReminder`
- `notifyLiturgyMorning`
- `notifyVespersEve`
- `notifyPresanctified`

## Settings UX

One row **Notifications** → modal with four toggles.

**i18n keys:**
- `settings.notifications` — row label
- `settings.notificationsRowHint` — phone app only (short)
- `settings.notificationsMobileOnly` — modal subtitle (always)
- `settings.notificationsWebOnly` — modal footer on web
- `settings.notificationsOff` / `settings.notificationsOnCount`
- `settings.notifyFasting`, `notifyLiturgy`, `notifyVespers`, `notifyPresanctified` + `*Hint`

## Permission flow

On enabling any toggle (native):
1. `requestNotificationPermissions(uiLanguage)`
2. If denied → alert + `permissionHint` in modal footer

## i18n namespace `notifications.*`

Push notification **titles/bodies** and Android **channel names** — separate from `settings.*`.

## Future ideas (not implemented)

- Custom notification times per type
- Richer notification bodies (fast rule text)
- Server push via FCM (would need Firebase Blaze + backend)
