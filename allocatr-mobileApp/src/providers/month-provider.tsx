// providers/month-provider.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './auth-provider';
import { getMonthKey } from '../lib/utils';

interface MonthContextType {
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  isCurrentMonth: boolean;
}

const MonthContext = createContext<MonthContextType | undefined>(undefined);

export function useMonth() {
  const context = useContext(MonthContext);
  if (context === undefined) {
    throw new Error('useMonth must be used within a MonthProvider');
  }
  return context;
}

interface MonthProviderProps {
  children: ReactNode;
}

export function MonthProvider({ children }: MonthProviderProps) {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState<string>(getMonthKey());

  useEffect(() => {
    // Reset to current month when user changes
    if (user) {
      setSelectedMonth(getMonthKey());
    }
  }, [user]);

  const isCurrentMonth = selectedMonth === getMonthKey();

  const value: MonthContextType = {
    selectedMonth,
    setSelectedMonth,
    isCurrentMonth,
  };

  return <MonthContext.Provider value={value}>{children}</MonthContext.Provider>;
}
