# Orthodox Liturgical Assistant (Expo / React Native)

Cross-platform **iOS + Android** shell for a Moscow Patriarchate–oriented daily liturgical assistant: Expo SDK 54, TypeScript, **Expo Router** (tab navigation), **expo-sqlite** placeholder for offline yearly packs, and Julian→Gregorian display helpers.

## Prerequisites

- Node.js LTS recommended (Expo documents supported versions; if `expo start` warns on Node 25, switch with `nvm use` to current LTS).
- Xcode (iOS) / Android Studio (Android) when running simulators or devices.

## Setup

```bash
cd orthodox-liturgical-app
npm install
npm start
```

Expo Router, SQLite, and navigation-related libraries are already pinned in `package.json` to the versions bundled with this SDK. If you upgrade Expo, run `npx expo install --fix` to realign native module versions.

Then press `i` for iOS simulator or `a` for Android emulator, or scan the QR code with Expo Go.

## Layout

| Path | Role |
|------|------|
| `app/_layout.tsx` | Root stack + navigation theme + preferences provider |
| `app/index.tsx` | Redirect into tab navigator |
| `app/(tabs)/` | **Today**, **Calendar**, **Settings** |
| `src/lib/calendar/julianGregorian.ts` | Julian calendar date → Gregorian civil date (for parallel labels) |
| `src/lib/db/sqlite.ts` | Opens local SQLite file; extend with migrations + bundled pack import |
| `src/types/liturgical.ts` | Shared enums/types for packs and UI |
| `src/theme/tokens.ts` | Minimal “icon” palette |
| `src/state/PreferencesContext.tsx` | In-memory prefs (add persistence next) |

## Liturgical data (orthocal.info)

The **Today** screen loads day name, saints, feasts, tone, fasting, and scripture readings from [orthocal.info](https://orthocal.info/api/) (OCA rubrics). Requires network on first load per day; responses are cached in memory for the session.

**Vestment colours** still come from the local Julian/Pascha script in `src/lib/calendar/dayAppearance.ts` (API does not provide colours).

**Troparion / kontakion** and Church Slavonic texts are not in the API — placeholders until you add a licensed text pack.

## Backend / data direction (future)

- Ship **versioned yearly SQLite packs** (per `jurisdiction_id`) for offline MP typikon and dual-language texts.
- Keep **Pascha-based colours** in the local engine; merge with API or pack rows per day.

## Assets

Template icons were copied from `expo-template-blank-typescript@54.0.44` into `assets/`. Replace with your own app icon and splash when branding is ready.
