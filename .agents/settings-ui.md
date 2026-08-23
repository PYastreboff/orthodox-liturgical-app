# Settings UI

## Layout (current)

Single scroll on `app/(tabs)/settings.tsx`:

1. Page title **“Settings”** — hidden on web when tab header visible (`useTabHeaderShown()`)
2. One card (`settingsListCard`) containing all rows
3. Footer: logo, version, attribution, data sources (unchanged)

**No** Display / Notifications / About section headers anymore — one continuous list.

## Row order (top → bottom)

| Row | Interaction | Trailing |
|-----|-------------|----------|
| Serving role | `SettingsOptionModal` | Current role label + chevron |
| Theme | modal | value label |
| Background Gradient | inline | `SettingsSwitch` |
| Text size | modal | value label |
| Liturgical calendar | modal | value label |
| App language | modal | value label |
| Notifications | `SettingsNotificationsModal` | “Off” or “{n} on” |
| Colours & fasting legend | navigate `/legend` | chevron |
| Privacy policy | navigate `/privacy` | chevron |
| Support | open GitHub issues URL | external-link |

## Components

### SettingsLinkRow

**File:** `src/components/settings/SettingsLinkRow.tsx`

Props:
- `icon` (Feather) or `leading` (custom node)
- `label`, `hint?`
- `onPress?` — shows chevron; row is pressable if no `trailing`
- `valueLabel?` — muted text before chevron
- `trailing?` — e.g. switch; disables row press
- `trailingIcon?` — default `chevron-right`, or `external-link`
- `showDivider?` — hairline above row

Exports:
- `settingsLinkListInset` — horizontal margin inside card
- `settingsListCard(isDark)` — card border/background style

### SettingsOptionModal

Single-select bottom sheet. Used for: role, theme, font scale, calendar, language.

Closes on select; backdrop tap closes.

### SettingsNotificationsModal

Multi-select toggles with checkmarks. Does **not** close on toggle.

Props: `subtitle` (phone-only note), `footerNote` (web-only or permission denied).

Calls `toggleReminder()` from settings screen — handles permission request on enable.

## Active picker state

```typescript
type SettingsPicker =
  | 'servingRole' | 'appearance' | 'fontScale' | 'calendar' | 'language' | null;
const [notificationsOpen, setNotificationsOpen] = useState(false);
```

Separate modals rendered conditionally at bottom of Settings screen.

## Legacy components (avoid in Settings)

- `SettingsSection` — old grouped cards with uppercase headers
- `SettingsField` — label above embedded picker
- `SettingsRow` — row without icon
- `AboutLinks` — links now inlined in settings.tsx (component file may still exist)

## Adding a new setting

1. Add preference to `PreferencesContext` if needed
2. Add i18n: label, `*RowHint`, option labels
3. Add `SettingsLinkRow` in the list
4. If enum picker → extend `SettingsPicker` + options `useMemo` + conditional modal
5. If boolean → `SettingsSwitch` in `trailing`
6. If navigation → `onPress` + `router.push` or `Linking.openURL`
