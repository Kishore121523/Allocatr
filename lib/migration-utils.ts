// lib/migration-utils.ts

'use client';

import { getMonthKey } from '@/lib/utils';

/**
 * Migrates user preferences from localStorage to Firebase
 * This helps existing users transition smoothly
 */
export function migrateLocalStorageToFirebase(): {
  selectedMonth: string;
  lastActiveDate: string;
  autoAdvanceMonth: boolean;
} {
  const defaultMonth = getMonthKey();
  const defaultLastActiveDate = new Date().toISOString();
  
  try {
    // Get existing localStorage data
    const savedMonth = localStorage.getItem('allocatr-selected-month');
    const lastCheckedDate = localStorage.getItem('allocatr-last-checked-date');
    
    // Convert last checked date to ISO format
    let lastActiveDate = defaultLastActiveDate;
    if (lastCheckedDate) {
      try {
        const parsedDate = new Date(lastCheckedDate);
        if (!isNaN(parsedDate.getTime())) {
          lastActiveDate = parsedDate.toISOString();
        }
      } catch {
        // If parsing fails, use default
        lastActiveDate = defaultLastActiveDate;
      }
    }
    
    const migrationData = {
      selectedMonth: savedMonth || defaultMonth,
      lastActiveDate,
      autoAdvanceMonth: true, // Default to enabled for all users
    };
    
    // Clear localStorage after successful migration
    // We'll do this in the preferences hook after successful Firebase write
    
    return migrationData;
  } catch (error) {
    console.warn('Error during localStorage migration:', error);
    return {
      selectedMonth: defaultMonth,
      lastActiveDate: defaultLastActiveDate,
      autoAdvanceMonth: true,
    };
  }
}

/**
 * Clears localStorage after successful migration
 */
export function clearLegacyLocalStorage(): void {
  try {
    localStorage.removeItem('allocatr-selected-month');
    localStorage.removeItem('allocatr-last-checked-date');
    localStorage.setItem('allocatr-migrated-to-firebase', 'true');
  } catch (error) {
    console.warn('Error clearing legacy localStorage:', error);
  }
}

/**
 * Checks if user has already been migrated
 */
export function hasBeenMigrated(): boolean {
  try {
    return localStorage.getItem('allocatr-migrated-to-firebase') === 'true';
  } catch {
    return false;
  }
}
