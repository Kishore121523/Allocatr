// providers/auth-provider.tsx

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup,
  signInWithCredential,
  signOut as firebaseSignOut,
  GoogleAuthProvider 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, COLLECTIONS } from '../lib/firebase';
import { User } from '../types';
import { Platform } from 'react-native';

// For React Native, we'll use Google Sign-In
let GoogleSignin: any = null;
try {
  // Try to import Google Sign-In for React Native
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
} catch (error) {
  console.log('Google Sign-In not available for React Native');
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Configure Google Sign-In for React Native
  useEffect(() => {
    if (Platform.OS !== 'web' && GoogleSignin) {
      GoogleSignin.configure({
        webClientId: '701634289972-s9ui5vk462t3jgho4rvereait627a8t2.apps.googleusercontent.com', // From Firebase console
        offlineAccess: true,
      });
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Create or update user document
        const userRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
        const userDoc = await getDoc(userRef);
        
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName,
          createdAt: userDoc.exists() ? userDoc.data().createdAt.toDate() : new Date(),
          updatedAt: new Date(),
        };

        if (!userDoc.exists()) {
          await setDoc(userRef, {
            ...userData,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } else {
          await setDoc(userRef, {
            ...userData,
            createdAt: userDoc.data().createdAt,
            updatedAt: new Date(),
          }, { merge: true });
        }

        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Check for redirect result on component mount (for web only)
  useEffect(() => {
    // This effect is only needed for web redirect flows
    // React Native doesn't use redirect-based auth
  }, []);

  const signInWithGoogle = async () => {
    try {
      if (Platform.OS === 'web') {
        // Web implementation using popup
        const provider = new GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        provider.setCustomParameters({
          prompt: 'select_account'
        });

        await signInWithPopup(auth, provider);
      } else {
        // React Native implementation
        if (!GoogleSignin) {
          throw new Error('Google Sign-In is not available. Please install @react-native-google-signin/google-signin');
        }

        // Check if your device supports Google Play
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        
        // Get the users ID token
        const userInfo = await GoogleSignin.signIn();
        
        // Create a Google credential with the token
        const googleCredential = GoogleAuthProvider.credential(userInfo.idToken);
        
        // Sign-in the user with the credential
        await signInWithCredential(auth, googleCredential);
      }
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      
      // Handle specific errors
      if (Platform.OS !== 'web' && error.code) {
        switch (error.code) {
          case 'SIGN_IN_CANCELLED':
            console.log('User cancelled the sign-in flow');
            break;
          case 'IN_PROGRESS':
            console.log('Sign in is in progress already');
            break;
          case 'PLAY_SERVICES_NOT_AVAILABLE':
            console.error('Play services not available or outdated');
            break;
          default:
            console.error('Unknown Google Sign-In error:', error);
        }
      } else if (Platform.OS === 'web') {
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            console.log('Sign in cancelled by user');
            break;
          case 'auth/network-request-failed':
            console.error('Network error during sign in');
            break;
          case 'auth/too-many-requests':
            console.error('Too many failed sign in attempts');
            break;
          default:
            console.error('Unknown error during sign in:', error.message);
        }
      }
      
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Sign out from Firebase
      await firebaseSignOut(auth);
      
      // Also sign out from Google Sign-In on React Native
      if (Platform.OS !== 'web' && GoogleSignin) {
        await GoogleSignin.signOut();
      }
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}