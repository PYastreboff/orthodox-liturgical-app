# Conventions for agents

## Code changes

1. **Minimal diff** — fix what was asked; don’t refactor unrelated code.
2. **Match existing style** — naming, imports, component patterns in neighbouring files.
3. **Comments** — only for non-obvious business logic.
4. **Tests** — only if requested or high-value; verify scripts exist for liturgical logic.

## Git

- **Never commit** unless the user explicitly asks.
- **Never** force push, amend unless user rules allow, or skip hooks.
- Follow existing commit message style if committing.

## i18n

- Three UI languages: **en**, **ru**, **el**
- EN + RU: `src/i18n/messages.ts` (RU is a nested block)
- EL: `src/i18n/messages.el.ts`
- Add keys to all three when adding user-facing strings
- Use `*RowHint` keys for short Settings row subtitles
- Interpolation: `{count}`, `{version}` via `translate.ts`

## Settings UI (current standard)

- **One card** — `settingsListCard(isDark)` wrapping `settingsLinkListInset`
- **Every row** — `SettingsLinkRow`:
  - Left: Feather `icon` or custom `leading` (e.g. MCI for serving role)
  - Center: `label` + `hint`
  - Right: `valueLabel` + chevron (picker), `SettingsSwitch` (toggle), or `trailingIcon="external-link"` (URL)
- **Pickers** — tap row → `SettingsOptionModal` (single select) or `SettingsNotificationsModal` (multi toggle)
- **Do not** reintroduce bulky section headers or inline `SegmentedPicker` in Settings unless user asks

## Notifications UX copy

- Label: `settings.notifications` → “Notifications”
- Row hint must state **phone app only (iOS & Android) — not on web**
- Modal subtitle: `settings.notificationsMobileOnly`
- Web footer in modal: `settings.notificationsWebOnly`

## Background gradient setting

- i18n key remains `settings.backgroundColour` (legacy key name)
- **Display string:** “Background Gradient” (EN)

## Platform

- `Platform.OS === 'web'` — no local notification scheduling; prefs still persist
- `supportsLocalNotifications()` — iOS/Android only
- Desktop web width ≥ **768px**: tab header shown; in-page titles on Calendar/Settings hidden

## User preferences

- Persist via `writeStoredPreferences` / `persist()` in `PreferencesContext`
- Type: `StoredPreferences` in `PreferencesContext.tsx`
- Do not add secrets to repo; use env vars for future Firebase keys

## App Store / legal (future)

- Privacy policy must be updated before collecting accounts
- Sign in with Apple required if Google/email offered on iOS
- Account deletion must be in-app if auth is added
