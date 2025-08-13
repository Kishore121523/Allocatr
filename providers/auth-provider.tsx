// providers/auth-provider.tsx

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db, COLLECTIONS } from '@/lib/firebase';
import { User } from '@/types';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        
        // Get or create user document in Firestore
        const userDocRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        } else {
          // Create new user document
          const newUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          await setDoc(userDocRef, newUser);
          setUser(newUser);
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      
      // Create or update user document
      const userDocRef = doc(db, COLLECTIONS.USERS, result.user.uid);
      const userData: User = {
        id: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await setDoc(userDocRef, userData, { merge: true });
      
      toast.success("Welcome!", {
        description: `Signed in as ${result.user.displayName || result.user.email}`,
      });
    } catch (error) {
      console.error('Error signing in with Google:', error);
      toast.error("Sign in failed", {
        description: "There was an error signing in. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      toast.success("Signed out", {
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error("Sign out failed", {
        description: "There was an error signing out. Please try again.",
      });
    }
  };

  const value = {
    user,
    firebaseUser,
    loading,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}