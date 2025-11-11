# Firebase Configuration Setup

## Problem
The app is showing `Firebase: Error (auth/invalid-api-key)` because environment variables are missing.

## Solution

### Step 1: Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **coffeeaddict-c9d70**
3. Click the gear icon ⚙️ (Project Settings)
4. Scroll down to "Your apps" section
5. If you don't see a Web app, click "Add app" and select Web (</>) icon
6. If you already have a web app, look for the Firebase SDK configuration

### Step 2: Copy Configuration Values

You'll see something like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "coffeeaddict-c9d70.firebaseapp.com",
  projectId: "coffeeaddict-c9d70",
  storageBucket: "coffeeaddict-c9d70.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX"
};
```

### Step 3: Update .env File

Open the `.env` file in your project root and replace the placeholder values:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=coffeeaddict-c9d70.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=coffeeaddict-c9d70
VITE_FIREBASE_STORAGE_BUCKET=coffeeaddict-c9d70.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Step 4: Rebuild and Deploy

```powershell
# Build the app with new environment variables
npm run build

# Deploy to Firebase
npm run deploy
```

### Step 5: Verify

1. Open https://coffeeaddict-c9d70.web.app
2. Check browser console (F12) - no Firebase errors should appear
3. Try to login or interact with the app

## Important Notes

- ⚠️ The `.env` file contains sensitive keys - never commit it to Git
- ✅ `.env` is already in `.gitignore` to prevent accidental commits
- 📝 `.env.example` is provided as a template (safe to commit)
- 🔄 Vite requires rebuilding the app after changing environment variables
- 🌐 Environment variables are embedded in the build at compile time

## Alternative: Hardcode for Quick Fix (Not Recommended for Production)

If you need a quick fix, you can temporarily hardcode the values in `src/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSy...", // Your actual API key
  authDomain: "coffeeaddict-c9d70.firebaseapp.com",
  projectId: "coffeeaddict-c9d70",
  storageBucket: "coffeeaddict-c9d70.appspot.com",
  messagingSenderId: "123...",
  appId: "1:123...",
  measurementId: "G-..."
};
```

**Warning:** This exposes your API keys in the source code. Use environment variables instead.

## Troubleshooting

### Error persists after adding .env
- Make sure to rebuild: `npm run build`
- Clear browser cache (Ctrl+Shift+Delete)
- Check that variable names start with `VITE_`

### Can't find Firebase config
- Make sure you're looking at the correct project (coffeeaddict-c9d70)
- If no web app exists, create one in Firebase Console
- Project Settings > General > Your apps > Web

### Build doesn't include env variables
- Vite only includes variables prefixed with `VITE_`
- Restart dev server after changing .env
- Environment variables are embedded at build time, not runtime
