# Liturgical features

## Rubrics stance

- **Target audience:** Moscow Patriarchate–oriented practice
- **Data source:** orthocal.info (OCA rubrics) — disclaimer in Settings footer
- User selects **Julian vs Gregorian** calendar mode for rubrics; civil dates always Gregorian

## Day-aware guides

Same form pattern for all roles: `priest | hierarchical | presanctified | great_friday`

| Role | Data | UI |
|------|------|-----|
| Altar server | `altarServerRoles.ts` | `AltarServerRoleTable.tsx` |
| Reader | `readerGuide.ts` | `ReaderGuideTable.tsx` |
| Deacon | `deaconGuide.ts` | `DeaconGuideTable.tsx` |
| Chorister | `choirGuide.ts` | `ChoirGuideTable.tsx` |
| Priest (also bishop) | `priestGuide.ts` | `PriestGuideTable.tsx` |

- `available*Forms(dayContext)` / `default*Form(dayContext)` — auto-select on day change
- Manual form toggle **without outer border**
- Day context from Today: `guideDayContext` (`isPresanctifiedDay` from `dayServices.ts`)

## Hero / feast display

- Major Theotokos feasts: show **“Major feast”** only (no “(Theotokos)”) — `feastRank.ts`
- Typikon symbols on dark hero: use light foreground for non-red ranks — `DayHero.tsx`

## Legend

**Route:** `app/legend.tsx`  
**Component:** `LiturgicalLegendGuide.tsx`  
Linked from Settings as “Colours & fasting” (i18n: `settings.colorsLegendLink`).

Replaced old `LegalLinks.tsx` / separate colours link.

## Serving roles

**IDs:** layperson, chorister, altar_server, reader, deacon, priest, bishop  
**Icons/labels:** `src/lib/liturgical/servingRoles.ts`  
Affects vestments on Today and which guide sections appear.

- Chorister: church-clothing (like layperson) + Choir Guide
- Priest guide also shown when role is **bishop**

## Readings

- Language toggle: EN / Church Slavonic / both (scripture)
- Category toggle when multiple liturgical text types present
- Slavonic via getBible.net; menaion/typikon hymns bundled

## Share

**Hook:** `useShareDay.ts`  
**URL:** `?date=YYYY-MM-DD` on web base URL  
Deep link parsing: `dayShareLink.ts`

## Caching / offline

- Orthocal persistent cache
- Prefetch neighbors: `prefetchOrthocalDayNeighbors`, `prefetchOrthocalTodayWindow`
- Offline message in i18n when API fails

## Verify scripts

Change fasting/colours/tone logic → run matching `npm run verify:*` script.
