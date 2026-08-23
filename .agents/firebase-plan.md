# Firebase plan — NOT IMPLEMENTED

This document describes the **agreed direction** for optional auth + profile sync. **No Firebase code exists in the repo yet.**

## Goals

- **Guest-first:** app fully usable without login
- **Simple profile:** email, optional display name
- **Settings sync:** mirror `StoredPreferences` JSON to Firestore
- **Platform:** Firebase Spark (free) to start — Auth + Firestore only

## Why Firebase (vs Supabase)

User chose Firebase for:
- Always-on free tier (no 7-day project pause)
- Spark: 50K MAU auth, Firestore 50K reads/day — plenty for prefs sync
- Optional later: Crashlytics, Analytics, FCM

## Recommended stack with Expo 54

Use **Firebase JS SDK** (`firebase` package) — works web + iOS + Android in one codebase.

```bash
npx expo install firebase
# Sign-in helpers:
npx expo install expo-apple-authentication expo-auth-session expo-crypto expo-web-browser
```

Avoid `@react-native-firebase` unless moving to dev client / prebuild-only workflow.

Auth persistence on native: `getReactNativePersistence(AsyncStorage)` — already have AsyncStorage.

Config via `EXPO_PUBLIC_FIREBASE_*` env vars (see Expo docs).

## Firestore schema

```
/users/{uid}
  email: string | null
  displayName: string | null
  createdAt: timestamp
  updatedAt: timestamp
  preferences: { ...StoredPreferences }
  preferencesUpdatedAt: timestamp
```

## Security rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## New files to create (when implementing)

```
src/lib/firebase/config.ts
src/lib/firebase/userProfile.ts
src/lib/firebase/syncPreferences.ts   # optional split
src/state/AuthContext.tsx
src/components/PreferencesSync.tsx    # mount in _layout.tsx
app/profile.tsx                       # sign in/out, delete account
```

## Provider order (future)

```
AuthProvider
  PreferencesProvider
    PreferencesSync   # on login: merge cloud ↔ local
    LiturgicalRemindersSync
    ...
```

## Merge policy (v1)

1. User signs in
2. No cloud doc → upload local AsyncStorage prefs
3. Cloud doc exists → **cloud wins** → apply to state + AsyncStorage
4. On sign out → keep local prefs (stay in guest mode)

## What to sync

| Sync | Don't sync |
|------|------------|
| All settings in `StoredPreferences` | `todayCollapsed` (optional — device UI) |
| displayName (profile field) | Orthocal cache |
| | Notification schedule handles |

## persist() hook

After `writeStoredPreferences`, if `user`:
- debounced `setDoc(..., { preferences, preferencesUpdatedAt })` (~400ms)

## Auth providers (v1)

| Provider | Priority |
|----------|----------|
| Apple | Required on iOS if Google/email offered |
| Google | Yes |
| Email | Optional later |

Skip phone/SMS on free tier.

## App Store requirements (when implemented)

- Update `privacy.tsx` / `privacyPolicy.ts`
- In-app **Delete account** (delete Firestore doc + `deleteUser`)
- Sign in with Apple capability in Apple Developer + Firebase console

## Implementation order

1. Firebase console + Firestore rules
2. Web auth smoke test
3. AuthContext + profile screen
4. PreferencesSync + debounced writes
5. Native Apple/Google (hardest)
6. Privacy + delete account

## Free tier limits (reminder)

Spark: 50K MAU, Firestore 50K reads / 20K writes per day, 1 GiB storage.  
Profile sync ≈ 1 read + few writes per user per day — scales to tens of thousands DAU.

Official: https://firebase.google.com/pricing

## Do not

- Force login on app launch
- Store liturgical content in Firebase
- Use Cloud Functions on Spark (not available — client-side delete only for v1)
