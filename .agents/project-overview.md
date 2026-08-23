# Project overview

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Expo ~54, React 19, React Native 0.81 |
| Routing | Expo Router (`app/` file-based) |
| Language | TypeScript |
| Storage | `@react-native-async-storage/async-storage` (device + web) |
| i18n | Custom `messages.ts` / `messages.el.ts` + `useAppTranslation()` |
| Deploy web | GitHub Pages (`experiments.baseUrl`: `/orthodox-liturgical-app`) |
| Native builds | EAS (`build:ios` scripts in package.json) |

## App structure

```
app/
  _layout.tsx           Root: PreferencesProvider, theme, splash, reminders sync
  (tabs)/
    _layout.tsx         Tab bar; conditional header on web ≥768px
    index.tsx           Today (main screen)
    calendar.tsx        Month grid + search
    settings.tsx        Unified settings list
  legend.tsx            Colours & fasting legend (linked from Settings)
  privacy.tsx           Privacy policy
```

## Tabs

1. **Today** — day hero, fasting, vestments, services, server/reader guides, readings, feasts, saints
2. **Calendar** — month grid, saint/feast search, tap day → open on Today
3. **Settings** — appearance, calendar, language, notifications, about links

## Data sources (read-only, no backend)

- **Orthocal.info** — calendar, fasts, saints, epistle/gospel (OCA rubrics)
- **Bundled menaion / Royster / typikon** — troparia, prokeimenon, etc.
- **getBible.net** — Church Slavonic scripture
- Local Julian/Pascha engine for appearance when API lacks detail

## Architecture diagram

```
┌─────────────────────────────────────────────────────────┐
│  UI (app/, src/components/)                             │
├─────────────────────────────────────────────────────────┤
│  State: PreferencesContext, DayNavigationContext          │
├─────────────────────────────────────────────────────────┤
│  Hooks: useOrthocalDay, useLiturgicalTexts, …           │
├─────────────────────────────────────────────────────────┤
│  Domain: src/lib/liturgical/*, src/lib/calendar/*       │
├─────────────────────────────────────────────────────────┤
│  API/cache: src/lib/api/orthocal*, prefetch             │
├─────────────────────────────────────────────────────────┤
│  Persistence: AsyncStorage (@orthodaily/preferences/v1) │
└─────────────────────────────────────────────────────────┘
```

No server, no auth, no Firebase yet.

## Brand / rubrics positioning

- **Display name:** OrthoDaily
- **Orientation:** Moscow Patriarchate–oriented; data often OCA (orthocal)
- Settings footer notes MP vs OCA where relevant
- Bundle IDs: `church.orthodox.liturgical.dev` (iOS/Android)

## Verify scripts (package.json)

- `verify:liturgical-colors`, `verify:fuzzy-search`, `verify:fasting`, `verify:orthocal-tone`

Run when changing rubrics-heavy logic.
