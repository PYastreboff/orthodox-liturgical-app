# OrthoDaily — Agent Knowledge Base

This folder captures **project context, conventions, and decisions** so Cursor agents (and humans) can work on the repo without re-discovering everything from scratch.

**Product:** OrthoDaily — Orthodox liturgical daybook (Today, Calendar, Settings). Expo SDK 54, TypeScript, Expo Router. MP-oriented rubrics; OCA orthocal data.

**Live web:** https://pyastreboff.github.io/orthodox-liturgical-app/

## Start here

| Doc | When to read |
|-----|----------------|
| [project-overview.md](./project-overview.md) | First time on the repo; stack, tabs, data flow |
| [file-map.md](./file-map.md) | Find the right file quickly |
| [conventions.md](./conventions.md) | How to edit (scope, git, i18n, UI patterns) |
| [state-and-preferences.md](./state-and-preferences.md) | AsyncStorage prefs, context API |
| [settings-ui.md](./settings-ui.md) | Unified settings list, modals, pickers |
| [notifications.md](./notifications.md) | Local notifications; phone-only UX |
| [i18n.md](./i18n.md) | EN / RU / EL strings and content localization |
| [liturgical-features.md](./liturgical-features.md) | Guides, vestments, orthocal, day-aware forms |
| [web-and-layout.md](./web-and-layout.md) | Desktop tab headers, breakpoints, GH Pages |
| [firebase-plan.md](./firebase-plan.md) | **Planned** auth + profile sync — **not implemented** |
| [firebase-setup.md](./firebase-setup.md) | **Step-by-step Firebase Console + .env setup** |
| [roadmap.md](./roadmap.md) | Ideas discussed; not committed |

## Current status (Aug 2026)

### Implemented in recent work
- Unified Settings: single card, `SettingsLinkRow` pattern (icon + title + hint + trailing)
- Picker settings open bottom sheets (`SettingsOptionModal`)
- Notifications: one row → `SettingsNotificationsModal` (multi-toggle); **phone app only** copy
- Setting label: **Background Gradient** (not “Background colour”)
- i18n: section renamed to **Notifications** (`settings.sectionNotifications`)
- Day-aware Server & Reader guides (Presanctified, Great Friday forms)
- Local notifications (`expo-notifications`) with per-type toggles
- Partial RU/EL localization for day content (`orthocalContent.ts`)
- Legend page (`app/legend.tsx`); About links in Settings list
- Web desktop: hide duplicate in-page titles when tab header shows (≥768px)
- **First-launch tips** (`FirstLaunchTips` after splash; `onboardingCompleted` pref)
- **Calendar search RU/EL** — Unicode tokens + given-name aliases (Николай / Νικόλαος)
- **Reading labels** — Orthocal category labels + Royster `Verse:` / `Another:` localized

### Not implemented
- Firebase auth / profile / cloud settings sync (see [firebase-plan.md](./firebase-plan.md))
- User login of any kind
- Widgets, custom notification times, Pascha countdown

## Rules for agents

1. **Do not commit** unless the user explicitly asks.
2. **Minimize scope** — match existing patterns; no drive-by refactors.
3. **i18n:** update EN (`messages.ts`), RU (block in `messages.ts`), and EL (`messages.el.ts`) together.
4. **Settings rows:** use `SettingsLinkRow`; pickers use modals, not inline segmented controls.
5. **Notifications:** local only on iOS/Android; web saves prefs but does not schedule.
6. **Guest-first:** any future auth must not block Today/Calendar without login.

## Related repo docs

- User-facing: [README.md](../README.md)
- Privacy: [app/privacy.tsx](../app/privacy.tsx), [src/lib/legal/privacyPolicy.ts](../src/lib/legal/privacyPolicy.ts)
