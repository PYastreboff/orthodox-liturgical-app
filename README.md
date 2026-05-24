# OrthoDaily

Cross-platform **iOS, Android, and web** liturgical daybook oriented toward **Moscow Patriarchate** practice. Built with **Expo SDK 54**, **TypeScript**, and **Expo Router** (three tabs: **Today**, **Calendar**, **Settings**).

Day content (feasts, saints, fasting, readings) comes from [orthocal.info](https://orthocal.info/) (OCA rubrics). Vestment colours, calendar cell styling, and weekly fast rules use a local Julian/Pascha engine when the API does not supply them. Troparia, kontakia, and many prokeimena are supplemented from bundled menaion and lectionary data (see [Data sources](#data-sources)).

**Live web app:** [https://pyastreboff.github.io/orthodox-liturgical-app/](https://pyastreboff.github.io/orthodox-liturgical-app/)

## Features

### Today

- **Day hero** — liturgical title, civil date, tone, typikon rank symbol, fast label; previous/next day and jump to today. Vestment-coloured card (dark-mode variants blend with the charcoal theme).
- **Serving role** — layperson (default), reader, altar server, deacon, priest, bishop — with role-specific vestment rows.
- **Date & liturgical day** — fast pill, major-feast highlight, service rank, Julian or Gregorian church date (per Settings).
- **Fasting** — level, allowed/not allowed foods, weekly fast suspensions (Bright Week, Pentecost week, etc.).
- **Vestments** — role-specific colours for the day.
- **Liturgical texts** — troparia, kontakia, prokeimenon, alleluia, epistle, gospel, communion, grouped by type with section icons. Language toggle: **English**, **Church Slavonic (ЧС)**, or **side by side** (scripture only; hymns follow the selected mode).
- **Feasts** and **Saints commemorated today** — collapsible cards with life accounts when orthocal provides them.

Long sections (liturgical texts, feasts, saints) start **collapsed**. Your expand/collapse choices, serving role, selected day, and calendar month are **remembered** across refresh (AsyncStorage on device; `localStorage` on web).

### Calendar

- Month grid with civil (Gregorian) day numbers and typikon symbols on ranked days.
- Cell colours: fasting, feasts, Palm Sunday, today.
- **Search** — find saints and feasts in the visible year; tap a result to open that day on Today.
- Tap any day to open it on **Today** (Julian or Gregorian rubrics follow Settings).

### Settings

- Light / dark / system theme.
- Optional vestment-colour **background glow** on Today.
- **Text size** — small, default, or large (Today readings and body text).
- **Liturgical calendar** — Julian or Gregorian rubrics on orthocal (civil dates always Gregorian).
- **App language** — **English** or **Русский** for UI labels (orthocal content remains largely in English).

### Web & mobile layout

- **Phone / narrow web:** edge-to-edge layout, floating tab bar, no top tab header.
- **Desktop web (≥768px):** tab header with app branding.
- **iPhone:** for a full-screen experience without Safari’s URL bar, use **Share → Add to Home Screen** and open the PWA from the home screen icon.

## Data sources

| Source | Used for |
|--------|----------|
| [orthocal.info](https://orthocal.info/) | Daily feasts, saints, fasting, epistle/gospel when present |
| [Mount-Skete typikon XML](https://github.com/Mount-Skete/orthodox-typikon-feasts-xml) | Church Slavonic troparia/kontakia; great-feast prokeimena |
| [Royster / Ponomar](https://www.ponomar.net/) | Weekday and Sunday prokeimenon, alleluia, communion when orthocal omits them |
| [getBible](https://getbible.net/v2/) | Church Slavonic scripture (Elizabeth Bible, 1757) for citations |

English troparia/kontakia on major feasts come from a bundled English hymn set when Slavonic typikon text is not shown in EN mode.

## Prerequisites

- **Node.js LTS** (if `expo start` warns on Node 25+, use current LTS via `nvm use`).
- **Xcode** (iOS) / **Android Studio** (Android) for simulators or devices.

## Setup

```bash
cd orthodox-liturgical-app
npm install
npm start
```

Then press `i` (iOS), `a` (Android), or `w` (web), or scan the QR code with **Expo Go**.

After upgrading Expo: `npx expo install --fix` to realign native module versions.

```bash
npm run lint          # expo lint
npm run build:web     # static export to dist/
```

### Rebuild menaion typikon index (optional)

If Mount-Skete XML changes, regenerate the bundled Julian-date index:

```bash
node scripts/build-typikon-index.mjs
```

Output: `src/lib/liturgical/menaion/data/typikonByJulianDate.json`

## Share online

**Repository:** [github.com/PYastreboff/orthodox-liturgical-app](https://github.com/PYastreboff/orthodox-liturgical-app)

### GitHub Pages (recommended)

1. GitHub → **Settings** → **Pages** → **Build and deployment** → **Source: GitHub Actions**.
2. Push to `main`; the **Deploy web to GitHub Pages** workflow builds and publishes automatically.
3. Site: **https://pyastreboff.github.io/orthodox-liturgical-app/**

### Manual deploy

```bash
npm run deploy:gh-pages
```

Then **Settings → Pages** → **Deploy from branch** → **`gh-pages`** / **(root)**.

**If Pages shows only this README:** the site is serving `main`, not the built app — switch the Pages source as above.

The web build needs network access for orthocal.info and Church Slavonic scripture. Preview locally:

```bash
npm run build:web
npx serve dist
```

**Expo Go:** `npm start` on the same Wi‑Fi, or `npx expo start --tunnel` for a temporary public URL.

## Project layout

| Path | Role |
|------|------|
| `app/(tabs)/index.tsx` | Today screen |
| `app/(tabs)/calendar.tsx` | Month grid + search |
| `app/(tabs)/settings.tsx` | Theme, calendar mode, language, sources |
| `app/+html.tsx` | Web viewport / PWA meta |
| `src/hooks/` | orthocal fetch, liturgical texts, safe area, calendar search |
| `src/i18n/` | English + Russian UI strings |
| `src/lib/api/orthocal.ts` | orthocal.info API |
| `src/lib/calendar/` | Julian/Gregorian, Pascha, appearances, cell styles |
| `src/lib/liturgical/menaion/` | Typikon index, hymns, feast prokeimena |
| `src/lib/liturgical/royster/` | Royster weekday/Sunday lectionary |
| `src/lib/liturgical/` | Dashboard, readings, typikon symbols, vestments |
| `src/lib/bible/` | Slavonic scripture fetch + citation parsing |
| `src/state/PreferencesContext.tsx` | Persisted preferences (`@orthodaily/preferences/v1`) |
| `src/components/` | Hero, grid, collapsible sections, passage blocks |
| `scripts/build-typikon-index.mjs` | Fetch typikon XML → JSON index |

## Data notes

- **Network:** first load per day hits orthocal; responses are cached in memory for the session.
- **Rubrics:** orthocal uses OCA-style data; verify against your typikon where MP practice differs.
- **UI vs content:** app language affects labels only; saint/feast names and most fast descriptions come from the API in English.
- **Persistence:** settings, serving role, Today section collapse state, selected day, and calendar month survive refresh; not synced across devices.

## Future direction

- Versioned offline packs per jurisdiction for typikon and texts without network.
- Deeper MP-specific fasting and rank rules merged with API rows.

## Assets

Default Expo template icons in `assets/` — replace with branded icon and splash when ready.
