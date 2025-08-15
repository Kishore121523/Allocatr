# Simple Firebase-Only Setup

Since you're just using Firebase, here's the simplest setup process:

## 📋 **Step 1: Create your `.env` file**

Create a `.env` file in the mobile app root with these variables:

```bash
# Firebase Configuration (get from Firebase Console)
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# Leave this empty for now (will use Firebase's built-in Google auth)
# EXPO_PUBLIC_GOOGLE_CLIENT_ID=

# For AI features - use localhost for development
EXPO_PUBLIC_WEB_APP_API_URL=http://localhost:3000
```

## 🔥 **Step 2: Get Firebase Configuration**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing
3. Click on "Project Settings" (gear icon)
4. Scroll down to "Your apps" section
5. Click "Add app" → Web app (</> icon)
6. Give it a name (e.g., "Allocatr Mobile")
7. Copy the config values to your `.env` file

## 🔑 **Step 3: Enable Authentication**

1. In Firebase Console, go to "Authentication"
2. Click "Get started" if it's your first time
3. Go to "Sign-in method" tab
4. Enable "Google" as a sign-in provider
5. Firebase will handle the OAuth setup automatically

## 📊 **Step 4: Set up Firestore Database**

1. Go to "Firestore Database" in Firebase Console
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to you
5. The mobile app will use the same database as your web app

## 🚀 **Step 5: Run the Mobile App**

```bash
# Install dependencies (if not done already)
npm install

# Start the development server
npm start

# Test on your device using Expo Go app
# Or run on simulators:
npm run ios    # for iOS simulator
npm run android # for Android emulator
```

## ⚠️ **Important Notes**

### For AI Categorization to Work:
- You need your web app running on `http://localhost:3000`
- Or deploy your web app and update `EXPO_PUBLIC_WEB_APP_API_URL`
- The web app needs the `/api/categorize` endpoint working

### For Google Sign-In:
- The current setup uses Firebase's default Google auth
- This works for development and testing
- For production, you might want to set up custom Google OAuth later

### Database Sharing:
- The mobile app uses the SAME Firestore database as your web app
- All data will be synchronized between web and mobile
- Users can switch between platforms seamlessly

## 🐛 **Troubleshooting**

### "Firebase Config: Missing" errors:
- Check that your `.env` file is in the correct location
- Ensure all Firebase variables are set correctly
- Restart the Expo server after changing `.env`

### "Google Client ID not configured" warning:
- This is normal if you're using Firebase's built-in auth
- The app will still work for other features
- You can add custom Google OAuth later

### "AI categorization unavailable" error:
- Make sure your web app is running on the URL specified
- Check that the `/api/categorize` endpoint is working
- For now, you can add expenses manually without AI

## 🎯 **Next Steps**

Once this basic setup works:
1. Test creating budgets and adding expenses manually
2. Set up your web app for AI categorization
3. Consider adding custom Google OAuth for production
4. Deploy both web and mobile apps

This gets you up and running quickly with just Firebase!
