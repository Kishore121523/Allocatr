// providers/month-provider.tsx

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getMonthKey } from '@/lib/utils';
import { useUserPreferences } from '@/hooks/use-user-preferences';

interface MonthContextType {
  currentMonth: string;
  setCurrentMonth: (month: string) => void;
  isCurrentMonth: boolean;
}

const MonthContext = createContext<MonthContextType | undefined>(undefined);

interface MonthProviderProps {
  children: ReactNode;
}

export function MonthProvider({ children }: MonthProviderProps) {
  const { 
    preferences, 
    loading: preferencesLoading, 
    updateSelectedMonth,
    checkAndHandleMonthAdvancement 
  } = useUserPreferences();
  
  const [currentMonth, setCurrentMonth] = useState<string>(getMonthKey());

  // Sync currentMonth with Firebase preferences
  useEffect(() => {
    if (preferences && !preferencesLoading) {
      setCurrentMonth(preferences.selectedMonth);
    }
  }, [preferences, preferencesLoading]);

  // Check if the selected month is the actual current month
  const actualCurrentMonth = getMonthKey();
  const isCurrentMonth = currentMonth === actualCurrentMonth;

  // Handle automatic month advancement on initial load
  useEffect(() => {
    if (preferences && !preferencesLoading) {
      checkAndHandleMonthAdvancement().catch(console.error);
    }
  }, [preferences, preferencesLoading, checkAndHandleMonthAdvancement]);

  // Check for month changes while app is running (real-time detection)
  useEffect(() => {
    if (!preferences) return;

    const checkForMonthChange = async () => {
      try {
        await checkAndHandleMonthAdvancement();
      } catch (error) {
        console.error('Error checking month advancement:', error);
      }
    };

    // Check every minute for month changes (for users who keep app open)
    const interval = setInterval(checkForMonthChange, 60000);
    
    // Also check on visibility change (when user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkForMonthChange();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [preferences, checkAndHandleMonthAdvancement]);

  const handleSetCurrentMonth = async (month: string) => {
    // Optimistically update local state for immediate UI response
    setCurrentMonth(month);
    
    // Update Firebase (will sync across devices)
    try {
      await updateSelectedMonth(month);
    } catch (error) {
      // Revert local state if Firebase update fails
      if (preferences) {
        setCurrentMonth(preferences.selectedMonth);
      }
      console.error('Failed to update month selection:', error);
    }
  };

  return (
    <MonthContext.Provider 
      value={{ 
        currentMonth, 
        setCurrentMonth: handleSetCurrentMonth,
        isCurrentMonth
      }}
    >
      {children}
    </MonthContext.Provider>
  );
}

export function useMonth() {
  const context = useContext(MonthContext);
  if (context === undefined) {
    throw new Error('useMonth must be used within a MonthProvider');
  }
  return context;
}
