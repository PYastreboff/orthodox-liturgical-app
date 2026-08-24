# Firebase setup checklist (OrthoDaily)

Step-by-step to create the Firebase project and wire it for **Auth + Firestore profile sync**.  
Code integration is separate — see [firebase-plan.md](./firebase-plan.md).

**Your app IDs (from `app.json`):**
- iOS bundle: `church.orthodox.liturgical.dev`
- Android package: `church.orthodox.liturgical.dev`
- URL scheme: `orthodox-liturgical`
- Web origin: `https://pyastreboff.github.io`

---

## Part 1 — Firebase Console (≈20 min)

### 1. Create project

1. Open https://console.firebase.google.com/
2. **Add project** → name e.g. `orthodaily`
3. Google Analytics: **off** for now (can enable later)
4. Create project

Stay on **Spark (free)** — no billing account required for Auth + Firestore free quotas.

### 2. Register apps (same Firebase project, three apps)

#### Web app

1. Project overview → **Web** (`</>`)
2. App nickname: `OrthoDaily Web`
3. **Do not** enable Firebase Hosting (you use GitHub Pages)
4. Register → copy the `firebaseConfig` object

#### iOS app

1. **Add app** → iOS
2. Bundle ID: `church.orthodox.liturgical.dev`
3. Download `GoogleService-Info.plist` (keep for native builds; JS SDK uses env vars)

#### Android app

1. **Add app** → Android
2. Package: `church.orthodox.liturgical.dev`
3. Download `google-services.json` (same note as iOS)

### 3. Enable Authentication

1. **Build → Authentication → Get started**
2. **Sign-in method** tab — enable:

| Provider | When | Notes |
|----------|------|-------|
| **Google** | v1 | Easy for web + Android |
| **Apple** | Before App Store | Required if Google is on iOS |
| Email/Password or Email link | optional | Skip for first milestone |

**Do not enable Phone** on Spark if you want zero cost.

#### Apple (when you ship iOS)

- Apple Developer → Identifiers → enable **Sign In with Apple** for your App ID
- Firebase → Apple → configure Services ID, team ID, key (.p8)
- Add return URL from Firebase to Apple Services ID

#### Google (web)

- Firebase → Authentication → Settings → **Authorized domains**
- Ensure `pyastreboff.github.io` and `localhost` are listed
- For native Google later: create OAuth client IDs in **Google Cloud Console** (linked to same project)

### 4. Create Firestore

1. **Build → Firestore Database → Create database**
2. Mode: **Production** (you’ll paste rules immediately)
3. Region: pick closest to users (e.g. `australia-southeast1`, `europe-west1`)
4. Enable

### 5. Firestore security rules

**Firestore → Rules** — replace with:

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

Publish.

### 6. Authorized domains (web sign-in)

**Authentication → Settings → Authorized domains** — add:

- `localhost` (dev)
- `pyastreboff.github.io` (production web)

---

## Part 2 — Local env (≈5 min)

### 1. Copy env template

```bash
cp .env.example .env
```

### 2. Fill from Firebase Console

**Project settings** (gear) → **Your apps** → Web app → **SDK setup and configuration**

Map to `.env`:

| Firebase field | Env var |
|----------------|---------|
| `apiKey` | `EXPO_PUBLIC_FIREBASE_API_KEY` |
| `authDomain` | `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` |
| `projectId` | `EXPO_PUBLIC_FIREBASE_PROJECT_ID` |
| `storageBucket` | `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` |
| `messagingSenderId` | `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` |
| `appId` | `EXPO_PUBLIC_FIREBASE_APP_ID` |

`.env` is gitignored — never commit it.

### 3. Restart Expo after changing env

```bash
npx expo start --clear
```

---

## Part 3 — Install packages (when coding)

```bash
npx expo install firebase
npx expo install expo-apple-authentication expo-auth-session expo-crypto expo-web-browser
```

Use **Firebase JS SDK** (`firebase`), not `@react-native-firebase`, for web + Expo Go / single codebase.

---

## Part 4 — EAS / production builds

For App Store / Play Store builds, add the same `EXPO_PUBLIC_*` vars in **EAS Secrets**:

```bash
eas secret:create --name EXPO_PUBLIC_FIREBASE_API_KEY --value "..." --scope project
# repeat for each var
```

Or `eas.json` env per profile (less ideal for secrets).

Store `GoogleService-Info.plist` and `google-services.json` via EAS if you later use prebuild + native Firebase plugins — not required for JS SDK-only v1.

---

## Part 5 — Verify setup (before writing app code)

### Quick web test (browser console on any page)

After you add `src/lib/firebase/config.ts`, open web app and check:

1. No “Firebase: Error (auth/...)” on load
2. `onAuthStateChanged` fires with `null` when logged out

### Manual Firestore test (optional)

Firebase Console → Firestore → **Rules playground**  
Simulate: authenticated user `uid` reading `/users/{uid}` → Allow.

---

## Part 6 — What to build next (code)

1. `src/lib/firebase/config.ts` — init app, auth, firestore
2. `src/state/AuthContext.tsx` — session, sign-in/out
3. `src/lib/firebase/userProfile.ts` — read/write `/users/{uid}`
4. `src/components/PreferencesSync.tsx` — merge on login
5. `app/profile.tsx` + Settings row
6. Update privacy policy

See [firebase-plan.md](./firebase-plan.md) for schema and merge rules.

---

## Checklist

- [ ] Firebase project created (Spark)
- [ ] Web + iOS + Android apps registered
- [ ] Authentication: Google (+ Apple before iOS release)
- [ ] Firestore created with user-only rules
- [ ] Authorized domains include localhost + GH Pages
- [ ] `.env` filled from web config
- [ ] `npm` packages installed
- [ ] EAS secrets set (when building native)
- [ ] Privacy policy updated (before collecting accounts)

---

## Links

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase pricing (Spark)](https://firebase.google.com/pricing)
- [Expo environment variables](https://docs.expo.dev/guides/environment-variables/)
