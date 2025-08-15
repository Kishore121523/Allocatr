export default {
  expo: {
    name: "Allocatr",
    slug: "allocatr-mobile",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    scheme: "allocatr",
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.allocatr.mobile"
    },
    android: {
      package: "com.allocatr.mobile"
    },
    web: {
      bundler: "metro"
    },
    plugins: [
      
    ],
    extra: {
      // Firebase configuration - these should be set from environment variables
      firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      
      // Google OAuth
      googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
      
      // Web app API URL for AI categorization
      webAppApiUrl: process.env.EXPO_PUBLIC_WEB_APP_API_URL,
      
      eas: {
        projectId: "your-eas-project-id"
      }
    }
  }
};
