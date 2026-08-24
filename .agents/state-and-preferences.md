# State and preferences

## PreferencesContext

**File:** `src/state/PreferencesContext.tsx`  
**Hook:** `usePreferences()`  
**Storage key:** `PREFERENCES_STORAGE_KEY` = `@orthodaily/preferences/v1`

### Stored shape (`StoredPreferences`)

| Field | Type | Notes |
|-------|------|-------|
| `primaryCalendar` | `'julian' \| 'gregorian'` | Rubrics source |
| `uiLanguage` | `'en' \| 'ru' \| 'el'` | UI labels only |
| `defaultTextLang` | `'en' \| 'chu' \| 'both'` | Scripture on Today |
| `readingsCategoryFilter` | liturgical text category | Today readings filter |
| `colorSchemePreference` | `'system' \| 'light' \| 'dark'` | |
| `showVestmentGradient` | boolean | Background gradient on Today |
| `fontScale` | `'small' \| 'default' \| 'large'` | |
| `servingRole` | `ClergyRole` | layperson, chorister, altar_server, reader, deacon, priest, bishop |
| `todayCollapsed` | partial collapsible state | Per-section expand on Today |
| `notifyFastingReminder` | boolean | |
| `notifyLiturgyMorning` | boolean | |
| `notifyVespersEve` | boolean | |
| `notifyPresanctified` | boolean | |
| `showAlternateCalendar` | boolean | Legacy migration from `showGregorianAlongside` |

### API surface

Each setter updates React state **and** calls `persist(partial)` → AsyncStorage merge.

`preferencesReady` — false until initial load completes (splash gate waits on this).

### Helpers

```typescript
readStoredPreferences(): Promise<StoredPreferences>
writeStoredPreferences(patch: StoredPreferences): Promise<void>
```

Export these for future Firebase sync (read local → merge → write cloud).

## What to sync to cloud (Firebase plan)

**Sync:** all `StoredPreferences` fields **except** optionally `todayCollapsed` (device-local UI).

**Do not sync:** Orthocal cache, notification schedule handles, scroll position.

## Provider tree (app/_layout.tsx)

```
SafeAreaProvider
  PreferencesProvider
    AppThemeProvider
      SplashGate
        DayNavigationProvider
          LiturgicalRemindersSync
          RootStack (expo-router)
```

Future: wrap `AuthProvider` **outside** `PreferencesProvider` so sync can read `user.uid`.

## Day navigation

**File:** `src/state/DayNavigationContext.tsx`  
Remembers selected day; calendar tap → `requestOpenDay(date)` → navigate to Today.

## Today UI collapse state

**File:** `src/state/todayUiState.ts`  
Keys: `date`, `fasting`, `vestments`, `services`, `altarRoles`, `readerGuide`, `readings`, `feasts`, `saints`.

Persisted in preferences; defaults in `DEFAULT_TODAY_COLLAPSED`.
