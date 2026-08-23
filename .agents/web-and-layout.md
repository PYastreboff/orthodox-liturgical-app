# Web and layout

## Breakpoint

**768px** width — shared by:
- `usePhoneLayout()` — true when width **< 768** (or native)
- `useTabHeaderShown()` — true when **web** and width **≥ 768**

## Desktop web tab header

**File:** `app/(tabs)/_layout.tsx`

When `headerShown: showTabHeader`:
- **Today:** `AppBrandHeader` (not plain text)
- **Calendar:** `headerTitle: t('calendar.title')` → “Liturgical calendar”
- **Settings:** `headerTitle: t('settings.title')` → “Settings”

Tab bar labels remain short: Calendar, Settings, Today.

## Double title fix

Problem: Calendar and Settings also rendered in-page titles → duplicate on wide web.

**Fix:**
- `calendar.tsx` — hide `calendar.title` when `showTabHeader`
- `settings.tsx` — hide `settings.title` when `showTabHeader`

Phone/narrow web: in-page title still shows (no tab header).

## Web deploy

- Base URL: `/orthodox-liturgical-app` (`app.json` → `experiments.baseUrl`)
- Build: `npm run build:web` → `scripts/prepare-gh-pages-spa.mjs`
- Deploy: `npm run deploy:gh-pages`
- SPA routing + theme sync: `syncWebDocumentTheme` on focus (calendar/settings)

## Safe area

Web uses zero insets in root `SafeAreaProvider` — custom padding via `useScreenSafePadding`.

## GH Pages / PWA

- `app/+html.tsx` for static HTML shell
- Favicon in `app.json` web config

## iOS Safari

`isIosSafariBrowser()` — extra tab bar bottom padding in tabs layout.
