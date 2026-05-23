# OrthoDaily

Cross-platform **iOS, Android, and web** liturgical daybook oriented toward Moscow Patriarchate practice. Built with **Expo SDK 54**, **TypeScript**, and **Expo Router** (three tabs: Today, Calendar, Settings).

Day content (feasts, saints, fasting, readings) comes from [orthocal.info](https://orthocal.info/) (OCA rubrics). Vestment colours and calendar cell styling use a local Julian/Pascha engine when the API does not supply them.

## Features

### Today

- **Day hero** — liturgical title, civil date, tone, typikon rank symbol, fast label; previous/next day and jump to today.
- **Serving role** — layperson, altar server, deacon, priest, bishop (vestment rows for clergy).
- **Date & liturgical day** — fast pill, service rank, orthocal query hint, Julian or Gregorian church date (per Settings).
- **Fasting** — level, allowed foods, notes (including Wednesday/Friday rules when orthocal reports no fast).
- **Vestments** — role-specific colours for the day (local appearance engine).
- **Liturgical texts** — troparia, kontakia, prokeimenon, epistle, gospel, communion, etc., grouped by type with one icon per section (not per reading). Toggle **English / Church Slavonic** for scripture via [getBible](https://getbible.net) (Elizabeth Bible, 1757); hymns stay in English when orthocal has no Slavonic.
- **Feasts** and **Saints commemorated today** — collapsible cards when orthocal provides a life account; otherwise the name only (no empty-state message).

Sections start collapsed where content can be long (liturgical texts, feasts, saints).

### Calendar

- Month grid with civil (Gregorian) day numbers.
- Cell colours: fasting, feasts, today; typikon symbols on ranked days.
- Tap a day to open it on **Today** (Julian or Gregorian rubrics follow Settings).

### Settings

- Light / dark / system theme.
- Optional vestment-colour background glow on Today (dark theme).
- **Liturgical calendar** — Julian or Gregorian rubrics on orthocal (civil dates always Gregorian).
- **App language** — **English** or **Русский** for all UI labels (orthocal content remains in the API language).

Preferences persist with AsyncStorage.

## Prerequisites

- Node.js LTS (if `expo start` warns on Node 25, use current LTS via `nvm use`).
- Xcode (iOS) / Android Studio (Android) for simulators or devices.

## Setup

```bash
cd orthodox-liturgical-app
npm install
npm start
```

If you upgrade Expo, run `npx expo install --fix` to realign native module versions.

Then press `i` (iOS), `a` (Android), or `w` (web), or scan the QR code with Expo Go.

```bash
npm run lint          # expo lint
npm run build:web     # static export to dist/
```

## Share online

**Repository:** [github.com/PYastreboff/orthodox-liturgical-app](https://github.com/PYastreboff/orthodox-liturgical-app)

**Live web demo (GitHub Pages):**

**Option A — GitHub Actions**

1. GitHub → **Settings** → **Pages** → **Build and deployment** → **Source: GitHub Actions**.
2. Push `main` and wait for **Deploy web to GitHub Pages** in [Actions](https://github.com/PYastreboff/orthodox-liturgical-app/actions).
3. **https://pyastreboff.github.io/orthodox-liturgical-app/**

**Option B — `gh-pages` branch**

```bash
npm run deploy:gh-pages
```

Then **Settings → Pages** → **Deploy from branch** → **`gh-pages`** / **/(root)**.

**If you only see this README on Pages:** the site is serving `main`, not the built app — switch the Pages source as above.

The web build needs network for orthocal.info and Church Slavonic scripture. Preview locally: `npm run build:web` then `npx serve dist`.

**Expo Go:** `npm start` (same Wi‑Fi) or `npx expo start --tunnel` for a temporary public URL.

## Project layout

| Path | Role |
|------|------|
| `app/_layout.tsx` | Root layout, theme, preferences, day navigation |
| `app/(tabs)/index.tsx` | Today screen |
| `app/(tabs)/calendar.tsx` | Liturgical month calendar |
| `app/(tabs)/settings.tsx` | Appearance, calendar mode, app language |
| `src/hooks/` | orthocal day/month fetch, liturgical texts + Slavonic overlay |
| `src/i18n/` | `messages.ts`, `translate`, `useAppTranslation` |
| `src/lib/api/orthocal.ts` | orthocal.info API types and helpers |
| `src/lib/calendar/` | Julian/Gregorian, Pascha, appearances, weekly fast, cell styles |
| `src/lib/liturgical/` | Dashboard, readings, typikon symbols, commemorations, vestments |
| `src/state/PreferencesContext.tsx` | Persisted user preferences |
| `src/components/` | UI (grid, hero, collapsible sections, passage blocks) |

## Data notes

- **Network:** first load per day hits orthocal; responses are cached in memory for the session.
- **Rubrics:** orthocal uses OCA-style data; verify against your typikon where MP practice differs.
- **UI vs content:** app language affects labels only; saint/feast names and most fast descriptions come from the API in English.
- **Troparia/kontakia:** often missing from `readings[]`; the app may pull hymn text from saint life stories when quoted there.

## Future direction

- Versioned offline SQLite packs per jurisdiction for typikon and texts without network.
- Deeper MP-specific fasting and rank rules merged with API rows.

## Assets

Default Expo template icons in `assets/` — replace with branded icon and splash when ready.
