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

## Share online

**Code:** [github.com/PYastreboff/orthodox-liturgical-app](https://github.com/PYastreboff/orthodox-liturgical-app) — set the repository to **Public** under GitHub → Settings → General → Danger zone → Change visibility.

**Live web demo (GitHub Pages):**

1. Push `main` — the workflow builds the app and publishes **`dist`** to the **`gh-pages`** branch (not your README).
2. GitHub → **Settings** → **Pages** → **Build and deployment**:
   - **Source:** Deploy from a branch
   - **Branch:** `gh-pages` / **/(root)**
   - If you previously chose **main** or **GitHub Actions**, switch to **`gh-pages`** or you will only see the README.
3. Wait for the [Actions](https://github.com/PYastreboff/orthodox-liturgical-app/actions) workflow to finish (green check).
4. Share: **https://pyastreboff.github.io/orthodox-liturgical-app/**

The web build needs network for orthocal.info and Church Slavonic scripture (getBible). To preview locally: `npm run build:web` then `npx serve dist`.

**Phone (Expo Go):** run `npm start`, share the QR code (same Wi‑Fi), or use `npx expo start --tunnel` for a public URL while your machine is running.

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

**Liturgical texts** use every `readings[]` entry from the API (KJV scripture, prokeimenon, communion verses when present). Troparia/kontakia are often absent from `readings[]`; the app may surface them from saint’s-life notes when quoted there, otherwise shows *None for this day.* On Today, toggle **English / Church Slavonic**: scripture is loaded from the [getBible](https://getbible.net) **Elizabeth Bible (1757)** by citation; hymns stay in English from orthocal when no Slavonic source exists.

## Backend / data direction (future)

- Ship **versioned yearly SQLite packs** (per `jurisdiction_id`) for offline MP typikon and dual-language texts.
- Keep **Pascha-based colours** in the local engine; merge with API or pack rows per day.

## Assets

Template icons were copied from `expo-template-blank-typescript@54.0.44` into `assets/`. Replace with your own app icon and splash when branding is ready.
