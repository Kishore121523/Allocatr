# Environment Variables Setup

Create a `.env` file in the root directory with these exact variable names:

## Required Environment Variables

```bash
# Firebase Configuration (copy from your web app)
# These must match your existing web app Firebase project
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id_here

# Google OAuth Client ID for Mobile
# Option 1: Use Firebase's built-in Google auth (easier setup)
# Leave this empty/commented out to use Firebase's default Google auth
# EXPO_PUBLIC_GOOGLE_CLIENT_ID=

# Option 2: Use custom Google OAuth (advanced)
# Get this from Google Cloud Console -> Credentials -> OAuth 2.0 Client IDs
# EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id_for_mobile

# Web App API URL for AI Categorization
# This should point to your deployed web app or localhost for development
EXPO_PUBLIC_WEB_APP_API_URL=https://your-web-app-domain.com

# Development URLs (uncomment for local development)
# EXPO_PUBLIC_WEB_APP_API_URL=http://localhost:3000
# EXPO_PUBLIC_WEB_APP_API_URL=http://192.168.1.x:3000  # Use your local IP for device testing
```

## Where These Variables Are Used

### Firebase Variables (src/lib/firebase.ts)
- `EXPO_PUBLIC_FIREBASE_API_KEY` → `firebaseApiKey`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` → `firebaseAuthDomain`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID` → `firebaseProjectId`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` → `firebaseStorageBucket`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` → `firebaseMessagingSenderId`
- `EXPO_PUBLIC_FIREBASE_APP_ID` → `firebaseAppId`

### Google OAuth (src/providers/auth-provider.tsx)
- `EXPO_PUBLIC_GOOGLE_CLIENT_ID` → `googleClientId`

### AI Categorization (src/hooks/use-ai-categorization.ts)
- `EXPO_PUBLIC_WEB_APP_API_URL` → `webAppApiUrl`

## Setup Steps

1. **Copy Firebase Config from Web App:**
   - Go to your Firebase project settings
   - Copy the config values from your web app
   - Paste them into the mobile app `.env` file

2. **Set up Google Authentication:**
   
   **Option A: Firebase Built-in Google Auth (Recommended for simplicity)**
   - In Firebase Console, go to Authentication → Sign-in method
   - Enable Google sign-in provider
   - Firebase will handle the OAuth setup automatically
   - Leave `EXPO_PUBLIC_GOOGLE_CLIENT_ID` empty or commented out
   
   **Option B: Custom Google OAuth (Advanced)**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Navigate to "Credentials" → "OAuth 2.0 Client IDs"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Select "Mobile application"
   - Add your bundle identifier (com.allocatr.mobile)
   - Copy the client ID to `EXPO_PUBLIC_GOOGLE_CLIENT_ID`

3. **Set Web App URL:**
   - For production: Use your deployed web app URL
   - For development: Use `http://localhost:3000` or your local IP

## Optional Additions

If you want to add more features, you might need:

### Push Notifications
```bash
# For Expo Push Notifications
EXPO_PUBLIC_PUSH_NOTIFICATIONS_ENABLED=true
```

### Analytics
```bash
# For Firebase Analytics
EXPO_PUBLIC_ANALYTICS_ENABLED=true
```

### Error Reporting
```bash
# For Sentry or other error reporting
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
```

### App Version
```bash
# For app versioning
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_BUILD_NUMBER=1
```

### API Rate Limiting
```bash
# For API rate limiting
EXPO_PUBLIC_API_RATE_LIMIT=100
```

## Important Notes

1. **All variables must start with `EXPO_PUBLIC_`** for Expo to expose them to the app
2. **Never commit `.env` files** - they're already in `.gitignore`
3. **Use the same Firebase project** as your web app for data consistency
4. **Test the Google OAuth** on both iOS and Android devices
5. **For device testing**, use your computer's IP address instead of localhost

## Verification

After setting up, you can verify the configuration by:
1. Running `npm start`
2. Opening the app in Expo Go
3. Checking the console for "Firebase Config: Loaded" messages
4. Testing Google sign-in functionality

The app will show specific error messages if any environment variables are missing or incorrect.
