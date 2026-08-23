# File map — where things live

## Screens

| Screen | Path |
|--------|------|
| Today | `app/(tabs)/index.tsx` |
| Calendar | `app/(tabs)/calendar.tsx` |
| Settings | `app/(tabs)/settings.tsx` |
| Tab layout | `app/(tabs)/_layout.tsx` |
| Root layout | `app/_layout.tsx` |
| Legend | `app/legend.tsx` |
| Privacy | `app/privacy.tsx` |

## State

| Concern | Path |
|---------|------|
| User preferences (all settings) | `src/state/PreferencesContext.tsx` |
| Storage key | `@orthodaily/preferences/v1` |
| Today collapsible sections | `src/state/todayUiState.ts` |
| Selected day / navigation | `src/state/DayNavigationContext.tsx` |

## Settings UI components

| Component | Path |
|-----------|------|
| Unified list row | `src/components/settings/SettingsLinkRow.tsx` |
| Single-select picker modal | `src/components/settings/SettingsOptionModal.tsx` |
| Notifications multi-toggle modal | `src/components/settings/SettingsNotificationsModal.tsx` |
| Toggle switch | `src/components/settings/SettingsSwitch.tsx` |
| Legacy (avoid for new settings UI) | `SettingsField`, `SettingsRow`, `SettingsSection` |
| Segmented pickers (still used elsewhere if needed) | `SegmentedPicker`, `ThemeModePicker`, etc. |
| Serving role dropdown (not in Settings list anymore) | `src/components/ServingRolePicker.tsx` |

## Notifications

| File | Role |
|------|------|
| `src/lib/notifications/liturgicalReminders.ts` | Schedule 14 days; channels; times |
| `src/components/LiturgicalRemindersSync.tsx` | Sync on prefs change / foreground |
| `app.json` | `expo-notifications` plugin, Android POST_NOTIFICATIONS |

## Liturgical domain

| Area | Path |
|------|------|
| Day dashboard (hero pills, fast summary) | `src/lib/liturgical/dayDashboard.ts` |
| Services list | `src/lib/liturgical/dayServices.ts` |
| Altar server roles / forms | `src/lib/liturgical/altarServerRoles.ts` |
| Reader guide / forms | `src/lib/liturgical/readerGuide.ts` |
| Typikon symbols | `src/lib/liturgical/typikonSymbols.ts` |
| Vestments | `src/lib/liturgical/vestments.ts` |
| Orthocal API + cache | `src/lib/api/orthocal.ts`, `orthocalPersistentCache.ts` |
| Content localization | `src/i18n/orthocalContent.ts` |

## Guides (UI)

| Component | Path |
|-----------|------|
| Server guide table | `src/components/AltarServerRoleTable.tsx` |
| Reader guide table | `src/components/ReaderGuideTable.tsx` |

Forms: `priest | hierarchical | presanctified | great_friday` — auto-selected from day context.

## i18n

| File | Content |
|------|---------|
| `src/i18n/messages.ts` | English + Russian |
| `src/i18n/messages.el.ts` | Greek (cast for type parity) |
| `src/i18n/useAppTranslation.ts` | `t()` hook |
| `src/i18n/feastRank.ts`, `fastingLabels.ts` | Rank/fast strings |

## Layout / web

| Hook / util | Path |
|-------------|------|
| Show tab header (web ≥768px) | `src/hooks/useTabHeaderShown.ts` |
| Phone vs desktop layout | `src/hooks/usePhoneLayout.ts` |
| Share day URL `?date=` | `src/lib/share/dayShareLink.ts` |

## Theme

| File | Role |
|------|------|
| `src/theme/tokens.ts` | colours |
| `src/components/AppThemeProvider.tsx` | navigation theme from prefs |
