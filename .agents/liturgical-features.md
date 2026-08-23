# Liturgical features

## Rubrics stance

- **Target audience:** Moscow Patriarchate–oriented practice
- **Data source:** orthocal.info (OCA rubrics) — disclaimer in Settings footer
- User selects **Julian vs Gregorian** calendar mode for rubrics; civil dates always Gregorian

## Day-aware guides (Server & Reader)

### Altar server forms

**File:** `src/lib/liturgical/altarServerRoles.ts`

```typescript
type AltarForm = 'priest' | 'hierarchical' | 'presanctified' | 'great_friday';
```

- `availableAltarForms(dayContext)` — which forms apply
- `defaultAltarForm(dayContext)` — auto-select on day change
- UI: `AltarServerRoleTable.tsx` — manual form toggle **without outer border**

### Reader guide forms

**File:** `src/lib/liturgical/readerGuide.ts` — same form pattern  
**UI:** `ReaderGuideTable.tsx`

### Day context passed from Today

**File:** `app/(tabs)/index.tsx` → `guideDayContext` from orthocal day + appearance

Exports used: `isPresanctifiedDay` from `dayServices.ts`

## Hero / feast display

- Major Theotokos feasts: show **“Major feast”** only (no “(Theotokos)”) — `feastRank.ts`
- Typikon symbols on dark hero: use light foreground for non-red ranks — `DayHero.tsx`

## Legend

**Route:** `app/legend.tsx`  
**Component:** `LiturgicalLegendGuide.tsx`  
Linked from Settings as “Colours & fasting” (i18n: `settings.colorsLegendLink`).

Replaced old `LegalLinks.tsx` / separate colours link.

## Serving roles

**IDs:** layperson, altar_server, reader, deacon, priest, bishop  
**Icons/labels:** `src/lib/liturgical/servingRoles.ts`  
Affects vestments on Today and which guide sections appear.

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
