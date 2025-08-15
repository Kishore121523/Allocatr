// lib/firebase.ts

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, GoogleAuthProvider } from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import Constants from 'expo-constants';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId,
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId,
  appId: Constants.expoConfig?.extra?.firebaseAppId,
};

console.log('Firebase Config:', {
  apiKey: firebaseConfig.apiKey ? 'Loaded' : 'Missing',
  authDomain: firebaseConfig.authDomain ? 'Loaded' : 'Missing',
  projectId: firebaseConfig.projectId ? 'Loaded' : 'Missing',
});

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with persistence
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// Initialize Auth with AsyncStorage persistence for React Native
let auth: any;
try {
  // Try to initialize with React Native persistence
  const { getReactNativePersistence } = require('firebase/auth');
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (error) {
  console.warn('Failed to initialize auth with React Native persistence, falling back to default auth');
  auth = getAuth(app);
}

export { auth };
export const functions = getFunctions(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Firestore collections
export const COLLECTIONS = {
  USERS: 'users',
  BUDGETS: 'budgets',
  TRANSACTIONS: 'transactions',
  CATEGORIES: 'categories',
  USER_PREFERENCES: 'userPreferences',
} as const;

export default app;
