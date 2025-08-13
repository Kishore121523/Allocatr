// hooks/use-user-preferences.ts

'use client';

import { useEffect, useState } from 'react';
import { 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc,
  Timestamp 
} from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/firebase';
import { useAuth } from '@/providers/auth-provider';
import { UserPreferences } from '@/types';
import { getMonthKey } from '@/lib/utils';
import { migrateLocalStorageToFirebase, clearLegacyLocalStorage, hasBeenMigrated } from '@/lib/migration-utils';
import { toast } from 'sonner';

export function useUserPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setPreferences(null);
      setLoading(false);
      return;
    }

    const preferencesRef = doc(db, COLLECTIONS.USER_PREFERENCES, user.id);

    const unsubscribe = onSnapshot(
      preferencesRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setPreferences({
            id: snapshot.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as UserPreferences);
        } else {
          // Create preferences - check for migration from localStorage
          let migrationData: ReturnType<typeof migrateLocalStorageToFirebase> | undefined;
          if (!hasBeenMigrated()) {
            migrationData = migrateLocalStorageToFirebase();
          }
          
          const defaultPreferences: Omit<UserPreferences, 'id'> = {
            userId: user.id,
            selectedMonth: migrationData?.selectedMonth || getMonthKey(),
            lastActiveDate: migrationData?.lastActiveDate || new Date().toISOString(),
            autoAdvanceMonth: migrationData?.autoAdvanceMonth ?? true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          setDoc(preferencesRef, {
            ...defaultPreferences,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          }).then(() => {
            // Clear localStorage after successful Firebase write
            if (migrationData && !hasBeenMigrated()) {
              clearLegacyLocalStorage();
              toast.success('Settings synced!', {
                description: 'Your preferences are now synced across all devices.',
                duration: 3000,
              });
            }
          }).catch(console.error);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching user preferences:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const updatePreferences = async (
    updates: Partial<Omit<UserPreferences, 'id' | 'userId' | 'createdAt'>>
  ): Promise<void> => {
    if (!user || !preferences) return;

    try {
      const preferencesRef = doc(db, COLLECTIONS.USER_PREFERENCES, user.id);
      await updateDoc(preferencesRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (err) {
      console.error('Error updating preferences:', err);
      toast.error('Failed to sync preferences', {
        description: 'Your settings may not be saved across devices.',
      });
      throw err;
    }
  };

  const updateSelectedMonth = async (month: string): Promise<void> => {
    return updatePreferences({ selectedMonth: month });
  };

  const updateLastActiveDate = async (date?: Date): Promise<void> => {
    return updatePreferences({ 
      lastActiveDate: (date || new Date()).toISOString() 
    });
  };

  const checkAndHandleMonthAdvancement = async (): Promise<boolean> => {
    if (!preferences || !preferences.autoAdvanceMonth) return false;

    const currentMonth = getMonthKey();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const lastActiveDate = preferences.lastActiveDate.split('T')[0];

    // Check if it's a new day and we should advance the month
    if (lastActiveDate !== today) {
      // Update last active date first
      await updateLastActiveDate();

      // Check if user was on current month and it's now a new month
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayMonth = getMonthKey(yesterday);

      if (preferences.selectedMonth === yesterdayMonth && preferences.selectedMonth !== currentMonth) {
        // Auto-advance to new month
        await updateSelectedMonth(currentMonth);
        
        // Show notification
        toast.success('Welcome to a new month!', {
          description: `Automatically switched to ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}. Your budget is ready for fresh tracking.`,
          duration: 5000,
        });
        
        return true; // Month was advanced
      }
    }

    return false; // No advancement needed
  };

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    updateSelectedMonth,
    updateLastActiveDate,
    checkAndHandleMonthAdvancement,
  };
}
