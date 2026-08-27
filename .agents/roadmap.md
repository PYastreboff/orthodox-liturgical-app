# Roadmap — ideas discussed, not committed

Use this to avoid re-proposing finished work or contradicting decisions.

## Done (recent sessions)

- [x] Localize day content (feasts, fast notes) RU/EL — partial via `orthocalContent.ts`
- [x] Day-aware Server & Reader guides (Presanctified, Great Friday)
- [x] Local notifications with per-type toggles
- [x] Settings unified list (About-style rows)
- [x] Notifications as single row + modal picker
- [x] Phone-only notification copy
- [x] “Background Gradient” label
- [x] Rename Reminders → Notifications in UI
- [x] Legend page + consolidated About links
- [x] Web desktop double-title fix
- [x] Major feast hero pill (Theotokos)
- [x] Hero typikon contrast on dark mode
- [x] First-launch tips (calendar, role, notifications)
- [x] Calendar search RU/EL (Unicode tokens + name aliases)
- [x] Localize Orthocal/Royster reading labels (`Verse:`, Matins Gospel, etc.)

## Planned (user chose direction)

- [ ] **Firebase auth + profile + settings sync** — see [firebase-plan.md](./firebase-plan.md)

## Nice-to-have (discussed, not scheduled)

### Quick wins
- “Back to today” chip when viewing another day
- [x] Test notification button in Settings
- Custom notification times (currently fixed 6:30 / 7:00 / 16:00 / 16:30)
- Richer notification bodies (include fast rule text)
- Inline typikon tap → legend sheet
- Role-aware default collapsed sections on Today

### Liturgical depth
- Pascha / Lent countdown (`pascha_distance` already on orthocal day)
- Liturgical week strip under hero
- Fasting year overview screen
- [x] Deacon guide section
- [x] Choir + Priest guides; chorister role (before altar server)
- Hierarchical form auto-detect

### Localization
- Finish EL feast/saint maps in `orthocalContent.ts`
- Greek scripture option (readings still EN/CS)
- Search saints in RU/EL scripts

### Platform
- Home screen widget (feast, fast, tone)
- Native deep links for shared `?date=` URLs
- Prefetch full calendar month for offline
- Web push (optional; conflicts with “phone only” notification messaging)

### Quality
- Run verify scripts in CI
- Short onboarding (calendar mode, role, notifications)
- Accessibility: reduce motion for collapsibles

## Explicit non-goals (for now)

- Social features / comments
- Server-side liturgical data hosting
- Requiring login to use the app
- Phone SMS auth on free tier

## Technical debt / known issues

- `@expo/vector-icons` types may fail `tsc` in some environments
- `LiturgicalLegendGuide.tsx` — pre-existing style type issue on pill styles
- Legacy i18n key `settings.backgroundColour` (display is “Background Gradient”)
- `settings.calendarHeader` may be unused after header uses `calendar.title`
- Legacy settings components (`SettingsSection`, `SettingsField`) still in repo but unused in main Settings screen
